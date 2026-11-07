# Asteria Real-Time Multiplayer API Reference

> **Document Version:** 1.0.0  
> **Status:** Production-Ready  
> **Protocol:** REST JSON over HTTPS + Client Polling / WebSocket SSE Upgrade  
> **Base URL:** `/api/rooms`  

---

## 1. Endpoint Index & Rate Limiting Overview

All multiplayer routes are protected by IP-based in-memory sliding window rate limits:

| Endpoint | Method | Rate Limit | Purpose |
|----------|--------|------------|---------|
| `/api/rooms/create` | `POST` | 20 req/min | Initializes a new room, assigns host, sets settings, returns `sessionToken` |
| `/api/rooms/join` | `POST` | 30 req/min | Joins room, validates capacity & duplicate nicknames, returns `sessionToken` |
| `/api/rooms/reconnect` | `POST` | 60 req/min | Restores existing player session via `sessionToken` on tab reload |
| `/api/rooms/heartbeat` | `POST` | 120 req/min | Keep-alive ping sent every 10s to maintain `isConnected: true` |
| `/api/rooms/action` | `POST` | 120 req/min | Dispatches turn actions, host settings updates, votes, and emojis |
| `/api/rooms/[code]` | `GET` | 180 req/min | Returns sanitized active room state with 2-hour TTL verification |

---

## 2. API Specifications

### 2.1 Create Room (`POST /api/rooms/create`)

Creates a new game lobby, generates a 6-character uppercase room code, and establishes the host identity.

**Request Body:**
```json
{
  "gameId": "truth-or-dare",
  "categoryId": "classic-party",
  "hostName": "Alice",
  "timerSeconds": 30,
  "language": "en",
  "maxPlayers": 12
}
```

**Response (HTTP 200 OK):**
```json
{
  "success": true,
  "roomCode": "ABC123",
  "hostPlayerId": "p-9a8b7c6",
  "sessionToken": "d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a",
  "room": {
    "roomCode": "ABC123",
    "gameId": "truth-or-dare",
    "categoryId": "classic-party",
    "hostPlayerId": "p-9a8b7c6",
    "status": "lobby",
    "players": [
      {
        "id": "p-9a8b7c6",
        "name": "Alice",
        "score": 0,
        "skips": 0,
        "isHost": true,
        "isConnected": true,
        "avatarColor": "#8B5CF6"
      }
    ],
    "activePlayerId": "p-9a8b7c6",
    "currentCard": null,
    "isCardFlipped": false,
    "timerSecondsRemaining": 30,
    "isTimerRunning": false,
    "roundNumber": 1,
    "maxPlayers": 12,
    "language": "en",
    "createdAt": 1730985600000,
    "expiresAt": 1730992800000
  }
}
```

---

### 2.2 Join Room (`POST /api/rooms/join`)

Allows a guest player to enter an existing room. Rejects duplicate names (case-insensitive) and enforces maximum capacity.

**Request Body:**
```json
{
  "roomCode": "ABC123",
  "playerName": "Bob"
}
```

**Response (HTTP 200 OK):**
```json
{
  "success": true,
  "playerId": "p-1b2c3d4",
  "sessionToken": "e7f8a9b0-c1d2-4e3f-5a6b-7c8d9e0f1a2b",
  "room": { ... }
}
```

**Error Responses:**
- `HTTP 400 Bad Request`: `{"error": "Room is currently full (maximum 12 players)."}`
- `HTTP 400 Bad Request`: `{"error": "A player named \"Bob\" is already in this room."}`
- `HTTP 404 Not Found`: `{"error": "Room not found or expired."}`

---

### 2.3 Reconnect Session (`POST /api/rooms/reconnect`)

Restores an existing player session when a participant refreshes their tab or recovers from a network interruption.

**Request Body:**
```json
{
  "roomCode": "ABC123",
  "playerId": "p-1b2c3d4",
  "sessionToken": "e7f8a9b0-c1d2-4e3f-5a6b-7c8d9e0f1a2b"
}
```

**Response (HTTP 200 OK):**
```json
{
  "success": true,
  "player": {
    "id": "p-1b2c3d4",
    "name": "Bob",
    "score": 3,
    "skips": 1,
    "isHost": false,
    "isConnected": true
  },
  "room": { ... }
}
```

**Error Response (HTTP 401 Unauthorized):**
```json
{
  "error": "Invalid session token. Authorization denied."
}
```

---

### 2.4 Heartbeat Ping (`POST /api/rooms/heartbeat`)

Client sends a heartbeat ping every 10 seconds. The server updates `lastSeenAt = Date.now()` and flags players who haven't pinged in >35s as `isConnected = false`.

**Request Body:**
```json
{
  "roomCode": "ABC123",
  "playerId": "p-1b2c3d4"
}
```

**Response (HTTP 200 OK):**
```json
{
  "success": true
}
```

---

### 2.5 Dispatch Turn Action (`POST /api/rooms/action`)

Performs server-authoritative actions. Every state mutation is validated against player role and current turn state.

**Request Body:**
```json
{
  "roomCode": "ABC123",
  "playerId": "p-9a8b7c6",
  "sessionToken": "d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a",
  "action": "FLIP_CARD",
  "payload": {
    "type": "dare"
  }
}
```

#### Supported Action Types

| Action | Allowed Roles | Payload | Effects |
|--------|---------------|---------|---------|
| `START_GAME` | Host only | none | Changes room status from `'lobby'` to `'in_game'` |
| `UPDATE_LOBBY_SETTINGS` | Host only | `{ language, categoryId, maxPlayers, timerSeconds }` | Updates room configuration before game starts |
| `FLIP_CARD` | Active player or Host | `{ type: 'truth' \| 'dare' }` | Draws question in room's language, sets `isCardFlipped: true` |
| `COMPLETE_DARE` | Active player or Host | none | Increments active player score by 1, advances turn to next player |
| `SKIP_TURN` | Active player or Host | none | Increments active player skips by 1, advances turn to next player |
| `LEAVE_ROOM` | Any player | none | Removes player; if host, triggers host migration; if active, rotates turn |
| `KICK_PLAYER` | Host only | `{ targetPlayerId }` | Removes targeted player from room |
| `SEND_EMOJI` | Any player | `{ emoji: '🔥' }` | Appends transient emoji reaction (max 10 retained) |
| `SUBMIT_VOTE` | Any player | `{ option: 'truth' }` | Records player poll vote for active card |

---

### 2.6 Get Room State (`GET /api/rooms/[code]`)

Retrieves latest sanitized room state. Private player `sessionToken` properties are stripped before returning.

**Response (HTTP 200 OK):**
```json
{
  "room": {
    "roomCode": "ABC123",
    "gameId": "truth-or-dare",
    "categoryId": "classic-party",
    "hostPlayerId": "p-9a8b7c6",
    "status": "in_game",
    "players": [ ... ],
    "activePlayerId": "p-1b2c3d4",
    "currentCard": {
      "id": "hi-party-dare-12",
      "type": "dare",
      "prompt": "कमरे में मौजूद किसी भी एक व्यक्ति की 1 मिनट तक मिमिक्री करें।",
      "intensity": 2
    },
    "isCardFlipped": true,
    "timerSecondsRemaining": 30,
    "roundNumber": 2,
    "maxPlayers": 12,
    "language": "hi",
    "createdAt": 1730985600000,
    "expiresAt": 1730992800000
  }
}
```
