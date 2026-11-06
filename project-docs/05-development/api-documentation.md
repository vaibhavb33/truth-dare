# API Specification & Route Contracts

**Project Name:** Project Asteria  
**Document:** REST & Realtime API Architecture  
**Role:** Senior Full-Stack Architect & Lead Developer  
**Date:** November 5, 2026  
**Status:** Approved & Implemented

---

## 1. REST Endpoints Overview

All API routes are served via Next.js 15 Server Route Handlers under `/api/`:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        API ROUTE ARCHITECTURE                          │
├────────────────────┬───────────┬───────────────────────────────────────┤
│ ENDPOINT           │ METHOD    │ PURPOSE                               │
├────────────────────┼───────────┼───────────────────────────────────────┤
│ `/api/questions`   │ GET       │ Fetch filtered randomized question pool│
│ `/api/custom-deck` │ POST, GET │ Save, validate, or fetch custom decks │
│ `/api/rooms/create`│ POST      │ Create a new multiplayer room         │
│ `/api/rooms/join`  │ POST      │ Validate room code & join as player   │
│ `/api/rooms/action`│ POST      │ Host actions (flip, timer, vote, kick)│
│ `/api/admin/auth`  │ POST      │ Secure admin session authentication   │
│ `/api/admin/manage`│ GET, POST │ CRUD questions & moderate submissions │
└────────────────────┴───────────┴───────────────────────────────────────┘
```

---

## 2. API Contract Specifications

### A. Fetch Filtered Questions (`GET /api/questions`)
* **Query Parameters:**
  * `game` (string, required): e.g. `truth-or-dare`
  * `category` (string, optional): e.g. `classic-party`
  * `type` (string, optional): `truth` or `dare`
  * `intensity` (integer, optional): `1` to `5`
  * `limit` (integer, optional, default: 50)
* **Response (200 OK):**
```json
{
  "success": true,
  "count": 50,
  "data": [
    {
      "id": "q-101",
      "game_id": "truth-or-dare",
      "category_id": "classic-party",
      "type": "truth",
      "prompt_text": "What is the single most embarrassing text you have sent to the wrong person?",
      "intensity_level": 2,
      "is_safe_for_minors": true
    }
  ]
}
```

---

### B. Create Multiplayer Room (`POST /api/rooms/create`)
* **Request Body:**
```json
{
  "game_id": "truth-or-dare",
  "category_id": "classic-party",
  "host_name": "Maya",
  "settings": {
    "timer_seconds": 30,
    "allow_skips": true
  }
}
```
* **Response (201 Created):**
```json
{
  "success": true,
  "room_code": "PARTY9",
  "room_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "player_id": "p-host-uuid",
  "expires_at": "2026-11-05T17:45:00Z"
}
```

---

### C. Join Multiplayer Room (`POST /api/rooms/join`)
* **Request Body:**
```json
{
  "room_code": "PARTY9",
  "player_name": "Jordan"
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "room_code": "PARTY9",
  "room_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "player_id": "p-guest-uuid",
  "game_state": {
    "status": "lobby",
    "players": [
      { "id": "p-host-uuid", "name": "Maya", "is_host": true },
      { "id": "p-guest-uuid", "name": "Jordan", "is_host": false }
    ]
  }
}
```

---

### D. Room Action Dispatcher (`POST /api/rooms/action`)
* **Request Body:**
```json
{
  "room_code": "PARTY9",
  "player_id": "p-host-uuid",
  "action": "FLIP_CARD", // FLIP_CARD, START_TIMER, COMPLETE_DARE, SKIP_TURN, SEND_EMOJI, VOTE
  "payload": {
    "card_type": "dare",
    "emoji": "🔥"
  }
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "action": "FLIP_CARD",
  "broadcast_timestamp": 1730818200150
}
```

---

## 3. Error Handling & Validation

All routes enforce strict JSON error responses with standard HTTP status codes:
* `400 Bad Request`: Payload validation failed (`{ "error": "Invalid room code format. Expected 6 uppercase alphanumeric characters." }`).
* `404 Not Found`: Target room or question pool not found.
* `429 Too Many Requests`: Rate limiting triggered (> 60 requests/minute per IP).
* `500 Internal Error`: Sanitized error response masking internal stack traces in production.

