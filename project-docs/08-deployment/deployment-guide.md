# Production Deployment Guide & DevOps Runbook
**Project Asteria — Party Gaming Platform**
**Role:** CTO & Project Director (with DevOps Lead)
*Document Version: 1.0.0 | Date: November 2026 | Target Hosting: Vercel + Supabase*

---

## 1. Production Architecture Overview

Project Asteria is engineered for high-availability, zero-maintenance global hosting:
- **Frontend & API Runtime:** **Vercel Edge & Serverless Network** (Optimized for Next.js 15 App Router with global edge caching, instant rollbacks, and automatic SSL).
- **Database & Realtime Engine:** **Supabase Managed PostgreSQL** (High-throughput relational storage with Realtime WebSocket replication, Row-Level Security, and automated daily backups).
- **Media & Assets:** In-app SVG icons, Web Audio synthesized sounds, and local optimized WebP banners (0 external CDN dependencies).

```
                            ┌───────────────────────────────┐
                            │    USERS (Global Mobile/Web)  │
                            └───────────────┬───────────────┘
                                            │
                                            ▼
                            ┌───────────────────────────────┐
                            │      CLOUDFLARE / VERCEL      │
                            │    Edge CDN & Anycast DNS     │
                            │ (HTTPS, HSTS, Brotli, Assets) │
                            └───────────────┬───────────────┘
                                            │
                     ┌──────────────────────┴──────────────────────┐
                     ▼                                             ▼
        ┌────────────────────────┐                    ┌────────────────────────┐
        │   VERCEL APP ENGINE    │                    │   SUPABASE DATABASE    │
        │ Next.js 15 App Router  │                    │ PostgreSQL 15 Engine   │
        │ Static Pages (SSG)     │<──REST / RPC API──>│ Row-Level Security     │
        │ Server APIs (Rate Ltd) │                    │ Realtime Engine (WSS)  │
        │ In-Memory Room Engine  │                    │ Point-in-Time Backups  │
        └────────────────────────┘                    └────────────────────────┘
```

---

## 2. Prerequisites & Tooling

Before initiating deployment, ensure the following command-line tools are available:
- **Node.js:** `v22.10.0+` (LTS)
- **Git:** `2.40+`
- **Vercel CLI:** `npm i -g vercel` (Version 39+)
- **Supabase CLI:** `npm i -g supabase` (Version 1.200+)

---

## 3. Environment Variables Configuration

Configure the following environment variables in the Vercel Project Settings (`Settings > Environment Variables`). **Never commit real secrets to source control.**

| Variable Name | Required | Environment | Purpose | Example Value |
|---|:---:|:---:|---|---|
| `NEXT_PUBLIC_APP_URL` | Yes | All | Canonical base URL for SEO, canonical tags, and sitemaps. | `https://truthordarequiz.com` |
| `NEXT_PUBLIC_SITE_URL`| Yes | All | Fallback canonical domain for robots and JSON-LD. | `https://truthordarequiz.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | All | Public Supabase project REST API endpoint. | `https://xyzproject.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | All | Public anonymous client JWT key (RLS restricted). | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Production (Server Only) | Administrative database key bypassing RLS. | `eyJhbGciOi...` (KEEP SECRET) |
| `ADMIN_JWT_SECRET` | Yes | Production (Server Only) | Secret key for signing administrative session tokens. | High-entropy 64-char string |
| `ADMIN_DEFAULT_PASSWORD` | Yes | Production (Server Only) | Master administrative dashboard password. | Strong unique passphrase |

---

## 4. Database Provisioning & Migration Runbook

### Step 1: Create Supabase Production Project
1. Log in to [Supabase Console](https://app.supabase.com/) and create a new project named `asteria-production`.
2. Select target AWS region closest to primary user demographics (e.g. `us-east-1` or `eu-central-1`).
3. Store the generated database password securely in a corporate password vault.

### Step 2: Execute DDL Schema Migration
Deploy the initial schema located at [`supabase/migrations/20261105000000_initial_schema.sql`](file:///Users/vaibhavborkar/truth&dare/supabase/migrations/20261105000000_initial_schema.sql):

**Option A (Via Supabase CLI):**
```bash
supabase link --project-ref your-project-ref
supabase db push
```

**Option B (Via Supabase SQL Editor):**
1. Open the Supabase Project Dashboard → **SQL Editor**.
2. Click **New Query**, paste the contents of `supabase/migrations/20261105000000_initial_schema.sql`, and execute.
3. Verify that 14 tables and indexes are created successfully under the `public` schema.

---

## 5. Vercel Deployment & Build Configuration

### Step 1: Link Repository to Vercel
1. Log in to [Vercel Dashboard](https://vercel.com/) → Click **Add New...** → **Project**.
2. Import the Git repository.
3. Configure build parameters:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./`
   - **Build Command:** `next build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`

### Step 2: Custom Headers & Security (`next.config.js`)
Ensure production security headers (HSTS, CSP, X-Frame-Options) are configured in `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

---

## 6. Custom Domain & DNS Configuration

To map the production domain `https://truthordarequiz.com/`:

1. In Vercel Project Settings → **Domains** → Add `truthordarequiz.com` and `www.truthordarequiz.com`.
2. Configure DNS records at your domain registrar (e.g. Cloudflare, Namecheap, GoDaddy):

| Record Type | Host / Name | Target / Value | TTL |
|:---:|:---:|:---:|:---:|
| **A** | `@` | `76.76.21.21` (Vercel Anycast IP) | Auto / 300s |
| **CNAME** | `www` | `cname.vercel-dns.com.` | Auto / 300s |

3. Vercel automatically generates and provisions an SSL/TLS certificate via Let's Encrypt within 60 seconds of DNS resolution.

---

## 7. CI/CD Automated Deployment Pipeline

Below is the production GitHub Actions workflow (`.github/workflows/deploy.yml`):

```yaml
name: Asteria CI/CD Production Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test-and-verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Run Vitest Automated Test Suite
        run: npm test

      - name: Verify Next.js Production Build
        run: npm run build
        env:
          NEXT_PUBLIC_APP_URL: "https://truthordarequiz.com"
          NEXT_PUBLIC_SITE_URL: "https://truthordarequiz.com"
          ADMIN_DEFAULT_PASSWORD: "build_dummy_password"

  deploy-production:
    needs: test-and-verify
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel Production
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 8. Backup & Disaster Recovery Runbook

| Parameter | Policy Specification |
|---|---|
| **Automated Database Backups** | Supabase executes daily automated WAL snapshots retained for 30 days. |
| **Point-in-Time Recovery (PITR)**| Supported down to the second on production tier. |
| **Recovery Point Objective (RPO)** | **< 5 minutes** (Minimal data loss in disaster scenario). |
| **Recovery Time Objective (RTO)** | **< 15 minutes** (Full system restoration to alternate region). |
| **Disaster Recovery Failover** | Instant rollback to previous immutable deployment in Vercel Dashboard with 1 click. |

