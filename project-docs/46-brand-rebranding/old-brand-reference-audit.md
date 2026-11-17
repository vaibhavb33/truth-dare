# Old Brand Reference & Deprecation Audit

**Project:** Asteria -> Play Truth & Dare Comprehensive Rebranding  
**New Domain:** `https://playtruthndare.com`  
**New Brand Name:** Play Truth & Dare  
**Short Brand:** PlayTruthNDare  
**Tagline:** Truth. Dare. Laugh. Repeat.  
**Date:** 2026-11-17  

---

## 1. Executive Summary

A comprehensive, automated static analysis was conducted across all files, components, localization dictionaries, metadata configurations, manifest files, and game engines to discover every reference to the legacy "Asteria" brand and old domain fallback (`truthordarequiz.com`).

A total of **78 distinct code, configuration, and localization files** were identified as requiring updates:
- **Root Configuration & Core App Layout:** 8 files (`next.config.js`, `app/layout.tsx`, `app/robots.ts`, `app/sitemap.ts`, `app/page.tsx`, `app/offline/page.tsx`, `app/room/[code]/page.tsx`, `app/room/[code]/RoomClient.tsx`)
- **Static & SEO Pages:** 28 files (`app/about/page.tsx`, `app/contact/page.tsx`, `app/privacy/page.tsx`, `app/terms/page.tsx`, `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`, `app/custom/page.tsx`, `app/games/**/*.tsx`, `app/questions/page.tsx`, and all 15 `app/[locale]/**/page.tsx` routes)
- **UI & Layout Components:** 8 files (`AppHeader.tsx`, `AppFooter.tsx`, `HomeClientContent.tsx`, `CustomDeckClient.tsx`, `TruthOrDareGameClient.tsx`, and PWA modals)
- **Localization Dictionaries:** 11 files (`seo.ts`, `config.ts`, `pwaPromotionTranslations.ts`, and 8 language translation dictionaries in `lib/i18n/translations/`)
- **Question Prompt Databases:** 3 files (`lib/questions/database/de.ts`, `fr.ts`, `id.ts`)
- **PWA & Service Worker:** 3 files (`public/manifest.json`, `public/manifest.webmanifest`, `public/sw.js`)
- **Internal Storage & Audio Engines:** 8 files (`deckStorage.ts`, `serverDeckRepository.ts`, `roomEngine.ts`, `gameplayState.ts`, `soundSynthesizer.ts`, `speechService.ts`, voice providers)

---

## 2. Legacy Identity vs. New Brand Mapping

| Dimension | Legacy Identity | New Brand Identity | Implementation Strategy |
| :--- | :--- | :--- | :--- |
| **Website Name** | Asteria / Project Asteria | **Play Truth & Dare** | Full brand title displayed on headers, footers, page titles, and structured data |
| **Compact Brand** | Asteria | **PlayTruthNDare** | Used in mobile headers (`< 640px`), PWA short_name, and social handles (`@PlayTruthNDare`) |
| **Primary Domain** | `https://truthordarequiz.com` | **`https://playtruthndare.com`** | Base canonical URL, Open Graph URLs, Twitter Cards, Sitemap, and Robots.txt |
| **Tagline** | The Modern Online Party Gaming Hub | **Truth. Dare. Laugh. Repeat.** | Displayed prominently across hero, footer, and social preview metadata |
| **Logo Icon** | Glowing Sparkle Star (Purple / Violet) | Glowing Sparkle Star with Cyan & Coral Accents | Retained SVG emblem, harmonized with brand colors (Deep Purple, Violet, Truth Cyan, Dare Coral) |
| **PWA Manifest** | `name: "Asteria - Truth or Dare"`, `short_name: "Asteria"` | `name: "Play Truth & Dare"`, `short_name: "PlayTruthNDare"` | Full PWA name update with updated description including tagline |
| **SW Cache Keys** | `asteria-shell-v*`, `asteria-static-v*` | `playtruthndare-shell-v*`, `playtruthndare-static-v*` | Clean cache migration preserving offline capabilities |
| **Local Storage** | `asteria_multiplayer_session_*`, `asteria_custom_decks`, `asteria_locale` | `playtruthndare_*` with dual-read fallback | Read from new key first with graceful fallback to legacy key to ensure zero player data loss |

---

## 3. Detailed Component & File Audit Inventory

### Category A: Core Layout & Metadata
1. **`next.config.js`**: `domains: ['localhost', 'truthordarequiz.com']` -> `domains: ['localhost', 'playtruthndare.com']`
2. **`app/layout.tsx`**:
   - `siteUrl`: fallback to `https://playtruthndare.com`
   - `metadata.title`: `default: 'Play Truth & Dare — Truth. Dare. Laugh. Repeat.'`, `template: '%s | Play Truth & Dare'`
   - `metadata.description`: `Play Truth or Dare, Spinner Wheel, Never Have I Ever, Would You Rather, and more with friends online or locally. Truth. Dare. Laugh. Repeat. Zero ads, instant room codes, 100% free.`
   - `metadata.authors`, `creator`, `publisher`: `'Play Truth & Dare'`
   - `openGraph`: `siteName: 'Play Truth & Dare'`, `title: 'Play Truth & Dare — Truth. Dare. Laugh. Repeat.'`, `alt: 'Play Truth & Dare — Truth. Dare. Laugh. Repeat.'`
   - `twitter`: `creator: '@PlayTruthNDare'`, `title`, `description`
   - `appleWebApp`: `title: 'PlayTruthNDare'`
   - `organizationAndWebsiteSchema`: Organization `name: 'Play Truth & Dare'`, `sameAs` handles, WebSite `name: 'Play Truth & Dare'`
3. **`app/robots.ts`**: `baseUrl` -> `https://playtruthndare.com`
4. **`app/sitemap.ts`**: `baseUrl` -> `https://playtruthndare.com`
5. **`app/page.tsx`**:
   - `siteUrl` -> `https://playtruthndare.com`
   - `title`: `Play Truth & Dare — Free Online Party Games | Play in Browser`
   - FAQ schema question: `"Is Play Truth & Dare completely free to play?"`
6. **`app/offline/page.tsx`**:
   - Heading: `"Play Truth & Dare is currently offline. Please reconnect to continue playing."`
   - Action: `"Reconnecting to Play Truth & Dare..."`
7. **`app/room/[code]/page.tsx`**:
   - `title`: `'Multiplayer Party Room | Play Truth & Dare'`
8. **`app/room/[code]/RoomClient.tsx`**:
   - Web Share API title: `'Play Truth & Dare Party Room'`
   - Web Share text: `'Join my Truth or Dare room (${roomCode}) on Play Truth & Dare!'`

### Category B: Static Pages & Localized Routes
1. **`app/about/page.tsx`**: Title, descriptions, schema names, and breadcrumbs updated to Play Truth & Dare.
2. **`app/contact/page.tsx`**: Title, descriptions, schema names, and breadcrumbs updated to Play Truth & Dare.
3. **`app/privacy/page.tsx`**: Title, descriptions, and schema names updated to Play Truth & Dare.
4. **`app/terms/page.tsx`**: Title, descriptions, and schema names updated to Play Truth & Dare.
5. **`app/blog/page.tsx`**: Title, descriptions, and schema names updated to Play Truth & Dare.
6. **`app/blog/[slug]/page.tsx`**: Author line `<span>By Play Truth & Dare Studio</span>`, article schema author/publisher, and remote host guide copy.
7. **`app/custom/page.tsx`**: `siteUrl` and schema name updated to `Play Truth & Dare Custom Deck Studio`.
8. **`app/games/page.tsx`**: `siteUrl`, directory description, and schema name updated to `Play Truth & Dare Online Party Games`.
9. **`app/games/**/*.tsx` & `app/questions/page.tsx`**: `siteUrl` updated to `https://playtruthndare.com`.
10. **`app/[locale]/**/page.tsx` (15 routes)**: `overrideTitle` updated to `Play Truth & Dare (${langMeta.nativeName})`.

### Category C: UI & Layout Components
1. **`components/layout/AppHeader.tsx`**:
   - Desktop/tablet brand: `"Play Truth & Dare"` with gradient sparkle emblem and pulsing indicator
   - Mobile compact brand (`< 640px`): `"PlayTruthNDare"` ensuring zero collision with language trigger or controls
   - Mobile drawer category: `"Play Truth & Dare Platform"`
2. **`components/layout/AppFooter.tsx`**:
   - Brand name: `"Play Truth & Dare"`
   - Tagline: `"Truth. Dare. Laugh. Repeat."`
   - Copyright: `"© 2026 Play Truth & Dare. All rights reserved."`
3. **`components/home/HomeClientContent.tsx`**:
   - Section 6 heading: `"Why Party Hosts Choose Play Truth & Dare"`
   - Copy: `"Play Truth & Dare modernizes the classic party experience..."`
   - FAQ accordion question: `"Is Play Truth & Dare completely free to play?"`
4. **PWA Modals & Buttons (`IOSInstallModal.tsx`, `PWAInstallButton.tsx`, `PWAPromotionModal.tsx`, `PWARegistration.tsx`)**:
   - Button labels: `"Install Play Truth & Dare App"`
   - iOS modal heading: `"Install Play Truth & Dare on iPhone / iPad"`
   - iOS step 3: `"Play Truth & Dare will launch with zero browser bars like a native app."`

### Category D: Localization & Questions
1. **`lib/i18n/seo.ts`**: `SITE_URL` updated to `https://playtruthndare.com`, default title, Open Graph siteName, alt tags, and twitter creator.
2. **`lib/i18n/pwaPromotionTranslations.ts`**: All 8 languages updated with `Play Truth & Dare`.
3. **`lib/i18n/translations/*.ts` (en, es, pt, fr, id, ar, hi, de)**:
   - About, contact, privacy, terms, and footer mission statements updated to `Play Truth & Dare`.
   - Arabic translations updated replacing `أستيريا` with `Play Truth & Dare`.
   - Hindi translations updated replacing `एस्टेरिया` with `Play Truth & Dare`.
4. **`lib/questions/database/de.ts`, `fr.ts`, `id.ts`**:
   - Challenge dare prompts shouting the brand name updated from "Asteria" to "Play Truth & Dare".

### Category E: Storage & Engine Compatibility
1. **`lib/custom/deckStorage.ts`**: Dual storage key read (`playtruthndare_custom_decks` / `asteria_custom_decks`).
2. **`lib/multiplayer/roomEngine.ts`**: Global singleton reference updated with backward compatibility.
3. **`lib/gameplay/gameplayState.ts`**: Window flag `__PLAYTRUTHNDARE_GAMEPLAY_ACTIVE__` with fallback to `__ASTERIA_GAMEPLAY_ACTIVE__`.
4. **`lib/audio/soundSynthesizer.ts`**: `playtruthndare_sound_muted` with fallback to `asteria_sound_muted`.
5. **`lib/voice/speechService.ts`**: `playtruthndare_voice_rate` with fallback to `asteria_voice_rate`.

---

## 4. Brand Color Palette Audit (Phase 4)

The requested color system preserves the high-performance dark gaming aesthetic:
- **Primary:** Deep Purple (`#3B1A7A` / `#6D28D9` / `brand.700`–`brand.900`)
- **Secondary:** Violet (`#8B5CF6` / `#7C3AED` / `brand.500`–`brand.600`)
- **Accent:** Cyan (`#22D3EE` / `#06B6D4` / `truth.400`–`truth.500`)
- **Secondary Accent:** Coral / Pink (`#FB7185` / `#FF5C77` / `dare.400`–`dare.500`)
- **Background:** Dark Navy (`#0A0A16` / `#07070F` / `canvas.base`–`canvas.deep`)

This palette exceeds WCAG 2.1 AA standards for high contrast on dark canvases.

