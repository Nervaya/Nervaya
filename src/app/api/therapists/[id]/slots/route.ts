import { NextRequest, NextResponse } from 'next/server';
import { getAvailableSlots } from '@/lib/services/therapistSlot.service';
import { successResponse, errorResponse } from '@/lib/utils/response.util';
import { handleError } from '@/lib/utils/error.util';

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

        if (!date) {
            return NextResponse.json(
                errorResponse('Date parameter is required', null, 400),
                { status: 400 },
            );
        }

        const slots = await getAvailableSlots(therapistId, date);

        return NextResponse.json(
            successResponse('Slots fetched successfully', slots),
        );
    } catch (error) {
        const { message, statusCode, error: errData } = handleError(error);
        return NextResponse.json(
            errorResponse(message, errData, statusCode),
            { status: statusCode },
        );
    }
}
