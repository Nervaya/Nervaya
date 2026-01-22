import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/services/auth.service';
import { successResponse, errorResponse } from '@/lib/utils/response.util';
import { handleError } from '@/lib/utils/error.util';
import { ApiError } from '@/types/error.types';
import { COOKIE_NAMES, getSecureCookieOptions } from '@/utils/cookieConstants';

// In-memory rate limiting - optimized for Vercel serverless functions
// Each function instance maintains its own rate limit state
const loginAttempts = new Map<string, { count: number; resetTime: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const attempt = loginAttempts.get(identifier);

  // Clean up expired entries on access (Vercel functions are short-lived, so simple cleanup is sufficient)
  if (attempt && now > attempt.resetTime) {
    loginAttempts.delete(identifier);
  }

  if (!attempt || now > attempt.resetTime) {
    loginAttempts.set(identifier, { count: 1, resetTime: now + WINDOW_MS });
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
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        errorResponse('Too many login attempts. Please try again later.', null, 429),
        { status: 429 },
      );
    }

    const body = await request.json();
    const { email, password } = body;

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        errorResponse('Email and password are required', null, 400),
        { status: 400 },
      );
    }

    // Validate email format
    if (typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        errorResponse('Invalid input format', null, 400),
        { status: 400 },
      );
    }

    // Sanitize input (trim whitespace)
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedPassword = password.trim();

    if (!sanitizedEmail || !sanitizedPassword) {
      return NextResponse.json(
        errorResponse('Email and password cannot be empty', null, 400),
        { status: 400 },
      );
    }

    const result = await loginUser(sanitizedEmail, sanitizedPassword);

    // Set secure HTTP-only cookie
    const response = NextResponse.json(
      successResponse('Login successful', result),
      { status: 200 },
    );

    response.cookies.set(
      COOKIE_NAMES.AUTH_TOKEN,
      result.token,
      getSecureCookieOptions()
    );

    return response;
  } catch (error) {
    const { message, statusCode, error: errData } = handleError(error as ApiError);
    return NextResponse.json(errorResponse(message, errData, statusCode), { status: statusCode });
  }
}
