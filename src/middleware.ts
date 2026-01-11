import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/utils/jwt.util';

export function middleware(request: NextRequest) {
    const protectedRoutes = ['/dashboard', '/profile'];
    const authRoutes = ['/login', '/signup'];
    const currentPath = request.nextUrl.pathname;

    const token = request.cookies.get('auth_token')?.value;

    if (protectedRoutes.some(route => currentPath.startsWith(route))) {
        if (!token || !verifyToken(token)) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    if (authRoutes.some(route => currentPath.startsWith(route))) {
        if (token && verifyToken(token)) {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icons/).*)'],
};
