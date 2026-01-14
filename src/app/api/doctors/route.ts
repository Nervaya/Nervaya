import { NextRequest, NextResponse } from 'next/server';
import { createDoctor, getAllDoctors } from '@/lib/services/doctor.service';
import { successResponse, errorResponse } from '@/lib/utils/response.util';
import { handleError } from '@/lib/utils/error.util';

export async function GET(req: NextRequest) {
    try {
        const doctors = await getAllDoctors();
        return NextResponse.json(successResponse('Doctors fetched successfully', doctors));
    } catch (error) {
        const { message, statusCode, error: errData } = handleError(error);
        return NextResponse.json(errorResponse(message, errData, statusCode), { status: statusCode });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const doctor = await createDoctor(body);
        return NextResponse.json(successResponse('Doctor created successfully', doctor, 201), { status: 201 });
    } catch (error) {
        const { message, statusCode, error: errData } = handleError(error);
        return NextResponse.json(errorResponse(message, errData, statusCode), { status: statusCode });
    }
}
