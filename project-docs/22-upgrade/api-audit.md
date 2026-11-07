# API Endpoint & Integration Audit
**Platform:** Asteria Party Gaming Platform (`https://truthordarequiz.com`)  
**Role:** CTO & Senior Full-Stack Architect  
**Date:** November 7, 2026  

---

## 1. Master API Route Catalog

Asteria provides 7 core RESTful API endpoints implemented using Next.js 15 Route Handlers:

| Endpoint Path | HTTP Method | Authentication | Rate Limit | Primary Purpose |
| :--- | :---: | :---: | :---: | :--- |
| `/api/rooms/create` | `POST` | Public (Client IP) | 10 req / min | Create new multiplayer party room & assign host |
| `/api/rooms/join` | `POST` | Public (Client IP) | 20 req / min | Join existing room via 6-char code |
| `/api/rooms/[code]` | `GET` | Public | None (Polled) | Fetch synchronized room state & player roster |
| `/api/rooms/action` | `POST` | Player Token / ID | 60 req / min | Dispatch turn action (flip, next, skip, reaction) |
| `/api/questions` | `GET` | Public | 60 req / min | Filtered question query by language & category |
| `/api/admin/auth` | `POST` | Superadmin Password | 5 req / min | Admin session authentication & bearer token |
| `/api/admin/questions`| `GET`, `POST` | Admin Session Token | 30 req / min | Question curation, metrics & duplicate analysis |

---

## 2. In-Depth Endpoint Review

### 2.1 `/api/rooms/create` (POST)
- **Request Body:**
  ```json
  {
    "gameId": "truth-or-dare",
    "categoryId": "classic-party",
    "hostName": "Alex",
    "timerSeconds": 30
  }
  ```
- **Validation:**
  - Strips HTML tags (`sanitizeName`). Truncates host name to 25 characters.
  - Enforces valid `gameId` and `categoryId`.
- **Response Contract (201 Created):**
  ```json
  {
    "success": true,
    "room": {
      "roomCode": "XK92M1",
      "status": "lobby",
      "players": [...],
      "expiresAt": 1731000000000
    },
    "hostPlayerId": "p-abc1234"
  }
  ```

### 2.2 `/api/rooms/join` (POST)
- **Request Body:**
  ```json
  {
    "roomCode": "XK92M1",
    "playerName": "Jordan"
  }
  ```
- **Validation:**
  - Regex check: `^[A-Z0-9]{6}$`.
  - Max player capacity check: rejects with HTTP 400 if room has >= 20 players.
  - Expiration check: rejects with HTTP 400 if `Date.now() > room.expiresAt`.
- **Response Contract (200 OK):**
  ```json
  {
    "success": true,
    "room": { ... },
    "playerId": "p-xyz9876"
  }
  ```

### 2.3 `/api/rooms/[code]` (GET)
- **Query / Params:** `code` parameter from URL route.
- **Service Worker Handling:** Explicitly excluded from Service Worker caching (`/sw.js`) to guarantee live player turns are never cached or stale.
- **Response Contract:** Returns current `MultiplayerRoom` object or 404 with error message.

### 2.4 `/api/rooms/action` (POST)
- **Request Body:**
  ```json
  {
    "roomCode": "XK92M1",
    "playerId": "p-abc1234",
    "action": "FLIP_CARD | NEXT_TURN | COMPLETE_DARE | SKIP_TURN | SEND_EMOJI | SUBMIT_VOTE",
    "payload": { "type": "dare", "emoji": "🔥" }
  }
  ```
- **Security & Authorization Gate:**
  - `FLIP_CARD`: Only permitted by `activePlayerId` or host.
  - `NEXT_TURN` / `COMPLETE_DARE`: Only permitted by `activePlayerId` or host.
  - `START_GAME`: Only permitted by host.
  - `SEND_EMOJI`: Permitted by all active room players (rate-limited buffer of 15 recent emojis).

### 2.5 `/api/questions` (GET)
- **Query Parameters:**
  - `language`: `en | hi | es | pt | fr | id | ar | de`
  - `category`: `classic-party | couples-flirty | teens-hangout | spicy-18 | family-kids`
  - `type`: `truth | dare`
  - `limit`: Default `50`
  - `offset`: Default `0`
- **PWA Service Worker Rule:** Cached with Network-First strategy in `asteria-static-v1`, enabling offline Pass & Play gameplay.

### 2.6 `/api/admin/auth` (POST)
- **Security Protections:**
  - Strict IP rate limiting: 5 attempts per 60 seconds. Rejects with HTTP 429 and `Retry-After: 60`.
  - Constant-time string evaluation against `ADMIN_DEFAULT_PASSWORD`.
  - Returns authenticated session token and superadmin role.

### 2.7 `/api/admin/questions` (GET / POST / PUT / DELETE)
- **Telemetry Query:** `?stats=true` returns language count breakdown across all 8 languages.
- **Audit Query:** `?duplicates=true` runs the automated duplicate detection engine.
- **Pagination:** Supports `limit` and `offset` slicing.

---

## 3. Rate Limiting Architecture (`lib/security/rateLimiter.ts`)

Asteria implements an in-memory sliding-window token bucket rate limiter:
- Automatically purges expired request buckets every 5 minutes.
- Uses client IP resolution from `x-forwarded-for` header with fallback to connection identifier.
- Prevents denial-of-service and brute-force room code guessing.

---

## 4. API Upgrade Requirements

1. **WebSocket / Realtime Transition:**  
   Replace `GET /api/rooms/[code]` polling with bidirectional WebSocket connection or Supabase Realtime Channels.
2. **Persistent Room CRUD:**  
   Wire `createRoom` and `dispatchAction` to update PostgreSQL `multiplayer_rooms` table with atomic row updates.
3. **Admin Mutation Persistence:**  
   Implement permanent database writes for question creation, moderation, and tag updates.
