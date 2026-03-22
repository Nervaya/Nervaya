import crypto from 'crypto';
import Order from '@/lib/models/order.model';
import Cart from '@/lib/models/cart.model';
import DriftOffOrder from '@/lib/models/driftOffOrder.model';
import Session from '@/lib/models/session.model';
import { createDriftOffResponse } from '@/lib/services/driftOffResponse.service';
import connectDB from '@/lib/db/mongodb';
import { createSession } from '@/lib/services/session.service';
import { handleError, ValidationError } from '@/lib/utils/error.util';
import mongoose, { Types } from 'mongoose';
import { PAYMENT_STATUS, ORDER_STATUS, CURRENCY, ITEM_TYPE } from '@/lib/constants/enums';
import { getRazorpayInstance } from '@/lib/utils/razorpay.util';

export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  created_at: number;
}

export async function createRazorpayOrder(orderId: string, amount: number, userId: string) {
  await connectDB();
  try {
    if (!Types.ObjectId.isValid(orderId)) {
      throw new ValidationError('Invalid Order ID');
    }

    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      throw new ValidationError('Order not found or access denied');
    }

    if (amount !== order.totalAmount) {
      throw new ValidationError('Amount mismatch');
    }

    if (order.paymentStatus === PAYMENT_STATUS.PAID) {
      throw new ValidationError('Order already paid');
    }

    const amountInPaisa = Math.round(amount * 100);

    const options = {
      amount: amountInPaisa,
      currency: CURRENCY.CODE,
      receipt: `ORD_${orderId.slice(-8)}_${Date.now().toString().slice(-6)}`,
      notes: {
        orderId: orderId.toString(),
      },
    };

    const razorpay = getRazorpayInstance();

    // Final sanity check for therapy slots before taking payment
    for (const item of order.items) {
      if (item.itemType === ITEM_TYPE.THERAPY) {
        const { date, slot } = item.metadata || {};
        if (date && slot) {
          const existingSession = await Session.findOne({
            therapistId: item.itemId,
            date,
            startTime: slot,
            status: { $ne: 'cancelled' },
          });
          if (existingSession) {
            throw new ValidationError(
              `The therapy session on ${date} at ${slot} has just been booked by someone else.`,
            );
          }
        }
      }
    }

    const razorpayOrder = await razorpay.orders.create(options);

    await Order.findByIdAndUpdate(orderId, {
      razorpayOrderId: razorpayOrder.id,
    });

    return razorpayOrder;
  } catch (error) {
    throw handleError(error);
  }
}

export async function verifyPayment(orderId: string, paymentId: string, razorpaySignature: string, userId: string) {
  await connectDB();
  try {
    if (!Types.ObjectId.isValid(orderId)) {
      throw new ValidationError('Invalid Order ID');
    }

    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      throw new ValidationError('Order not found or access denied');
    }

    if (!order.razorpayOrderId) {
      throw new ValidationError('Razorpay order ID not found');
    }

    const webhookSecret = process.env.RAZORPAY_KEY_SECRET || '';
    if (!webhookSecret) {
      throw new Error('RAZORPAY Secret Credential is not defined');
    }

    const text = `${order.razorpayOrderId}|${paymentId}`;
    const generatedSignature = crypto.createHmac('sha256', webhookSecret).update(text).digest('hex');

    if (generatedSignature !== razorpaySignature) {
      throw new ValidationError('Invalid payment signature');
    }

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const currentOrder = await Order.findById(orderId).session(session);
        if (!currentOrder) throw new ValidationError('Order not found');

        if (currentOrder.paymentStatus === PAYMENT_STATUS.PAID) {
          return; // Already processed
        }

        await Order.findByIdAndUpdate(orderId, {
          paymentId,
          paymentStatus: PAYMENT_STATUS.PAID,
          orderStatus: ORDER_STATUS.CONFIRMED,
        }).session(session);

        // Clear the user's cart now that payment is confirmed
        await Cart.findOneAndUpdate({ userId: currentOrder.userId }, { items: [] }).session(session);

        for (const item of currentOrder.items) {
          if (item.itemType === ITEM_TYPE.DRIFT_OFF) {
            // Check if DriftOffOrders already created for this Razorpay Order ID to avoid duplicates
            const existingCount = await DriftOffOrder.countDocuments({
              razorpayOrderId: currentOrder.razorpayOrderId,
            }).session(session);

            if (existingCount === 0) {
              const quantity = item.quantity || 1;
              for (let i = 0; i < quantity; i++) {
                const [newDriftOffOrder] = await DriftOffOrder.create(
                  [
                    {
                      userId: currentOrder.userId,
                      amount: item.price,
                      paymentStatus: 'paid',
                      razorpayOrderId: currentOrder.razorpayOrderId,
                      paymentId,
                    },
                  ],
                  { session },
                );

                await createDriftOffResponse(currentOrder.userId.toString(), newDriftOffOrder._id.toString(), session);
              }
            }
          } else if (item.itemType === ITEM_TYPE.THERAPY) {
            const date = item.metadata?.date as string;
            const slot = item.metadata?.slot as string;
            if (date && slot) {
              await createSession(currentOrder.userId.toString(), item.itemId.toString(), date, slot, session);
            }
          }
        }
      });

      const orderResult = await Order.findById(orderId);
      return { verified: true, order: orderResult };
    } finally {
      await session.endSession();
    }
  } catch (error) {
    throw handleError(error);
  }
}

export async function handlePaymentWebhook(razorpayOrderId: string, paymentId: string, event: string) {
  await connectDB();
  try {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const order = await Order.findOne({ razorpayOrderId }).session(session);
        if (!order) throw new ValidationError('Order not found');

        if (event === 'payment.captured' || event === 'payment.authorized') {
          if (order.paymentStatus === PAYMENT_STATUS.PAID) return;

          await Order.findByIdAndUpdate(order._id, {
            paymentId,
            paymentStatus: PAYMENT_STATUS.PAID,
            orderStatus: ORDER_STATUS.CONFIRMED,
          }).session(session);

          // Clear the user's cart now that payment is confirmed
          await Cart.findOneAndUpdate({ userId: order.userId }, { items: [] }).session(session);

          for (const item of order.items) {
            if (item.itemType === ITEM_TYPE.DRIFT_OFF) {
              const existingCount = await DriftOffOrder.countDocuments({ razorpayOrderId }).session(session);
              if (existingCount === 0) {
                const quantity = item.quantity || 1;
                for (let i = 0; i < quantity; i++) {
                  const [newDriftOffOrder] = await DriftOffOrder.create(
                    [
                      {
                        userId: order.userId,
                        amount: item.price,
                        paymentStatus: 'paid',
                        razorpayOrderId,
                        paymentId,
                      },
                    ],
                    { session },
                  );

                  await createDriftOffResponse(order.userId.toString(), newDriftOffOrder._id.toString(), session);
                }
              }
            } else if (item.itemType === ITEM_TYPE.THERAPY) {
              const date = item.metadata?.date as string;
              const slot = item.metadata?.slot as string;
              if (date && slot) {
                await createSession(order.userId.toString(), item.itemId.toString(), date, slot, session);
              }
            }
          }
        } else if (event === 'payment.failed') {
          await Order.findByIdAndUpdate(order._id, {
            paymentStatus: PAYMENT_STATUS.FAILED,
          }).session(session);
        }
      });
      return { success: true };
    } finally {
      await session.endSession();
    }
  } catch (error) {
    throw handleError(error);
  }
}

export function calculateTotal(items: { price: number; quantity: number }[]): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}
