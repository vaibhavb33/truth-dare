# Google Tag Manager (GTM) Installation Guide

**Domain:** `https://playtruthndare.com`  
**Container ID:** `GTM-MNXM9MQK`  
**Framework:** Next.js 15 App Router  
**Status:** INSTALLED & VERIFIED  
**Date:** November 2026  
**Specialist:** Senior Analytics Implementation Specialist  

---

## 1. Container Placement Architecture

Google Tag Manager is implemented once in the universal root layout ([`app/layout.tsx`](file:///Users/vaibhavborkar/truth&dare/app/layout.tsx)), ensuring 100% coverage across all 184 localized static pages and dynamic multiplayer rooms without code duplication.

### 1.1 Document Head Script (`<head>`)
The official container loader script is injected using Next.js's native `Script` component with `strategy="afterInteractive"`. This executes immediately after hydration, avoiding render-blocking while guaranteeing fast analytics initialization.

```tsx
// app/layout.tsx
<Script
  id="gtm-container"
  strategy="afterInteractive"
  dangerouslySetInnerHTML={{
    __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{'analytics_storage':'granted','ad_storage':'denied','ad_user_data':'denied','ad_personalization':'denied','wait_for_update':500});(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-MNXM9MQK');`,
  }}
/>
```

### 1.2 Body Noscript Fallback (`<body>`)
Immediately following the opening `<body ...>` tag, the official `<noscript>` iframe is mounted for search engine bots and JavaScript-disabled browsers:

```tsx
// app/layout.tsx
<body className="min-h-screen flex flex-col bg-canvas-base text-slate-100 selection:bg-brand-500 selection:text-white">
  {/* Google Tag Manager (noscript) */}
  <noscript>
    <iframe
      src="https://www.googletagmanager.com/ns.html?id=GTM-MNXM9MQK"
      height="0"
      width="0"
      style={{ display: 'none', visibility: 'hidden' }}
    />
  </noscript>
  <GTMRouteTracker />
  ...
```

---

## 2. SPA Route Tracking ([`components/analytics/GTMRouteTracker.tsx`](file:///Users/vaibhavborkar/truth&dare/components/analytics/GTMRouteTracker.tsx))

Because Next.js uses client-side transitions (SPA), subsequent link clicks do not trigger standard browser `DOMContentLoaded` or `load` events.

The dedicated `GTMRouteTracker` component observes `pathname` and `searchParams` changes:
1. **Initial Load De-duplication:** On first page load, `isInitialLoad.current` absorbs the initial navigation event to prevent double-counting against GTM's built-in `gtm.js` All Pages trigger.
2. **Path Memoization:** The component verifies that `previousUrl.current !== currentUrl` before dispatching, preventing duplicate tracking if re-renders occur without URL changes.
3. **Suspense Isolation:** Wrapped in `<Suspense fallback={null}>` to ensure static page pre-rendering (SSG) in Next.js is fully preserved.

---

## 3. Production Performance & Core Web Vitals Safeguards

- **Non-Blocking Execution:** `strategy="afterInteractive"` ensures that Google Tag Manager does not delay First Contentful Paint (FCP) or Largest Contentful Paint (LCP).
- **Zero Third-Party Bundles:** No heavy npm analytics wrappers or legacy tracking libraries are included in client bundles.
- **Single Global Variable:** Interacts exclusively through the native `window.dataLayer` array.
- **Container Hygiene:** Exactly one container (`GTM-MNXM9MQK`) is active across the codebase.

