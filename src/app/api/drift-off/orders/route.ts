import { NextRequest, NextResponse } from 'next/server';
import { createDriftOffOrder, getDriftOffOrdersByUser } from '@/lib/services/driftOffOrder.service';
import { successResponse, errorResponse } from '@/lib/utils/response.util';
import { handleError } from '@/lib/utils/error.util';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import { ROLES } from '@/lib/constants/roles';
import { DRIFT_OFF_SESSION_PRICE } from '@/lib/constants/driftOff.constants';
import { configService } from '@/lib/services/config.service';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, [ROLES.CUSTOMER, ROLES.ADMIN]);
    if (authResult instanceof NextResponse) return authResult;

    const orders = await getDriftOffOrdersByUser(authResult.user.userId);
    return NextResponse.json(successResponse('Drift Off orders retrieved', orders));
  } catch (error) {
    const { message, statusCode, error: errData } = handleError(error);
    return NextResponse.json(errorResponse(message, errData, statusCode), { status: statusCode });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, [ROLES.CUSTOMER, ROLES.ADMIN]);
    if (authResult instanceof NextResponse) return authResult;

    const dbPrice = await configService.get('driftOffSessionPrice');
    const finalPrice = dbPrice !== null ? dbPrice : DRIFT_OFF_SESSION_PRICE;

    const order = await createDriftOffOrder(authResult.user.userId, finalPrice);

    return NextResponse.json(successResponse('Drift Off order created', order, 201), { status: 201 });
  } catch (error) {
    const { message, statusCode, error: errData } = handleError(error);
    return NextResponse.json(errorResponse(message, errData, statusCode), { status: statusCode });
  }
}
