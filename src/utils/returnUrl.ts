/**
 * Validates returnUrl to prevent open redirects.
 * Allows only same-origin, path-only URLs (e.g. /supplements, /supplements/cart).
 */
export function validateReturnUrl(value: string | null | undefined): string | null {
  if (value == null || typeof value !== 'string') return null;
  const path = value.trim();
  if (path === '') return null;
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('://')) return null;
  return path;
}
