export const PUBLIC_ROUTES = ['/', '/login', '/signup', '/about-us', '/privacy-policy', '/support'] as const;

export const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/account',
  '/supplements/cart',
  '/supplements/checkout',
  '/sleep-assessment',
] as const;

export const ADMIN_ROUTES = ['/admin'] as const;

/** Routes accessible only by users with THERAPIST role */
export const THERAPIST_ROUTES = ['/therapist'] as const;

export const AUTH_ROUTES = ['/login', '/signup'] as const;

export const CUSTOMER_ONLY_ROUTES = [
  '/dashboard',
  '/blog',
  '/supplements',
  '/drift-off',
  '/therapy-corner',
  '/support',
  '/sleep-assessment',
  '/account',
  '/profile',
] as const;

export function isProtectedPath(pathname: string): boolean {
  return (
    PROTECTED_ROUTES.some((route) => pathname.startsWith(route)) ||
    ADMIN_ROUTES.some((route) => pathname.startsWith(route)) ||
    THERAPIST_ROUTES.some((route) => pathname.startsWith(route))
  );
}

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  ADMIN_DASHBOARD: '/admin/dashboard',
  THERAPIST_DASHBOARD: '/therapist/dashboard',
  SUPPLEMENTS: '/supplements',
  CART: '/supplements/cart',
  CHECKOUT: '/supplements/checkout',
} as const;
