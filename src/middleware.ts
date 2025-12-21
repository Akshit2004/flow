import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    // Update session expiry if exists
    const response = await updateSession(request);
    const res = response || NextResponse.next();

    const session = request.cookies.get('session')?.value;
    const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup');
    const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');

    if (isDashboard && !session) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (isAuthPage && session) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return res;
}

export const config = {
    matcher: ['/dashboard/:path*', '/login', '/signup'],
};
