# Play Truth & Dare — Brand Asset Inventory

**Domain:** `https://playtruthndare.com`  
**Brand:** Play Truth & Dare  
**Directory:** `/public/branding/`  
**Date:** November 2026  
**Status:** COMPLETE & VERIFIED  

---

## 1. Primary Branding Directory (`/public/branding/`)

All master logos, vector art, and raster icons are housed directly within the `/public/branding/` directory.

| Asset File | Format | Dimensions | File Size | Description & Usage |
|---|---|---|---|---|
| `logo-horizontal-dark.svg` | SVG | 800 x 200 | 4,214 B | Primary horizontal brand lockup with dark obsidian container (`#0A0A16`), vector emblem, and full typography wordmark. |
| `logo-horizontal-light.svg` | SVG | 800 x 200 | 4,214 B | Horizontal lockup with white/slate container for light presentation decks or documentation. |
| `logo-horizontal-transparent.svg` | SVG | 800 x 200 | 4,023 B | Transparent background horizontal lockup for overlays and variable canvases. |
| `logo-icon-dark.svg` | SVG | 512 x 512 | 6,225 B | Square icon with dark rounded container (`rx="128"`), violet stroke, and full Truth & Dare vector emblem. |
| `logo-icon-light.svg` | SVG | 512 x 512 | 6,214 B | Square icon on light rounded container for high-key backgrounds. |
| `logo-icon-transparent.svg` | SVG | 512 x 512 | 5,920 B | Pure vector mark (Truth hook + Dare blade + diamond spark) with zero background box. |
| `favicon.svg` | SVG | 512 x 512 | 6,225 B | Vector favicon referenced in `<head>` for browsers supporting scalable SVG icons. |
| `favicon.ico` | ICO | 16/32/48 Multi | 2,645 B | Multi-resolution legacy Windows/desktop browser tab icon. |
| `favicon-16x16.png` | PNG | 16 x 16 | 671 B | Compact raster icon optimized for 16px tab headers and bookmarks. |
| `favicon-32x32.png` | PNG | 32 x 32 | 1,936 B | High-DPI raster icon for Retina browser tabs and taskbars. |
| `apple-touch-icon.png` | PNG | 180 x 180 | 31,040 B | Official iOS Home Screen bookmark icon. |
| `icon-192.png` | PNG | 192 x 192 | 34,044 B | Standard Android home screen and PWA manifest icon. |
| `icon-512.png` | PNG | 512 x 512 | 171,187 B | High-resolution PWA splash screen and store icon. |
| `icon-maskable-512x512.png` | PNG | 512 x 512 | 101,998 B | Android adaptive maskable icon with safe-zone margin (inner 72% bounding box). |

---

## 2. Root Public Directory Aliases (`/public/`)

For maximum cross-browser, crawler, and legacy system compatibility, standard root endpoints are maintained:

| Root Path | Target File | Purpose |
|---|---|---|
| `/public/favicon.ico` | 2,645 B ICO | Default fallback root favicon |
| `/public/favicon.svg` | 6,225 B SVG | Modern browser vector favicon |
| `/public/favicon.png` | 1,936 B PNG | Standard 32x32 PNG favicon fallback |
| `/public/apple-touch-icon.png` | 31,040 B PNG | Apple touch icon auto-detected by iOS Safari |
| `/public/icon.svg` | 6,225 B SVG | Schema.org organization logo and PWA icon |
| `/public/icon-maskable.svg` | 2,845 B SVG | Vector maskable definition |
| `/public/icon-192.png` | 34,044 B PNG | Root alias for 192px PWA icon |
| `/public/icon-512.png` | 171,187 B PNG | Root alias for 512px PWA icon |
| `/public/og-image.png` | 124,663 B PNG | 1200 x 630 px Open Graph / Twitter Cards social preview image |

---

## 3. PWA Icons Directory (`/public/icons/`)

Referenced by `manifest.webmanifest` and `manifest.json`:

| File Path | Dimensions | Purpose |
|---|---|---|
| `/public/icons/apple-touch-icon.png` | 180 x 180 | iOS touch icon |
| `/public/icons/icon-192x192.png` | 192 x 192 | Manifest PWA standard icon |
| `/public/icons/icon-512x512.png` | 512 x 512 | Manifest PWA high-res icon |
| `/public/icons/icon-maskable-512x512.png` | 512 x 512 | Manifest PWA maskable icon |

---

## 4. UI Components Inventory

### 4.1 `BrandIcon` (`@/components/branding/BrandIcon.tsx`)
```tsx
import { BrandIcon } from '@/components/branding';

// Header brand icon
<BrandIcon size={24} className="w-5 h-5 sm:w-6 sm:h-6" idPrefix="header-icon" />

// Standalone dark tile icon
<BrandIcon size={48} variant="dark" />
```

### 4.2 `BrandLogo` (`@/components/branding/BrandLogo.tsx`)
```tsx
import { BrandLogo } from '@/components/branding';

// Full horizontal lockup with styled typography
<BrandLogo variant="horizontal" theme="dark" showTagline />
```

---

## 5. Verification Checklist

- [x] All 14 brand assets present in `/public/branding/`.
- [x] All files stored locally — zero external asset URLs.
- [x] Original vector artwork — no emoji placeholders used in logos.
- [x] `favicon.ico` present and readable.
- [x] `favicon.svg` present and scalable.
- [x] 16x16, 32x32, 180x180, 192x192, 512x512 PNGs generated and verified.
- [x] Maskable icon adheres to Android 80% safe circle rule.
- [x] Open Graph preview (`og-image.png`) re-rendered at 1200x630 using vector emblem.
- [x] `AppHeader.tsx` updated to use `BrandIcon` across desktop and mobile drawer.
- [x] `AppFooter.tsx` updated to use `BrandIcon`.
- [x] `app/layout.tsx` metadata and `<head>` links configured.

