# Project Decision Log (ADRs & Product Choices)

This log records all fundamental architectural, technical, product, and design decisions. No decision is altered or overturned without documenting the rationale, impact, and approval.

---

## Decision Records Summary Table

| ID | Title | Department | Status | Date | Decision Summary |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ADR-001** | Strict Phase-Gated Inception Model | Project Management | **Approved** | 2026-11-05 | No code implementation before specs and design systems are approved. |
| **ADR-002** | Core Technology Stack Selection | Development / CTO | **Proposed** | 2026-11-05 | Next.js 15+ App Router, React 19, TypeScript (Strict), Tailwind CSS. |
| **ADR-003** | Real-Time Multiplayer Networking Model | Development | **Proposed** | 2026-11-05 | Evaluate Lightweight Server-Sent Events/WebSockets vs. Peer-to-Peer vs. Cloud Realtime. |
| **ADR-004** | Content & Age-Appropriateness Strategy | Product / Research | **Proposed** | 2026-11-05 | Tiered categorization (Kids, Teens, Adults, Couples) with client-side verification gate. |
| **ADR-005** | Sound and Tactile Feedback Architecture | UI/UX / Dev | **Proposed** | 2026-11-05 | Web Audio API synthesized audio (zero asset lag) + Web Haptics API with user toggle. |

---

## Detailed Records

### ADR-001: Strict Phase-Gated Inception Model
- **Status:** **Approved** (CTO Mandate)
- **Context:** Previous software initiatives often suffer from scope creep, unverified UI mockups, and low product quality when developers start coding before requirements are documented.
- **Decision:** Enforce GSD Rules. The project must proceed linearly through: Research -> Requirements -> UI/UX -> Architecture -> Implementation -> Testing -> Deployment.
- **Consequences:** Ensures zero placeholder buttons and ensures every visual and functional requirement is premeditated.

---

### ADR-002: Core Technology Stack Selection
- **Status:** **Proposed (Pending Stakeholder Approval)**
- **Context:** Need an ultra-fast, modern, SEO-friendly framework capable of rendering rich client-side animations while serving high-speed programmatic landing pages for SEO.
- **Options Considered:**
  1. *Next.js (App Router) + TypeScript + Tailwind CSS:* Industry standard, excellent SSR/ISR for SEO, zero-config bundling, superior developer experience.
  2. *Vite + React SPA:* Great for pure client-side apps, but poor for organic SEO programmatic landing pages without complex prerendering setups.
  3. *Remix / React Router v7:* Strong SSR capabilities, but smaller ecosystem for drop-in animated UI primitives compared to Next.js.
- **Recommendation:** Option 1: Next.js (App Router) with TypeScript (Strict) and Tailwind CSS.
- **Impact:** High developer velocity, out-of-the-box SEO metadata and sitemaps, clean component isolation.

---

### ADR-003: Real-Time Multiplayer Networking Model
- **Status:** **Proposed (Pending Stakeholder Approval)**
- **Context:** The platform must support synchronized room play where multiple players on separate phones or computers join a room, see the same card revealed simultaneously, vote, and react in real-time.
- **Options Considered:**
  1. *WebSockets (Custom Node server or PartyKit / Socket.io):* Direct, bidirectional, low latency (< 50ms).
  2. *Server-Sent Events (SSE) + HTTP POST:* Great for unidirectional updates, simple to host on serverless, but higher latency on two-way reactions.
  3. *Cloud Real-Time Engine (Supabase Realtime / Ably / Pusher):* Instant setup, managed infrastructure, room channels, presence events.
  4. *WebRTC (Peer-to-Peer):* Direct mesh between mobile phones; eliminates central server load but suffers from NAT traversal / mobile sleep disconnection issues.
- **Recommendation:** Start with an abstracted Room Sync Engine interface supporting local mock/broadcast channel testing, with Socket.io / PartyKit / Realtime provider for multi-client synchronization.
- **Impact:** Modular architecture that allows zero-latency local play while enabling multi-device multiplayer.

---

### ADR-004: Content & Age-Appropriateness Strategy
- **Status:** **Proposed (Pending Stakeholder Approval)**
- **Context:** `truthordarequiz.com` has mixed prompts where mildly suggestive questions can appear in casual modes. Our platform must serve family nights, teen hangouts, party bashes, and intimate couples without awkward overlap.
- **Decision:** Introduce a dual-axis filter system:
  1. **Audience Deck:** Family / Kids (G), Party / Friends (PG-13), Couples / Romantic (PG-13 to R), Adult 18+ (Explicit / Spicy).
  2. **Intensity Slider:** Level 1 (Casual Icebreaker) to Level 5 (Spicy / Bold).
  - Explicit modes require an initial consent modal and are excluded from public default indexes.
- **Impact:** Protects users, avoids brand liability, and creates tailored experiences.

---

### ADR-005: Sound and Tactile Feedback Architecture
- **Status:** **Proposed (Pending Stakeholder Approval)**
- **Context:** Party games rely heavily on excitement, suspense, and sensory feedback (card whoosh, suspenseful countdown tick, buzzer, celebration chime). Downloading heavy audio files introduces network latency and mobile data lag.
- **Decision:** Build a lightweight Web Audio API procedural sound synthesizer (generating pleasant chime, card flip, countdown ticks, buzzer frequencies programmatically in < 3KB code) plus native `navigator.vibrate` integration for mobile devices. Provide an immediate mute toggle in the main header.
- **Impact:** Instant loading, zero external audio asset dependency, high tactile engagement.

