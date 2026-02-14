/** Rate limit and OTP configuration. */

export const MAX_LOGIN_ATTEMPTS = 5;
export const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export const MAX_SIGNUP_ATTEMPTS = 3;
export const SIGNUP_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export const MAX_OTP_SEND_PER_EMAIL = 5;
export const OTP_SEND_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export const MAX_OTP_VERIFY_ATTEMPTS = 5;
export const OTP_VERIFY_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

export const OTP_LENGTH = 6;
