import { NextRequest, NextResponse } from 'next/server';
import { generateSlotsFromConsultingHours } from '@/lib/services/therapistSchedule.service';
import { successResponse, errorResponse } from '@/lib/utils/response.util';
import { handleError } from '@/lib/utils/error.util';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import { ROLES } from '@/lib/constants/roles';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function POST(
    req: NextRequest,
    { params }: RouteParams,
) {
    try {
        const authResult = await requireAuth(req, [ROLES.ADMIN]);

        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { id: therapistId } = await params;
        const { searchParams } = new URL(req.url);
        const numberOfDays = searchParams.get('days')
            ? parseInt(searchParams.get('days')!, 10)
            : 30;

        const result = await generateSlotsFromConsultingHours(
            therapistId,
            new Date(),
            numberOfDays,
        );

        return NextResponse.json(
            successResponse(
                `Generated schedules successfully`,
                {
                    insertedCount: result.insertedCount || 0,
                    modifiedCount: result.modifiedCount || 0,
                },
            ),
        );
    } catch (error) {
        const { message, statusCode, error: errData } = handleError(error);
        return NextResponse.json(
            errorResponse(message, errData, statusCode),
            { status: statusCode },
        );
    }
}
