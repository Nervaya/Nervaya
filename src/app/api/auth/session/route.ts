import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import { successResponse, errorResponse } from '@/lib/utils/response.util';

export async function GET(req: NextRequest) {
    try {
        const authResult = await requireAuth(req);

        if (authResult instanceof NextResponse) {
            return authResult;
        }

        return NextResponse.json(
            successResponse('Session valid', {
                userId: authResult.user.userId,
                role: authResult.user.role
            }),
        );
    } catch (error) {
        return NextResponse.json(
            errorResponse('Unauthorized', null, 401),
            { status: 401 },
        );
    }
}
