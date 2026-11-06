# Feature Tracker & Traceability Matrix

This document tracks all user-facing and technical features from inception to verified delivery. 

**Rule:** No feature may be marked **Done** without documented empirical proof (e.g., test output, screenshot, or reproducible verification steps).

---

## Feature Matrix

| Feature ID | Category | Feature Name | Description | Target Phase | Status | Assigned Specialist | Verification Evidence |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| **FEAT-001** | Solo / Local | Quick Play (Truth or Dare Engine) | Single-device card picker with instant random selection between Truth and Dare. | Phase 5 | QA Testing | Full-Stack Dev | Implemented in `app/games/truth-or-dare` |
| **FEAT-002** | Solo / Local | Local "Pass & Play" Player Queue | Roster of player names; game automatically tracks whose turn it is, displays their name, and scores completed dares/truths. | Phase 5 | QA Testing | Full-Stack Dev | Verified in `app/games/truth-or-dare` |
| **FEAT-003** | Solo / Local | Turn Timer & Countdown | Optional configurable timer (15s, 30s, 60s) with visual progress bar and audio ticking for dares. | Phase 5 | QA Testing | Full-Stack Dev | Implemented in `components/game/DareTimerRing.tsx` |
| **FEAT-004** | Solo / Local | Anti-Repetition Algorithm | Memory mechanism ensuring questions do not repeat within a single game session until the deck is exhausted. | Phase 5 | QA Testing | Full-Stack Dev | Unit tests pass 100% (`tests/questionEngine.test.ts`) |
| **FEAT-005** | Content | Multi-Category Deck Picker | Switch between Classic, Party, Couples, Deep & Meaningful, Icebreakers, and Extreme (18+). | Phase 5 | QA Testing | Full-Stack Dev | Implemented with 5 curated decks |
| **FEAT-006** | Content | Custom Deck Creator | Users can input, save, edit, and export their own custom Truths and Dares into browser storage (`localStorage`). | Phase 5 | QA Testing | Full-Stack Dev | Implemented in `app/custom/page.tsx` |
| **FEAT-007** | Content | Intensity Level Filter | Slider to tune prompts from Level 1 (Light/Funny) to Level 5 (Wild/Spicy). | Phase 5 | QA Testing | Full-Stack Dev | Verified with dynamic filter query |
| **FEAT-008** | UX / Audio | Tactile Micro-Interactions | 3D card flip animation, confetti celebration on dare completion, and Web Haptic vibration. | Phase 5 | QA Testing | UI/UX Designer / Dev | Verified via CSS `preserve-3d` & canvas confetti |
| **FEAT-009** | UX / Audio | Synthesized Sound FX Engine | Web Audio API sound effects for card flip, timer tick, success chime, and buzzer with master mute. | Phase 5 | QA Testing | Full-Stack Dev | Verified in `lib/audio/soundSynthesizer.ts` |
| **FEAT-010** | Multiplayer | Room Creation & Joining | Host creates a 6-character room code; guests join via code or QR code link. | Phase 6 | QA Testing | Full-Stack Dev | Implemented in `app/room/[code]` & `api/rooms` |
| **FEAT-011** | Multiplayer | Synchronized Card Reveal | Host or active player flips the card; card state and prompt synchronize across all connected screens in < 150ms. | Phase 6 | QA Testing | Full-Stack Dev | Verified in `tests/roomEngine.test.ts` |
| **FEAT-012** | Multiplayer | Real-time Social Reactions | Connected players can send live emoji reactions (🔥, 😂, 😱, 👏) that burst on all connected screens. | Phase 6 | QA Testing | Full-Stack Dev | Implemented in `app/room/[code]` |
| **FEAT-013** | Multiplayer | Community Dare Voting | Room players can vote "Pass" or "Fail" to officially validate if a player completed their dare. | Phase 6 | QA Testing | Full-Stack Dev | Implemented in `lib/multiplayer/roomEngine.ts` |
| **FEAT-014** | SEO & Growth | Programmatic Category Hubs | Dynamic SEO landing pages for high-search intent terms (e.g., `/truth-or-dare-for-teens`, `/dirty-truth-or-dare`). | Phase 7 | QA Testing | SEO Specialist / Dev | Implemented in `/games/*` directory |
| **FEAT-015** | SEO & Growth | Schema.org Structured Data | Fully compliant JSON-LD Game, FAQPage, Quiz, and BreadcrumbList markup. | Phase 7 | QA Testing | SEO Specialist | Enriched in homepage & articles |
| **FEAT-016** | SEO & Growth | Social Share Cards (OpenGraph) | Dynamic card preview generation for sharing specific truths, dares, or room invites on WhatsApp/iMessage/X. | Phase 7 | QA Testing | SEO Specialist / Dev | Implemented in `app/layout.tsx` metadata |
| **FEAT-017** | Accessibility | WCAG AA Compliant Theme | Dark/Party mode with 4.5:1+ contrast ratios, keyboard navigation support, and ARIA labels. | Phase 8 | QA Testing | UI/UX Designer / QA | Verified via color system & ARIA regions |

---

## Status Legend
- **Backlog:** Defined in requirements; not yet scheduled for active sprint.
- **In Spec:** Requirements and functional acceptance criteria being written.
- **In Design:** Wireframing, UX states, and tokens being created.
- **In Dev:** Active engineering implementation.
- **QA Testing:** Verification, cross-browser and stress testing in progress.
- **Done:** Fully implemented, verified empirically, and signed off with test artifact.

