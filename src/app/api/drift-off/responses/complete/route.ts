import { NextRequest, NextResponse } from 'next/server';
import { completeDriftOffResponse } from '@/lib/services/driftOffResponse.service';
import { successResponse, errorResponse } from '@/lib/utils/response.util';
import { handleError } from '@/lib/utils/error.util';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import { ROLES } from '@/lib/constants/roles';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, [ROLES.CUSTOMER, ROLES.ADMIN]);
    if (authResult instanceof NextResponse) return authResult;

    const body = await request.json();
    const { driftOffOrderId } = body as { driftOffOrderId: string };

    if (!driftOffOrderId) {
      return NextResponse.json(errorResponse('driftOffOrderId is required', null, 400), { status: 400 });
    }

    const response = await completeDriftOffResponse(authResult.user.userId, driftOffOrderId);
    return NextResponse.json(successResponse('Drift Off assessment completed', response));
  } catch (error) {
    const { message, statusCode, error: errData } = handleError(error);
    return NextResponse.json(errorResponse(message, errData, statusCode), { status: statusCode });
  }
}
