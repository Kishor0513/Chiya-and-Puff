import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuth } from './lib/auth';

export async function middleware(req: NextRequest) {
    const token = req.cookies.get('auth-token')?.value;

    const isAuthPage = req.nextUrl.pathname.startsWith('/login');

    if (isAuthPage) {
        if (token) {
            try {
                const payload = await verifyAuth(token);
                if (payload.role === 'ADMIN') {
                    return NextResponse.redirect(new URL('/admin', req.url));
                }
                return NextResponse.redirect(new URL('/waiter', req.url));
            } catch (err) {
                // Token invalid, allow them to login
            }
        }
        return NextResponse.next();
    }

    // Protected routes
    if (req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname.startsWith('/waiter')) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', req.url));
        }

        try {
            const payload = await verifyAuth(token);

            if (req.nextUrl.pathname.startsWith('/admin') && payload.role !== 'ADMIN') {
                return NextResponse.redirect(new URL('/waiter', req.url));
            }
            if (req.nextUrl.pathname.startsWith('/waiter') && payload.role === 'ADMIN') {
                // Optionally admins can view waiter page, but let's redirect them to admin for simplicity
                return NextResponse.redirect(new URL('/admin', req.url));
            }

            return NextResponse.next();
        } catch (err) {
            // Invalid token
            return NextResponse.redirect(new URL('/login', req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/waiter/:path*', '/login'],
};
