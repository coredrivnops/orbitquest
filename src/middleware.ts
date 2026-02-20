import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Force canonical URL - redirect www to non-www
    const hostname = request.headers.get('host') || '';
    if (hostname.startsWith('www.')) {
        const newUrl = request.nextUrl.clone();
        newUrl.host = hostname.replace('www.', '');
        return NextResponse.redirect(newUrl, 301);
    }

    // Remove trailing slashes (except for root)
    if (pathname !== '/' && pathname.endsWith('/')) {
        const newUrl = request.nextUrl.clone();
        newUrl.pathname = pathname.slice(0, -1);
        return NextResponse.redirect(newUrl, 301);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp3|wav)$).*)',
    ],
};
