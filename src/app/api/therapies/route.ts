import { NextRequest, NextResponse } from 'next/server';
import { createTherapy, getAllTherapies } from '@/lib/services/therapy.service';
import { successResponse, errorResponse } from '@/lib/utils/response.util';
import { handleError } from '@/lib/utils/error.util';

export async function GET(req: NextRequest) {
    try {
        const therapies = await getAllTherapies();
        return NextResponse.json(successResponse('Therapies fetched successfully', therapies));
    } catch (error) {
        const { message, statusCode, error: errData } = handleError(error);
        return NextResponse.json(errorResponse(message, errData, statusCode), { status: statusCode });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const therapy = await createTherapy(body);
        return NextResponse.json(successResponse('Therapy created successfully', therapy, 201), { status: 201 });
    } catch (error) {
        const { message, statusCode, error: errData } = handleError(error);
        return NextResponse.json(errorResponse(message, errData, statusCode), { status: statusCode });
    }
}
