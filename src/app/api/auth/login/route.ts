import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/services/auth.service';
import { successResponse, errorResponse } from '@/lib/utils/response.util';
import { handleError } from '@/lib/utils/error.util';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                errorResponse('Email and password are required', null, 400),
                { status: 400 }
            );
        }

        const result = await loginUser(email, password);

        return NextResponse.json(
            successResponse('Login successful', result),
            { status: 200 }
        );
    } catch (error: any) {
        const { message, statusCode, error: errData } = handleError(error);
        return NextResponse.json(errorResponse(message, errData, statusCode), { status: statusCode });
    }
}
