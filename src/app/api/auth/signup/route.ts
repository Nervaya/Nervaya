import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/services/auth.service';
import { successResponse, errorResponse } from '@/lib/utils/response.util';
import { handleError } from '@/lib/utils/error.util';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, name, role } = body;

        // Controller level validation (Basic required fields)
        if (!email || !password || !name) {
            return NextResponse.json(
                errorResponse('Email, password, and name are required', null, 400),
                { status: 400 }
            );
        }

        const result = await registerUser(email, password, name, role);

        return NextResponse.json(
            successResponse('User registered successfully', result, 201),
            { status: 201 }
        );
    } catch (error: any) {
        const { message, statusCode, error: errData } = handleError(error);
        return NextResponse.json(errorResponse(message, errData, statusCode), { status: statusCode });
    }
}
