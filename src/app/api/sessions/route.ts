import { NextRequest, NextResponse } from "next/server";
import { createSession, getUserSessions } from "@/lib/services/session.service";
import { successResponse, errorResponse } from "@/lib/utils/response.util";
import { handleError } from "@/lib/utils/error.util";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { ROLES } from "@/lib/constants/roles";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, [ROLES.CUSTOMER, ROLES.ADMIN]);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status") || undefined;

    const sessions = await getUserSessions(
      authResult.user.userId,
      statusFilter,
    );

    return NextResponse.json(
      successResponse("Sessions fetched successfully", sessions),
    );
  } catch (error) {
    const { message, statusCode, error: errData } = handleError(error);
    return NextResponse.json(errorResponse(message, errData, statusCode), {
      status: statusCode,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, [ROLES.CUSTOMER, ROLES.ADMIN]);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await req.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        errorResponse("Invalid request body", null, 400),
        { status: 400 },
      );
    }

    const { therapistId, date, startTime } = body;

    if (!therapistId || !date || !startTime) {
      return NextResponse.json(
        errorResponse(
          "Missing required fields: therapistId, date, startTime",
          null,
          400,
        ),
        { status: 400 },
      );
    }

    const session = await createSession(
      authResult.user.userId,
      therapistId,
      date,
      startTime,
    );

    return NextResponse.json(
      successResponse("Session booked successfully", session, 201),
      { status: 201 },
    );
  } catch (error) {
    const { message, statusCode, error: errData } = handleError(error);
    return NextResponse.json(errorResponse(message, errData, statusCode), {
      status: statusCode,
    });
  }
}
