import {
  MAX_LOGIN_ATTEMPTS,
  LOGIN_WINDOW_MS,
  MAX_SIGNUP_ATTEMPTS,
  SIGNUP_WINDOW_MS,
  MAX_OTP_SEND_PER_EMAIL,
  OTP_SEND_WINDOW_MS,
  MAX_OTP_VERIFY_ATTEMPTS,
  OTP_VERIFY_WINDOW_MS,
} from '@/lib/constants/otp.constants';

export interface RateLimitOptions {
  maxAttempts: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining?: number;
  resetTime?: number;
}

const loginAttempts = new Map<string, { count: number; resetTime: number }>();
const signupAttempts = new Map<string, { count: number; resetTime: number }>();
const otpSendAttempts = new Map<string, { count: number; sendCount: number; resetTime: number }>();
const otpVerifyAttempts = new Map<string, { count: number; resetTime: number }>();

function checkWindow(
  map: Map<string, { count: number; resetTime: number }>,
  identifier: string,
  maxAttempts: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const entry = map.get(identifier);

  if (entry && now > entry.resetTime) {
    map.delete(identifier);
  }

  const current = map.get(identifier);
  if (!current || now > current.resetTime) {
    map.set(identifier, { count: 1, resetTime: now + windowMs });
    return {
      allowed: true,
      remaining: maxAttempts - 1,
      resetTime: now + windowMs,
    };
  }

  if (current.count >= maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime,
    };
  }

  current.count++;
  return {
    allowed: true,
    remaining: maxAttempts - current.count,
    resetTime: current.resetTime,
  };
}

export function checkLoginRateLimit(identifier: string): boolean {
  const result = checkWindow(loginAttempts, identifier, MAX_LOGIN_ATTEMPTS, LOGIN_WINDOW_MS);
  return result.allowed;
}

export function checkSignupRateLimit(identifier: string): boolean {
  const result = checkWindow(signupAttempts, identifier, MAX_SIGNUP_ATTEMPTS, SIGNUP_WINDOW_MS);
  return result.allowed;
}

export interface OTPSendLimitResult {
  allowed: boolean;
  sendCount: number;
  resetTime?: number;
}

export function checkOTPSendLimit(identifier: string): OTPSendLimitResult {
  const now = Date.now();
  const entry = otpSendAttempts.get(identifier);

  if (entry && now > entry.resetTime) {
    otpSendAttempts.delete(identifier);
  }

  const current = otpSendAttempts.get(identifier);
  if (!current || now > current.resetTime) {
    const resetTime = now + OTP_SEND_WINDOW_MS;
    otpSendAttempts.set(identifier, {
      count: 1,
      sendCount: 1,
      resetTime,
    });
    return {
      allowed: true,
      sendCount: 1,
      resetTime,
    };
  }

  if (current.sendCount >= MAX_OTP_SEND_PER_EMAIL) {
    return {
      allowed: false,
      sendCount: current.sendCount,
      resetTime: current.resetTime,
    };
  }

  current.sendCount++;
  current.count++;
  return {
    allowed: true,
    sendCount: current.sendCount,
    resetTime: current.resetTime,
  };
}

export function checkOTPVerifyRateLimit(identifier: string): boolean {
  const result = checkWindow(otpVerifyAttempts, identifier, MAX_OTP_VERIFY_ATTEMPTS, OTP_VERIFY_WINDOW_MS);
  return result.allowed;
}
