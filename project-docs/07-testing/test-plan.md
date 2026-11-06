# Master Quality Assurance & Test Plan
**Project Asteria — Party Gaming Platform**
**Role:** Senior QA Engineer & Software Testing Lead (5+ Years Experience)
*Document Version: 1.0.0 | Date: November 2026 | Environment: Next.js 15 App Router*

---

## 1. Quality Mission & Testing Philosophy

The primary objective of the Asteria Quality Assurance department is to verify that the party gaming platform meets all functional, non-functional, security, and accessibility requirements specified in the approved PRD (`03-product-requirements/master-prd.md`) and Technical Architecture (`05-development/system-architecture.md`).

Party games live and die by **flow and social momentum**. Any stutter, unresponsive tap, unsynchronized multiplayer card, or audio delay ruins the party mood. Our testing philosophy is built on four non-negotiable principles:
1. **Empirical Verification Only:** A test is marked passed only after explicit execution and validation against assertions.
2. **Zero P0 or P1 Defects:** Production release certification is withheld as long as any critical security flaw (P0) or core gameplay defect (P1) exists.
3. **Multi-Client Isolation:** Multiplayer synchronization must be validated using independent concurrent client sessions with simulated network latency and disconnections.
4. **Mobile-First Realism:** Over 85% of party game traffic originates on handheld smartphones. Touch targets, 100dvh viewport bounds, and haptic audio responses must operate flawlessly on real mobile constraints.

---

## 2. Test Scope & Feature Matrix

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ASTERIA TEST COVERAGE SCOPE                     │
├────────────────────┬───────────────────────────────────────────────────┤
│ Core Solo Engines  │ Truth or Dare, Spinner Wheel, Never Have I Ever,  │
│                    │ Would You Rather, Most Likely To, This or That    │
├────────────────────┼───────────────────────────────────────────────────┤
│ Multiplayer System │ Room lifecycle (Create, Join, QR, Code), Turn     │
│                    │ Rotation, Card Sync, Emoji Bursts, Host Controls  │
├────────────────────┼───────────────────────────────────────────────────┤
│ Supporting Modules │ Custom Deck Creator, Question Library, Admin Hub, │
│                    │ Static Legal & Information Pages, Blog Guides     │
├────────────────────┼───────────────────────────────────────────────────┤
│ Cross-Cutting NFRs │ Responsiveness (360px-4K), Cross-Browser (WebKit, │
│                    │ Chromium, Gecko), Security, SEO, CWV Performance  │
└────────────────────┴───────────────────────────────────────────────────┘
```

---

## 3. Testing Levels & Tooling Architecture

| Level | Tool / Framework | Scope & Focus |
|---|---|---|
| **Unit Testing** | Vitest 3.2.7 | Question shuffle, deduplication, rating filters, room state machine, rate limiting logic. |
| **Component Testing**| React Testing Library & jsdom | 3D card perspective flip, countdown timer ring, modal dialog traps, sound synthesizer triggers. |
| **End-to-End Testing**| Playwright / Synthetic HTTP Harness | Complete multiplayer room creation, multi-browser client joining, QR link resolution, turn rotation. |
| **Security Testing** | In-Memory Sliding Window & Header Scanners | Rate limiting, SQL/XSS input sanitization, unauthorized action interception, admin token guards. |
| **SEO & Schema Audit**| Schema.org Validator & Next.js Metadata CLI | Sitemap URL completeness, robots.txt directives, JSON-LD structured data syntax validation. |
| **Performance Audit**| Next.js Build Trace & Chrome DevTools Emulation | JS bundle size (< 130 kB), LCP (< 1.8s), INP (< 50ms), CLS (< 0.01). |

---

## 4. Defect Severity & Classification Rubric

All issues uncovered during testing are categorized strictly according to industry-standard defect severity:

- **P0 (Critical Blocker):** System crash, remote code execution, database breach, complete loss of user privacy, or persistent application crash affecting all users. Blocks all releases immediately.
- **P1 (High Blocker):** Core game engine broken (e.g., cards cannot be flipped, spinner freezes, multiplayer room desynchronizes, points stolen). Production release prohibited.
- **P2 (Medium Defect):** Secondary feature impairment, rate limiter threshold tuning, non-game-breaking layout shift, or missing non-critical validation error state. Must be scheduled for immediate resolution.
- **P3 (Low Polish Issue):** Minor cosmetic misalignment, subtle font color discrepancy, minor copy typo, or optional animation enhancement. Release permissible with documented backlog tracking.

---

## 5. Test Environment Configurations

Testing was performed across isolated environments mirroring production constraints:
- **Runtime Environment:** Node.js v22.10.0 on macOS / Apple Silicon (ARM64)
- **Framework:** Next.js 15.5.29 App Router, React 19.0.0
- **Database / State:** In-memory high-speed RoomEngine Map with TTL expiry + Supabase client configuration
- **Network Profiles:**
  - Fast 5G / Broadband (Zero throttling, < 15ms latency)
  - Emulated Slow 4G (400ms RTT latency, 1.6 Mbps download, 750 kbps upload)
  - Intermittent Disconnect (Simulated WebSocket / polling dropouts)

---

## 6. Exit Criteria for Production Launch

1. **100% Pass Rate** on all automated regression suites (minimum 25+ automated test assertions).
2. **0 Open P0 or P1 Defects.**
3. **All 6 Party Games** verified for game selection, draw, deduplication, turn rotation, scoring, and reset.
4. **Multiplayer Room Engine** verified with multi-session concurrency, orphan player prevention, and host migration.
5. **Production Build** compiles cleanly with zero TypeScript errors across all 27 static and dynamic routes.
6. **Shared First Load JS Bundle** remains strictly under the 130 kB performance budget.
7. **Accessibility Score** meets WCAG 2.1 Level AA standards with contrast ratios ≥ 4.5:1.

