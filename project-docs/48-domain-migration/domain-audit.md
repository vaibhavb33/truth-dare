# Play Truth & Dare — Technical Domain Audit & Architecture

**Target Canonical Domain:** `https://playtruthndare.com`  
**Protocol:** HTTPS (Port 443)  
**Canonical Hostname Form:** Apex (`playtruthndare.com`)  
**Previous Production Domain:** `truthordarequiz.com`  
**Legacy Brand Domains:** `asteria.games`, `asteria-games.vercel.app`  
**Date:** November 2026  
**Auditor:** Senior Technical SEO Specialist & DevOps Engineer  

---

## 1. Domain & Infrastructure Overview

| Parameter | Configuration Detail |
|---|---|
| **Primary Canonical Host** | `playtruthndare.com` |
| **Secondary Alternative Host** | `www.playtruthndare.com` (301 redirects to apex) |
| **Legacy Hostnames** | `truthordarequiz.com`, `www.truthordarequiz.com`, `asteria.games`, `www.asteria.games`, `asteria-games.vercel.app` |
| **Application Runtime** | Next.js 15.5 App Router (Node.js & Edge Middleware) |
| **Target Deployment Platform** | Vercel / Cloudflare Pages / AWS Amplify / Node Server |
| **SSL/TLS Requirement** | TLS 1.3 / HSTS enforced with 2-year preload (`max-age=63072000`) |
| **HTTP to HTTPS** | Automatic 301 redirect via edge middleware |

---

## 2. Inventory of Domain Touchpoints

### 2.1 Canonical Tags & Alternate Language URLs
- **Root Configuration:** `app/layout.tsx` defines `metadataBase: new URL('https://playtruthndare.com')`.
- **Hreflang Engine:** `lib/i18n/seo.ts` automatically generates self-referential canonical tags and 8-language reciprocal hreflang links with `x-default` for all localized pages:
  - English: `https://playtruthndare.com/en/...` (or apex root for homepage)
  - Hindi: `https://playtruthndare.com/hi/...`
  - Spanish: `https://playtruthndare.com/es/...`
  - Portuguese: `https://playtruthndare.com/pt/...`
  - French: `https://playtruthndare.com/fr/...`
  - Indonesian: `https://playtruthndare.com/id/...`
  - Arabic: `https://playtruthndare.com/ar/...`
  - German: `https://playtruthndare.com/de/...`
  - `x-default`: `https://playtruthndare.com/...`

### 2.2 XML Sitemap & Robots.txt
- **XML Sitemap:** Served dynamically at `https://playtruthndare.com/sitemap.xml` via `app/sitemap.ts`.
  - Indexes all 18 primary routes with prioritized crawl frequencies.
  - Generates full hreflang alternate maps.
- **Robots Directives:** Served at `https://playtruthndare.com/robots.txt` via `app/robots.ts`.
  - Allows public crawling of game hubs, decks, and articles.
  - Disallows crawler indexing of private multiplayer rooms (`/room/`), system endpoints (`/api/`), and admin panels (`/admin`).
  - Points explicitly to `sitemap: https://playtruthndare.com/sitemap.xml`.

### 2.3 Structured Data (JSON-LD)
All schemas across the platform link to `https://playtruthndare.com`:
- `Organization`: ID `https://playtruthndare.com/#organization`, logo `https://playtruthndare.com/branding/logo-horizontal-dark.svg`.
- `WebSite`: ID `https://playtruthndare.com/#website`, search action `https://playtruthndare.com/questions?q={search_term_string}`.
- Breadcrumbs & Game Schemas: Fully relative or derived from canonical base.

### 2.4 Progressive Web App (PWA)
- Manifests (`/public/manifest.webmanifest` & `/public/manifest.json`):
  - `start_url`: `"/"`
  - `scope`: `"/"`
  - Bound to origin: Resolves directly to `https://playtruthndare.com/` upon installation.
  - Icons: Local high-resolution and maskable PNGs.

### 2.5 Multiplayer & Dynamic Sharing
- **Room Join Links:** Generated using `window.location.origin`:
  ```ts
  const joinUrl = `${window.location.origin}/room/${roomCode}`;
  ```
  Resolves automatically to `https://playtruthndare.com/room/{ROOM_CODE}` with zero hardcoded domain dependencies.
- **OAuth & Auth Callbacks:** None. The platform operates on a 100% free, zero-registration model using WebSockets and ephemeral server-side room states.

---

## 3. Risk Assessment & Pre-Migration Findings

1. **DNS Propagation Lag:** DNS updates can take 1–24 hours to propagate globally. Instructions must provide strict TTL (300 seconds) prior to cutover.
2. **Redirect Loops:** If `playtruthndare.com` redirects to `www` and `www` redirects to apex, a browser error occurs. Middleware has been tested and guaranteed to enforce apex canonical with zero loops.
3. **HTTPS Certificate Failure:** The apex domain and `www` subdomain must both be covered under a SAN (Subject Alternative Name) SSL certificate before activating redirects.
4. **Link Equity Preservation:** Previous backlinks to `truthordarequiz.com` and `asteria.games` will transfer PageRank via permanent HTTP 301 redirects with path and query preservation.

