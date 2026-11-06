# Team Responsibilities & RACI Matrix

## 1. Project Organization Structure

```
                      ┌──────────────────────────────────────┐
                      │        CTO & PROJECT DIRECTOR        │
                      │  Strategic Leadership & Governance   │
                      └──────────────────┬───────────────────┘
                                         │
         ┌───────────────────────────────┼───────────────────────────────┐
         │                               │                               │
┌────────┴────────┐             ┌────────┴────────┐             ┌────────┴────────┐
│PRODUCT RESEARCH │             │  UI/UX DESIGN   │             │   FULL-STACK    │
│5+ Yrs Experience│             │5+ Yrs Experience│             │5+ Yrs Experience│
└────────┬────────┘             └────────┬────────┘             └────────┬────────┘
         │                               │                               │
         └───────────────────────────────┼───────────────────────────────┘
                                         │
                         ┌───────────────┴───────────────┐
                         │                               │
                ┌────────┴────────┐             ┌────────┴────────┐
                │   QA ENGINEER   │             │ SEO SPECIALIST  │
                │5+ Yrs Experience│             │5+ Yrs Experience│
                └─────────────────┘             └─────────────────┘
```

---

## 2. Department Profiles & Specific Mandates

### 1. CTO & Project Director
- **Experience:** Senior Engineering Leadership (10+ years).
- **Core Responsibilities:**
  - Enforce project rules, architectural integrity, and timeline.
  - Review and formally sign off on each phase handover.
  - Prevent scope creep, placeholder code, and unverified functionality.
  - Coordinate dependencies among all five specialists.
- **Success Criteria:** Zero unverified features in production, on-time delivery across planned phases, high software craftsmanship.

---

### 2. Product Researcher
- **Experience:** 5+ years in digital entertainment, web gaming, and consumer apps.
- **Core Responsibilities:**
  - Perform competitor research on `truthordarequiz.com` and related party game apps (e.g., Psych, Jackbox, Heads Up).
  - Conduct feature gap analysis and identify unmet user desires.
  - Define user personas, user stories, and acceptance criteria.
  - Formulate the Product Requirements Document (PRD) and functional specifications.
  - Define content categorization matrix, intensity ratings, and prompt mechanics.
- **Key Inputs:** High-level project vision, competitive landscape.
- **Key Deliverables:**
  - `02-research/competitor-analysis.md`
  - `02-research/user-personas-and-journeys.md`
  - `03-product-requirements/prd.md`
  - `03-product-requirements/functional-specifications.md`
  - `03-product-requirements/content-taxonomy.md`
- **Handover Gate Criteria:** PRD must feature clear acceptance criteria for every feature before passing to UI/UX and Development.

---

### 3. UI/UX Designer
- **Experience:** 5+ years in interactive web design, mobile-first design, and gamification interfaces.
- **Core Responsibilities:**
  - Design user experience journeys and wireflows (Solo, Pass-and-Play, and Real-time Multiplayer).
  - Develop the design system (color palette, typography, spacing, component tokens, dark/party mode aesthetics).
  - Design high-fidelity responsive layouts (mobile, tablet, desktop, TV landscape).
  - Craft tactile interaction designs (card animations, flip transitions, sound cues, haptic trigger points).
  - Ensure strict accessibility standards (WCAG 2.1 AA, contrast ratios, keyboard navigation).
- **Key Inputs:** PRD and functional specifications from Product Research.
- **Key Deliverables:**
  - `04-ui-ux/design-system.md`
  - `04-ui-ux/wireframes-and-flows.md`
  - `04-ui-ux/responsive-specifications.md`
  - `04-ui-ux/interaction-and-motion-specs.md`
- **Handover Gate Criteria:** Design system tokens, component states (default, hover, active, disabled, loading), and viewport guidelines validated before frontend implementation.

---

### 4. Full-Stack Developer
- **Experience:** 5+ years in Next.js, React, TypeScript, Tailwind CSS, real-time networking, and database architecture.
- **Core Responsibilities:**
  - Design clean application architecture and directory structure.
  - Implement full-stack Next.js (App Router) codebase with TypeScript strict mode.
  - Build responsive UI components precisely matching the design system with Tailwind CSS.
  - Engineer the game loop (state management, card generation, deduplication, timer system).
  - Architect real-time multiplayer room orchestration (room codes, presence, synced state, action broadcast).
  - Implement secure API routes, input sanitization, rate limiting, and performance optimizations.
- **Key Inputs:** Approved PRD, UX specs, and SEO technical requirements.
- **Key Deliverables:**
  - `05-development/system-architecture.md`
  - `05-development/data-models.md`
  - `05-development/api-specifications.md`
  - Fully tested, clean, production-ready codebase.
- **Handover Gate Criteria:** 100% type safety, zero linter errors, zero placeholder buttons, all features locally verifiable before handing off to QA.

---

### 5. QA Engineer
- **Experience:** 5+ years in automated and manual web application testing, cross-browser compatibility, and performance testing.
- **Core Responsibilities:**
  - Develop Master Test Plan, test suites, and automated test scripts.
  - Perform functional, boundary, and edge-case testing (e.g., player disconnects, empty card decks, rapid clicks).
  - Conduct responsive and cross-browser audits (Chrome, Safari/WebKit, Firefox, Edge across iOS and Android).
  - Execute regression testing upon bug fixes and release candidates.
  - Maintain the bug tracking log with clear reproduction steps and severities.
- **Key Inputs:** Acceptance criteria from PRD, design system specs, and developer build drops.
- **Key Deliverables:**
  - `07-testing/test-plan.md`
  - `07-testing/test-cases-and-matrix.md`
  - `07-testing/bug-log.md`
  - `07-testing/verification-reports.md`
- **Handover Gate Criteria:** Zero critical or high-priority open defects; test suite passing 100% prior to deployment sign-off.

---

### 6. SEO Specialist
- **Experience:** 5+ years in technical SEO, programmatic content architectures, and web vitals optimization.
- **Core Responsibilities:**
  - Conduct keyword research for party games, icebreakers, truth or dare categories, and social search intent.
  - Define technical site architecture, canonicalization, URL structure, and sitemap hierarchy.
  - Architect structured data schemas (JSON-LD: Game, FAQPage, Quiz, BreadcrumbList, WebPage).
  - Optimize Core Web Vitals (LCP < 2.5s, INP < 200ms, CLS < 0.1) in coordination with Dev.
  - Formulate international/multilingual URL strategies and meta tag templates.
- **Key Inputs:** Research insights, content taxonomy, routing architecture.
- **Key Deliverables:**
  - `06-seo/keyword-research.md`
  - `06-seo/technical-seo-blueprint.md`
  - `06-seo/schema-specifications.md`
  - `06-seo/content-and-metadata-strategy.md`
- **Handover Gate Criteria:** SEO blueprints ready to be embedded into the development phase so all static and dynamic pages ship fully optimized from day one.

---

## 3. RACI Matrix (Responsibility Assignment)

| Phase / Artifact | CTO / Project Director | Product Researcher | UI/UX Designer | Full-Stack Developer | QA Engineer | SEO Specialist |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Documentation & Governance Setup** | **A / R** | C | C | C | C | C |
| **Competitor & Market Research** | **A** | **R** | I | I | I | C |
| **Product Requirements (PRD)** | **A** | **R** | C | C | C | C |
| **UX Flows & Design System** | **A** | C | **R** | C | C | I |
| **SEO Strategy & Schema Planning** | **A** | C | I | C | I | **R** |
| **Technical Architecture & Data Model** | **A** | I | C | **R** | C | C |
| **Frontend & Game Engine Implementation**| **A** | I | C | **R** | C | I |
| **Real-time Multiplayer Implementation**| **A** | I | I | **R** | C | I |
| **Testing, Cross-device QA & Hardening** | **A** | I | C | C | **R** | I |
| **Final Production Deployment** | **A / R** | I | I | **R** | C | C |

*R = Responsible (the doer), A = Accountable (the decision maker / approver), C = Consulted (provides inputs), I = Informed (receives output).*

