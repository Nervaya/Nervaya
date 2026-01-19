export const COOKIE_NAMES = {
  AUTH_TOKEN: 'auth_token',
} as const;

export const COOKIE_OPTIONS = {
  AUTH_TOKEN_MAX_AGE: 7 * 24 * 60 * 60, // 7 days in seconds
} as const;
