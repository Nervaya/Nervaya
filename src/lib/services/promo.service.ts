import PromoCode, { IPromoCode } from '@/lib/models/promo.model';
import connectDB from '@/lib/db/mongodb';
import { handleError, ValidationError } from '@/lib/utils/error.util';
import { Types } from 'mongoose';

export interface CreatePromoCodeDto {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase?: number;
  maxDiscount?: number;
  expiryDate: Date | string;
  usageLimit?: number;
  description?: string;
  isActive?: boolean;
}

export interface UpdatePromoCodeDto extends Partial<CreatePromoCodeDto> {
  isActive?: boolean;
}

export async function createPromoCode(data: CreatePromoCodeDto): Promise<IPromoCode> {
  await connectDB();
  try {
    const code = String(data.code).trim().toUpperCase();
    if (!code) throw new ValidationError('Code is required');
    if (!data.discountType || !['percentage', 'fixed'].includes(data.discountType)) {
      throw new ValidationError('Invalid discount type');
    }
    if (data.discountValue == null || data.discountValue <= 0) {
      throw new ValidationError('Discount value must be positive');
    }
    const expiryDate = data.expiryDate instanceof Date ? data.expiryDate : new Date(data.expiryDate);
    if (expiryDate <= new Date()) {
      throw new ValidationError('Expiry date must be in the future');
    }
    if (data.discountType === 'percentage' && (data.maxDiscount == null || data.maxDiscount <= 0)) {
      throw new ValidationError('Max discount is required for percentage type');
    }
    if (data.usageLimit != null && data.usageLimit < 1) {
      throw new ValidationError('Usage limit must be at least 1');
    }

    const existing = await PromoCode.findOne({ code });
    if (existing) throw new ValidationError('Promo code already exists');

    const promo = await PromoCode.create({
      ...data,
      code,
      expiryDate,
      usedCount: 0,
    });
    return promo;
  } catch (error) {
    throw handleError(error);
  }
}

export async function getAllPromoCodes(): Promise<IPromoCode[]> {
  await connectDB();
  try {
    return await PromoCode.find().sort({ createdAt: -1 });
  } catch (error) {
    throw handleError(error);
  }
}

export async function getPromoCodeById(id: string): Promise<IPromoCode> {
  await connectDB();
  try {
    if (!Types.ObjectId.isValid(id)) throw new ValidationError('Invalid promo code ID');
    const promo = await PromoCode.findById(id);
    if (!promo) throw new ValidationError('Promo code not found');
    return promo;
  } catch (error) {
    throw handleError(error);
  }
}

export async function getPromoCodeByCode(code: string): Promise<IPromoCode | null> {
  await connectDB();
  try {
    const normalized = String(code).trim().toUpperCase();
    return await PromoCode.findOne({ code: normalized });
  } catch (error) {
    throw handleError(error);
  }
}

export async function updatePromoCode(id: string, data: UpdatePromoCodeDto): Promise<IPromoCode> {
  await connectDB();
  try {
    if (!Types.ObjectId.isValid(id)) throw new ValidationError('Invalid promo code ID');
    if (data.discountValue != null && data.discountValue <= 0) {
      throw new ValidationError('Discount value must be positive');
    }
    if (data.expiryDate != null) {
      const expiryDate = data.expiryDate instanceof Date ? data.expiryDate : new Date(data.expiryDate);
      if (expiryDate <= new Date()) {
        throw new ValidationError('Expiry date must be in the future');
      }
    }
    if (data.code != null) {
      const code = String(data.code).trim().toUpperCase();
      const existing = await PromoCode.findOne({ code, _id: { $ne: id } });
      if (existing) throw new ValidationError('Promo code already exists');
    }

    const promo = await PromoCode.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!promo) throw new ValidationError('Promo code not found');
    return promo;
  } catch (error) {
    throw handleError(error);
  }
}

export async function deletePromoCode(id: string): Promise<void> {
  await connectDB();
  try {
    if (!Types.ObjectId.isValid(id)) throw new ValidationError('Invalid promo code ID');
    const result = await PromoCode.findByIdAndDelete(id);
    if (!result) throw new ValidationError('Promo code not found');
  } catch (error) {
    throw handleError(error);
  }
}

export async function validatePromoCode(code: string): Promise<IPromoCode> {
  await connectDB();
  const promo = await getPromoCodeByCode(code);
  if (!promo) throw new ValidationError('Invalid code');
  if (!promo.isActive) throw new ValidationError('Invalid code');
  if (promo.isExpired()) throw new ValidationError('Code expired');
  if (promo.isExhausted()) throw new ValidationError('Usage limit exceeded');
  return promo;
}

function calculateDiscount(promo: IPromoCode, cartTotal: number): number {
  if (promo.minPurchase != null && cartTotal < promo.minPurchase) {
    throw new ValidationError('Minimum purchase not met');
  }
  if (promo.discountType === 'percentage') {
    const raw = (cartTotal * promo.discountValue) / 100;
    const capped = promo.maxDiscount != null ? Math.min(raw, promo.maxDiscount) : raw;
    return Math.round(capped * 100) / 100;
  }
  return Math.min(promo.discountValue, cartTotal);
}

export async function applyPromoCode(
  code: string,
  _cartId: string,
  cartTotal: number,
): Promise<{ discount: number; promoCode: IPromoCode }> {
  await connectDB();
  const promo = await validatePromoCode(code);
  const discount = calculateDiscount(promo, cartTotal);
  return { discount, promoCode: promo };
}

export async function incrementUsage(codeId: string): Promise<void> {
  await connectDB();
  try {
    if (!Types.ObjectId.isValid(codeId)) throw new ValidationError('Invalid promo code ID');
    const promo = await PromoCode.findByIdAndUpdate(codeId, { $inc: { usedCount: 1 } }, { new: true });
    if (!promo) throw new ValidationError('Promo code not found');
  } catch (error) {
    throw handleError(error);
  }
}
