import { Types } from "mongoose";
import { PaymentStatus, OrderStatus } from "@/lib/constants/enums";

export interface Supplement {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  category: string;
  ingredients: string[];
  benefits: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplementFormData {
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  category: string;
  ingredients: string[];
  benefits: string[];
  isActive: boolean;
}

export interface CartItem {
  supplementId: Types.ObjectId | Supplement;
  quantity: number;
  price: number;
}

export interface Cart {
  _id: string;
  userId: Types.ObjectId | string;
  items: CartItem[];
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  supplementId: Types.ObjectId | Supplement;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface SavedAddress extends ShippingAddress {
  _id: string;
  label: "Home" | "Work" | "Other";
  isDefault: boolean;
}

export interface Order {
  _id: string;
  userId: Types.ObjectId | string;
  items: OrderItem[];
  totalAmount: number;
  paymentId?: string;
  razorpayOrderId?: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  shippingAddress: ShippingAddress;
  createdAt: Date;
  updatedAt: Date;
}
