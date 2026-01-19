import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/services/cloudinary.service';
import { errorResponse } from '@/lib/utils/response.util';
import { ApiError } from '@/types/error.types';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadImage(buffer);

    return NextResponse.json({ url });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json(
      errorResponse(errorMessage, error as ApiError, 500),
      { status: 500 },
    );
  }
}
