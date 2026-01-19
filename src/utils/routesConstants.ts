export const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/account',
] as const;

export const ADMIN_ROUTES = [
  '/admin',
  '/admin/doctors',
  '/admin/therapies',
  '/admin/settings',
  '/admin/users',
  '/admin/billing',
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
