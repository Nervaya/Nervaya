import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/services/cloudinary.service';
import { errorResponse, successResponse } from '@/lib/utils/response.util';
import { ApiError } from '@/types/error.types';
import { requireAuth } from '@/lib/middleware/auth.middleware';

// Allowed file types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    // Require authentication - only authenticated users can upload
    const authResult = await requireAuth(req);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(errorResponse('No file uploaded', null, 400), {
        status: 400,
      });
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        errorResponse(
          'Invalid file type. Only images (JPEG, PNG, WebP, GIF) are allowed',
          null,
          400,
        ),
        { status: 400 },
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        errorResponse('File size exceeds maximum limit of 5MB', null, 400),
        { status: 400 },
      );
    }

    // Additional validation: check file extension
    const fileName = file.name.toLowerCase();
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const hasValidExtension = validExtensions.some((ext) =>
      fileName.endsWith(ext),
    );

    if (!hasValidExtension) {
      return NextResponse.json(
        errorResponse('Invalid file extension', null, 400),
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadImage(buffer);

    return NextResponse.json(
      successResponse('File uploaded successfully', { url }),
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json(
      errorResponse(errorMessage, error as ApiError, 500),
      { status: 500 },
    );
  }
}
