import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import {
  PAYMENT_STATUS,
  ORDER_STATUS,
  PAYMENT_STATUS_VALUES,
  ORDER_STATUS_VALUES,
  PaymentStatus,
  OrderStatus,
} from '@/lib/constants/enums';

export interface IOrderItem {
  supplementId: Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface IShippingAddress {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface IOrder extends Document {
  userId: string;
  items: IOrderItem[];
  totalAmount: number;
  paymentId?: string;
  razorpayOrderId?: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  shippingAddress: IShippingAddress;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    supplementId: {
      type: Schema.Types.ObjectId,
      ref: 'Supplement',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
      default: '',
    },
  },
  { _id: false },
);

const shippingAddressSchema = new Schema<IShippingAddress>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
    },
    addressLine1: {
      type: String,
      required: [true, 'Address line 1 is required'],
      trim: true,
    },
    addressLine2: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    zipCode: {
      type: String,
      required: [true, 'Zip code is required'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      default: 'India',
    },
  },
  { _id: false },
);

const orderSchema = new Schema<IOrder>(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: [true, 'Items are required'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount must be non-negative'],
    },
    paymentId: {
      type: String,
    },
    razorpayOrderId: {
      type: String,
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUS_VALUES,
      default: PAYMENT_STATUS.PENDING,
      required: true,
    },
    orderStatus: {
      type: String,
      enum: ORDER_STATUS_VALUES,
      default: ORDER_STATUS.PENDING,
      required: true,
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: [true, 'Shipping address is required'],
    },
  },
  {
    timestamps: true,
  },
);

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);

export default Order;
