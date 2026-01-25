export const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/account',
  '/sleep-assessment',
] as const;

export const ADMIN_ROUTES = [
  '/admin',
  '/admin/therapists',
  '/admin/settings',
  '/admin/users',
  '/admin/billing',
  '/admin/sleep-assessment',
] as const;

export const AUTH_ROUTES = [
  '/login',
  '/signup',
] as const;

// Common redirect routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  ADMIN_DASHBOARD: '/admin/dashboard',
} as const;
