import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/services/auth.service';
import { successResponse, errorResponse } from '@/lib/utils/response.util';
import { handleError } from '@/lib/utils/error.util';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, name } = body;

        if (!email || !password || !name) {
            return NextResponse.json(
                errorResponse('Email, password, and name are required'),
                { status: 400 }
            );
        }

        const result = await registerUser(email, password, name);

        return NextResponse.json(
            successResponse('User registered successfully', result),
            { status: 201 }
        );
    } catch (error: any) {
        const { message, statusCode } = handleError(error);
        return NextResponse.json(errorResponse(message, error.message), { status: statusCode });
    }
}
