import Review from '@/lib/models/review.model';
import Supplement, { IStarDistribution } from '@/lib/models/supplement.model';
import connectDB from '@/lib/db/mongodb';
import { handleError, ValidationError } from '@/lib/utils/error.util';
import { Types } from 'mongoose';

export async function getByProductId(productId: string, page = 1, limit = 10) {
  await connectDB();
  try {
    if (!Types.ObjectId.isValid(productId)) {
      throw new ValidationError('Invalid product ID');
    }
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      Review.find({ productId: new Types.ObjectId(productId), isVisible: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments({ productId: new Types.ObjectId(productId), isVisible: true }),
    ]);
    return {
      data: reviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw handleError(error);
  }
}

export async function getByItemType(itemId: string, itemType: string, page = 1, limit = 10) {
  await connectDB();
  try {
    if (!Types.ObjectId.isValid(itemId)) {
      throw new ValidationError('Invalid item ID');
    }
    const filter = { productId: new Types.ObjectId(itemId), itemType, isVisible: true };
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      Review.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Review.countDocuments(filter),
    ]);
    return {
      data: reviews,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  } catch (error) {
    throw handleError(error);
  }
}

export async function create(
  productId: string,
  userId: string,
  rating: number,
  comment?: string,
  userDisplayName?: string,
  itemType: string = 'Supplement',
) {
  await connectDB();
  try {
    if (!Types.ObjectId.isValid(productId)) {
      throw new ValidationError('Invalid product ID');
    }
    if (rating < 1 || rating > 5) {
      throw new ValidationError('Rating must be between 1 and 5');
    }
    if (itemType === 'Supplement') {
      const supplement = await Supplement.findById(productId);
      if (!supplement) {
        throw new ValidationError('Supplement not found');
      }
    }
    const review = await Review.findOneAndUpdate(
      { productId: new Types.ObjectId(productId), userId, itemType },
      {
        rating,
        comment: comment ?? '',
        userDisplayName: userDisplayName ?? '',
        itemType,
      },
      { new: true, upsert: true, runValidators: true },
    );
    if (itemType === 'Supplement') {
      await updateSupplementAggregates(productId);
    }
    return review;
  } catch (error) {
    throw handleError(error);
  }
}

export async function deleteReview(reviewId: string, userId: string) {
  await connectDB();
  try {
    if (!Types.ObjectId.isValid(reviewId)) {
      throw new ValidationError('Invalid review ID');
    }
    const review = await Review.findOneAndDelete({
      _id: reviewId,
      userId,
    });
    if (!review) {
      throw new ValidationError('Review not found');
    }
    await updateSupplementAggregates(review.productId.toString());
    return { message: 'Review deleted successfully' };
  } catch (error) {
    throw handleError(error);
  }
}

export async function updateSupplementAggregates(productId: string) {
  const reviews = await Review.find({
    productId: new Types.ObjectId(productId),
    isVisible: true,
  }).lean();
  const count = reviews.length;
  if (count === 0) {
    await Supplement.findByIdAndUpdate(productId, {
      averageRating: undefined,
      reviewCount: 0,
      starDistribution: undefined,
    });
    return;
  }
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const averageRating = Math.round((sum / count) * 10) / 10;
  const starDistribution: IStarDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of reviews) {
    const star = r.rating as 1 | 2 | 3 | 4 | 5;
    if (star >= 1 && star <= 5) {
      starDistribution[star] = (starDistribution[star] ?? 0) + 1;
    }
  }
  await Supplement.findByIdAndUpdate(productId, {
    averageRating,
    reviewCount: count,
    starDistribution,
  });
}
