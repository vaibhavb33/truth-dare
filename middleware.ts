import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ALL_LOCALES, DEFAULT_LOCALE, LOCALE_COOKIE_NAME, Locale } from '@/lib/i18n/config';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip system paths, api, static files, and admin
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/room') ||
    pathname.includes('.') // e.g. icon.svg, robots.txt, sitemap.xml
  ) {
    return NextResponse.next();
  }

  // 2. Check if pathname starts with a supported locale (e.g. /es, /hi/truth-or-dare)
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0] as Locale;

  if (firstSegment && ALL_LOCALES.includes(firstSegment)) {
    // If the URL has a locale prefix, ensure the preference cookie is in sync
    const currentCookie = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
    const response = NextResponse.next();

    if (currentCookie !== firstSegment) {
      response.cookies.set(LOCALE_COOKIE_NAME, firstSegment, {
        path: '/',
        maxAge: 31536000,
        sameSite: 'lax',
      });
    }
    return response;
  }

  // 3. For unprefixed URLs, do not force change based on IP (per Phase 4 rule)
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|admin|room|.*\\..*).*)'],
};

