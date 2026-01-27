import { NextRequest, NextResponse } from 'next/server';
import { createSupplement, getActiveSupplements, getAllSupplements } from '@/lib/services/supplement.service';
import { successResponse, errorResponse } from '@/lib/utils/response.util';
import { handleError } from '@/lib/utils/error.util';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import { ROLES } from '@/lib/constants/roles';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const adminView = searchParams.get('admin') === 'true';

    let supplements;
    if (adminView) {
      const authResult = await requireAuth(request, [ROLES.ADMIN]);
      if (authResult instanceof NextResponse) {
        return authResult;
      }
      supplements = await getAllSupplements();
    } else {
      supplements = await getActiveSupplements(category || undefined);
    }

    return NextResponse.json(successResponse('Supplements fetched successfully', supplements));
  } catch (error) {
    const { message, statusCode, error: errData } = handleError(error);
    return NextResponse.json(errorResponse(message, errData, statusCode), {
      status: statusCode,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, [ROLES.ADMIN]);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await req.json();

    if (!body || typeof body !== 'object') {
      return NextResponse.json(errorResponse('Invalid request body', null, 400), { status: 400 });
    }

    const supplement = await createSupplement(body);
    return NextResponse.json(successResponse('Supplement created successfully', supplement, 201), { status: 201 });
  } catch (error) {
    const { message, statusCode, error: errData } = handleError(error);
    return NextResponse.json(errorResponse(message, errData, statusCode), {
      status: statusCode,
    });
  }
}
