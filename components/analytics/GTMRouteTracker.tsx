'use client';

import { useEffect, useRef, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageView } from '@/lib/analytics/gtm';

function RouteTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isInitialLoad = useRef(true);
  const previousUrl = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;

    const queryString = searchParams?.toString();
    const currentUrl = queryString ? `${pathname}?${queryString}` : pathname;

    // Prevent duplicate triggers if path and search haven't changed
    if (previousUrl.current === currentUrl) return;

    // Skip duplicate page_view on initial container load (gtm.js handles initial pageview)
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      previousUrl.current = currentUrl;
      return;
    }

    previousUrl.current = currentUrl;

    // Track client-side SPA navigation
    trackPageView({
      path: pathname,
      url: typeof window !== 'undefined' ? window.location.href : currentUrl,
      title: typeof document !== 'undefined' ? document.title : undefined,
    });
  }, [pathname, searchParams]);

  return null;
}

export function GTMRouteTracker() {
  return (
    <Suspense fallback={null}>
      <RouteTrackerInner />
    </Suspense>
  );
}

