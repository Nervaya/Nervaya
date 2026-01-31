import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken } from './lib/utils/jwt.util';
import { PROTECTED_ROUTES, ADMIN_ROUTES, AUTH_ROUTES, CUSTOMER_ONLY_ROUTES, ROUTES } from '@/utils/routesConstants';
import { validateReturnUrl } from '@/utils/returnUrl';
import { COOKIE_NAMES } from '@/utils/cookieConstants';
import { ROLES } from '@/lib/constants/roles';

function loginRedirectUrl(request: NextRequest, returnPath: string): URL {
  const url = new URL(ROUTES.LOGIN, request.url);
  const safeReturn = validateReturnUrl(returnPath);
  if (safeReturn) {
    url.searchParams.set('returnUrl', safeReturn);
  }
  return url;
}

export async function middleware(request: NextRequest) {
  const currentPath = request.nextUrl.pathname;
  let response: NextResponse;

  const token = request.cookies.get(COOKIE_NAMES.AUTH_TOKEN)?.value;

  if (
    PROTECTED_ROUTES.some((route) => currentPath.startsWith(route)) ||
    ADMIN_ROUTES.some((route) => currentPath.startsWith(route))
  ) {
    if (!token) {
      response = NextResponse.redirect(loginRedirectUrl(request, currentPath));
    } else {
      const decoded = await verifyToken(token);
      if (!decoded) {
        response = NextResponse.redirect(loginRedirectUrl(request, currentPath));
        response.cookies.delete(COOKIE_NAMES.AUTH_TOKEN);
      } else if (ADMIN_ROUTES.some((route) => currentPath.startsWith(route)) && decoded.role !== ROLES.ADMIN) {
        response = NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url));
      } else if (PROTECTED_ROUTES.some((route) => currentPath.startsWith(route)) && decoded.role === ROLES.ADMIN) {
        response = NextResponse.redirect(new URL(ROUTES.ADMIN_DASHBOARD, request.url));
      } else {
        response = NextResponse.next();
      }
    }
  } else if (CUSTOMER_ONLY_ROUTES.some((route) => currentPath.startsWith(route))) {
    if (token) {
      const decoded = await verifyToken(token);
      if (decoded?.role === ROLES.ADMIN) {
        response = NextResponse.redirect(new URL(ROUTES.ADMIN_DASHBOARD, request.url));
      } else {
        response = NextResponse.next();
      }
    } else {
      response = NextResponse.next();
    }
  } else if (AUTH_ROUTES.some((route) => currentPath.startsWith(route))) {
    if (token) {
      const decoded = await verifyToken(token);
      if (decoded) {
        const redirectUrl = decoded.role === ROLES.ADMIN ? ROUTES.ADMIN_DASHBOARD : ROUTES.DASHBOARD;
        response = NextResponse.redirect(new URL(redirectUrl, request.url));
      } else {
        response = NextResponse.next();
      }
    } else {
      response = NextResponse.next();
    }
  } else {
    response = NextResponse.next();
  }

  // Add security headers
  const isProduction = process.env.NODE_ENV === 'production';

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (isProduction) {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  return response;
}

export const config = {
  // Only run middleware on routes that need auth checks
  // Public routes like /, /about-us, /support, /privacy-policy are excluded
  matcher: [
    '/dashboard/:path*',
    '/account/:path*',
    '/profile/:path*',
    '/supplements/:path*',
    '/sleep-assessment/:path*',
    '/drift-off/:path*',
    '/sleep-elixir/:path*',
    '/therapy-corner/:path*',
    '/support/:path*',
    '/admin/:path*',
    '/login/:path*',
    '/signup/:path*',
  ],
};
