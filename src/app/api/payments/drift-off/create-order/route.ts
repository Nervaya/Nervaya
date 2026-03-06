import { NextRequest, NextResponse } from 'next/server';
import { createDriftOffRazorpayOrder } from '@/lib/services/driftOffPayment.service';
import { successResponse, errorResponse } from '@/lib/utils/response.util';
import { handleError } from '@/lib/utils/error.util';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import { ROLES } from '@/lib/constants/roles';

export async function POST(request: NextRequest) {
  try {
    console.warn('POST /api/payments/drift-off/create-order - Request received');

    const authResult = await requireAuth(request, [ROLES.CUSTOMER, ROLES.ADMIN]);
    if (authResult instanceof NextResponse) {
      console.warn('Authentication failed');
      return authResult;
    }

    const body = await request.json();
    const { driftOffOrderId } = body as { driftOffOrderId: string };

    console.warn('Request body:', { driftOffOrderId, userId: authResult.user.userId });

    if (!driftOffOrderId) {
      console.error('Missing driftOffOrderId in request');
      return NextResponse.json(errorResponse('driftOffOrderId is required', null, 400), { status: 400 });
    }

    console.warn('Creating Razorpay order for driftOffOrderId:', driftOffOrderId);

    const razorpayOrder = await createDriftOffRazorpayOrder(driftOffOrderId);

    console.warn('Razorpay order created successfully, returning response');

    return NextResponse.json(
      successResponse('Razorpay order created', {
        ...razorpayOrder,
        key_id: process.env.RAZORPAY_KEY_ID || '',
      }),
    );
  } catch (error) {
    console.error('Error in POST /api/payments/drift-off/create-order:', error);
    const { message, statusCode, error: errData } = handleError(error);
    return NextResponse.json(errorResponse(message, errData, statusCode), { status: statusCode });
  }
}
