import { NextRequest, NextResponse } from 'next/server';
import Session from '@/lib/models/session.model';
import {
  createCustomSlot,
  updateSlot,
  deleteSlot,
  getScheduleByDate,
  getSchedulesByDateRange,
} from '@/lib/services/therapistSchedule.service';
import { successResponse, errorResponse } from '@/lib/utils/response.util';
import { handleError } from '@/lib/utils/error.util';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import { ROLES } from '@/lib/constants/roles';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: therapistId } = await params;
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const includeBooked = searchParams.get('includeBooked') !== 'false';

    if (startDate && endDate) {
      const schedules = await getSchedulesByDateRange(therapistId, startDate, endDate, includeBooked);
      const data = schedules.map((s) => ({
        date: s.date,
        slots: s.slots.map((slot) => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
          isAvailable: slot.isAvailable,
        })),
      }));
      return NextResponse.json(successResponse('Schedules fetched successfully', data));
    }

    if (date) {
      const schedule = await getScheduleByDate(therapistId, date);
      const bookedSessions = await Session.find({
        therapistId,
        date,
        status: { $ne: 'cancelled' },
      }).select('startTime');
      const bookedStartTimes = new Set(bookedSessions.map((s) => s.startTime));
      const slots = (schedule.slots || []).map((slot) => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: includeBooked
          ? bookedStartTimes.has(slot.startTime)
            ? false
            : slot.isAvailable
          : slot.isAvailable,
      }));
      return NextResponse.json(
        successResponse('Schedule fetched successfully', {
          date: schedule.date || date,
          slots,
        }),
      );
    }

    return NextResponse.json(errorResponse('Date or startDate/endDate is required', null, 400), { status: 400 });
  } catch (error) {
    const { message, statusCode, error: errData } = handleError(error);
    return NextResponse.json(errorResponse(message, errData, statusCode), {
      status: statusCode,
    });
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(req, [ROLES.ADMIN]);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id: therapistId } = await params;
    const body = await req.json();

    const { date, startTime, endTime, isAvailable } = body;

    if (!date || !startTime || !endTime) {
      return NextResponse.json(errorResponse('Missing required fields: date, startTime, endTime', null, 400), {
        status: 400,
      });
    }

    const slot = await createCustomSlot(
      therapistId,
      date,
      startTime,
      endTime,
      isAvailable !== undefined ? isAvailable : true,
    );

    return NextResponse.json(successResponse('Slot created successfully', slot, 201), { status: 201 });
  } catch (error) {
    const { message, statusCode, error: errData } = handleError(error);
    return NextResponse.json(errorResponse(message, errData, statusCode), {
      status: statusCode,
    });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(req, [ROLES.ADMIN]);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id: therapistId } = await params;
    const body = await req.json();

    const { date, startTime, updates } = body;

    if (!date || !startTime || !updates) {
      return NextResponse.json(errorResponse('Missing required fields: date, startTime, updates', null, 400), {
        status: 400,
      });
    }

    const slot = await updateSlot(therapistId, date, startTime, updates);

    return NextResponse.json(successResponse('Slot updated successfully', slot));
  } catch (error) {
    const { message, statusCode, error: errData } = handleError(error);
    return NextResponse.json(errorResponse(message, errData, statusCode), {
      status: statusCode,
    });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(req, [ROLES.ADMIN]);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id: therapistId } = await params;
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const startTime = searchParams.get('startTime');

    if (!date || !startTime) {
      return NextResponse.json(errorResponse('Missing required parameters: date, startTime', null, 400), {
        status: 400,
      });
    }

    await deleteSlot(therapistId, date, startTime);

    return NextResponse.json(successResponse('Slot deleted successfully'));
  } catch (error) {
    const { message, statusCode, error: errData } = handleError(error);
    return NextResponse.json(errorResponse(message, errData, statusCode), {
      status: statusCode,
    });
  }
}
