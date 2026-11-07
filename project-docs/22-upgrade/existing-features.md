# Existing Features & Functional Inventory
**Platform:** Asteria Party Gaming Platform (`https://truthordarequiz.com`)  
**Role:** CTO & Senior Full-Stack Architect  
**Date:** November 7, 2026  

---

## 1. Master Feature Capability Matrix

| Feature Domain | Module / Component | Functional State | Maturity Level |
| :--- | :--- | :--- | :---: |
| **Truth or Dare (Core)** | `TruthOrDareGameClient.tsx` | Solo & Pass-and-Play, 3D card flip, dare timer, scores, age-gate | Production-Ready (100%) |
| **Bottle Spinner Wheel** | `SpinnerWheelClient.tsx` | Canvas 60fps rotational physics, custom segments, party presets | Production-Ready (100%) |
| **Never Have I Ever** | `NeverHaveIEverClient.tsx` | Statement cards, "I Have" (+1 sip) vs "Never" counters, reshuffle | Production-Ready (100%) |
| **Would You Rather** | `WouldYouRatherClient.tsx` | Dilemma voting (Option A vs B), percentage split calculation | Production-Ready (100%) |
| **Most Likely To** | `MostLikelyToClient.tsx` | Group nominative voting, player point increment, turn rotation | Production-Ready (100%) |
| **This or That** | `ThisOrThatClient.tsx` | Rapid-fire binary choice game, timed rounds, streak tracking | Production-Ready (100%) |
| **Multiplayer Engine** | `lib/multiplayer/roomEngine.ts` | 6-char room codes, QR scan, host control, turn syncing via polling | In-Memory Functional (85%) |
| **Custom Deck Studio** | `CustomDeckClient.tsx` | User-defined prompt creation, local storage persistence, play deck | Local-Only Functional (80%) |
| **Audio Synthesizer** | `lib/audio/soundSynthesizer.ts` | Web Audio API procedural synthesis: whoosh, chime, tick, buzzer | Production-Ready (100%) |
| **Voice Narration (TTS)**| *Not Yet Implemented* | Zero SpeechSynthesis / TTS audio capability | ❌ Missing (0%) |
| **PWA Core & Offline** | `public/sw.js`, `app/offline/` | Precached shell, SWR static cache, offline Pass & Play, manifest | Production-Ready (100%) |
| **PWA 7-Day Promotion** | `PWAPromotionModal.tsx` | 7-day cooldown schedule, gameplay protection, native & iOS install | Production-Ready (100%) |
| **Internationalization**| `lib/i18n/`, `LanguageModal.tsx`| 8 languages (EN, HI, ES, PT, FR, ID, AR, DE) + Arabic RTL layout | Production-Ready (100%) |
| **Admin Dashboard** | `AdminDashboardClient.tsx` | Superadmin auth, question telemetry, duplicate finder, filters | Read-Only Complete (85%) |
| **Technical SEO Engine**| `components/seo/`, `sitemap.ts` | Hreflang alternates, JSON-LD schemas, breadcrumbs, robots.txt | Production-Ready (100%) |

---

## 2. Detailed Functional Walkthrough

### 2.1 Core Party Games
1. **Truth or Dare:**
   - Setup screen allows adding up to 20 local players with custom names.
   - 5 Category Decks: *Classic Party*, *Couples & Flirty*, *Teens Hangout*, *Spicy 18+* (gated by consent modal), and *Family & Kids*.
   - Timer Duration settings: 15 seconds, 30 seconds, 60 seconds.
   - Dual-layer CSS 3D Card Flip engine (`Card3D.tsx`) with zero text clipping or mirroring on all viewports from 320px to 1440px.
   - Turn actions: Choose Truth, Choose Dare, Random Choice, Skip (tracks skip counts), Complete Dare (+1 point).
   - End-game screen calculates the winner and triggers a celebratory canvas confetti blast (`ConfettiCelebration.tsx`).
2. **Interactive Spinner Wheel:**
   - Custom-rendered on HTML5 Canvas using polar coordinate mathematics.
   - Smooth rotational friction with dynamic deceleration.
   - Four instant presets: *Classic Party*, *Couples Night*, *Party Chaos*, *Clean Family*.
   - Inline segment editor: add player names, custom dares, or eliminate landed options.
3. **Never Have I Ever:**
   - 100+ prompt statements. Tracks accumulated "sips/points" per player. Reshuffles seamlessly when the deck is exhausted.
4. **Would You Rather:**
   - Interactive dilemma cards with immediate visual percentage breakdowns between Option A and Option B.
5. **Most Likely To:**
   - Group voting prompts designed for pass-around mobile play.
6. **This or That:**
   - High-energy, rapid-fire binary decision game with streak tracking.

---

### 2.2 Multiplayer Synchronized Room System
- **Host Room Creation:** Generates a unique 6-character alphanumeric code (`/room/[code]`).
- **Instant Join via QR Code:** Generates a real-time vector QR code (`qrcode` library) for mobile players to join instantly without typing.
- **Player Registry:** Supports up to 20 synchronized players with unique avatar colors.
- **Turn Rotation & Authorization:** Only the active player or host can flip cards or advance turns.
- **Host Migration:** If the host drops, host privileges automatically transfer to the next connected player.
- **Orphan Turn Prevention:** If the active player disconnects, turn automatically advances to prevent game deadlock.
- **Live Reactions:** Players can dispatch floating emojis (`🔥`, `😂`, `😱`, `🎉`) synchronized across screens.

---

### 2.3 Audio & Haptics Engine
- **Procedural Audio (Zero Assets):** Generates sound effects dynamically using oscillator nodes, biquad filters, and gain nodes via the Web Audio API.
  - *Whoosh:* Filtered white noise sweep for 3D card flips.
  - *Chime:* Dual-frequency pure sine chord for correct turns and confirmations.
  - *Timer Tick:* Short high-passed click for countdown rings.
  - *Buzzer:* Low-frequency sawtooth wave for timer expirations and forfeits.
  - *Fanfare:* Ascending arpeggio triad for game victories.
- **Tactile Haptic Feedback:** Triggers device vibration motors via `navigator.vibrate` (10ms to 30ms pulses) on card flips, button clicks, and category selections.
- **Global Mute Persistence:** Audio state persists across sessions in `localStorage.getItem('asteria_sound_muted')`.

---

### 2.4 Progressive Web App (PWA) Capabilities
- **W3C Web App Manifest:** Standalone display, portrait orientation, theme/background `#0A0A16`, custom launcher shortcuts.
- **Brand Icons Suite:** 192px, 512px, 512px maskable (safe-zone padded), 180px Apple touch icon, and scalable vector SVG.
- **Service Worker Cache Strategy:**
  - Shell Cache: Pre-caches `/`, `/offline`, manifest, and icon suite.
  - Static Cache: Stale-While-Revalidate for Next.js chunks, fonts, and assets.
  - Questions API: Network-First with cache fallback for offline pass-and-play.
  - Security Bypass: Network-Only bypass for `/api/admin/*`, `/api/rooms/*`, and `/admin/*`.
- **7-Day Recurring Promotion:**
  - Evaluates after 30 seconds or on first meaningful interaction.
  - Cooldown of 7 days (`asteria_pwa_last_prompt_at`).
  - Active gameplay protection (never interrupts live rooms or active rounds).
  - Triggers native `beforeinstallprompt` on Chromium and 3-step portaled modal on iOS Safari.
