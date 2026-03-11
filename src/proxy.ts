import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { verifyAuth } from './lib/auth';

export async function proxy(req: NextRequest) {
	const token = req.cookies.get('auth-token')?.value;

	const isAuthPage = req.nextUrl.pathname.startsWith('/login');

	if (isAuthPage) {
		if (token) {
			try {
				const payload = await verifyAuth(token);
				if (payload.role === 'ADMIN') {
					return NextResponse.redirect(new URL('/admin', req.url));
				}
				if (payload.role === 'CHEF') {
					return NextResponse.redirect(new URL('/kitchen', req.url));
				}
				return NextResponse.redirect(new URL('/waiter', req.url));
			} catch {
				// Token invalid, allow them to login
			}
		}
		return NextResponse.next();
	}

	// Protected routes
	if (
		req.nextUrl.pathname.startsWith('/admin') ||
		req.nextUrl.pathname.startsWith('/waiter') ||
		req.nextUrl.pathname.startsWith('/kitchen')
	) {
		if (!token) {
			return NextResponse.redirect(new URL('/login', req.url));
		}

		try {
			const payload = await verifyAuth(token);

			if (
				req.nextUrl.pathname.startsWith('/admin') &&
				payload.role !== 'ADMIN'
			) {
				if (payload.role === 'CHEF') return NextResponse.redirect(new URL('/kitchen', req.url));
				return NextResponse.redirect(new URL('/waiter', req.url));
			}

			if (
				req.nextUrl.pathname.startsWith('/kitchen') &&
				payload.role !== 'CHEF' && payload.role !== 'ADMIN'
			) {
				return NextResponse.redirect(new URL('/waiter', req.url));
			}

			if (
				req.nextUrl.pathname.startsWith('/waiter') &&
				(payload.role === 'ADMIN' || payload.role === 'CHEF')
			) {
				if (payload.role === 'ADMIN') return NextResponse.redirect(new URL('/admin', req.url));
				return NextResponse.redirect(new URL('/kitchen', req.url));
			}

			return NextResponse.next();
		} catch {
			// Invalid token
			return NextResponse.redirect(new URL('/login', req.url));
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/admin/:path*', '/waiter/:path*', '/kitchen/:path*', '/login'],
};
