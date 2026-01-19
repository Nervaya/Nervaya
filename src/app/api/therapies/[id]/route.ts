import { NextRequest, NextResponse } from 'next/server';
import { getTherapyById, updateTherapy, deleteTherapy } from '@/lib/services/therapy.service';
import { successResponse, errorResponse } from '@/lib/utils/response.util';
import { handleError } from '@/lib/utils/error.util';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const therapy = await getTherapyById(id);
    return NextResponse.json(successResponse('Therapy fetched successfully', therapy));
  } catch (error) {
    const { message, statusCode, error: errData } = handleError(error);
    return NextResponse.json(errorResponse(message, errData, statusCode), { status: statusCode });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const therapy = await updateTherapy(id, body);
    return NextResponse.json(successResponse('Therapy updated successfully', therapy));
  } catch (error) {
    const { message, statusCode, error: errData } = handleError(error);
    return NextResponse.json(errorResponse(message, errData, statusCode), { status: statusCode });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteTherapy(id);
    return NextResponse.json(successResponse('Therapy deleted successfully', null));
  } catch (error) {
    const { message, statusCode, error: errData } = handleError(error);
    return NextResponse.json(errorResponse(message, errData, statusCode), { status: statusCode });
  }
}
