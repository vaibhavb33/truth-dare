/**
 * Asteria Progressive Web App Service Worker
 * Version: 1.0.0
 * Architecture: Stale-While-Revalidate for static assets, Network-First for navigation,
 * Strict Network-Only bypass for authenticated admin APIs and live multiplayer room states.
 */

const CACHE_VERSION = 'v1';
const SHELL_CACHE = `asteria-shell-${CACHE_VERSION}`;
const STATIC_CACHE = `asteria-static-${CACHE_VERSION}`;
const OFFLINE_CACHE = `asteria-offline-${CACHE_VERSION}`;

const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/manifest.webmanifest',
  '/icon.svg',
  '/icon-maskable.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-512x512.png',
  '/icons/apple-touch-icon.png',
  '/favicon.png',
];

// -------------------------------------------------------------
// 1. INSTALLATION EVENT: Precache Application Shell & Offline Screen
// -------------------------------------------------------------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => {
        // Precache critical shell assets
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        // Activate worker immediately
        return self.skipWaiting();
      })
      .catch((err) => {
        console.warn('[PWA SW] Precache failed during install:', err);
      })
  );
});

// -------------------------------------------------------------
// 2. ACTIVATION EVENT: Clean Outdated Caches & Claim Clients
// -------------------------------------------------------------
self.addEventListener('activate', (event) => {
  const currentCaches = [SHELL_CACHE, STATIC_CACHE, OFFLINE_CACHE];

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!currentCaches.includes(cacheName)) {
              console.log('[PWA SW] Removing outdated cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Immediately control all open clients
        return self.clients.claim();
      })
  );
});

// -------------------------------------------------------------
// 3. FETCH EVENT: Intelligent Multi-Tier Caching Strategies
// -------------------------------------------------------------
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // A. Only process HTTP/HTTPS GET requests
  if (request.method !== 'GET') {
    return;
  }

  // B. Bypass Chrome extensions & internal browser schemes
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // -----------------------------------------------------------
  // SECURITY & PRIVACY RULE: Network-Only Bypass
  // Never cache authenticated admin endpoints or live multiplayer rooms
  // -----------------------------------------------------------
  if (
    url.pathname.startsWith('/api/admin') ||
    url.pathname.startsWith('/api/rooms') ||
    url.pathname.startsWith('/admin')
  ) {
    // Explicit Network-Only: Do not intercept, bypass cache entirely
    return;
  }

  // -----------------------------------------------------------
  // STRATEGY 1: Static Bundles & Assets (Stale-While-Revalidate)
  // Next.js chunks, Google Fonts, and static image icons
  // -----------------------------------------------------------
  if (
    url.pathname.startsWith('/_next/static') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff2') ||
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com'
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => {
              // Network error is non-fatal when cached response exists
              return cachedResponse;
            });

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // -----------------------------------------------------------
  // STRATEGY 2: Read-Only Gameplay Questions API (Network-First)
  // Allows offline pass-and-play while keeping prompts up-to-date
  // -----------------------------------------------------------
  if (url.pathname.startsWith('/api/questions')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const resClone = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, resClone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // -----------------------------------------------------------
  // STRATEGY 3: Navigation Requests (HTML Pages: Network-First with Offline Fallback)
  // -----------------------------------------------------------
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // If valid response, cache the page shell
          if (networkResponse && networkResponse.status === 200) {
            const resClone = networkResponse.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(request, resClone));
          }
          return networkResponse;
        })
        .catch(() => {
          // If network failed (offline), check cache for exact route
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If route is not in cache, deliver dedicated offline fallback screen
            return caches.match('/offline').then((offlineResponse) => {
              return (
                offlineResponse ||
                new Response(
                  '<!DOCTYPE html><html><body style="background:#0A0A16;color:#FFF;font-family:sans-serif;text-align:center;padding:50px;"><h2>Asteria is currently offline. Please reconnect to continue playing.</h2></body></html>',
                  {
                    headers: { 'Content-Type': 'text/html' },
                  }
                )
              );
            });
          });
        })
    );
    return;
  }

  // Default: Stale-While-Revalidate for other static requests
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request);
    })
  );
});

// -------------------------------------------------------------
// 4. MESSAGE EVENT: Support In-App Skip Waiting & Update Triggers
// -------------------------------------------------------------
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

