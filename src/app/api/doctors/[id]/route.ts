import { NextRequest, NextResponse } from 'next/server';
import { getDoctorById, updateDoctor, deleteDoctor } from '@/lib/services/doctor.service';
import { successResponse, errorResponse } from '@/lib/utils/response.util';
import { handleError } from '@/lib/utils/error.util';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const doctor = await getDoctorById(id);
    return NextResponse.json(successResponse('Doctor fetched successfully', doctor));
  } catch (error) {
    const { message, statusCode, error: errData } = handleError(error);
    return NextResponse.json(errorResponse(message, errData, statusCode), { status: statusCode });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const doctor = await updateDoctor(id, body);
    return NextResponse.json(successResponse('Doctor updated successfully', doctor));
  } catch (error) {
    const { message, statusCode, error: errData } = handleError(error);
    return NextResponse.json(errorResponse(message, errData, statusCode), { status: statusCode });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteDoctor(id);
    return NextResponse.json(successResponse('Doctor deleted successfully', null));
  } catch (error) {
    const { message, statusCode, error: errData } = handleError(error);
    return NextResponse.json(errorResponse(message, errData, statusCode), { status: statusCode });
  }
}
