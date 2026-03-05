import crypto from 'crypto';
import connectDB from '@/lib/db/mongodb';
import DriftOffOrder from '@/lib/models/driftOffOrder.model';
import { ValidationError, NotFoundError } from '@/lib/utils/error.util';
import { Types } from 'mongoose';
import { CURRENCY } from '@/lib/constants/enums';
import { getRazorpayInstance } from '@/lib/utils/razorpay.util';

export async function createDriftOffRazorpayOrder(driftOffOrderId: string) {
  await connectDB();
  try {
    if (!Types.ObjectId.isValid(driftOffOrderId)) {
      throw new ValidationError('Invalid Drift Off Order ID');
    }

    const order = await DriftOffOrder.findById(driftOffOrderId);
    if (!order) {
      throw new NotFoundError('Drift Off order not found');
    }

    if (order.paymentStatus === 'paid') {
      throw new ValidationError('Order already paid');
    }

    const amountInPaisa = Math.round(order.amount * 100);

    const razorpay = getRazorpayInstance();
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaisa,
      currency: CURRENCY.CODE,
      receipt: `receipt_${driftOffOrderId}`,
      notes: { driftOffOrderId: driftOffOrderId.toString() },
    });

    await DriftOffOrder.findByIdAndUpdate(driftOffOrderId, {
      razorpayOrderId: razorpayOrder.id,
    });

    return razorpayOrder;
  } catch (error) {
    throw error;
  }
}

export async function verifyDriftOffPayment(driftOffOrderId: string, paymentId: string, razorpaySignature: string) {
  await connectDB();
  if (!Types.ObjectId.isValid(driftOffOrderId)) {
    throw new ValidationError('Invalid Drift Off Order ID');
  }
  const order = await DriftOffOrder.findById(driftOffOrderId);
  if (!order) {
    throw new NotFoundError('Drift Off order not found');
  }
  if (!order.razorpayOrderId) {
    throw new ValidationError('Razorpay order ID not found');
  }

  const secret = process.env.RAZORPAY_KEY_SECRET || '';
  const text = `${order.razorpayOrderId}|${paymentId}`;
  const generated = crypto.createHmac('sha256', secret).update(text).digest('hex');

  if (generated !== razorpaySignature) {
    throw new ValidationError('Invalid payment signature');
  }

  await DriftOffOrder.findByIdAndUpdate(driftOffOrderId, {
    paymentId,
    paymentStatus: 'paid',
  });

  return { verified: true, orderId: driftOffOrderId };
}
