import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/utils/jwt.util';

export async function middleware(request: NextRequest) {
    const protectedRoutes = ['/dashboard', '/profile', '/account'];
    const adminRoutes = ['/admin'];
    const authRoutes = ['/login', '/signup'];
    const currentPath = request.nextUrl.pathname;

    const token = request.cookies.get('auth_token')?.value;

    if (protectedRoutes.some(route => currentPath.startsWith(route)) || adminRoutes.some(route => currentPath.startsWith(route))) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        const decoded = await verifyToken(token);
        if (!decoded) {
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('auth_token');
            return response;
        }

        if (adminRoutes.some(route => currentPath.startsWith(route)) && decoded.role !== 'ADMIN') { // Verified ADMIN matches constant
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    if (authRoutes.some(route => currentPath.startsWith(route))) {
        if (token) {
            const decoded = await verifyToken(token);
            if (decoded) {
                return NextResponse.redirect(new URL('/', request.url));
            }
            // If token is present but invalid, let them proceed to login page (and maybe clear cookie?)
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icons/).*)'],
};
