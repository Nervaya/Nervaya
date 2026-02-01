import { Types } from 'mongoose';
import { PaymentStatus, OrderStatus } from '@/lib/constants/enums';

export interface StarDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface Supplement {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  ingredients: string[];
  benefits: string[];
  isActive: boolean;
  originalPrice?: number;
  shortDescription?: string;
  suggestedUse?: string;
  images?: string[];
  capsuleCount?: number;
  unitLabel?: string;
  averageRating?: number;
  reviewCount?: number;
  starDistribution?: StarDistribution;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  _id: string;
  productId: string;
  userId: string;
  userDisplayName?: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewsResponse {
  data: Review[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SupplementFormData {
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  ingredients: string[];
  benefits: string[];
  isActive: boolean;
  originalPrice?: number;
  shortDescription?: string;
  suggestedUse?: string;
  images?: string[];
  capsuleCount?: number;
  unitLabel?: string;
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
  label: 'Home' | 'Work' | 'Other';
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
