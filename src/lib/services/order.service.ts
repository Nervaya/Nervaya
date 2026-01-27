import Order, { IOrder, IOrderItem } from '@/lib/models/order.model';
import Cart from '@/lib/models/cart.model';
import Supplement from '@/lib/models/supplement.model';
import connectDB from '@/lib/db/mongodb';
import { handleError, ValidationError } from '@/lib/utils/error.util';
import { Types } from 'mongoose';
import {
  PAYMENT_STATUS,
  ORDER_STATUS,
  ORDER_STATUS_VALUES,
  PAYMENT_STATUS_VALUES,
  OrderStatus,
} from '@/lib/constants/enums';

export async function createOrder(userId: string, shippingAddress: IOrder['shippingAddress']) {
  await connectDB();
  try {
    if (!userId || typeof userId !== 'string') {
      throw new ValidationError('Invalid User ID');
    }

    const cart = await Cart.findOne({ userId }).populate('items.supplementId');
    if (!cart || cart.items.length === 0) {
      throw new ValidationError('Cart is empty');
    }

    const orderItems: IOrderItem[] = [];
    for (const cartItem of cart.items) {
      const supplement = await Supplement.findById(cartItem.supplementId);
      if (!supplement) {
        throw new ValidationError(`Supplement ${cartItem.supplementId} not found`);
      }

      if (!supplement.isActive) {
        throw new ValidationError(`Supplement ${supplement.name} is not available`);
      }

      if (supplement.stock < cartItem.quantity) {
        throw new ValidationError(`Insufficient stock for ${supplement.name}`);
      }

      orderItems.push({
        supplementId: supplement._id,
        name: supplement.name,
        quantity: cartItem.quantity,
        price: cartItem.price,
        image: supplement.image,
      });

      supplement.stock -= cartItem.quantity;
      await supplement.save();
    }

    const totalAmount = cart.totalAmount < 500 ? cart.totalAmount + 50 : cart.totalAmount;

    const order = await Order.create({
      userId: userId,
      items: orderItems,
      totalAmount: totalAmount,
      paymentStatus: PAYMENT_STATUS.PENDING,
      orderStatus: ORDER_STATUS.PENDING,
      shippingAddress,
    });

    await clearCart(userId);

    return await Order.findById(order._id).populate('items.supplementId');
  } catch (error) {
    throw handleError(error);
  }
}

async function clearCart(userId: string) {
  await connectDB();
  const cart = await Cart.findOne({ userId });
  if (cart) {
    cart.items = [];
    await cart.save();
  }
}

export async function getOrderById(orderId: string) {
  await connectDB();
  try {
    if (!Types.ObjectId.isValid(orderId)) {
      throw new ValidationError('Invalid Order ID');
    }
    const order = await Order.findById(orderId).populate('items.supplementId');
    if (!order) {
      throw new ValidationError('Order not found');
    }
    return order;
  } catch (error) {
    throw handleError(error);
  }
}

export async function getUserOrders(userId: string) {
  await connectDB();
  try {
    if (!userId || typeof userId !== 'string') {
      throw new ValidationError('Invalid User ID');
    }
    const orders = await Order.find({ userId }).populate('items.supplementId').sort({ createdAt: -1 });
    return orders;
  } catch (error) {
    throw handleError(error);
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await connectDB();
  try {
    if (!Types.ObjectId.isValid(orderId)) {
      throw new ValidationError('Invalid Order ID');
    }

    if (!ORDER_STATUS_VALUES.includes(status)) {
      throw new ValidationError('Invalid order status');
    }

    const order = await Order.findByIdAndUpdate(orderId, { orderStatus: status }, { new: true, runValidators: true });

    if (!order) {
      throw new ValidationError('Order not found');
    }
    return order;
  } catch (error) {
    throw handleError(error);
  }
}

export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: IOrder['paymentStatus'],
  paymentId?: string,
  razorpayOrderId?: string,
) {
  await connectDB();
  try {
    if (!Types.ObjectId.isValid(orderId)) {
      throw new ValidationError('Invalid Order ID');
    }

    if (!PAYMENT_STATUS_VALUES.includes(paymentStatus)) {
      throw new ValidationError('Invalid payment status');
    }

    const updateData: Partial<IOrder> = { paymentStatus };
    if (paymentId) {
      updateData.paymentId = paymentId;
    }
    if (razorpayOrderId) {
      updateData.razorpayOrderId = razorpayOrderId;
    }

    const order = await Order.findByIdAndUpdate(orderId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!order) {
      throw new ValidationError('Order not found');
    }

    if (paymentStatus === PAYMENT_STATUS.PAID) {
      await Order.findByIdAndUpdate(orderId, {
        orderStatus: ORDER_STATUS.CONFIRMED,
      });
    }

    return order;
  } catch (error) {
    throw handleError(error);
  }
}
