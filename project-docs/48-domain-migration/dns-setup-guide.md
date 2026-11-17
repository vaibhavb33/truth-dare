# Play Truth & Dare — DNS Configuration & Hosting Setup Guide

**Domain:** `playtruthndare.com`  
**Target Canonical:** `https://playtruthndare.com` (Apex)  
**Date:** November 2026  
**Audience:** DevOps Engineers, System Administrators, Domain Owners  

> [!IMPORTANT]
> Do NOT claim the domain is live until DNS propagation and SSL certificate issuance have been empirically validated using dig/nslookup and curl.

---

## 1. Required DNS Records Matrix

Configure the following DNS records at your authoritative DNS provider (Cloudflare, Namecheap, Route 53, GoDaddy, Squarespace):

| Type | Name / Host | Target Value / IP | TTL | Purpose |
|---|---|---|---|---|
| **A** | `@` (Apex) | `76.76.21.21` (or Hosting Provider IP) | 300s (5 min) | Directs apex `playtruthndare.com` to production cluster |
| **CNAME** | `www` | `cname.vercel-dns.com` (or `playtruthndare.com`) | 300s (5 min) | Enables `www` subdomain to reach hosting |
| **TXT** | `@` (Apex) | `google-site-verification=<TOKEN>` | 3600s | Google Search Console Domain verification |
| **TXT** | `@` (Apex) | `msvalidate.01=<TOKEN>` | 3600s | Bing Webmaster Tools verification |
| **CAA** | `@` (Apex) | `0 issue "letsencrypt.org"` | 3600s | Authorizes automated SSL certificate renewal |
| **CAA** | `@` (Apex) | `0 issue "digicert.com"` | 3600s | Backup CA authorization |

> [!TIP]
> If using Cloudflare DNS, set the Proxy status to **DNS Only** (Gray Cloud) during initial domain verification and SSL provisioning to allow Let's Encrypt HTTP-01 challenge completion without proxy interference.

---

## 2. Hosting Dashboard Setup (Vercel / Next.js)

### Step 1: Add Production Domains
1. Navigate to your project on the hosting platform (e.g., **Vercel Project Settings > Domains**).
2. Add `playtruthndare.com`.
3. Add `www.playtruthndare.com`.

### Step 2: Configure Canonical Redirection
1. In the domain manager, select **`playtruthndare.com`** as the **Primary Domain**.
2. Configure **`www.playtruthndare.com`** with **Redirect to `playtruthndare.com`** (HTTP 301).
3. Verify that SSL certificates are issued for both hostnames (SAN cert covers `playtruthndare.com` and `*.playtruthndare.com`).

### Step 3: Configure Environment Variables
Set the following environment variables in your production environment settings:
```ini
NEXT_PUBLIC_SITE_URL="https://playtruthndare.com"
NEXT_PUBLIC_APP_URL="https://playtruthndare.com"
```

---

## 3. Legacy Domain Redirect Configuration (`truthordarequiz.com` & `asteria.games`)

To retain all historic search ranking equity and prevent broken user bookmarks, legacy domains must be routed to the hosting project as redirect aliases:

1. In the hosting domain manager, add `truthordarequiz.com` and `www.truthordarequiz.com`.
2. Point their DNS records (`A` to `76.76.21.21`, `CNAME` for `www` to `cname.vercel-dns.com`).
3. Next.js Edge Middleware (`middleware.ts`) automatically intercepts incoming requests for `truthordarequiz.com`, `asteria.games`, or `asteria-games.vercel.app`, returning an immediate **HTTP 301** with the exact original path and query string preserved.

---

## 4. Live DNS Propagation & Verification Commands

Run the following terminal commands to verify that DNS has fully propagated before switching live traffic:

```bash
# 1. Verify Apex A Record resolution
dig +short A playtruthndare.com

# 2. Verify WWW CNAME resolution
dig +short CNAME www.playtruthndare.com

# 3. Test HTTP to HTTPS 301 Redirect
curl -sI -o /dev/null -w "%{http_code} -> %{redirect_url}\n" http://playtruthndare.com

# 4. Test WWW to Apex 301 Redirect
curl -sI -o /dev/null -w "%{http_code} -> %{redirect_url}\n" https://www.playtruthndare.com

# 5. Test Legacy Domain 301 Path Preservation
curl -sI -o /dev/null -w "%{http_code} -> %{redirect_url}\n" http://truthordarequiz.com/games/truth-or-dare
```

Expected output:
- `301 -> https://playtruthndare.com/`
- `301 -> https://playtruthndare.com/`
- `301 -> https://playtruthndare.com/games/truth-or-dare`

