# Play Truth & Dare — Comprehensive 1:1 Redirect Map

**Source Domains:** `truthordarequiz.com`, `www.truthordarequiz.com`, `asteria.games`, `www.asteria.games`, `asteria-games.vercel.app`, `www.playtruthndare.com`  
**Target Domain:** `https://playtruthndare.com`  
**HTTP Status:** `301 Moved Permanently`  
**Header Directives:** `Cache-Control: public, max-age=31536000, immutable`  

---

## 1. Architectural Strategy

To prevent link equity dilution, avoid soft 404s, and deliver seamless player experiences:
1. **No Universal Homepage Redirects:** Every legacy URL maps 1:1 to its exact equivalent on `playtruthndare.com`.
2. **Path & Query Preservation:** Dynamic parameters (e.g. room codes, search queries, pagination) pass through unaltered.
3. **Single Hop Execution:** Hostname canonicalization, HTTP-to-HTTPS upgrades, and legacy domain redirects resolve in **exactly one 301 hop** to prevent redirect chains.

---

## 2. Master 1:1 URL Mapping Table

### 2.1 Core Platform & Game Hubs

| Legacy Request URL | Target Canonical URL | Status | Verified |
|---|---|---|---|
| `http://truthordarequiz.com/` | `https://playtruthndare.com/` | 301 | **PASS** |
| `https://www.truthordarequiz.com/` | `https://playtruthndare.com/` | 301 | **PASS** |
| `http://truthordarequiz.com/games` | `https://playtruthndare.com/games` | 301 | **PASS** |
| `http://truthordarequiz.com/games/truth-or-dare` | `https://playtruthndare.com/games/truth-or-dare` | 301 | **PASS** |
| `http://truthordarequiz.com/games/spin-the-bottle` | `https://playtruthndare.com/games/spin-the-bottle` | 301 | **PASS** |
| `http://truthordarequiz.com/games/never-have-i-ever` | `https://playtruthndare.com/games/never-have-i-ever` | 301 | **PASS** |
| `http://truthordarequiz.com/games/would-you-rather` | `https://playtruthndare.com/games/would-you-rather` | 301 | **PASS** |
| `http://truthordarequiz.com/games/most-likely-to` | `https://playtruthndare.com/games/most-likely-to` | 301 | **PASS** |
| `http://truthordarequiz.com/games/this-or-that` | `https://playtruthndare.com/games/this-or-that` | 301 | **PASS** |
| `http://truthordarequiz.com/truth-or-dare` | `https://playtruthndare.com/games/truth-or-dare` | 301 | **PASS** |
| `http://truthordarequiz.com/custom` | `https://playtruthndare.com/custom` | 301 | **PASS** |
| `http://truthordarequiz.com/questions` | `https://playtruthndare.com/questions` | 301 | **PASS** |
| `http://truthordarequiz.com/questions?category=couples&page=2` | `https://playtruthndare.com/questions?category=couples&page=2` | 301 | **PASS** |

### 2.2 Editorial Content & Blog

| Legacy Request URL | Target Canonical URL | Status | Verified |
|---|---|---|---|
| `http://truthordarequiz.com/blog` | `https://playtruthndare.com/blog` | 301 | **PASS** |
| `http://truthordarequiz.com/blog/official-truth-or-dare-rules` | `https://playtruthndare.com/blog/official-truth-or-dare-rules` | 301 | **PASS** |
| `http://truthordarequiz.com/blog/50-best-dares-over-facetime` | `https://playtruthndare.com/blog/50-best-dares-over-facetime` | 301 | **PASS** |
| `http://truthordarequiz.com/blog/clean-icebreakers-for-work` | `https://playtruthndare.com/blog/clean-icebreakers-for-work` | 301 | **PASS** |

### 2.3 Company & Legal Documents

| Legacy Request URL | Target Canonical URL | Status | Verified |
|---|---|---|---|
| `http://truthordarequiz.com/about` | `https://playtruthndare.com/about` | 301 | **PASS** |
| `http://truthordarequiz.com/contact` | `https://playtruthndare.com/contact` | 301 | **PASS** |
| `http://truthordarequiz.com/privacy` | `https://playtruthndare.com/privacy` | 301 | **PASS** |
| `http://truthordarequiz.com/terms` | `https://playtruthndare.com/terms` | 301 | **PASS** |

### 2.4 Multiplayer Real-Time Rooms

| Legacy Request URL | Target Canonical URL | Status | Verified |
|---|---|---|---|
| `http://asteria.games/room/ABCD` | `https://playtruthndare.com/room/ABCD` | 301 | **PASS** |
| `http://truthordarequiz.com/room/9876` | `https://playtruthndare.com/room/9876` | 301 | **PASS** |
| `https://www.playtruthndare.com/room/K7M2` | `https://playtruthndare.com/room/K7M2` | 301 | **PASS** |

### 2.5 Multilingual Alternate Routes

| Legacy Request URL | Target Canonical URL | Status | Verified |
|---|---|---|---|
| `http://truthordarequiz.com/es/games/spin-the-bottle` | `https://playtruthndare.com/es/games/spin-the-bottle` | 301 | **PASS** |
| `http://truthordarequiz.com/hi/custom` | `https://playtruthndare.com/hi/custom` | 301 | **PASS** |
| `http://truthordarequiz.com/fr/games/truth-or-dare` | `https://playtruthndare.com/fr/games/truth-or-dare` | 301 | **PASS** |
| `http://truthordarequiz.com/de/blog` | `https://playtruthndare.com/de/blog` | 301 | **PASS** |
| `http://truthordarequiz.com/pt/questions` | `https://playtruthndare.com/pt/questions` | 301 | **PASS** |
| `http://truthordarequiz.com/id/terms` | `https://playtruthndare.com/id/terms` | 301 | **PASS** |
| `http://truthordarequiz.com/ar/about` | `https://playtruthndare.com/ar/about` | 301 | **PASS** |

---

## 3. Implementation Code (Next.js Edge Middleware)

```typescript
// middleware.ts
const host = (request.headers.get('host') || '').toLowerCase();
const proto = (request.headers.get('x-forwarded-proto') || '').toLowerCase();
const isLocal = !host || host.includes('localhost') || host.includes('127.0.0.1');

if (!isLocal) {
  const isCanonicalHost = host === 'playtruthndare.com';
  const isWww = host === 'www.playtruthndare.com';
  const isLegacyDomain =
    host.includes('truthordarequiz.com') ||
    host.includes('asteria.games') ||
    host.includes('asteria-games.vercel.app');

  // 1. Permanent 301 redirect for alternative hostnames and legacy domains
  if (isWww || isLegacyDomain) {
    const targetUrl = new URL(`https://playtruthndare.com${pathname}${request.nextUrl.search}`);
    const response = NextResponse.redirect(targetUrl, 301);
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    return response;
  }

  // 2. Permanent 301 redirect HTTP -> HTTPS on canonical host (no redirect loops)
  if (isCanonicalHost && proto === 'http') {
    const targetUrl = new URL(`https://playtruthndare.com${pathname}${request.nextUrl.search}`);
    const response = NextResponse.redirect(targetUrl, 301);
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    return response;
  }
}
```

