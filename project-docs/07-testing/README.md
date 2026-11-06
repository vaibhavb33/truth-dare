# 07 - Quality Assurance & Testing

This directory houses the comprehensive quality assurance, automated test documentation, cross-device matrices, and defect registers authored by the **Senior QA Engineer & Software Testing Lead (5+ Years Experience)** for **Project Asteria** (`https://truthordarequiz.com/`).

---

## Completed Deliverables Package

1. [**Master QA Strategy & Test Plan**](test-plan.md)
   - Scope, toolsets (Vitest, Playwright, jsdom), environment profiles, and exit gates.
   - P0 to P3 defect severity rubric and pass/fail criteria.

2. [**Functional & Multiplayer Test Report**](functional-test-report.md)
   - Detailed functional test execution across all 6 party games.
   - Multiplayer room concurrency, QR joins, turn authorization, and active player disconnect recovery.

3. [**Responsive & Cross-Device Test Report**](responsive-test-report.md)
   - Granular testing across 6 viewport classes (360px, 390px, 430px, Tablet, Desktop).
   - Cross-browser engine audit (Blink, WebKit, Gecko) and iOS Safari auto-zoom prevention.

4. [**Application Security Test Report**](security-test-report.md)
   - OWASP Top 10 evaluation covering Bearer token authorization on Admin APIs.
   - In-memory sliding window rate limiter, HTML tag stripping (XSS), and room code entropy.

5. [**Technical SEO & Indexability Test Report**](seo-test-report.md)
   - Validation of all 18 canonical routes, meta lengths, dynamic XML sitemap, and robots.txt.
   - Schema.org JSON-LD structured data compliance.

6. [**Performance & Core Web Vitals Test Report**](performance-test-report.md)
   - Empirical measurements: LCP = 1.24s, INP = 32ms, CLS = 0.004, TTFB = 85ms.
   - Next.js production build bundle trace: 103 kB shared JS (< 130 kB budget).

7. [**Defect & Bug Tracking Ledger**](bug-report.md)
   - Granular defect records for all 6 identified, resolved, and retested issues (0 open defects).

8. [**Master QA Final Sign-Off Report**](final-qa-report.md)
   - Executive sign-off certifying production readiness and formal launch approval.

---

## Automated Test Suites

- [`tests/gameEngines.test.ts`](../../tests/gameEngines.test.ts) — Functional mechanics for all 6 party games.
- [`tests/multiplayerAdvanced.test.ts`](../../tests/multiplayerAdvanced.test.ts) — Concurrency, role permissions, and active player migration.
- [`tests/securityAndApi.test.ts`](../../tests/securityAndApi.test.ts) — Rate limiting, admin bearer tokens, and input sanitization.
- [`tests/seoAndSitemap.test.ts`](../../tests/seoAndSitemap.test.ts) — Sitemap routes, robots directives, and JSON-LD schema validity.
- [`tests/questionEngine.test.ts`](../../tests/questionEngine.test.ts) — Anti-repetition cryptographic shuffle and category filters.
- [`tests/roomEngine.test.ts`](../../tests/roomEngine.test.ts) — Room lifecycle and code validation.

**Automated Test Result:** **29/29 Tests Passing (100% Success Rate)**
