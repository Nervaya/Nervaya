import { NextRequest, NextResponse } from 'next/server';
import { createTherapist, getAllTherapists } from '@/lib/services/therapist.service';
import { successResponse, errorResponse } from '@/lib/utils/response.util';
import { handleError } from '@/lib/utils/error.util';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import { ROLES } from '@/lib/constants/roles';

export async function GET() {
  try {
    // GET is public - anyone can view therapists
    const therapists = await getAllTherapists();
    return NextResponse.json(successResponse('Therapists fetched successfully', therapists));
  } catch (error) {
    const { message, statusCode, error: errData } = handleError(error);
    return NextResponse.json(errorResponse(message, errData, statusCode), { status: statusCode });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Require authentication and ADMIN role for creating therapists
    const authResult = await requireAuth(req, [ROLES.ADMIN]);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await req.json();
    
    // Input validation
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        errorResponse('Invalid request body', null, 400),
        { status: 400 }
      );
    }

    const therapist = await createTherapist(body);
    return NextResponse.json(successResponse('Therapist created successfully', therapist, 201), { status: 201 });
  } catch (error) {
    const { message, statusCode, error: errData } = handleError(error);
    return NextResponse.json(errorResponse(message, errData, statusCode), { status: statusCode });
  }
}
