# Production Launch Execution Checklist
**Project Asteria — Party Gaming Platform**
**Role:** CTO & Project Director (with QA & DevOps Leads)
*Document Version: 1.0.0 | Date: November 2026 | Launch Status: GO (Approved)*

---

## 1. Pre-Launch Verification Gate (T-24 Hours)

### Code & Compilation Health
- [x] **Git Repository State:** Codebase frozen; zero untracked local modifications in active release branch.
- [x] **Automated Regression Suite:** 29/29 Vitest tests passing with 100% success rate (`npm test`).
- [x] **Production Build Cleanliness:** Next.js 15 production build (`npm run build`) compiles 27/27 static and dynamic routes with 0 errors.
- [x] **Shared JS Bundle Size:** Shared first load JS measured at `103 kB` (< 130 kB performance budget).
- [x] **TypeScript Strict Typing:** Full codebase passes `tsc --noEmit` with zero type errors.

### Infrastructure & Database
- [x] **Database Migrations:** Schema applied in production Supabase project (`20261105000000_initial_schema.sql`).
- [x] **Row-Level Security (RLS):** Policies enabled on all 14 tables; public cannot read internal profiles or expired rooms.
- [x] **Database Backups:** Daily automated WAL snapshots configured and verified in Supabase dashboard.
- [x] **Production Secrets:** Server-side secrets (`SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_DEFAULT_PASSWORD`, `ADMIN_JWT_SECRET`) populated exclusively in Vercel environment variables; zero secrets committed in repo.

### Security & Compliance
- [x] **Rate Limiter Active:** Sliding window rate limiter enabled on `/api/admin/auth` (5/min) and `/api/rooms/create` (20/min).
- [x] **Admin Authentication Guard:** `/api/admin/questions` requires valid `Bearer asteria_admin_*` token.
- [x] **XSS & Injection Protection:** HTML tag stripping active on player names and custom cards.
- [x] **Age Verification Gate:** 18+ modal intercept active on Spicy deck.

---

## 2. Launch Day Cutover Runbook (T-0)

### DNS & SSL Cutover
- [ ] **DNS Record Update:** Update apex domain `truthordarequiz.com` A record to `76.76.21.21` and CNAME `www` to `cname.vercel-dns.com`.
- [ ] **SSL / TLS Handshake:** Verify automated Let's Encrypt TLS certificate provisions with valid HTTPS redirect.
- [ ] **HSTS Headers:** Inspect response headers for `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`.

### Production Smoke Test Suite (Live Domain)
- [ ] **Homepage (`/`):** Verify HTTP 200, hero CTA, value pillars, FAQ accordion, and footer links.
- [ ] **Truth or Dare (`/games/truth-or-dare`):** Test 3D card flip, dare countdown timer audio tick, Pass & Play player roster, and safe skip.
- [ ] **Spinner Wheel (`/games/spin-the-bottle`):** Test canvas spin deceleration physics, pointer angle calculation, and winner celebration.
- [ ] **Never Have I Ever (`/games/never-have-i-ever`):** Test 10-heart decrement on "I HAVE" and confession counter.
- [ ] **Would You Rather (`/games/would-you-rather`):** Test Option A / Option B vote locking and percentage bar animation.
- [ ] **Most Likely To (`/games/most-likely-to`):** Test player voting card and winner trophy badge.
- [ ] **This or That (`/games/this-or-that`):** Test rapid-fire choice gauntlet and round counter.
- [ ] **Multiplayer Room (`/room/create`):**
  - Host creates room; verify 6-character room code and QR code generation.
  - Secondary guest connects via smartphone camera / direct link.
  - Verify synchronized 3D card draw and turn rotation between devices.
  - Verify floating emoji bursts appear across both sessions.
- [ ] **Question Library (`/questions`):** Search prompt keyword; verify copy-to-clipboard toast.
- [ ] **Admin Dashboard (`/admin`):** Verify login gate; verify rate limiter triggers on 6th failed attempt.

---

## 3. Post-Launch Verification & Monitoring (T+24 Hours)

### Search Engine Submission & Crawling
- [ ] **Google Search Console:** Submit production sitemap `https://truthordarequiz.com/sitemap.xml`.
- [ ] **Bing Webmaster Tools:** Verify sitemap indexing and submit root URL via IndexNow API.
- [ ] **Robots.txt Inspection:** Verify `https://truthordarequiz.com/robots.txt` returns HTTP 200 with correct disallows for `/admin/`, `/api/`, `/room/`.
- [ ] **Social Graph Previews:** Share room link on WhatsApp, Discord, Slack, and iMessage; verify rich OpenGraph preview card renders at 1200x630px.

### Real User Performance (RUM) & Error Telemetry
- [ ] **Core Web Vitals RUM:** Monitor 75th percentile mobile metrics (LCP < 2.5s, INP < 200ms, CLS < 0.10).
- [ ] **Error Rate Monitoring:** Monitor Sentry / Vercel runtime logs for 5xx errors (Target: < 0.01% error rate).
- [ ] **Database Connection Pool:** Monitor Supabase active connection pools under peak party hours (Friday/Saturday evening).

---

## 4. Emergency Abort & Rollback Criteria

If any of the following critical failure conditions occur, execute immediate rollback:
1. **P0 Vulnerability:** Data leak, database breach, or unauthenticated admin compromise.
2. **Crash Loop:** Critical 500 error on `/` or `/games/*` affecting more than 2% of traffic.
3. **Multiplayer Desynchronization:** WebSocket / room polling fails globally across multiple devices.

**Rollback Procedure:**
1. Open Vercel Dashboard → **Deployments**.
2. Select previous known-good deployment.
3. Click **Instant Rollback**.
4. Time to restore: **< 60 seconds**.

