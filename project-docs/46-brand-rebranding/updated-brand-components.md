# Play Truth & Dare — Updated Brand Components & Architectural Migration

> **Brand Transformation:** Project Asteria ➔ **Play Truth & Dare**  
> **Domain:** `https://playtruthndare.com`  
> **Brand Identity:** Play Truth & Dare (Primary) | PlayTruthNDare (Compact / Handle)  
> **Official Tagline:** *Truth. Dare. Laugh. Repeat.*  
> **Status:** Fully Migrated & Verified Empirically  

---

## 1. Executive Summary

This document catalogues every user-facing, structural, localization, and technical component modified as part of the complete brand transformation from **Asteria** to **Play Truth & Dare**.

All 78 detected application touchpoints across layouts, pages, games, modals, service workers, manifests, audio engines, localization dictionaries, and database challenges have been refactored. The platform satisfies a strict zero-legacy brand leakage policy: **zero occurrences of "Asteria" remain in public-facing UI, HTML metadata, JSON-LD schemas, or browser runtime copy**.

---

## 2. Updated Components Catalogue

### 2.1 Core Layout & Navigation
| File | Brand Updates Implemented |
|---|---|
| `app/layout.tsx` | Site metadata (`https://playtruthndare.com`), Title template `'%s \| Play Truth & Dare'`, Open Graph site name, Twitter handle `@PlayTruthNDare`, appleWebApp title `'PlayTruthNDare'`, Organization & WebSite JSON-LD schemas. |
| `components/layout/AppHeader.tsx` | Responsive brand title implementation: Desktop (`sm:inline`) shows `"Play Truth & Dare"`; mobile (`inline sm:hidden`) displays `"PlayTruthNDare"` preventing toolbar collisions. Mobile drawer header and category updated to `"Play Truth & Dare Platform"`. |
| `components/layout/AppFooter.tsx` | Footer brand link updated to `"Play Truth & Dare"`, copyright text updated to `"© 2026 Play Truth & Dare. All rights reserved."`. |
| `app/robots.ts` | Default fallback baseUrl updated to `'https://playtruthndare.com'`, sitemap location updated to `https://playtruthndare.com/sitemap.xml`. |
| `app/sitemap.ts` | Base canonical url fallback updated to `'https://playtruthndare.com'`. |
| `app/offline/page.tsx` | Offline screen headline updated to `"Play Truth & Dare is currently offline. Please reconnect to continue playing."` and retry state updated to `"Reconnecting to Play Truth & Dare..."`. |

---

### 2.2 Gameplay Pages & Client Components
| File | Brand Updates Implemented |
|---|---|
| `app/page.tsx` | Canonical URLs, Open Graph images, Twitter metadata, FAQ Schema and breadcrumbs all updated to `Play Truth & Dare`. |
| `components/home/HomeClientContent.tsx` | Dual-write session persistence (`playtruthndare_multiplayer_session_` + fallback `asteria_multiplayer_session_`). Editorial copy, FAQ question ("Is Play Truth & Dare completely free to play?"), and Section 6 title ("Why Party Hosts Choose Play Truth & Dare"). |
| `app/room/[code]/page.tsx` | Metadata title updated to `'Multiplayer Party Room \| Play Truth & Dare'`. |
| `app/room/[code]/RoomClient.tsx` | Web Share API sharing title set to `'Play Truth & Dare Party Room'` and message text to `'Join my Truth or Dare room (${roomCode}) on Play Truth & Dare!'`. Dual-read/write for player session storage keys. |
| `components/games/TruthOrDareGameClient.tsx` | Dual-write multiplayer room tokens, dual-read/write for age verification status (`playtruthndare_age_verified` + `asteria_age_verified`). |
| `app/custom/page.tsx` | Canonical URL to `https://playtruthndare.com/custom`, WebApplication schema name updated to `'Play Truth & Dare Custom Deck Studio'`. |
| `components/custom/CustomDeckClient.tsx` | Draft storage updated to `playtruthndare_custom_deck_draft` with fallback read to `asteria_custom_deck_draft`. Room creation dual-session token write. |
| `app/games/page.tsx` | Game directory metadata, Open Graph alt, ItemList schema updated to `'Play Truth & Dare Online Party Games'`. |
| `app/games/truth-or-dare/page.tsx` | Canonical URLs and WebApplication schema name updated to `'Truth or Dare Online — Play Truth & Dare'`. |
| `app/games/spin-the-bottle/page.tsx` | Base canonical URL updated to `https://playtruthndare.com`. |
| `app/games/never-have-i-ever/page.tsx` | Base canonical URL updated to `https://playtruthndare.com`. |
| `app/games/would-you-rather/page.tsx` | Base canonical URL updated to `https://playtruthndare.com`. |
| `app/games/most-likely-to/page.tsx` | Base canonical URL updated to `https://playtruthndare.com`. |
| `app/games/this-or-that/page.tsx` | Base canonical URL updated to `https://playtruthndare.com`. |
| `app/questions/page.tsx` | Canonical URL updated to `https://playtruthndare.com/questions`. |

---

### 2.3 Editorial & Informational Pages
| File | Brand Updates Implemented |
|---|---|
| `app/about/page.tsx` | Title: `'About Play Truth & Dare — Premium Ad-Free Online Party Gaming'`, Open Graph, Breadcrumbs, and AboutPage schema updated to `'Play Truth & Dare'`. |
| `app/contact/page.tsx` | Title: `'Contact Play Truth & Dare \| Support, Suggestions & Submissions'`, Breadcrumbs, and ContactPage schema updated to `'Contact Play Truth & Dare Studio'`. |
| `app/privacy/page.tsx` | Title: `'Privacy Policy \| Play Truth & Dare Online Party Gaming'`, WebPage schema updated to `'Play Truth & Dare Privacy Policy'`. |
| `app/terms/page.tsx` | Title: `'Terms of Service \| Play Truth & Dare Online Party Gaming'`, WebPage schema updated to `'Play Truth & Dare Terms of Service'`. |
| `app/blog/page.tsx` | Title: `'Party Game Rules & Guides \| Play Truth & Dare Blog'`, Open Graph alt, Blog schema publisher updated to `'Play Truth & Dare'`. |
| `app/blog/[slug]/page.tsx` | Remote team guide copy updated to `"Using web-based tools like Play Truth & Dare..."`, Author and Publisher schemas updated to `'Play Truth & Dare Studio'`. |

---

### 2.4 Localized Routing (`app/[locale]/**`)
All 15 localized route files updated with the brand title suffix:
- `app/[locale]/about/page.tsx` ➔ `${dict.about.title} — Play Truth & Dare (${langMeta.nativeName})`
- `app/[locale]/blog/[slug]/page.tsx` ➔ `${article.metaTitle} — Play Truth & Dare (${langMeta.nativeName})`
- `app/[locale]/blog/page.tsx` ➔ `${dict.blog.title} — Play Truth & Dare (${langMeta.nativeName})`
- `app/[locale]/contact/page.tsx` ➔ `${dict.contact.title} — Play Truth & Dare (${langMeta.nativeName})`
- `app/[locale]/custom/page.tsx` ➔ `${dict.nav.customDeck} Studio — Play Truth & Dare (${langMeta.nativeName})`
- `app/[locale]/games/most-likely-to/page.tsx` ➔ `${dict.gamesList.mostLikelyTo.name} — Play Truth & Dare (${langMeta.nativeName})`
- `app/[locale]/games/never-have-i-ever/page.tsx` ➔ `${dict.gamesList.neverHaveIEver.name} — Play Truth & Dare (${langMeta.nativeName})`
- `app/[locale]/games/page.tsx` ➔ `${dict.nav.allGames} — Play Truth & Dare Party Games (${langMeta.nativeName})`
- `app/[locale]/games/spin-the-bottle/page.tsx` ➔ `${dict.gamesList.spinTheBottle.name} — Play Truth & Dare (${langMeta.nativeName})`
- `app/[locale]/games/this-or-that/page.tsx` ➔ `${dict.gamesList.thisOrThat.name} — Play Truth & Dare (${langMeta.nativeName})`
- `app/[locale]/games/truth-or-dare/page.tsx` ➔ `${dict.gamesList.truthOrDare.name} Online — Play Truth & Dare (${langMeta.nativeName})`
- `app/[locale]/games/would-you-rather/page.tsx` ➔ `${dict.gamesList.wouldYouRather.name} — Play Truth & Dare (${langMeta.nativeName})`
- `app/[locale]/privacy/page.tsx` ➔ `${dict.privacy.title} — Play Truth & Dare (${langMeta.nativeName})`
- `app/[locale]/terms/page.tsx` ➔ `${dict.terms.title} — Play Truth & Dare (${langMeta.nativeName})`
- `app/[locale]/truth-or-dare/page.tsx` ➔ `${dict.gamesList.truthOrDare.name} Online — Play Truth & Dare (${langMeta.nativeName})`

---

### 2.5 Multiplayer & State Engines
| File | Brand Updates Implemented |
|---|---|
| `lib/multiplayer/roomEngine.ts` | Global singleton declared with backward-compatible keying: `__playtruthndare_room_engine__ ?? __asteria_room_engine__`. Header comment updated to Play Truth & Dare. |
| `lib/gameplay/gameplayState.ts` | Gameplay active flags updated: `window.__PLAYTRUTHNDARE_GAMEPLAY_ACTIVE__` with fallback to `__ASTERIA_GAMEPLAY_ACTIVE__`. |
| `lib/custom/deckStorage.ts` | Primary storage keys: `playtruthndare_custom_decks` and `playtruthndare_user_id` with backward-compatible reads from legacy keys. |
| `lib/custom/serverDeckRepository.ts` | Server singleton updated: `__playtruthndare_server_deck_repo__ ?? __asteria_server_deck_repo__`. |
| `lib/audio/soundSynthesizer.ts` | Sound mute preference: dual-key read `playtruthndare_sound_muted ?? asteria_sound_muted` and dual-key write on toggle. |
| `lib/games/spinnerMath.ts` | Engine header updated to Play Truth & Dare. |

---

### 2.6 Speech Synthesis & Neural Voice Engine
| File | Brand Updates Implemented |
|---|---|
| `app/api/voice/synthesize/route.ts` | Header responses emit both `X-PlayTruthNDare-Voice-*` and `X-Asteria-Voice-*` (Engine, Provider, Cached, Voice-Id). |
| `lib/voice/speechService.ts` | Rate storage key updated to `playtruthndare_voice_rate` with fallback to `asteria_voice_rate`. Response reader parses `X-PlayTruthNDare-Voice-Provider` before fallback. Speech utterance window attachment updated to `__playtruthndare_speech_utterance__`. |
| `lib/voice/providers/AzureSpeechProvider.ts` | User-Agent string updated to `PlayTruthNDarePartyGame`. |
| `lib/voice/cache/voiceCache.ts` | Architecture header updated to Play Truth & Dare. |
| `lib/voice/providers/*.ts` | Architecture headers updated across all provider interfaces. |

---

### 2.7 Internationalization & Translations
| File | Brand Updates Implemented |
|---|---|
| `lib/i18n/config.ts` | Locale cookie configured as `playtruthndare_locale` with `LEGACY_LOCALE_COOKIE_NAME = 'asteria_locale'`. |
| `lib/i18n/LanguageContext.tsx` | Reads both `playtruthndare_locale` and legacy cookie/localStorage on initialization; writes both on language switch. |
| `middleware.ts` | Validates and keeps both `playtruthndare_locale` and `asteria_locale` in sync on route transitions. |
| `lib/i18n/seo.ts` | `SITE_URL` default updated to `'https://playtruthndare.com'`, title template set to `| Play Truth & Dare (${langMeta.nativeName})`, and Twitter creator to `'@PlayTruthNDare'`. |
| `lib/i18n/pwaPromotionTranslations.ts` | All 8 languages updated: English, Hindi, Spanish, Portuguese, French, Indonesian, Arabic, and German. |
| `lib/i18n/translations/*.ts` | All 8 language dictionaries (en, hi, es, pt, fr, id, ar, de) scrubbed of `Asteria`, `एस्टेरिया`, `أستيريا`. |
| `lib/questions/database/de.ts` | Removed shout prompts `laut 'Asteria!'` ➔ `'Play Truth & Dare!'` and `Asteria-Herausforderung` ➔ `Super-Herausforderung`. |
| `lib/questions/database/fr.ts` | Replaced `en criant 'Asteria'` ➔ `en criant 'Play Truth & Dare'`. |
| `lib/questions/database/id.ts` | Replaced `'Asteria Juara!'` ➔ `'Play Truth & Dare Juara!'`. |

---

### 2.8 PWA, Service Worker & Social Assets
| File | Brand Updates Implemented |
|---|---|
| `public/manifest.json` | `"name": "Play Truth & Dare"`, `"short_name": "PlayTruthNDare"`. |
| `public/manifest.webmanifest` | `"name": "Play Truth & Dare"`, `"short_name": "PlayTruthNDare"`. |
| `public/sw.js` | Cache names updated to `playtruthndare-shell-v1`, `playtruthndare-static-v1`, `playtruthndare-offline-v1`. Fallback offline HTML text updated. |
| `components/pwa/PWAInstallButton.tsx` | User-facing labels and titles updated to `"Install Play Truth & Dare App"`. |
| `components/pwa/IOSInstallModal.tsx` | Modal title: `"Install Play Truth & Dare on iPhone / iPad"`, step description updated, event listeners support `playtruthndare:open_ios_install`. |
| `components/pwa/PWAPromotionModal.tsx` | Image alt updated to `"Play Truth & Dare App"`. |
| `components/pwa/PWARegistration.tsx` | Update log message updated to `[PWA] New Play Truth & Dare content is available; please refresh.`. |
| `public/og-image.png` | Crisp 1200x630 Open Graph preview image generated with brand icon, gradient typography, official tagline `"Truth • Dare • Laugh • Repeat"`, and `playtruthndare.com`. |

---

## 3. Verification & Compliance Matrix

| Audit Dimension | Target Criterion | Verification Method | Result |
|---|---|---|---|
| **Zero Public References** | 0 matches for `Asteria` in public routes | Static AST & regex grep | **PASS (0 found)** |
| **Domain Modernization** | All canonicals point to `playtruthndare.com` | Vitest + route inspection | **PASS (100%)** |
| **Responsive Header** | No text clipping on 320px–430px viewports | Breakpoint logic (`PlayTruthNDare`) | **PASS (Verified)** |
| **Social Graph Meta** | `og-image.png` exists at 1200x630 | File inspection (236KB PNG) | **PASS** |
| **Offline PWA** | Standalone manifest & cache names | Webmanifest & sw.js inspection | **PASS** |
| **Backward Compatibility** | Existing player sessions/decks persist | Dual-read storage adapters | **PASS** |
| **Unit Test Suite** | All unit tests pass with new branding | Vitest run (17/17 suites) | **PASS (172/172)** |
| **TypeScript Typecheck** | 0 compiler errors | `tsc --noEmit` | **PASS (0 errors)** |
| **Production Build** | Clean Next.js standalone build | `next build` | **PASS** |

