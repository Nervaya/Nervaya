import { NextRequest, NextResponse } from 'next/server';
import { requestReSession } from '@/lib/services/driftOffResponse.service';
import { successResponse, errorResponse } from '@/lib/utils/response.util';
import { handleError } from '@/lib/utils/error.util';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import { ROLES } from '@/lib/constants/roles';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await requireAuth(request, [ROLES.CUSTOMER]);
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const updated = await requestReSession(authResult.user.userId, id);

    return NextResponse.json(successResponse('Re-session requested successfully', updated));
  } catch (error) {
    const { message, statusCode, error: errData } = handleError(error);
    return NextResponse.json(errorResponse(message, errData, statusCode), { status: statusCode });
  }
}
