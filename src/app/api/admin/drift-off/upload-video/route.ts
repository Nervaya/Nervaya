import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { successResponse, errorResponse } from '@/lib/utils/response.util';
import { handleError } from '@/lib/utils/error.util';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import { ROLES } from '@/lib/constants/roles';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, [ROLES.ADMIN]);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const formData = await request.formData();
    const video = formData.get('video') as File;
    const responseId = formData.get('responseId') as string;
    const userId = formData.get('userId') as string;

    if (!video) {
      return NextResponse.json(errorResponse('Video file is required', null, 400), { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowedTypes.includes(video.type)) {
      return NextResponse.json(
        errorResponse('Invalid file type. Only MP4, WebM, and MOV files are allowed', null, 400),
        { status: 400 },
      );
    }

    // Validate file size (100MB max)
    const maxSize = 100 * 1024 * 1024;
    if (video.size > maxSize) {
      return NextResponse.json(errorResponse('File size must be less than 100MB', null, 400), { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'videos');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = video.name.split('.').pop() || 'mp4';
    const fileName = `${userId}_${responseId}_${timestamp}.${fileExtension}`;
    const filePath = join(uploadsDir, fileName);

    // Save file to disk
    const bytes = await video.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Generate public URL
    const videoUrl = `/uploads/videos/${fileName}`;

    console.warn(`Video uploaded successfully: ${fileName} for user ${userId}, response ${responseId}`);

    return NextResponse.json(successResponse('Video uploaded successfully', { videoUrl, fileName }), { status: 201 });
  } catch (error) {
    console.error('Error uploading video:', error);
    const { message, statusCode, error: errData } = handleError(error);
    return NextResponse.json(errorResponse(message, errData, statusCode), { status: statusCode });
  }
}
