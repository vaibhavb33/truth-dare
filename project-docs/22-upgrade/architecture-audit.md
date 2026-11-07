# Comprehensive Architectural Audit
**Platform:** Asteria Party Gaming Platform (`https://truthordarequiz.com`)  
**Role:** CTO & Senior Full-Stack Architect  
**Date:** November 7, 2026  
**Audited Git Reference:** `asteria-major-upgrade-backup`  

---

## 1. System Overview & Technology Stack

Asteria is an enterprise-grade, browser-based real-time party gaming platform developed on the modern JavaScript/TypeScript ecosystem.

| Layer | Technology | Version | Architectural Role | Health Status |
| :--- | :--- | :--- | :--- | :---: |
| **Framework** | Next.js (App Router) | `15.1.0` (Engine `15.5.29`) | Hybrid Static Generation (SSG) & Dynamic Server Rendering | 🟢 Excellent |
| **UI Library** | React | `19.0.0` | Concurrent rendering, Server/Client component isolation | 🟢 Excellent |
| **Language** | TypeScript | `5.7.2` | Strict type safety, shared domain models across client/server | 🟢 Excellent |
| **Styling** | Tailwind CSS | `3.4.17` | Utility-first, mobile-first responsive tokens, arbitrary CSS values | 🟢 Excellent |
| **Audio Engine**| Web Audio API | Native Browser | Procedural real-time sound synthesizer (no external MP3 downloads) | 🟢 Excellent |
| **Offline / PWA**| Service Worker API | Custom W3C SW | Multi-tier cache (SWR, Network-First, Network-Only bypass) | 🟢 Excellent |
| **Persistence** | PostgreSQL (Supabase) | Client `2.49.1` | Schema designed in SQL; currently running in-memory engine | 🟡 Transition Needed |
| **Testing** | Vitest + Playwright | `3.0.0` / `1.65.0` | 42 unit/integration tests + multi-viewport E2E validation | 🟢 Excellent |

---

## 2. Next.js App Router Structure & Rendering Pipeline

### 2.1 Route Topology
The codebase follows Next.js App Router conventions with 79 cleanly prerendered and dynamic routes:

```
app/
├── [locale]/                      # Dynamic localized routes (en, hi, es, pt, fr, id, ar, de)
│   ├── page.tsx                   # Localized Homepage (SSG)
│   ├── games/
│   │   ├── page.tsx               # Localized Games Directory (SSG)
│   │   └── truth-or-dare/page.tsx # Localized Game Setup & Play (SSG)
│   ├── truth-or-dare/page.tsx     # Direct SEO Game Route (SSG)
│   ├── questions/page.tsx         # Localized Question Browser (SSG)
│   └── custom/page.tsx            # Localized Custom Deck Studio (SSG)
├── games/                         # Unprefixed Root Game Hub
│   ├── truth-or-dare/page.tsx     # Truth or Dare Solo / Pass & Play
│   ├── spin-the-bottle/page.tsx   # Canvas Bottle / Wheel Spinner
│   ├── never-have-i-ever/page.tsx # Never Have I Ever Interactive Deck
│   ├── would-you-rather/page.tsx  # Would You Rather Dilemma Engine
│   ├── most-likely-to/page.tsx    # Most Likely To Voting Engine
│   └── this-or-that/page.tsx      # Binary Speed Decision Game
├── room/[code]/                   # Real-Time Multiplayer Synchronized Screen
│   ├── page.tsx                   # Dynamic server page
│   └── RoomClient.tsx             # Polling & synchronized multiplayer controller
├── admin/                         # Administrative Portal
│   ├── page.tsx                   # Superadmin dashboard
│   └── AdminDashboardClient.tsx   # Live question browser & telemetry
├── api/                           # Edge & Node Serverless API Routes
│   ├── rooms/                     # Multiplayer engine actions (create, join, action, [code])
│   ├── admin/                     # Superadmin auth & question curation APIs
│   └── questions/                 # Public question query API with filter capabilities
├── offline/page.tsx               # Dedicated PWA Offline fallback
├── blog/                          # SEO Editorial Hub & Guides
└── layout.tsx                     # Global Root Layout (Fonts, PWA, SEO JsonLd, LanguageProvider)
```

### 2.2 Middleware & Routing Hygiene
The root `middleware.ts` handles locale cookie synchronization while enforcing strict bypass rules:
```typescript
matcher: ['/((?!_next|api|admin|room|.*\\..*).*)']
```
- **Static Assets Bypass:** Files with extensions (`/sw.js`, `/manifest.webmanifest`, `/icons/*.png`, `/icon.svg`) bypass locale redirects and serve with 0ms edge latency.
- **Dynamic API Bypass:** Requests to `/api/*` and `/room/*` remain unhindered by locale rewriting.
- **Admin Isolation:** `/admin` routes are preserved outside locale hierarchies.

---

## 3. Client Component Architecture & State Management

Client components are strictly marked with `'use client'` and organized by domain:

1. **`components/games/`**:
   - `TruthOrDareGameClient.tsx` (Solo & Pass-and-Play state, card rotation, scorekeeping, category picker, age-gate)
   - `SpinnerWheelClient.tsx` (Canvas 60fps rotational physics engine, segment presets, winner celebration)
   - `NeverHaveIEverClient.tsx`, `WouldYouRatherClient.tsx`, `MostLikelyToClient.tsx`, `ThisOrThatClient.tsx`
2. **`components/pwa/`**:
   - `PWARegistration.tsx` (Single canonical service worker registrant at scope `/`)
   - `PWAPromotionModal.tsx` (7-day recurring Add to Home Screen promotional banner)
   - `IOSInstallModal.tsx` (Portaled 3-step WebKit Home Screen instructions)
   - `PWAInstallButton.tsx` (Adaptive install trigger for header, drawer, and footer)
3. **`components/i18n/`**:
   - `LanguageSelector.tsx` & `LanguageModal.tsx` (Instant locale switching, native language display, search)
4. **`components/layout/`**:
   - `AppHeader.tsx`, `AppFooter.tsx`, `MobileDock.tsx` (Global responsive navigation, audio toggles, language triggers)

---

## 4. Key Architectural Observations & Technical Debt

1. **In-Memory Multiplayer State Limitation:**
   - `lib/multiplayer/roomEngine.ts` maintains an in-memory `Map<string, MultiplayerRoom>`.
   - *Impact:* Rooms only persist within the lifetime of a single Node process. If deployed to multi-container environments or serverless edge lambdas (Vercel/AWS), room state will desynchronize across separate instances.
2. **Polling vs WebSockets / Push Architecture:**
   - Real-time multiplayer synchronization currently relies on client-side HTTP polling every 1,500ms (`RoomClient.tsx`).
   - *Impact:* High network traffic and battery drain on mobile devices. Needs upgrade to WebSockets or Supabase Realtime Channels.
3. **Absence of Voice / Text-to-Speech Engine:**
   - Asteria has a procedural sound effects synthesizer (`lib/audio/soundSynthesizer.ts`), but has **no voice narration engine** (SpeechSynthesis / TTS) to read questions aloud to party groups.
4. **Local-Only Custom Decks:**
   - Custom decks are currently confined to browser `localStorage` (`asteria_custom_deck`). Users cannot share custom decks across devices or send room codes with their custom questions.
5. **Admin Mutation Persistence:**
   - The `/api/admin/questions` endpoint handles queries and duplicate detection, but does not persist new or modified questions back to PostgreSQL or disk.
