import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/services/auth.service';
import { successResponse, errorResponse } from '@/lib/utils/response.util';
import { handleError } from '@/lib/utils/error.util';
import { ApiError } from '@/types/error.types';
import { COOKIE_NAMES, getSecureCookieOptions } from '@/utils/cookieConstants';

const signupAttempts = new Map<string, { count: number; resetTime: number }>();
const MAX_ATTEMPTS = 3;
const WINDOW_MS = 60 * 60 * 1000;

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const attempt = signupAttempts.get(identifier);

  if (attempt && now > attempt.resetTime) {
    signupAttempts.delete(identifier);
  }

  if (!attempt || now > attempt.resetTime) {
    signupAttempts.set(identifier, { count: 1, resetTime: now + WINDOW_MS });
    return true;
  }

  if (attempt.count >= MAX_ATTEMPTS) {
    return false;
  }

  attempt.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(errorResponse('Too many signup attempts. Please try again later.', null, 429), {
        status: 429,
      });
    }

    const body = await request.json();
    const { email, password, name, role } = body;

    if (!email || !password || !name) {
      return NextResponse.json(errorResponse('Email, password, and name are required', null, 400), { status: 400 });
    }

    if (typeof email !== 'string' || typeof password !== 'string' || typeof name !== 'string') {
      return NextResponse.json(errorResponse('Invalid input format', null, 400), { status: 400 });
    }

    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedPassword = password.trim();
    const sanitizedName = name.trim();

    if (!sanitizedEmail || !sanitizedPassword || !sanitizedName) {
      return NextResponse.json(errorResponse('Email, password, and name cannot be empty', null, 400), { status: 400 });
    }

    const sanitizedRole = role === 'ADMIN' ? undefined : role;

    const result = await registerUser(sanitizedEmail, sanitizedPassword, sanitizedName, sanitizedRole);

    const response = NextResponse.json(successResponse('User registered successfully', result, 201), { status: 201 });

    response.cookies.set(COOKIE_NAMES.AUTH_TOKEN, result.token, getSecureCookieOptions());

    return response;
  } catch (error) {
    const { message, statusCode, error: errData } = handleError(error as ApiError);
    return NextResponse.json(errorResponse(message, errData, statusCode), {
      status: statusCode,
    });
  }
}
