import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken } from './lib/utils/jwt.util';
import { PROTECTED_ROUTES, ADMIN_ROUTES, AUTH_ROUTES, ROUTES } from '@/utils/routesConstants';
import { COOKIE_NAMES } from '@/utils/cookieConstants';

export async function middleware(request: NextRequest) {
  const currentPath = request.nextUrl.pathname;

  const token = request.cookies.get(COOKIE_NAMES.AUTH_TOKEN)?.value;

  if (PROTECTED_ROUTES.some(route => currentPath.startsWith(route)) || ADMIN_ROUTES.some(route => currentPath.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      const response = NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
      response.cookies.delete(COOKIE_NAMES.AUTH_TOKEN);
      return response;
    }

    if (ADMIN_ROUTES.some(route => currentPath.startsWith(route)) && decoded.role !== 'ADMIN') { // Verified ADMIN matches constant
      return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url));
    }
  }

  if (AUTH_ROUTES.some(route => currentPath.startsWith(route))) {
    if (token) {
      const decoded = await verifyToken(token);
      if (decoded) {
        return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
      }
      // If token is present but invalid, let them proceed to login page (and maybe clear cookie?)
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icons/).*)'],
};
