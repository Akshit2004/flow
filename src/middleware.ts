import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession, decrypt } from '@/lib/auth';
import { RateLimiter } from '@/lib/ratelimit';

// Initialize limiters outside to persist across generic invocations where possible (in-memory)
// Note: This is per-instance memory. Distribution requires Redis/KV.
const authLimiter = RateLimiter.strict();
const apiLimiter = RateLimiter.moderate();

export async function middleware(request: NextRequest) {
    const ip = (request as any).ip || request.headers.get('x-forwarded-for') || '127.0.0.1';

    // 1. Rate Limiting Logic
    const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup');
    const isApi = request.nextUrl.pathname.startsWith('/api');

    if (isAuthPage) {
        if (!await authLimiter.check(ip)) {
            return new NextResponse('Too Many Requests', { status: 429 });
        }
    }

    if (isApi) {
        if (!await apiLimiter.check(ip)) {
            return new NextResponse('Too Many Requests', { status: 429 });
        }
    }

    // 2. Auth Logic
    const session = request.cookies.get('session')?.value;
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
    matcher: ['/dashboard/:path*', '/login', '/signup', '/api/:path*'],
};
