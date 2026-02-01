export const COOKIE_NAMES = {
  AUTH_TOKEN: 'auth_token',
} as const;

export const AUTH_STORAGE_KEYS = {
  AUTH_USER: 'nervaya_auth_user',
  AUTH_EXPIRES_AT: 'nervaya_auth_expires_at',
  IS_LOGGED_IN: 'isLoggedIn',
} as const;

export const COOKIE_OPTIONS = {
  AUTH_TOKEN_MAX_AGE: 7 * 24 * 60 * 60,
} as const;

export function getSecureCookieOptions(isProduction: boolean = process.env.NODE_ENV === 'production') {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict' as const,
    path: '/',
    maxAge: COOKIE_OPTIONS.AUTH_TOKEN_MAX_AGE,
  };
}
