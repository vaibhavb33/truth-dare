# Service Worker Caching & Network Strategy
**Platform:** Asteria Party Gaming Platform (`https://truthordarequiz.com`)  
**Service Worker File:** `public/sw.js`  
**Registration Controller:** `components/pwa/PWARegistration.tsx`  
**Lifecycle State:** Precache, Stale-While-Revalidate, Network-First, Network-Only  

---

## 1. Service Worker Lifecycle

### 1.1 Installation Phase (`install`)
Upon initial registration or version update:
1. Opens `asteria-shell-v1` cache store.
2. Precaches critical app shell assets required for cold offline boot:
   - Root navigation shell: `/`
   - Dedicated offline fallback screen: `/offline`
   - Manifest definition: `/manifest.webmanifest`
   - High-resolution SVG assets: `/icon.svg`, `/icon-maskable.svg`
   - High-density raster icons: `192x192.png`, `512x512.png`, `apple-touch-icon.png`, `favicon.png`
3. Invokes `self.skipWaiting()` to immediately activate the worker without waiting for old tabs to close.

```javascript
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});
```

### 1.2 Activation & Pruning Phase (`activate`)
When a new service worker version activates:
1. Scans `caches.keys()` across all origin storage.
2. Identifies and deletes deprecated caches that do not match current active cache keys (`SHELL_CACHE`, `STATIC_CACHE`, `OFFLINE_CACHE`).
3. Calls `self.clients.claim()` so active pages immediately inherit the worker.

```javascript
self.addEventListener('activate', (event) => {
  const currentCaches = [SHELL_CACHE, STATIC_CACHE, OFFLINE_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!currentCaches.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});
```

---

## 2. Request Routing & Strategy Matrix

Every incoming HTTP `fetch` request is categorized into one of four distinct strategies:

```
[Incoming Request]
       |
       |-- Method != 'GET' or non-HTTP  ---> [Bypass SW]
       |
       |-- /api/admin/*, /api/rooms/*   ---> [Network-Only (Strict Security Bypass)]
       |
       |-- /_next/static/*, /icons/*,   ---> [Stale-While-Revalidate (Instant render + background refresh)]
       |   fonts.googleapis.com
       |
       |-- /api/questions/*             ---> [Network-First (Cache on success, serve cache offline)]
       |
       \-- Navigate (HTML Pages)        ---> [Network-First -> Cache Shell -> Precached /offline]
```

### Strategy 1: Strict Network-Only (Security & Real-Time Isolation)
- **Target URIs:** `/api/admin/*`, `/api/rooms/*`, `/admin/*`
- **Behavior:** The service worker does **not** call `event.respondWith()`. Requests fall through directly to the standard browser network stack.
- **Guarantee:** No room sync desync, zero authentication token caching, zero sensitive leak to disk cache.

### Strategy 2: Stale-While-Revalidate (Static JavaScript, CSS, Fonts, Images)
- **Target URIs:** `/_next/static/*`, `/icons/*`, `.woff2`, `fonts.googleapis.com`, `fonts.gstatic.com`
- **Behavior:**
  1. Instantly returns cached version if available (0ms render).
  2. Simultaneously fires a network fetch to refresh the cached copy in the background.
  3. If offline, the cached asset serves seamlessly.

### Strategy 3: Network-First with Cache Fallback (Questions API)
- **Target URIs:** `/api/questions`
- **Behavior:**
  1. Requests fresh questions from the server.
  2. On HTTP 200, saves a clone into `asteria-static-v1`.
  3. On network failure (offline), catches error and serves previously cached questions, allowing uninterrupted local pass-and-play.

### Strategy 4: Network-First with Dedicated Offline Fallback (HTML Pages)
- **Target URIs:** `request.mode === 'navigate'` (all page views)
- **Behavior:**
  1. Attempts network fetch to serve latest server-rendered HTML.
  2. If online and 200, updates `asteria-shell-v1` with the fresh page HTML.
  3. If network fails:
     - Checks if this exact route was previously cached.
     - If not cached, falls back to the precached `/offline` application route.

```javascript
if (request.mode === 'navigate') {
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const resClone = networkResponse.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put(request, resClone));
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return caches.match('/offline').then((offlineResponse) => {
            return offlineResponse || Response.error();
          });
        });
      })
  );
  return;
}
```

---

## 3. Dedicated Offline Fallback Experience

The offline screen (`app/offline/page.tsx`) satisfies all user requirements:
- **Exact Required Header:** `"Asteria is currently offline. Please reconnect to continue playing."`
- **Truthful Offline Feature Claims:** Never claims multiplayer or live room syncing functions offline; clearly states:
  > *"Online multiplayer rooms and live synchronized screens require internet access. You can still play Pass & Play mode locally with friends or browse questions on your device."*
- **Interactive Recovery CTA:** Includes a `"Try Reconnecting"` button that evaluates `window.navigator.onLine` and reloads.
- **Direct Local Play Shortcuts:** Links to `/games/truth-or-dare` (Pass & Play) and `/questions` (offline question library).

