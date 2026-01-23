import { NextRequest, NextResponse } from 'next/server';
import {
    getAvailableSlots,
    createCustomSlot,
    updateSlot,
    deleteSlot,
    getSlotsByDateRange,
    bulkUpdateSlots,
} from '@/lib/services/therapistSlot.service';
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
        const { id: therapistId } = await params;
        const { searchParams } = new URL(req.url);
        const date = searchParams.get('date');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const includeBooked = searchParams.get('includeBooked') === 'true';

        // Support both single date and date range queries
        if (date) {
            const slots = await getAvailableSlots(therapistId, date);
            return NextResponse.json(
                successResponse('Slots fetched successfully', slots),
            );
        } else if (startDate && endDate) {
            const slots = await getSlotsByDateRange(
                therapistId,
                startDate,
                endDate,
                includeBooked,
            );
            return NextResponse.json(
                successResponse('Slots fetched successfully', slots),
            );
        } else {
            return NextResponse.json(
                errorResponse('Date or date range (startDate, endDate) parameter is required', null, 400),
                { status: 400 },
            );
        }
    } catch (error) {
        const { message, statusCode, error: errData } = handleError(error);
        return NextResponse.json(
            errorResponse(message, errData, statusCode),
            { status: statusCode },
        );
    }
}

export async function POST(
    req: NextRequest,
    { params }: RouteParams,
) {
    try {
        // Require admin authentication
        const authResult = await requireAuth(req, [ROLES.ADMIN]);

        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { id: therapistId } = await params;
        const body = await req.json();

        const { date, startTime, endTime, isAvailable } = body;

        if (!date || !startTime || !endTime) {
            return NextResponse.json(
                errorResponse('Missing required fields: date, startTime, endTime', null, 400),
                { status: 400 },
            );
        }

        const slot = await createCustomSlot(
            therapistId,
            date,
            startTime,
            endTime,
            isAvailable !== undefined ? isAvailable : true,
        );

        return NextResponse.json(
            successResponse('Slot created successfully', slot, 201),
            { status: 201 },
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
        // Require admin authentication
        const authResult = await requireAuth(req, [ROLES.ADMIN]);

        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { searchParams } = new URL(req.url);
        const slotId = searchParams.get('slotId');

        if (!slotId) {
            return NextResponse.json(
                errorResponse('slotId query parameter is required', null, 400),
                { status: 400 },
            );
        }

        const body = await req.json();
        const { date, startTime, endTime, isAvailable } = body;

        const updates: Record<string, unknown> = {};
        if (date !== undefined) updates.date = date;
        if (startTime !== undefined) updates.startTime = startTime;
        if (endTime !== undefined) updates.endTime = endTime;
        if (isAvailable !== undefined) updates.isAvailable = isAvailable;

        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                errorResponse('No valid fields to update', null, 400),
                { status: 400 },
            );
        }

        const slot = await updateSlot(slotId, updates);

        return NextResponse.json(
            successResponse('Slot updated successfully', slot),
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
        // Require admin authentication
        const authResult = await requireAuth(req, [ROLES.ADMIN]);

        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { searchParams } = new URL(req.url);
        const slotId = searchParams.get('slotId');

        if (!slotId) {
            return NextResponse.json(
                errorResponse('slotId query parameter is required', null, 400),
                { status: 400 },
            );
        }

        const result = await deleteSlot(slotId);

        return NextResponse.json(
            successResponse(result.message || 'Slot deleted successfully', result),
        );
    } catch (error) {
        const { message, statusCode, error: errData } = handleError(error);
        return NextResponse.json(
            errorResponse(message, errData, statusCode),
            { status: statusCode },
        );
    }
}
