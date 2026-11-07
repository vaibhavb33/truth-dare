# Cross-Browser PWA Compatibility & Platform Support
**Platform:** Asteria Party Gaming Platform (`https://truthordarequiz.com`)  
**Target Environments:** Mobile (iOS Safari, Android Chrome, Samsung Internet), Desktop (Chrome, Edge, Safari, Firefox)  

---

## 1. Browser Capability & Support Matrix

Asteria's PWA implementation adheres strictly to standard web APIs while providing graceful progressive enhancement across major browser rendering engines.

| Platform / Browser | Service Worker | Manifest Support | Installation Flow | Standalone Mode | Maskable Icons |
| :--- | :---: | :---: | :--- | :---: | :---: |
| **Google Chrome (Android)** | Full (v40+) | Full (v39+) | Native `beforeinstallprompt` | Full | Yes |
| **Samsung Internet (Android)** | Full (v4+) | Full (v4+) | Native `beforeinstallprompt` | Full | Yes |
| **Apple Safari (iOS 11.3+)** | Full (v11.3+) | Partial (Icons & Meta) | Manual "Add to Home Screen" | Full (`standalone`) | Padded Fallback |
| **Apple Safari (macOS Sonoma+)**| Full | Full | "Add to Dock" | Full | Yes |
| **Google Chrome / Edge (Desktop)** | Full | Full | Address bar install icon | Full | Yes |
| **Mozilla Firefox (Android)** | Full (v44+) | Full | Address bar badge | Full | Yes |
| **Mozilla Firefox (Desktop)** | Full | Partial (No standalone) | Tabbed / Offline Cache | N/A | N/A |

---

## 2. Platform Installation Differences & Strategy

### 2.1 Chromium Ecosystem (Android, Desktop Chrome, MS Edge)
Chromium fires the `beforeinstallprompt` event on eligible sites meeting PWA criteria (HTTPS, valid manifest, registered service worker with fetch handler, 192px/512px icons).

**Asteria Implementation:**
- Intercepts and captures `beforeinstallprompt` event inside `lib/pwa/usePWA.ts`.
- Silences default browser prompt banner via `event.preventDefault()`.
- Surfaces an elegant, Asteria-themed "Install Asteria App" button with download/sparkle icon in header, navigation drawer, and footer.
- Calling `prompt()` on user gesture triggers the native platform modal.
- Listens for `appinstalled` to immediately dismiss promotional UI.

### 2.2 Apple iOS Safari Ecosystem (iPhone & iPad)
Apple WebKit does **not** dispatch `beforeinstallprompt`. Prompting an iOS user with a dead button creates user frustration.

**Asteria Solution:**
- `usePWA` detects iOS Safari by inspecting user agent (`iPhone|iPad|iPod`) and confirming WebKit environment.
- When an iOS user taps "Install Asteria App", Asteria opens a custom, portaled instructions modal (`components/pwa/IOSInstallModal.tsx`):
  1. Shows the iOS Safari Share icon (`[↑]`) located at the bottom toolbar.
  2. Guides the player to tap **"Add to Home Screen"** (`[+]`).
  3. Displays confirmation step to tap **"Add"** in the top-right corner.
- In standalone mode (`navigator.standalone === true`), the install button is automatically hidden.

---

## 3. iOS Viewport & Safe-Area Inset Handling

Running in standalone mode on iOS requires special viewport and layout considerations:

### 3.1 Status Bar Theming
In `app/layout.tsx`:
```html
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Asteria" />
```
- `black-translucent` allows Asteria's cosmic `#0A0A16` canvas to bleed smoothly into the status bar area behind battery and clock indicators.

### 3.2 Safe-Area Bottom Insets (iPhone Home Indicator)
- App layout implements `pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))]` on main content areas to prevent navigation buttons or question cards from being obscured by the iOS virtual home indicator bar.

---

## 4. Cache Persistence & Storage Quotas

| OS / Browser | Quota Allocation | Eviction Policy | Impact on Asteria |
| :--- | :--- | :--- | :--- |
| **Android Chrome** | Up to 60% of free storage | Least-Recently-Used (LRU) under disk pressure | Negligible; Asteria cache bundle is < 3 MB |
| **iOS Safari** | ~50 MB default partition | 7-day eviction if unused in regular browser; **retained indefinitely** once installed to Home Screen | Installing to Home Screen protects player's offline question cache from 7-day safari purge |
| **Desktop Chrome** | Gigabytes available | Extremely persistent | Zero eviction risk |
