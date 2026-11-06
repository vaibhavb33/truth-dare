# 06 - SEO, Growth & Technical Architecture

This directory houses the comprehensive international SEO and growth documentation authored by the **Senior Technical SEO Specialist (5+ Years Experience)** for **Project Asteria** (`https://truthordarequiz.com/`).

---

## Completed Deliverables Package

1. [**SEO Strategy & Internationalization Blueprint**](seo-strategy.md)
   - Dual-funnel search intent taxonomy (Immediate Play vs. Pre-Party Planning).
   - International multi-region architecture (`/es/`, `/fr/`, `/de/`, `/pt/` roadmap).
   - Technical performance budgets (LCP < 2.5s, First Load JS < 130 kB).

2. [**Keyword Map & Search Intent Taxonomy**](keyword-map.md)
   - 13 Required query clusters mapped with primary, secondary, and long-tail keywords.
   - Related entities, content gaps, and search intent classification.
   - Strict adherence to professional ethics: zero fabricated keyword volume or difficulty scores.

3. [**URL Architecture & Routing Rules**](url-architecture.md)
   - Canonical routing tree, strict trailing slash avoidance, and dynamic query handling.
   - Ephemeral room exclusion (`/room/[code]` disallow directives) preventing SERP pollution.

4. [**Technical SEO Checklist & Metadata Inventory**](technical-seo-checklist.md)
   - 50-point technical compliance audit across crawlability, indexability, and rendering.
   - Granular meta title and description length audit across all routes.

5. [**Schema.org JSON-LD Structured Data Implementation**](schema-implementation.md)
   - Production JSON-LD templates for `Organization`, `WebSite`, `WebApplication`, `BreadcrumbList`, `FAQPage`, and `Article`.
   - Rich snippet qualification standards without fake reviews or hidden text.

6. [**Editorial Content Calendar & Evergreen Strategy**](content-calendar.md)
   - 6-month editorial roadmap across 5 core pillars (Couples, Teens, Adult 18+, Icebreakers, Rules).
   - Seasonal surge calendar (New Year's Eve, Valentine's Day, Summer Sleepovers, Halloween).

7. [**Pre-Launch & Technical SEO Audit Report**](launch-seo-audit.md)
   - 60-point launch verification report: **PASSED (Production Ready)**.
   - Core Web Vitals audit: LCP = 1.24s, INP = 32ms, CLS = 0.004, Bundle = 103 kB.

---

## Application Code Integrations

- [`app/sitemap.ts`](../../app/sitemap.ts) — Native Next.js 15 dynamic XML sitemap generating all 18 indexable URLs.
- [`app/robots.ts`](../../app/robots.ts) — Dynamic crawler directives for Googlebot, Bingbot, and AI crawlers.
- [`components/seo/JsonLd.tsx`](../../components/seo/JsonLd.tsx) — Reusable, type-safe JSON-LD structured data renderer.
- Schema injection across [`app/layout.tsx`](../../app/layout.tsx), [`app/page.tsx`](../../app/page.tsx), [`app/games/page.tsx`](../../app/games/page.tsx), [`app/games/truth-or-dare/page.tsx`](../../app/games/truth-or-dare/page.tsx), and [`app/blog/[slug]/page.tsx`](../../app/blog/[slug]/page.tsx).

---

## Governance & Handover
- **Handover Reference:** `HO-006` in [`project-docs/01-project-management/handover-log.md`](../01-project-management/handover-log.md).
- **Status:** **APPROVED & FULLY INTEGRATED**
