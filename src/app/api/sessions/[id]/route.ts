import { NextRequest, NextResponse } from 'next/server';
import {
    getSessionById,
    cancelSession,
    updateSessionStatus,
} from '@/lib/services/session.service';
import { successResponse, errorResponse } from '@/lib/utils/response.util';
import { handleError } from '@/lib/utils/error.util';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import { ROLES } from '@/lib/constants/roles';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(
    req: NextRequest,
    { params }: RouteParams,
) {
    try {
        const authResult = await requireAuth(req, [ROLES.CUSTOMER, ROLES.ADMIN]);

        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { id } = await params;
        const session = await getSessionById(id);

        return NextResponse.json(
            successResponse('Session fetched successfully', session),
        );
    } catch (error) {
        const { message, statusCode, error: errData } = handleError(error);
        return NextResponse.json(
            errorResponse(message, errData, statusCode),
            { status: statusCode },
        );
    }
}

export async function PUT(
    req: NextRequest,
    { params }: RouteParams,
) {
    try {
        const authResult = await requireAuth(req, [ROLES.CUSTOMER, ROLES.ADMIN]);

        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { id } = await params;
        const body = await req.json();

        if (body.status === 'cancelled') {
            const session = await cancelSession(id, authResult.user.userId);
            return NextResponse.json(
                successResponse('Session cancelled successfully', session),
            );
        }

        const session = await updateSessionStatus(id, body.status);
        return NextResponse.json(
            successResponse('Session updated successfully', session),
        );
    } catch (error) {
        const { message, statusCode, error: errData } = handleError(error);
        return NextResponse.json(
            errorResponse(message, errData, statusCode),
            { status: statusCode },
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: RouteParams,
) {
    try {
        const authResult = await requireAuth(req, [ROLES.CUSTOMER, ROLES.ADMIN]);

        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { id } = await params;
        const session = await cancelSession(id, authResult.user.userId);

        return NextResponse.json(
            successResponse('Session deleted successfully', session),
        );
    } catch (error) {
        const { message, statusCode, error: errData } = handleError(error);
        return NextResponse.json(
            errorResponse(message, errData, statusCode),
            { status: statusCode },
        );
    }
}
