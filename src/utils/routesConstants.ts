export const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/account',
  '/supplements/cart',
  '/supplements/checkout',
  '/sleep-assessment',
] as const;

export const ADMIN_ROUTES = [
  '/admin',
  '/admin/therapists',
  '/admin/settings',
  '/admin/users',
  '/admin/billing',
  '/admin/supplements',
  '/admin/sleep-assessment',
] as const;

export const AUTH_ROUTES = ['/login', '/signup'] as const;

export const CUSTOMER_ONLY_ROUTES = [
  '/supplements',
  '/drift-off',
  '/sleep-elixir',
  '/therapy-corner',
  '/support',
] as const;

export function isProtectedPath(pathname: string): boolean {
  return (
    PROTECTED_ROUTES.some((route) => pathname.startsWith(route)) ||
    ADMIN_ROUTES.some((route) => pathname.startsWith(route))
  );
}

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  ADMIN_DASHBOARD: '/admin/dashboard',
  SUPPLEMENTS: '/supplements',
  CART: '/supplements/cart',
  CHECKOUT: '/supplements/checkout',
} as const;
