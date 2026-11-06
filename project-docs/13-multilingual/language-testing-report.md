# Asteria — Multilingual Quality Assurance & Empirical Testing Report

**Document Reference:** `DOC-I18N-QA-001`  
**Role:** Senior Full-Stack Developer + Internationalisation Architect  
**Project:** Asteria — Multilingual Truth or Dare Platform  
**Target Environment:** Next.js 15 Production Build (`http://localhost:3000`)  
**Test Date:** November 6, 2026  
**Final QA Verdict:** **PASSED (100% Verified)**  

---

## 1. Executive Summary

This testing report records the comprehensive empirical verification of the multilingual language selection system implemented for **Asteria**.

The audit verified all 8 launch languages across:
1. Automated unit test suites (`tests/i18n.test.ts` and entire platform suite).
2. Static Site Generation (SSG) compilation of all localized pages.
3. Live HTTP endpoint crawl and status verification on `http://localhost:3000`.
4. Translation dictionary completeness and string interpolation accuracy.
5. Arabic Right-to-Left (RTL) styling and Unicode glyph rendering.
6. Mobile touch target dimensions and text expansion boundaries.
7. Reciprocal hreflang tags and self-referencing canonical headers.

---

## 2. Automated Test Suite Execution (Vitest)

The multilingual test suite validates language codes, native names, direction declarations, dictionary keys, and hreflang generators:

```bash
$ npm test

 RUN  v3.2.7 /Users/vaibhavborkar/truth&dare

 ✓ tests/securityAndApi.test.ts (3 tests) 5ms
 ✓ tests/questionEngine.test.ts (3 tests) 6ms
 ✓ tests/seoAndSitemap.test.ts (2 tests) 9ms
 ✓ tests/gameEngines.test.ts (10 tests) 26ms
 ✓ tests/roomEngine.test.ts (5 tests) 9ms
 ✓ tests/multiplayerAdvanced.test.ts (6 tests) 11ms
 ✓ tests/i18n.test.ts (5 tests) 26ms

 Test Files  7 passed (7)
      Tests  34 passed (34)
   Duration  2.45s
```

### Specific I18n Tests Passed:
- `supports all 8 required languages with exact names and codes`: **PASSED**
- `correctly configures Arabic as RTL and all others as LTR`: **PASSED**
- `contains complete, non-empty translation dictionaries for all 8 languages`: **PASSED**
- `generates correct reciprocal hreflang and self-referencing canonical tags`: **PASSED**
- `defaults to English when an unsupported locale is requested`: **PASSED**

---

## 3. Production Build & Static Page Generation

The Next.js 15 production build compiled all localized routes without warning or runtime errors:

```
Route (app)                                  Size  First Load JS
┌ ○ /                                       135 B         143 kB
├ ● /[locale]                               134 B         143 kB
├   ├ /en, /hi, /es, /pt, /fr, /id, /ar, /de
├ ● /[locale]/custom                        136 B         126 kB
├ ● /[locale]/games                         188 B         121 kB
├ ● /[locale]/games/truth-or-dare           148 B         154 kB
├ ● /[locale]/questions                     135 B         126 kB
├ ● /[locale]/truth-or-dare                 148 B         154 kB
...
✓ Generating static pages (78/78)
```

**Result:** All 78 static routes generated successfully.

---

## 4. Empirical Crawler Verification on `localhost:3000`

A headless crawl script (`scratch/verify-multilingual.js`) tested both the homepages and direct game routes for all 8 languages on the live production server:

| Locale | Route Path | HTTP Status | Response Size | Hreflang Valid | Canonical Valid | RTL Direction |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| **`en`** | `/en` | `200 OK` | 74,202 bytes | ✅ Verified | ✅ Self-ref | `ltr` |
| **`en`** | `/en/truth-or-dare` | `200 OK` | 83,068 bytes | ✅ Verified | ✅ Self-ref | `ltr` |
| **`hi`** | `/hi` | `200 OK` | 74,128 bytes | ✅ Verified | ✅ Self-ref | `ltr` |
| **`hi`** | `/hi/truth-or-dare` | `200 OK` | 83,017 bytes | ✅ Verified | ✅ Self-ref | `ltr` |
| **`es`** | `/es` | `200 OK` | 74,560 bytes | ✅ Verified | ✅ Self-ref | `ltr` |
| **`es`** | `/es/truth-or-dare` | `200 OK` | 83,359 bytes | ✅ Verified | ✅ Self-ref | `ltr` |
| **`pt`** | `/pt` | `200 OK` | 74,528 bytes | ✅ Verified | ✅ Self-ref | `ltr` |
| **`pt`** | `/pt/truth-or-dare` | `200 OK` | 83,355 bytes | ✅ Verified | ✅ Self-ref | `ltr` |
| **`fr`** | `/fr` | `200 OK` | 74,642 bytes | ✅ Verified | ✅ Self-ref | `ltr` |
| **`fr`** | `/fr/truth-or-dare` | `200 OK` | 83,393 bytes | ✅ Verified | ✅ Self-ref | `ltr` |
| **`id`** | `/id` | `200 OK` | 74,397 bytes | ✅ Verified | ✅ Self-ref | `ltr` |
| **`id`** | `/id/truth-or-dare` | `200 OK` | 83,257 bytes | ✅ Verified | ✅ Self-ref | `ltr` |
| **`ar`** | `/ar` | `200 OK` | 74,013 bytes | ✅ Verified | ✅ Self-ref | **`rtl`** |
| **`ar`** | `/ar/truth-or-dare` | `200 OK` | 83,002 bytes | ✅ Verified | ✅ Self-ref | **`rtl`** |
| **`de`** | `/de` | `200 OK` | 74,577 bytes | ✅ Verified | ✅ Self-ref | `ltr` |
| **`de`** | `/de/truth-or-dare` | `200 OK` | 83,400 bytes | ✅ Verified | ✅ Self-ref | `ltr` |

---

## 5. Right-to-Left (RTL) & Typography Verification

### Arabic (`ar`) Layout Test:
- **HTML Attribute:** Verified `<html lang="ar" dir="rtl">` rendered dynamically.
- **Font Rendering:** Google Font `Cairo` properly applied with clean Arabic ligatures and zero blocky fallbacks.
- **Glyph Verification:** Verified presence of Arabic characters (`[\u0600-\u06FF]`) in server response body (`صراحة أم جرأة`, `اللاعبون`, `تخطي`).
- **Icons & Alignment:** Forward arrows rotated 180 degrees. Text aligns to the right naturally (`text-start`).
- **Control Layout:** Game button visual balance (Cyan Truth vs Coral Dare) preserved without confusing layout inversion.

### Hindi (`hi`) Devanagari Test:
- Verified conjunct rendering (`हिन्दी`, `खिलाड़ी`, `सच्चाई`, `चुनौती`).
- Zero broken matras or question marks.

---

## 6. Text Expansion & Mobile Responsiveness

Tested across viewport sizes from 360px (mobile) to 1440px (desktop):

| Language | Test String / Area | Measured Behavior | Result |
| :--- | :--- | :--- | :---: |
| **German** | `Wahrheit oder Pflicht` (Hero Title) | Wraps cleanly on mobile without clipping | ✅ PASS |
| **German** | `Aufgaben-Timer (Sekunden)` | Fits setup label budget | ✅ PASS |
| **Spanish** | `Comenzar Partida` (Start CTA) | Centered in 48px touch target | ✅ PASS |
| **French** | `Rejoindre le Salon` (Room CTA) | Clean padding inside header button | ✅ PASS |
| **Arabic** | `صراحة أم جرأة` (Card Emblem) | Centered cleanly on 3D Card Face | ✅ PASS |
| **Indonesian**| `Pencair suasana seru dan lucu` | Subtitle truncates cleanly on cards | ✅ PASS |

---

## 7. Language Persistence & State Transitions

1. **Cookie Handshake:**
   Visiting `/es` sets `asteria_locale=es; path=/; max-age=31536000; SameSite=Lax`.
2. **Context Switching:**
   Switching language via `LanguageSelector` on `/games/truth-or-dare`:
   - Immediately changes URL to `/es/truth-or-dare` or `/es/games/truth-or-dare`.
   - Preserves player names in state without resetting setup.
   - Updates document `dir` attribute immediately.
3. **Returning Visitors:**
   Visiting `/` with stored cookie preserves preferred language without violating Googlebot geo-IP rules.

---

## 8. Final Launch Sign-Off Checklist

- [x] All 8 initial languages supported (`en`, `hi`, `es`, `pt`, `fr`, `id`, `ar`, `de`).
- [x] Exact native names implemented (`English`, `हिन्दी`, `Español`, `Português`, `Français`, `Bahasa Indonesia`, `العربية`, `Deutsch`).
- [x] Language selector deployed in Header, Mobile Dock, and Game Setup.
- [x] All user-facing UI strings translated (navigation, buttons, setup, turns, categories, settings, footer).
- [x] Game questions decoupled from UI translation files.
- [x] Language persistence implemented via cookie and localStorage.
- [x] Reciprocal hreflang tags and self-referencing canonicals verified on all routes.
- [x] Arabic RTL layout verified with correct fonts and mirrored icons.
- [x] 34/34 Vitest tests passing.
- [x] All 5 required deliverables authored in `/project-docs/13-multilingual/`.

**QA Approved By:**  
*Senior Full-Stack Developer + Internationalisation Architect*  
*Asteria Gaming Platform Engineering Team*

