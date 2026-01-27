import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '@/lib/models/order.model';
import connectDB from '@/lib/db/mongodb';
import { handleError, ValidationError } from '@/lib/utils/error.util';
import { Types } from 'mongoose';
import { PAYMENT_STATUS, ORDER_STATUS } from '@/lib/constants/enums';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

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

export async function createRazorpayOrder(orderId: string, amount: number) {
  await connectDB();
  try {
    if (!Types.ObjectId.isValid(orderId)) {
      throw new ValidationError('Invalid Order ID');
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throw new ValidationError('Order not found');
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
      currency: 'INR',
      receipt: `${orderId}_${Date.now()}`,
      notes: {
        orderId: orderId.toString(),
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    await Order.findByIdAndUpdate(orderId, {
      razorpayOrderId: razorpayOrder.id,
    });

    return razorpayOrder;
  } catch (error) {
    throw handleError(error);
  }
}

export async function verifyPayment(orderId: string, paymentId: string, razorpaySignature: string) {
  await connectDB();
  try {
    if (!Types.ObjectId.isValid(orderId)) {
      throw new ValidationError('Invalid Order ID');
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throw new ValidationError('Order not found');
    }

    if (!order.razorpayOrderId) {
      throw new ValidationError('Razorpay order ID not found');
    }

    const webhookSecret = process.env.RAZORPAY_KEY_SECRET || '';

    const text = `${order.razorpayOrderId}|${paymentId}`;
    const generatedSignature = crypto.createHmac('sha256', webhookSecret).update(text).digest('hex');

    if (generatedSignature !== razorpaySignature) {
      throw new ValidationError('Invalid payment signature');
    }

    await Order.findByIdAndUpdate(orderId, {
      paymentId,
      paymentStatus: PAYMENT_STATUS.PAID,
      orderStatus: ORDER_STATUS.CONFIRMED,
    });

    return { verified: true, order };
  } catch (error) {
    throw handleError(error);
  }
}

export async function handlePaymentWebhook(razorpayOrderId: string, paymentId: string, event: string) {
  await connectDB();
  try {
    const order = await Order.findOne({ razorpayOrderId });
    if (!order) {
      throw new ValidationError('Order not found');
    }

    if (event === 'payment.captured' || event === 'payment.authorized') {
      await Order.findByIdAndUpdate(order._id, {
        paymentId,
        paymentStatus: PAYMENT_STATUS.PAID,
        orderStatus: ORDER_STATUS.CONFIRMED,
      });
    } else if (event === 'payment.failed') {
      await Order.findByIdAndUpdate(order._id, {
        paymentStatus: PAYMENT_STATUS.FAILED,
      });
    }

    return { success: true };
  } catch (error) {
    throw handleError(error);
  }
}
