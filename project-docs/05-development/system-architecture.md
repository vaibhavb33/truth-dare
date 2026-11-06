# System Architecture & Technical Topology

**Project Name:** Project Asteria  
**Document:** System Architecture & Runtime Topology  
**Role:** Senior Full-Stack Architect & Lead Developer  
**Date:** November 5, 2026  
**Status:** Approved & Implemented  
**Upstream Inputs:** [master-prd.md](file:///Users/vaibhavborkar/truth&dare/project-docs/03-product-requirements/master-prd.md), [functional-requirements.md](file:///Users/vaibhavborkar/truth&dare/project-docs/03-product-requirements/functional-requirements.md), [design-system.md](file:///Users/vaibhavborkar/truth&dare/project-docs/04-ui-ux/design-system.md).

---

## 1. System Topology Overview

Project Asteria is engineered as a modern, high-concurrency, isomorphic full-stack web application. It combines static edge rendering for high-intent SEO pages with low-latency client state hydration and synchronized real-time WebSockets / Supabase Realtime channels for multiplayer rooms.

```
                                  ┌────────────────────────┐
                                  │      CLIENT FLEET      │
                                  │ Mobile • Tablet • Desk │
                                  └───────────┬────────────┘
                                              │ HTTPS / WSS
                                              ▼
                         ┌──────────────────────────────────────────┐
                         │      NEXT.JS 15 APP ROUTER RUNTIME       │
                         ├────────────────────┬─────────────────────┤
                         │ Edge / SSR Layer   │ API & State Engine  │
                         │ • Dynamic Meta     │ • Room Sync Engine  │
                         │ • Schema JSON-LD   │ • Content API Routes│
                         │ • Static Lobbies   │ • Admin RBAC API    │
                         └─────────┬──────────┴──────────┬──────────┘
                                   │                     │
                    PostgreSQL Pool│                     │Realtime Sync / WSS
                                   ▼                     ▼
                         ┌────────────────────┐ ┌───────────────────┐
                         │ POSTGRESQL DATABASE│ │ SUPABASE REALTIME │
                         │ • 14 Schematized   │ │ • Room Channels   │
                         │   Relational Tables│ │ • Presence Track  │
                         │ • RLS & Indexes    │ │ • Reaction Stream │
                         └────────────────────┘ └───────────────────┘
```

---

## 2. Directory & Module Separation

The project strictly decouples logic into specialized layers:

```
/
├── app/                        # Next.js App Router (Pages, Layouts & Route Handlers)
│   ├── (marketing)/            # Public SEO pages (About, Blog, Contact, Legal)
│   ├── admin/                  # Secure administrative portal
│   ├── api/                    # Server-side REST & RPC endpoints
│   ├── games/                  # Game lobbies, setups, and active engines
│   │   ├── truth-or-dare/
│   │   ├── spin-the-bottle/
│   │   ├── never-have-i-ever/
│   │   ├── would-you-rather/
│   │   ├── most-likely-to/
│   │   └── this-or-that/
│   ├── room/                   # Multiplayer room join & active sync viewports
│   └── custom/                 # Custom deck builder
├── components/                 # Reusable UI component library
│   ├── layout/                 # Universal header, footer, bottom dock
│   ├── ui/                     # Primitives (Button, Modal, Input, Badge, Slider)
│   ├── game/                   # 3D Flip Card, Timer Ring, Scoreboard, Roster
│   └── multiplayer/            # Room codes, QR display, live reactions, voting
├── lib/                        # Core application services & engines
│   ├── audio/                  # Web Audio API sound synthesizer
│   ├── database/               # PostgreSQL & Supabase database client & seeds
│   ├── games/                  # Isolated game engines & rules evaluators
│   ├── multiplayer/            # In-memory and Supabase real-time room engine
│   ├── questions/              # Question repository, Fisher-Yates shuffle & cache
│   └── utils/                  # Tailwind cn, string sanitizers, validators
├── types/                      # Universal TypeScript data contracts & models
└── tests/                      # Unit & integration test suites (Vitest / Playwright)
```

---

## 3. Core Engine Decoupling

1. **Question Engine (`lib/questions/`):**
   * Decoupled from rendering logic.
   * Maintains cryptographically secure Fisher-Yates deck shuffle.
   * Tracks in-memory session deduplication sets (`Set<string>`) to guarantee zero duplicate questions within an active session until deck exhaustion.
2. **Audio Synthesizer (`lib/audio/soundSynthesizer.ts`):**
   * Programmatic Web Audio API synthesis (zero audio file downloads, zero latency).
   * Generates card whoosh, timer clicks, victory chimes, and buzzers on demand with global mute guard.
3. **Multiplayer Engine (`lib/multiplayer/roomEngine.ts`):**
   * Dual-mode architecture: Runs seamlessly with native in-memory high-speed server state sync or bridges directly to Supabase Realtime channels.
   * Implements heartbeats, automatic host migration, turn advancement, and consensus vote aggregation.

