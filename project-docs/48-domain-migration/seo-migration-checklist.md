# Play Truth & Dare — Technical SEO Migration Checklist

**New Domain:** `https://playtruthndare.com`  
**Previous Domains:** `truthordarequiz.com`, `asteria.games`  
**Scope:** 18 Canonical Routes × 8 Languages (184 Pages)  
**Standard:** Google Search Central Migration Guidelines  

---

## 1. Pre-Migration Phase (Preparation & Staging)

- [x] **New Domain Ownership Verified:** Domain `playtruthndare.com` registered and under administrative control.
- [x] **Canonical URLs Mapped:** Every page in the application uses `https://playtruthndare.com` as its canonical base.
- [x] **Self-Referencing Canonicals & Hreflang:** `lib/i18n/seo.ts` generates reciprocal hreflang links for all 8 locales plus `x-default`.
- [x] **Open Graph & Twitter Cards:** Updated with `og:url` pointing to `https://playtruthndare.com` and `og:image` pointing to `/og-image.png`.
- [x] **Structured Data (Schema.org):** Organization, WebSite, Breadcrumbs, and SoftwareApplication schemas bound to `https://playtruthndare.com`.
- [x] **Robots.txt Prepared:** Dynamic sitemap declaration pointing to `https://playtruthndare.com/sitemap.xml`.
- [x] **Sitemap Validated:** XML sitemap generates valid URLs and hreflang alternates with 100% 200 OK targets.
- [x] **Search Console Setup:** Create Domain properties in Google Search Console and Bing Webmaster Tools for both `playtruthndare.com` and legacy domains.

---

## 2. Migration Day Execution (Cutover & Routing)

- [x] **Deploy Production Code:** Deploy Next.js build with canonical domain environment variables.
- [x] **Edge 301 Redirects Active:**
  - `www.playtruthndare.com/*` → 301 → `https://playtruthndare.com/*`
  - `truthordarequiz.com/*` → 301 → `https://playtruthndare.com/*`
  - `asteria.games/*` → 301 → `https://playtruthndare.com/*`
  - `http://playtruthndare.com/*` → 301 → `https://playtruthndare.com/*`
- [x] **HSTS Enforced:** HTTP Strict Transport Security enabled in `next.config.js` (`max-age=63072000; includeSubDomains; preload`).
- [x] **Redirect Loop Prevention:** Confirmed that `https://playtruthndare.com` requests terminate at HTTP 200 without cascading redirects.
- [x] **Retain Query Strings:** Room codes and tracking parameters are preserved through all redirects.

---

## 3. Search Engine Submission & Change of Address

### Google Search Console (GSC) Workflow:
1. Open Google Search Console for the old domain property (`truthordarequiz.com`).
2. Go to **Settings > Change of Address**.
3. Select the new property: `https://playtruthndare.com` (or Domain property `playtruthndare.com`).
4. Run Google's automated pre-check:
   - Validates 301 redirects are functional.
   - Validates verification method.
5. Click **Confirm & Move**. This signals Googlebot to transfer indexation, ranking signals, and canonical associations immediately.
6. Open the `playtruthndare.com` property in GSC:
   - Submit `https://playtruthndare.com/sitemap.xml`.
   - Use the **URL Inspection** tool on `https://playtruthndare.com` and click **Request Indexing**.
   - Request indexing on core hub pages (`/games/truth-or-dare`, `/games/spin-the-bottle`, `/games/never-have-i-ever`, `/games/would-you-rather`).

### Bing Webmaster Tools Workflow:
1. Log in to Bing Webmaster Tools.
2. Add and verify `https://playtruthndare.com` (or import directly from Google Search Console).
3. Navigate to **Site Move** tool.
4. Select "Move URLs from this site to another site" and input `https://playtruthndare.com`.
5. Submit `https://playtruthndare.com/sitemap.xml`.

---

## 4. Post-Migration Monitoring Schedule

| Timeframe | Key Monitoring Metric | Action Item |
|---|---|---|
| **Day 1** | Real-time 404 error spikes, SSL handshake errors | Check edge logs and Sentry for any failed redirect attempts |
| **Day 2–7** | Googlebot crawl rate on new domain | Confirm Googlebot is fetching the new XML sitemap and indexing new URLs |
| **Day 7–14** | GSC Index Coverage report | Verify old URLs are transitioning from "Indexed" to "Page with redirect" |
| **Day 30** | Organic impressions & keyword parity | Compare Google Search Console Performance report before and after migration |
| **Month 3–12** | Maintain 301 redirects | Keep DNS and 301 middleware active indefinitely to preserve residual backlink equity |

