import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils/response.util';
import { verifyOtp } from '@/lib/services/otp';
import { createSessionAfterOtp } from '@/lib/services/auth.service';
import { handleError } from '@/lib/utils/error.util';
import { ApiError } from '@/types/error.types';
import { COOKIE_NAMES, getSecureCookieOptions } from '@/utils/cookieConstants';
import connectDB from '@/lib/db/mongodb';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  const body = await request.json().catch(() => ({}));
  const { email, code, purpose } = body;

  if (!email || code === undefined || code === null || !purpose) {
    return NextResponse.json(errorResponse('Email, code, and purpose are required', null, 400), { status: 400 });
  }

  if (typeof email !== 'string' || typeof code !== 'string' || typeof purpose !== 'string') {
    return NextResponse.json(errorResponse('Invalid input format', null, 400), { status: 400 });
  }

  if (purpose !== 'login' && purpose !== 'signup') {
    return NextResponse.json(errorResponse('Purpose must be login or signup', null, 400), { status: 400 });
  }

  const result = verifyOtp(email, code, purpose, ip);

  if (!result.success) {
    return NextResponse.json(errorResponse(result.message ?? 'Verification failed', null, result.statusCode), {
      status: result.statusCode,
    });
  }

  const sanitizedEmail = email.trim().toLowerCase();

  if (purpose === 'login') {
    try {
      const session = await createSessionAfterOtp(sanitizedEmail);
      const response = NextResponse.json(successResponse('Login successful', session, 200), { status: 200 });
      response.cookies.set(COOKIE_NAMES.AUTH_TOKEN, session.token, getSecureCookieOptions());
      return response;
    } catch (err) {
      const { message, statusCode, error: errData } = handleError(err as ApiError);
      return NextResponse.json(errorResponse(message, errData, statusCode), {
        status: statusCode,
      });
    }
  }

  if (purpose === 'signup') {
    try {
      await connectDB();

      // Consume pending signup data
      const { consumePendingSignup } = await import('@/lib/services/auth');
      const pendingData = consumePendingSignup(sanitizedEmail);

      if (!pendingData) {
        return NextResponse.json(errorResponse('Signup session expired. Please sign up again.', null, 400), {
          status: 400,
        });
      }

      // Create user with verified email
      const { createUserAfterOtpVerification } = await import('@/lib/services/auth.service');
      const session = await createUserAfterOtpVerification(
        pendingData.email,
        pendingData.password,
        pendingData.name,
        pendingData.role,
      );

      const response = NextResponse.json(successResponse('Email verified successfully', session, 200), { status: 200 });
      response.cookies.set(COOKIE_NAMES.AUTH_TOKEN, session.token, getSecureCookieOptions());
      return response;
    } catch (err) {
      const { message, statusCode, error: errData } = handleError(err as ApiError);
      return NextResponse.json(errorResponse(message, errData, statusCode), {
        status: statusCode,
      });
    }
  }

  return NextResponse.json(successResponse('OTP verified successfully', undefined, 200), { status: 200 });
}
