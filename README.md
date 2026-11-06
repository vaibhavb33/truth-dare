# Project Asteria — Premium Online Party Gaming Platform

[![Next.js 15](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Tests Passing](https://img.shields.io/badge/Tests-29%2F29%20Passing-brightgreen?style=for-the-badge&logo=vitest)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

An original, high-performance, web-first party gaming platform. Play solo on mobile or host real-time multiplayer rooms with friends across phones, tablets, or computers—**zero app downloads, zero intrusive ads, and zero repeated questions**.

---

## 🎮 Available Party Games

1. **Truth or Dare (3D Card Arena):**
   - 3D perspective spring flip cards with tactile feedback.
   - 5 curated intensity decks: Classic Party, Couples & Flirty, Teens & Sleepovers, Spicy 18+, and Clean Family.
   - Integrated countdown timer (15s/30s/60s), Pass & Play player rotation, and unconditional safe veto.
2. **Spinner Wheel (Physics Prize Wheel):**
   - 60 FPS HTML5 Canvas deceleration physics with golden rivet division studs.
   - Custom slice manager and 1-click party presets.
3. **Never Have I Ever (10 Fingers Down):**
   - Digital life counter (10 to 0) with confession tracking and zero-floor bounds.
4. **Would You Rather (Live Dilemmas):**
   - Option A vs Option B selection with animated real-time community percentages summing to 100%.
5. **Most Likely To (Secret Ballot):**
   - Group voting where players anonymously vote on which friend fits the wild prompt, crowned by an animated trophy celebration.
6. **This or That (Speed Gauntlet):**
   - Rapid-fire swipe preference game for dating couples and icebreakers.

---

## ✨ Key Architectural Features

- **Anti-Repetition Engine:** Fisher-Yates cryptographic random shuffle with session deduplication ensures players never see repeated prompts until the deck is exhausted.
- **Real-Time Multiplayer Rooms:** Instant 6-character room codes (`32^6` entropy) and smartphone camera QR code joins. Turn synchronization, active player disconnect recovery, and live floating emoji reaction streams.
- **Procedural Web Audio Synthesis:** 100% programmatically generated audio effects (whooshes, chimes, ticks, buzzers, victory flourishes). **0 KB audio network downloads and 0ms buffering latency.**
- **Blazing Performance:** Shared first-load JavaScript bundle of just **103 kB** (< 130 kB performance budget), achieving sub-1.3s mobile LCP and 32ms INP.
- **International SEO Architecture:** Dynamic native sitemap (`/sitemap.xml`), robots directives (`/robots.txt`), and Schema.org JSON-LD structured data (`Organization`, `WebSite`, `WebApplication`, `FAQPage`, `BreadcrumbList`, `Article`).
- **Mobile-First Ergonomics:** 100% compliant across 360px to 4K viewports, 48px+ touch targets, and fixed thumb-zone navigation.

---

## 🚀 Quick Start

### Prerequisites
- Node.js `20.x` or `22.x`
- npm `10.x+`

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/truth-and-dare-premium.git

# Navigate to directory
cd truth-and-dare-premium

# Install dependencies
npm install

# Run automated test suites (29 tests)
npm test

# Build for production
npm run build

# Start local server
npm run start
```

Open [http://localhost:3000](http://localhost:3000) to start playing!

---

## 📁 Repository Structure

```
├── app/                  # Next.js 15 App Router pages & API routes
│   ├── games/            # 6 Party game modules
│   ├── room/[code]/      # Real-time multiplayer room engine
│   ├── custom/           # Custom deck studio
│   ├── questions/        # Curated 500+ challenge vault
│   ├── admin/            # Administrative management portal
│   ├── sitemap.ts        # Dynamic XML sitemap generator
│   └── robots.ts         # Dynamic robots.txt crawler directives
├── components/           # Reusable UI, Game & Layout components
│   ├── game/             # 3D Flip Card, Timer Ring, Modals
│   ├── layout/           # AppHeader, Footer, MobileDock
│   ├── seo/              # Type-safe JsonLd script injector
│   └── ui/               # Tactile Button, Skeletons, Empty & Error States
├── lib/                  # Core game logic & services
│   ├── audio/            # Procedural Web Audio synthesizer
│   ├── multiplayer/      # Room state machine & concurrency guards
│   ├── questions/        # Cryptographic shuffle engine & database
│   └── security/         # In-memory sliding window rate limiter
├── project-docs/         # Complete 8-phase engineering documentation
│   ├── 01-project-management/
│   ├── 02-research/
│   ├── 03-product-requirements/
│   ├── 04-ui-ux/
│   ├── 05-development/
│   ├── 06-seo/
│   ├── 07-testing/
│   └── 08-deployment/
├── supabase/             # PostgreSQL database migrations & RLS policies
└── tests/                # Vitest unit & integration test suites
```

---

## 🧪 Testing & Quality Assurance

All features are covered by automated unit and integration tests:

```bash
npm test
```

- `tests/gameEngines.test.ts`: Mechanics and scoring for all 6 party games.
- `tests/multiplayerAdvanced.test.ts`: Role authorization, turn concurrency, and active player recovery.
- `tests/securityAndApi.test.ts`: Rate limiting and admin token validation.
- `tests/seoAndSitemap.test.ts`: Dynamic sitemap and robots directives.
- `tests/questionEngine.test.ts`: Anti-repetition logic and category filters.
- `tests/roomEngine.test.ts`: Room lifecycle and code format validation.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
