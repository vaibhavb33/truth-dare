# Product Release Roadmap: MVP to Horizon 3

**Project Name:** Project Asteria  
**Document:** Product Release Roadmap  
**Role:** Senior Product Manager & Business Analyst  
**Date:** November 5, 2026  
**Status:** Complete — Ready for Review

---

## 1. Roadmap Architecture & Release Horizons

To maintain continuous delivery without compromising product stability, Project Asteria follows an evolutionary 4-tier release cadence:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        RELEASE HORIZON OVERVIEW                        │
├────────────────────────────────────────────────────────────────────────┤
│ HORIZON 1: ESSENTIAL MVP (Phase 5)                                     │
│ Target: The Most Polished Local Party Experience on the Web            │
│ Focus: Core 3D Card Engine, Pass & Play Roster, 5 Decks, Web Audio     │
├────────────────────────────────────────────────────────────────────────┤
│ HORIZON 2: IMPORTANT V1 (Phase 6 & 7)                                  │
│ Target: Real-Time Multi-Device Sync & Programmatic SEO Virality        │
│ Focus: 6-Digit Rooms, QR Join, Live Reactions, Voting, SEO Hubs        │
├────────────────────────────────────────────────────────────────────────┤
│ HORIZON 3: ADVANCED V2 (Post-V1 Expansion)                             │
│ Target: Comprehensive Party Gaming Suite & AI Customization            │
│ Focus: 8 Party Games, AI Prompt Generator, Community Deck Hub          │
├────────────────────────────────────────────────────────────────────────┤
│ HORIZON 4: FUTURE OPPORTUNITIES (Long-Term Exploration)                │
│ Target: Social Media & Streaming Dominance                             │
│ Focus: AI Voice Game Master, WebRTC Video Mesh, Discord/Twitch Bots    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Release Breakdown & Milestones

### Horizon 1: Essential MVP (Phase 5) — "The Tactile Foundation"
* **Release Objective:** Deliver an instant, zero-friction, tactile web game that redefines how Truth or Dare feels in a mobile browser.
* **Target Audience:** In-person house parties, romantic couples, and teen sleepovers passing a single smartphone or iPad.
* **Core Capabilities:**
  * Instant web launch (< 2.0s hydration), zero account barrier.
  * 3D card flip animation with perspective transforms.
  * Local Pass & Play roster with turn tracking, score tally, and skip counter.
  * 5 curated original decks: *Classic Party*, *Couples & Flirty*, *Teens & Hangouts*, *Family & Kids*, *Spicy 18+*.
  * Anti-repetition shuffle algorithm with in-memory session history.
  * Dare countdown timer (15s, 30s, 60s) with animated SVG ring and audio ticking.
  * Zero-latency procedural Web Audio sound synthesizer (whoosh, chime, tick, buzzer).
  * Mobile Web Haptics on card reveal and timer completion.
  * Universal header mute and dark/party mode.
  * Affirmative 18+ age verification gate.
* **Target KPIs:**
  * Average session duration: > 12 minutes.
  * Cards drawn per session: > 25 cards.
  * Lighthouse Performance & Accessibility: > 90.

---

### Horizon 2: Important V1 (Phases 6 & 7) — "Social Rooms & SEO Virality"
* **Release Objective:** Connect players across separate devices in real time and capture high-intent organic search traffic.
* **Target Audience:** Long-distance friends, Discord hangouts, remote couples, and organic Google searchers.
* **Core Capabilities:**
  * **Real-time Multiplayer Rooms:** 6-character room codes and instant camera QR codes.
  * **Bidirectional State Sync:** Sub-150ms card flip replication across all connected devices.
  * **Live Streamer-style Reactions:** Floating animated emoji bursts (🔥, 😂, 😱, 👏).
  * **Dare Consensus Voting:** Connected room players vote "Passed" vs. "Chickened Out".
  * **Interactive Spinner Wheel:** Physics-based wheel for turn selection and dare forfeits.
  * **Custom Deck Builder:** Author, save, and play custom decks via browser `localStorage`.
  * **Programmatic SEO Landing Pages:** Dedicated dynamic hubs for top search keywords (`/games/truth-or-dare/couples`, `/games/truth-or-dare/spicy-18`, etc.) with full Schema.org JSON-LD.
  * **Dynamic OpenGraph Previews:** Auto-generated share cards for rooms and cards.
* **Target KPIs:**
  * Multiplayer room creation rate: > 35% of total sessions.
  * Guest joins per room: > 3.8 average players.
  * Organic search impressions growth: > 50% month-over-month.

---

### Horizon 3: Advanced V2 — "The Party Gaming Suite & AI Engine"
* **Release Objective:** Expand into an all-in-one party entertainment portal and integrate generative AI customization.
* **Target Audience:** Repeat party hosts, college social circles, and users seeking novel party games.
* **Core Capabilities:**
  * **Extended Multi-Game Suite:**
    * *Never Have I Ever* (with 10-fingers life counter and anonymous room polling).
    * *Would You Rather* (with real-time global community percentage stats).
    * *Most Likely To* (with real-time room player nomination voting).
    * *This or That* (60-second mobile swipe gauntlet).
  * **Contextual AI Question Generator:** Guided LLM prompt builder generating 20 custom prompts for specific themes (e.g., "Tech Startup Happy Hour", "Camping Trip").
  * **Community Deck Marketplace:** Moderated public repository of user-submitted decks with upvoting and curation.
  * **Optional User Accounts (OAuth):** Save custom decks to cloud storage and sync across devices without blocking anonymous instant play.
* **Target KPIs:**
  * Cross-game exploration rate: > 40% of sessions play more than 1 game type.
  * Custom deck creation rate: > 15% of active hosts.

---

### Horizon 4: Future Opportunities — "Next-Gen Interactive Entertainment"
* **Release Objective:** Pioneer AI-hosted social gaming and native streaming integrations.
* **Target Audience:** Twitch/YouTube streamers, Discord communities, and virtual parties.
* **Core Capabilities:**
  * **AI Virtual Game Master:** Conversational synthesized AI voice host that reads dares aloud, mediates disputes, and offers comedic roast commentary.
  * **Direct WebRTC Video & Audio Mesh:** Optional embedded picture-in-picture video feeds for long-distance hangouts directly inside the browser.
  * **Twitch & Discord Streamer Extensions:** Live audience chat voting extensions allowing viewers to submit and vote on dares in real time.

---

## 3. Release Milestones & Governance Quality Gates

```
┌────────────────────────────────────────────────────────────────────────┐
│                        RELEASE QUALITY GATES                           │
├────────────┬──────────────────┬────────────────────────────────────────┤
│ RELEASE    │ TARGET PHASE     │ EXIT QUALITY GATE                      │
├────────────┼──────────────────┼────────────────────────────────────────┤
│ MVP        │ Phase 5 (Dev)    │ Zero bugs, 750+ original prompts,      │
│            │ Phase 8 (QA)     │ 100 turns tested, Web Audio 100% pass  │
├────────────┼──────────────────┼────────────────────────────────────────┤
│ V1         │ Phase 6 (Multi)  │ Sub-150ms room sync verified,          │
│            │ Phase 7 (SEO)    │ 100% valid Schema.org validation pass  │
├────────────┼──────────────────┼────────────────────────────────────────┤
│ V2         │ Extended Suite   │ 4 new games integrated, AI prompt      │
│            │                  │ safety filter verified 100%            │
└────────────┴──────────────────┴────────────────────────────────────────┘
```

