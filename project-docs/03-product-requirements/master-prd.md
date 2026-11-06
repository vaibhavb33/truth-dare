# Master Product Requirements Document (PRD)

**Project Name:** Project Asteria (Working Title: Truth & Dare Premium)  
**Role:** Senior Product Manager & Business Analyst  
**Document Version:** 1.0.0  
**Date:** November 5, 2026  
**Status:** Complete — Ready for Review & Handover (Phase 2 Deliverable)  
**Upstream Inputs:** [project-overview.md](file:///Users/vaibhavborkar/truth&dare/project-docs/01-project-management/project-overview.md), [competitor-analysis.md](file:///Users/vaibhavborkar/truth&dare/project-docs/02-research/competitor-analysis.md), [feature-comparison.md](file:///Users/vaibhavborkar/truth&dare/project-docs/02-research/feature-comparison.md), [user-personas.md](file:///Users/vaibhavborkar/truth&dare/project-docs/02-research/user-personas.md), [market-opportunities.md](file:///Users/vaibhavborkar/truth&dare/project-docs/02-research/market-opportunities.md), [product-recommendations.md](file:///Users/vaibhavborkar/truth&dare/project-docs/02-research/product-recommendations.md).

---

## 1. Executive Vision & Value Proposition

Project Asteria is a **premium, web-first online party gaming ecosystem**. It allows friends, couples, families, and remote groups to discover party games, spin up instant rooms, invite guests via 6-character room codes or QR codes, and play seamlessly directly inside any web browser on desktop, tablet, or smartphone.

### The Problem We Solve
Existing competitors force users into a false dichotomy:
1. Suffer through intrusive pop-ups, slow mobile page loads, and static clicker UIs on ad-cluttered websites (`truthordare.fun`, `truthordare.website`).
2. Suffer through app-download hostage walls where 18+ content, offline mode, and custom packs require downloading native iOS/Android apps (`truthordareplay.com`).

### Our Product Solution
* **Zero App Download Requirement:** 100% full feature parity natively delivered in modern mobile and desktop web browsers.
* **Instant Time-to-Fun:** Less than 2 seconds from URL landing to active card reveal, with zero forced account registration.
* **Tactile Sensory Feedback:** Hardware-accelerated 3D card flips, zero-download procedural audio synthesis (Web Audio API), and native mobile Web Haptics.
* **Real-time Synchronized Rooms:** Low-latency (< 150ms) bidirectional card replication, live floating emoji reactions, and crowd consensus voting.
* **Modular Multi-Game Suite:** A single unified platform hosting Truth or Dare, Spinner Wheel, Never Have I Ever, Would You Rather, Most Likely To, and This or That.

---

## 2. Product Scope Taxonomy (The 15 Core Modules)

The platform architecture comprises 15 distinct functional modules:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PROJECT ASTERIA TAXONOMY                        │
├────────────────────────────────────────────────────────────────────────┤
│ 01. Homepage & Instant Launch     │ 09. Custom Question Generator      │
│ 02. Game Directory & Hub          │ 10. Multiplayer Game Rooms         │
│ 03. Truth or Dare Core Engine     │ 11. Custom Game Packs              │
│ 04. Interactive Spinner Wheel     │ 12. User Preferences & Audio       │
│ 05. Never Have I Ever Engine      │ 13. Question Library & Shuffle Mem │
│ 06. Would You Rather Engine       │ 14. Editorial Guides & Rules Hub   │
│ 07. Most Likely To Engine         │ 15. Content Administration Portal  │
│ 08. This or That Dilemma Engine   │                                    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Universal Game Logic & Fairness Rules

To maintain professional gaming integrity, every game engine implemented on Project Asteria must enforce the following rules:

1. **Deterministic Randomness & Smart Anti-Repetition:**
   * Prompts are selected via a cryptographically random Fisher-Yates deck shuffle.
   * Prompts drawn within an active game session are tracked in an in-memory session history set.
   * **Rule:** A prompt can **never repeat** within the same session until the entire deck is exhausted.
   * Upon deck exhaustion, the user is notified with an animated celebration modal and given the choice to reshuffle or switch decks.
2. **Deterministic Player Rotation:**
   * Local Pass & Play and Multiplayer Rooms maintain an ordered player roster.
   * Rotation alternates automatically upon turn completion: `Player[i] -> Player[(i + 1) % N]`.
   * The active player's name is rendered prominently in high-contrast text.
3. **Unconditional Safe Skipping & Consent (Safety Mandate):**
   * Physical and emotional safety is paramount.
   * Every card presentation includes an immediate **"Skip / Veto"** button.
   * Skipping is penalty-free by default (house drinking penalty can be toggled by the host).
   * No prompt may coerce physical danger, illegal acts, harassment, or non-consensual behavior.
4. **Session Reset & State Recovery:**
   * Hosts can reset the current game session, clearing drawn cards, resetting scores, or reshuffling the deck at any time with a two-tap confirmation modal.
   * In-session state (active roster, drawn cards, timer settings) is mirrored to browser `sessionStorage`/`localStorage` to survive accidental page refreshes.
5. **Clear Empty & Error States:**
   * If a custom deck has 0 cards, or a network drop occurs, the UI displays actionable empty/error states with clear recovery actions (e.g., "Add at least 5 cards to begin", "Reconnecting to room...").

---

## 4. Safety & Content Governance Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                     CONTENT RATING TAXONOMY                            │
├──────────────────────┬─────────────────────────────────────────────────┤
│ KIDS & FAMILY (G)    │ Wholesome, clean, school-safe challenges.       │
│ TEENS & SOCIAL (PG)  │ Harmless gossip, school life, light romance.   │
│ CLASSIC PARTY (PG13) │ Hilarious party dares, goofy social challenges. │
│ AFTER DARK 18+ (R)   │ Adult, flirty, provocative with explicit gate.  │
└──────────────────────┴─────────────────────────────────────────────────┘
```

1. **Explicit Age Verification Gate (18+ Content):**
   * Adult / Spicy decks are visually demarcated with an explicit 18+ badge.
   * Accessing mature content triggers a full-screen confirmation modal requiring an affirmative birth-year check and explicit consent acknowledgement.
   * Consent status is stored client-side in `localStorage`.
2. **Editorial Content Guidelines:**
   * Prompts must pass editorial safety review before inclusion in production decks.
   * Banned topics: Self-harm, physical violence, dangerous driving, non-consensual sexual acts, hate speech, vandalism, and illegal substance consumption.
3. **Safe Mode Toggle:**
   * A persistent "Family Safe Mode" toggle in user preferences locks all adult categories behind a 4-digit PIN, giving parents and teachers total peace of mind.

---

## 5. Non-Functional Requirements (NFRs)

### Performance & Core Web Vitals
* **Largest Contentful Paint (LCP):** < 2.0s on 4G mobile networks.
* **Interaction to Next Paint (INP):** < 150ms (instant touch feedback).
* **Cumulative Layout Shift (CLS):** < 0.05 (zero layout shifts from dynamic ads or font loading).
* **Initial JavaScript Bundle:** < 130KB gzipped initial hydration.
* **Audio Latency:** < 20ms using procedural Web Audio synthesis (zero network audio fetch).

### Responsive Design & Ergonomics
* **Breakpoints:**
  * Mobile Portrait: 320px – 480px (Primary optimization target; 1-handed bottom thumb-zone reachability).
  * Mobile Landscape: 481px – 768px (Horizontal dual-pane layout).
  * Tablet: 769px – 1024px (Centered responsive game canvas).
  * Desktop & Living Room TV: 1025px+ (Immersive presentation with keyboard shortcut controls).
* **Touch Targets:** Minimum 48px × 48px hit areas with 8px margins.

### Accessibility (WCAG 2.1 Level AA)
* **Color Contrast:** All body text and button labels maintain at least 4.5:1 contrast against their backgrounds (7:1 for headings in Dark Mode).
* **Keyboard Navigation:** 100% playable via keyboard (`Tab` focus, `Space`/`Enter` selection, `Arrow` navigation, `Escape` modal dismissal).
* **Screen Reader Support:** Full ARIA role attribution (`aria-live="polite"` for prompt reveals, `role="region"`, `aria-label` for icon buttons).
* **Reduced Motion:** Fully honors `prefers-reduced-motion: reduce` by replacing 3D card flips with instant opacity fades.

### Security & Privacy
* Zero mandatory PII collection for gameplay.
* Room codes are cryptographically generated (6-character uppercase alphanumeric, excluding ambiguous characters `I, O, 1, 0`).
* Content Security Policy (CSP), strict X-Frame-Options, and automated sanitization of all custom user prompt submissions to prevent XSS.

---

## 6. Phased Scope Summary

* **Phase A: Essential MVP (Phase 5 Launch):** Instant Web Play, Truth or Dare Engine, Pass & Play Player Roster, 5 Curated Original Decks, Dare Timer, Procedural Web Audio FX, Mobile Haptics, Dark Mode.
* **Phase B: Important V1 (Phase 6 & 7):** Real-time Multiplayer Rooms (6-digit codes, QR join), Live Emojis, Dare Consensus Voting, Interactive Spinner Wheel, Custom Deck Builder, Programmatic SEO Landing Pages.
* **Phase C: Advanced V2:** Never Have I Ever, Would You Rather, Most Likely To, This or That, Contextual AI Question Generator, Community Deck Hub.
* **Phase D: Future Opportunities:** AI Voice Host, WebRTC Video Mesh, Discord & Twitch stream bots.

---

## 7. Product Risks & Mitigation Strategy

| Risk ID | Category | Description | Severity | Mitigation Strategy |
| :--- | :--- | :--- | :---: | :--- |
| **PR-001** | Content | Mature content displayed to minors. | Critical | Strict age gate modal with `localStorage` persistence, PIN-protected Safe Mode, separate adult URLs excluded from default sitemaps. |
| **PR-002** | User Experience | Session boredom due to prompt repetition. | High | Fisher-Yates shuffle with session tracking set; minimum deck size threshold of 200+ cards per category before release. |
| **PR-003** | Technical | High latency or desync in multiplayer rooms on mobile networks. | High | Optimistic client-side rendering with authoritative server state timestamping; automatic reconnection backoff. |
| **PR-004** | Performance | Animation lag on low-end budget smartphones. | Medium | Pure CSS transforms (`translate3d`, `backface-visibility: hidden`), zero heavy video/GIF assets, reduced motion fallback. |

