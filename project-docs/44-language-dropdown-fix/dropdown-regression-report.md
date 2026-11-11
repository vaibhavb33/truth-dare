# Global Language Dropdown: Multi-Viewport QA Regression Report

**Project:** Asteria — Multiplayer Party Gaming Platform  
**Module:** Global Language Selector (`components/i18n/LanguageSelector.tsx`, `lib/i18n/LanguageContext.tsx`)  
**Test Suites:**  
- `tests/e2e/qaLanguageDropdownAudit.js`  
- `tests/e2e/languageSelectorResponsiveAudit.test.js`  
**Execution Environment:** Production Build (`next start`, Chrome Headless)  
**Date:** 2026-11-11  
**Status:** **ALL 10 VIEWPORTS, ALL 8 LANGUAGES, RTL & PARTY ROOM NAVIGATION PASS (100%)**

---

## 1. Executive Summary

A full Playwright regression and visual inspection audit verified the refactored Global Language Dropdown across 10 responsive breakpoints inside an active multiplayer Party Room (`/room/[code]`), as well as across all 8 supported languages on the game setup page (`/games/truth-or-dare`).

All defects identified in the reference screenshot (`IMG_5272.jpg`) and discovered during deep testing have been eliminated:
1. **Zero Background Bleed / Ghosting:** Solid `#0D0D1E` (`rgb(13, 13, 30)`, `opacity: 1`) surface completely blocks underlying headings, cards, and glow effects.
2. **React Portal Isolation:** Menu mounts cleanly onto `document.body` (`z-index: 100`), escaping `<header>`'s `sticky` + `backdrop-blur-xl` stacking trap.
3. **Viewport-Bounded Positioning:** Strictly contained within `[12px, viewportWidth - 12px]` across every breakpoint (`320px` through `1440px`) with zero horizontal overflow (`docOverflow: false`).
4. **Compact Mobile Proportions:** Bounded to `min(312px, calc(100vw - 24px))` width and `<= 60vh` height (`maxHeight` dynamically clamped).
5. **Unmistakable Active Selection:** Highlighted border, `Active` pill badge, bold check icon, and automatic `scrollIntoView` reveal.
6. **Zero-404 Party Room Translation:** Switching language to Hindi (`hi`) or Arabic (`ar`) inside `/room/[code]` updates UI and text direction (`dir="rtl"`) cleanly in-place without navigating away to a non-existent `/[locale]/room/[code]` route.

---

## 2. Multi-Viewport Audit Matrix (Party Room Header Trigger)

Verified using `tests/e2e/qaLanguageDropdownAudit.js` on active Party Room sessions:

| Viewport Width | Device / Breakpoint | Dimensions (W x H) | Horizontal Span (`left..right`) | Portaled to `<body>` | Solid Surface (`rgb(13, 13, 30)`) | Safe Margins & Viewport Fit | All 8 Options | Esc & Outside Dismiss | Screenshot Artifact |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|---|
| **320px** | iPhone SE 1st Gen | `296 x 360` | `12.0px .. 308.0px` | **PASS** | **PASS (`opacity=1`)** | **PASS (0 overflow)** | **8/8** | **PASS** | `screenshots/01_mobile_320_dropdown_open.png` |
| **360px** | Galaxy S8 / Android | `312 x 440` | `36.0px .. 348.0px` | **PASS** | **PASS (`opacity=1`)** | **PASS (0 overflow)** | **8/8** | **PASS** | `screenshots/02_mobile_360_dropdown_open.png` |
| **375px** | iPhone SE 2nd Gen / 8 | `312 x 400.2` | `51.0px .. 363.0px` | **PASS** | **PASS (`opacity=1`)** | **PASS (0 overflow)** | **8/8** | **PASS** | `screenshots/03_mobile_375_dropdown_open.png` |
| **390px** | iPhone 12 / 13 / 14 / 15 | `312 x 440` | `66.0px .. 378.0px` | **PASS** | **PASS (`opacity=1`)** | **PASS (0 overflow)** | **8/8** | **PASS** | `screenshots/04_mobile_390_dropdown_open.png` |
| **414px** | iPhone XR / 11 Plus | `312 x 440` | `90.0px .. 402.0px` | **PASS** | **PASS (`opacity=1`)** | **PASS (0 overflow)** | **8/8** | **PASS** | `screenshots/05_mobile_414_dropdown_open.png` |
| **430px** | iPhone 14/15 Pro Max | `312 x 440` | `22.0px .. 334.0px` | **PASS** | **PASS (`opacity=1`)** | **PASS (0 overflow)** | **8/8** | **PASS** | `screenshots/06_mobile_430_dropdown_open.png` |
| **768px** | iPad Mini / Tablet | `312 x 440` | `196.8px .. 508.8px` | **PASS** | **PASS (`opacity=1`)** | **PASS (0 overflow)** | **8/8** | **PASS** | `screenshots/07_tablet_768_dropdown_open.png` |
| **1024px** | iPad Landscape / Laptop | `312 x 440` | `502.8px .. 814.8px` | **PASS** | **PASS (`opacity=1`)** | **PASS (0 overflow)** | **8/8** | **PASS** | `screenshots/08_desktop_1024_dropdown_open.png` |
| **1280px** | MacBook / Desktop | `312 x 440` | `758.8px .. 1070.8px` | **PASS** | **PASS (`opacity=1`)** | **PASS (0 overflow)** | **8/8** | **PASS** | `screenshots/09_desktop_1280_dropdown_open.png` |
| **1440px** | Desktop HD | `312 x 440` | `918.8px .. 1230.8px` | **PASS** | **PASS (`opacity=1`)** | **PASS (0 overflow)** | **8/8** | **PASS** | `screenshots/10_desktop_1440_dropdown_open.png` |

---

## 3. Localization, RTL & Separation Verification

| Test Check | Verified Outcome | Status |
|---|---|---|
| **Switch UI to Hindi (`hi`) inside `/room/[code]`** | UI renders Devanagari (`पार्टी रूम`, `गेम शुरू करें`), `<html lang="hi">`, zero 404 errors | **PASS** |
| **Hindi Active Indicator (`hindi_dropdown_open.png`)** | `हिन्दी` row highlighted with glowing purple border, `Active` pill badge, and checkmark | **PASS** |
| **Switch UI to Arabic (`ar`) RTL inside `/room/[code]`** | `<html dir="rtl">`, dropdown bounds `[12.0px .. 324.0px]` anchored cleanly under RTL button, zero 404 | **PASS** |
| **RTL Auto-Scroll & Punctuation Guard (`arabic_rtl_dropdown_open.png`)** | Arabic row scrolled cleanly into view; footer note keeps English sentence punctuation intact (`dir="ltr"`) | **PASS** |
| **Room Question Language Isolation** | Room started with `language: 'en'` retained `room.language === 'en'` after UI changes to `hi`, `ar`, and `en` | **PASS** |
| **Game Setup Variant (`languageSelectorResponsiveAudit.test.js`)** | Compact single-row tile (`40-44px` height), dropdown opens, Full Language Modal opens, `/en -> /hi` navigation works on localized game routes | **PASS** |

---

## 4. Build & Type Verification

- **`./node_modules/.bin/tsc --noEmit`**: Exited `0` (Zero TypeScript errors).
- **`npm run build`**: Succeeded cleanly (`184/184` static/SSG pages + dynamic routes built).
- **`node tests/e2e/qaLanguageDropdownAudit.js`**: `ALL AUDIT TESTS PASSED (100%)`.
- **`node tests/e2e/languageSelectorResponsiveAudit.test.js`**: All 9 viewports + all 8 languages + modal verified.
