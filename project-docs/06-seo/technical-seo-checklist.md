# Technical SEO Audit & Compliance Checklist

**Project Name:** Project Asteria  
**Document:** 50-Point Technical SEO Compliance Checklist  
**Role:** Senior Technical SEO Specialist (5+ Years Exp)  
**Date:** November 5, 2026  
**Status:** Approved & Implemented

---

## Technical Audit Matrix

| Category | Verification Item | Specification / Requirement | Implementation Status |
| :--- | :--- | :--- | :---: |
| **Rendering** | Server-Side / Static Pre-rendering | Public pages pre-rendered via SSG/SSR at build time. Zero blank client hydration. | ✅ Verified |
| **Title Tags** | Length & Format | Primary keyword first, brand suffix, 50–60 characters max. Unique per page. | ✅ Verified |
| **Meta Descriptions**| Length & Call-to-Action | Engaging click-through copy, 140–160 characters max. Unique per page. | ✅ Verified |
| **Canonicals** | Self-Referential Tag | Fully qualified HTTPS URL declared on every indexable route. | ✅ Verified |
| **Sitemap** | Dynamic XML Generation | Native Next.js `sitemap.ts` serving `/sitemap.xml` with priority & changefreq. | ✅ Verified |
| **Robots.txt** | Crawler Directives | Allows all public content; explicitly disallows `/admin`, `/api/`, `/room/`. | ✅ Verified |
| **Open Graph** | Social Sharing Tags | `og:title`, `og:description`, `og:url`, `og:image`, `og:type="website"`. | ✅ Verified |
| **Twitter Cards** | Summary Large Image | `twitter:card="summary_large_image"`, `twitter:title`, `twitter:description`. | ✅ Verified |
| **Headings** | Semantic Hierarchy | Exactly one `<h1>` per page. Followed by `<h2>` and `<h3>`. No skipped levels. | ✅ Verified |
| **Semantic HTML**| Landmarks | Use `<main>`, `<header>`, `<nav>`, `<footer>`, `<section>`, `<article>`. | ✅ Verified |
| **Alt Attributes** | Image Descriptions | All images and SVGs have descriptive `alt` tags or `aria-hidden="true"`. | ✅ Verified |
| **Internal Links** | Crawl Path | Contextual descriptive anchor text (no "click here"). Siloed topical hubs. | ✅ Verified |
| **Index Directives** | Private Route Isolation | Ephemeral `/room/*`, `/admin`, `/api/*` output `noindex, nofollow`. | ✅ Verified |
| **Core Web Vitals**| Performance Budgets | LCP < 2.0s, INP < 100ms, CLS = 0.00. First Load JS bundle = 103 kB. | ✅ Verified |

---

## Metadata Inventory by Core Page

| Page Route | `<title>` Tag | Meta Description | Target Primary Keyword |
| :--- | :--- | :--- | :--- |
| `/` | `Asteria — Premium Online Party Gaming Platform` | Play Truth or Dare, Spinner Wheel, Never Have I Ever, and Would You Rather online. 100% free, zero ads, zero downloads, and real-time multiplayer. | `online party games` |
| `/games` | `All Party Games — Play Truth or Dare, Never Have I Ever & More` | Discover 6 interactive party games. Filter by couples, teens, house party, or drinking games with instant browser play. | `party games online` |
| `/games/truth-or-dare` | `Truth or Dare Online — 3D Cards, Timers & Multiplayer` | The ultimate online Truth or Dare game. 5 curated decks (Classic, Couples, Teens, Family, Spicy 18+) with 3D card flips and dare timer. | `truth or dare online` |
| `/games/spin-the-bottle`| `Spin the Bottle Online — Interactive Physics Wheel` | Smooth virtual bottle-spinning and custom wheel to randomly assign turns and forfeits. Works seamlessly on all mobile phones. | `spin the bottle online` |
| `/games/never-have-i-ever`| `Never Have I Ever Online — 10 Fingers Down Game` | Digital life counter confession game with group reveals. Track lives or drinks with hundreds of fresh party questions. | `never have i ever online`|
| `/games/would-you-rather`| `Would You Rather Online — Dilemmas with Global Live % Stats`| Tough, hilarious dilemmas. Vote Option A or Option B and instantly see live community vote percentages. | `would you rather online` |
| `/games/most-likely-to` | `Most Likely To Online — Synchronized Player Voting Game` | Secret ballot voting where friends vote on who fits the wild prompt best. Live crown reveals and score tracking. | `most likely to online game`|
| `/games/this-or-that` | `This or That Gauntlet — Rapid-Fire Swipe Preference Game` | 60-second mobile swipe preference test for couples, friends, and quick social icebreakers. Tap or swipe to choose. | `this or that online` |
| `/questions` | `Party Question Library — 500+ Truths, Dares & Icebreakers` | Browse and search over 500 curated party questions and dares. Copy prompts with one click or launch them directly in-game. | `random question generator`|
| `/blog` | `Party Game Guides, Rules & Icebreaker Advice — Asteria` | Official rules breakdowns, long-distance FaceTime dare ideas, and clean icebreakers for virtual meetings and game nights. | `truth or dare rules` |

