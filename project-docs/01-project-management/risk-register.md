# Project Risk Register

This document identifies, quantifies, and monitors technical, product, legal, and operational risks across the project lifecycle.

---

## Risk Scoring System
- **Impact (1–5):** 1 = Negligible, 2 = Minor, 3 = Moderate, 4 = Significant, 5 = Catastrophic
- **Likelihood (1–5):** 1 = Rare, 2 = Unlikely, 3 = Possible, 4 = Likely, 5 = Almost Certain
- **Risk Score:** `Impact × Likelihood` (Low: 1–6, Medium: 7–14, High: 15–25)

---

## Active Risk Log

| Risk ID | Category | Description | Impact (1-5) | Likelihood (1-5) | Score | Mitigation Strategy | Contingency Plan | Owner | Status |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- | :--- | :---: |
| **RSK-001** | Content / Legal | Inappropriate or extreme dares causing user distress or safety issues. | 4 | 2 | **8 (Med)** | Establish strict editorial standards; separate content into distinct, explicit age tiers (Kids, Teens, Adults). Provide immediate "Skip/Veto" button. | Provide an emergency "Safe Mode" lock code; allow hosts to disable physical dares entirely. | Product Researcher | Monitoring |
| **RSK-002** | Technical | Real-time room desynchronization or connection drops on mobile sleep/wake. | 3 | 4 | **12 (Med)** | Implement heartbeat ping/pong, reconnect backoff with exponential retry, and auto-state resynchronization upon page focus. | Provide a manual "Resync Room" button for players who temporarily lose connectivity. | Full-Stack Dev | Monitoring |
| **RSK-003** | Product / Engagement | Content fatigue: users see repeated questions quickly during extended sessions. | 3 | 3 | **9 (Med)** | Develop a high-capacity question database (> 500 prompts per tier) with a session-based Fisher-Yates deck shuffle and deduplication cache. | Implement instant user custom card prompt input during gameplay so players can inject their own truths/dares. | Product Researcher | Monitoring |
| **RSK-004** | Performance / SEO | Heavy animations, transitions, or sound files degrade mobile Core Web Vitals (LCP & INP). | 4 | 2 | **8 (Med)** | Use hardware-accelerated CSS transforms (`translate3d`, `will-change`), zero heavy external media assets, procedural Web Audio API, and bundle size budgeting (< 120KB initial JS). | Fallback to simplified 2D CSS transitions if device frame rate drops below 50fps. | Full-Stack Dev / SEO | Monitoring |
| **RSK-005** | Intellectual Property | Accidental similarity to competitor's proprietary question wording or trademarked visual assets. | 5 | 1 | **5 (Low)** | Zero scraping or duplication of competitor assets. All question banks, design elements, and copy are generated from original creative prompts and vetted by the team. | Immediate replacement protocol if any question is flagged as identical to an external trademarked brand. | Product Researcher / CTO | Monitoring |

---

## Review & Escalation Cadence
- Reviewed at the beginning and completion of each development phase.
- Any risk with a score of 15 or higher triggers an immediate Project Director intervention and architecture review.

