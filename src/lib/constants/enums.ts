// Roles
export const ROLES = {
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// Payment status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

// Order status
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

// Session status
export const SESSION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type SessionStatus = (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS];

// Value arrays for validation / schemas
export const PAYMENT_STATUS_VALUES = Object.values(PAYMENT_STATUS);
export const ORDER_STATUS_VALUES = Object.values(ORDER_STATUS);
export const SESSION_STATUS_VALUES = Object.values(SESSION_STATUS);

// Currency / money
export const CURRENCY = {
  SYMBOL: '₹',
  CODE: 'INR',
  NAME: 'Indian Rupee',
} as const;

export type CurrencyCode = (typeof CURRENCY)['CODE'];

// Delivery method (shipping)
export const DELIVERY_METHOD = {
  STANDARD: 'standard',
  EXPRESS: 'express',
} as const;

export type DeliveryMethod = (typeof DELIVERY_METHOD)[keyof typeof DELIVERY_METHOD];

export const DELIVERY_METHOD_VALUES = Object.values(DELIVERY_METHOD);

// Discount type (promo / pricing)
export const DISCOUNT_TYPE = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
} as const;

export type DiscountType = (typeof DISCOUNT_TYPE)[keyof typeof DISCOUNT_TYPE];

export const DISCOUNT_TYPE_VALUES = Object.values(DISCOUNT_TYPE);

// NTherapy popular YouTube video links
export const NTHERAPY_YOUTUBE_VIDEOS = {
  HERO: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  POPULAR_1: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  POPULAR_2: 'https://www.youtube.com/watch?v=XsX3ATc3FbA',
} as const;

export type NTherapyYouTubeVideo = (typeof NTHERAPY_YOUTUBE_VIDEOS)[keyof typeof NTHERAPY_YOUTUBE_VIDEOS];
