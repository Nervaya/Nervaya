import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import { ROLES } from '@/lib/constants/roles';
import { successResponse, errorResponse } from '@/lib/utils/response.util';
import { handleError } from '@/lib/utils/error.util';
import connectDB from '@/lib/db/mongodb';
import Order from '@/lib/models/order.model';
import Review from '@/lib/models/review.model';

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, [ROLES.CUSTOMER]);
    if (authResult instanceof NextResponse) return authResult;

    await connectDB();

    const userId = authResult.user.userId;

    const orders = await Order.find({
      userId,
      orderStatus: 'delivered',
    })
      .sort({ createdAt: -1 })
      .lean();

    const existingReviews = await Review.find({ userId }).select('productId itemType').lean();
    const reviewedKeys = new Set(existingReviews.map((r) => `${r.productId.toString()}_${r.itemType || 'Supplement'}`));

    const reviewableItems: {
      itemId: string;
      itemType: string;
      name: string;
      image: string;
      orderId: string;
      orderDate: string;
    }[] = [];

    for (const order of orders) {
      for (const item of order.items) {
        const itemId = item.itemId.toString();
        const itemType = item.itemType;
        const key = `${itemId}_${itemType}`;

        if (!reviewedKeys.has(key)) {
          reviewableItems.push({
            itemId,
            itemType,
            name: item.name,
            image: item.image,
            orderId: order._id.toString(),
            orderDate: order.createdAt.toISOString(),
          });
          reviewedKeys.add(key);
        }
      }
    }

    return NextResponse.json(successResponse('Reviewable items fetched', reviewableItems));
  } catch (error) {
    const { message, statusCode, error: errData } = handleError(error);
    return NextResponse.json(errorResponse(message, errData, statusCode), { status: statusCode });
  }
}
