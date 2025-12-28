import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession, decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    const session = request.cookies.get('session')?.value;
    const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup');
    const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');

    if (isDashboard && !session) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (isAuthPage && session) {
        // Validate session before redirecting
        try {
            await decrypt(session);
            return NextResponse.redirect(new URL('/dashboard', request.url));
        } catch {
            // Invalid session - allow access to auth page, but effectively they will be logged out eventually
        }
    }

    // Update session expiry if exists
    return await updateSession(request);
}

export const config = {
    matcher: ['/dashboard/:path*', '/login', '/signup'],
};
