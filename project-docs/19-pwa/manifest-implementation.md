# Web App Manifest & Asset Implementation
**Platform:** Asteria Party Gaming Platform (`https://truthordarequiz.com`)  
**Specification Compliance:** W3C Web App Manifest Draft & Chromium PWA Standards  
**Output Files:** `public/manifest.webmanifest`, `public/manifest.json`  

---

## 1. Overview & Identity Configuration

The Web App Manifest configures Asteria's standalone operating system identity, window chrome, orientation defaults, and direct game launch shortcuts. Both `.webmanifest` and `.json` extensions are maintained to ensure compatibility across all user agents, legacy crawlers, and modern webviews.

```json
{
  "name": "Asteria - Truth or Dare",
  "short_name": "Asteria",
  "description": "Premium online Truth or Dare and social party games. Play with friends locally or online with instant room codes and zero ads.",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#0A0A16",
  "background_color": "#0A0A16",
  "lang": "en",
  "categories": ["games", "entertainment", "social"]
}
```

### Property Rationale:
- **`name` & `short_name`:** `"Asteria - Truth or Dare"` provides immediate search clarity on app stores and install dialogs, while `"Asteria"` ensures clean, unclipped text below the app icon on Android, iOS, and macOS launchpads.
- **`start_url` (`/`):** Launches into the multilingual homepage where locale persistence auto-routes players to their preferred language.
- **`scope` (`/`):** Retains standalone display mode across all localized routes (`/en/*`, `/hi/*`, `/es/*`, `/pt/*`, `/fr/*`, `/id/*`, `/ar/*`, `/de/*`).
- **`display` (`standalone`):** Strips browser chrome (address bar, browser back/forward buttons, tab bar) providing an immersive, native game container.
- **`orientation` (`portrait`):** Optimized for one-handed handheld phone play during parties and social gatherings, while permitting flexible rotation for game boards.
- **`theme_color` & `background_color` (`#0A0A16`):** Matches Asteria's cosmic dark theme canvas, preventing white flashes during cold app boot.

---

## 2. Icon Suite & Visual Assets

All icons were generated from the vector brand definition in `public/icon.svg` featuring Asteria's dark cosmic gradient, rounded container, and vibrant multi-pointed sparkle star.

| Icon Path | Resolution | Purpose | MIME Type | File Size |
| :--- | :--- | :--- | :--- | :--- |
| `public/icon.svg` | Scalable Vector | Vector fallback, browser tab, SVG high-res | `image/svg+xml` | 2,452 bytes |
| `public/icon-maskable.svg` | Scalable Vector | Safe-zone padded vector | `image/svg+xml` | 2,520 bytes |
| `public/icons/icon-192x192.png` | 192 × 192 px | Android home screen, task switcher | `image/png` | 22,659 bytes |
| `public/icons/icon-512x512.png` | 512 × 512 px | Splash screen, PWA install prompt | `image/png` | 109,436 bytes |
| `public/icons/icon-maskable-512x512.png` | 512 × 512 px | Android adaptive icon (maskable) | `image/png` | 61,227 bytes |
| `public/icons/apple-touch-icon.png` | 180 × 180 px | iOS Home Screen bookmark icon | `image/png` | 20,515 bytes |
| `public/favicon.png` | 32 × 32 px | Desktop browser tab favicon | `image/png` | 1,691 bytes |

### 2.1 Maskable Icon Safe Zone
In Android 8.0+, launcher icons can be cropped into circles, squircles, or rounded rectangles.
- Asteria's `icon-maskable-512x512.png` centers the star and badge within the inner 80% safe zone circle (diameter 409.6px).
- The outer 10% perimeter consists of solid canvas color (`#0A0A16`), guaranteeing that no critical graphic element is clipped by OEM icon masks.

---

## 3. Quick Action Shortcuts

The manifest provides direct app shortcuts accessible via deep press or right-click on the launcher icon:

```json
"shortcuts": [
  {
    "name": "Play Truth or Dare",
    "short_name": "Truth or Dare",
    "description": "Jump straight into classic Truth or Dare",
    "url": "/games/truth-or-dare",
    "icons": [{ "src": "/icons/icon-192x192.png", "sizes": "192x192" }]
  },
  {
    "name": "Spin the Wheel",
    "short_name": "Spinner",
    "description": "Open the interactive bottle spinner",
    "url": "/games/spin-the-bottle",
    "icons": [{ "src": "/icons/icon-192x192.png", "sizes": "192x192" }]
  },
  {
    "name": "Never Have I Ever",
    "short_name": "Never Have I",
    "description": "Discover funny secrets and stories",
    "url": "/games/never-have-i-ever",
    "icons": [{ "src": "/icons/icon-192x192.png", "sizes": "192x192" }]
  },
  {
    "name": "Would You Rather",
    "short_name": "Rather",
    "description": "Dilemma questions and tough choices",
    "url": "/games/would-you-rather",
    "icons": [{ "src": "/icons/icon-192x192.png", "sizes": "192x192" }]
  }
]
```

---

## 4. HTML `<head>` Integration

The manifest and corresponding metadata are linked in `app/layout.tsx`:

```html
<!-- Web App Manifest -->
<link rel="manifest" href="/manifest.webmanifest" />

<!-- iOS Safari Add to Home Screen Meta -->
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Asteria" />

<!-- Browser Chrome & Theming -->
<meta name="theme-color" content="#0A0A16" />
```

