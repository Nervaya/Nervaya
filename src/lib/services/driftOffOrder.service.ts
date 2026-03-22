import connectDB from '@/lib/db/mongodb';
import DriftOffOrder, { IDriftOffOrder } from '@/lib/models/driftOffOrder.model';
import { ValidationError, NotFoundError } from '@/lib/utils/error.util';
import { Types } from 'mongoose';

export async function createDriftOffOrder(userId: string, amount: number): Promise<IDriftOffOrder> {
  await connectDB();
  return DriftOffOrder.create({ userId, amount, paymentStatus: 'pending' });
}

export async function getDriftOffOrderById(orderId: string): Promise<IDriftOffOrder> {
  await connectDB();
  if (!Types.ObjectId.isValid(orderId)) {
    throw new ValidationError('Invalid order ID');
  }
  const order = await DriftOffOrder.findById(orderId);
  if (!order) {
    throw new NotFoundError('Deep Rest order not found');
  }
  return order;
}

export async function getDriftOffOrdersByUser(userId: string): Promise<IDriftOffOrder[]> {
  await connectDB();
  return DriftOffOrder.find({ userId }).sort({ createdAt: -1 });
}

export async function getPaidDriftOffOrderByUser(userId: string): Promise<IDriftOffOrder | null> {
  await connectDB();
  return DriftOffOrder.findOne({ userId, paymentStatus: 'paid' }).sort({ createdAt: -1 });
}

export async function updateOrderPaymentStatus(
  orderId: string,
  paymentStatus: 'paid' | 'failed',
  paymentId?: string,
): Promise<IDriftOffOrder> {
  await connectDB();
  if (!Types.ObjectId.isValid(orderId)) {
    throw new ValidationError('Invalid order ID');
  }
  const update: Record<string, unknown> = { paymentStatus };
  if (paymentId) update.paymentId = paymentId;
  const order = await DriftOffOrder.findByIdAndUpdate(orderId, update, { new: true });
  if (!order) {
    throw new NotFoundError('Deep Rest order not found');
  }
  return order;
}
