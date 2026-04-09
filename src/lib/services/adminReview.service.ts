import connectDB from '@/lib/db/mongodb';
import Review, { IReview } from '@/lib/models/review.model';
import { ValidationError } from '@/lib/utils/error.util';
import { Types } from 'mongoose';
import { updateSupplementAggregates } from '@/lib/services/review.service';

interface AdminReviewFilters {
  rating?: number;
  isVisible?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export async function getAllReviews(page = 1, limit = 10, filters?: AdminReviewFilters) {
  await connectDB();

  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const skip = (page - 1) * safeLimit;

  const query: Record<string, unknown> = {};

  if (filters?.rating) {
    query.rating = filters.rating;
  }
  if (filters?.isVisible !== undefined) {
    query.isVisible = filters.isVisible;
  }
  if (filters?.dateFrom || filters?.dateTo) {
    query.createdAt = {};
    if (filters.dateFrom) (query.createdAt as Record<string, unknown>).$gte = new Date(filters.dateFrom);
    if (filters.dateTo) (query.createdAt as Record<string, unknown>).$lte = new Date(filters.dateTo);
  }

  const [reviews, total] = await Promise.all([
    Review.find(query).populate('productId', 'name image').sort({ createdAt: -1 }).skip(skip).limit(safeLimit).lean(),
    Review.countDocuments(query),
  ]);

  return {
    data: reviews,
    meta: { total, page, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) },
  };
}

export async function toggleReviewVisibility(reviewId: string): Promise<IReview> {
  await connectDB();

  if (!Types.ObjectId.isValid(reviewId)) {
    throw new ValidationError('Invalid review ID');
  }

  const review = await Review.findById(reviewId);
  if (!review) {
    throw new ValidationError('Review not found');
  }

  review.isVisible = !review.isVisible;
  await review.save();

  if (review.itemType === 'Supplement') {
    await updateSupplementAggregates(review.productId.toString());
  }

  return review;
}
