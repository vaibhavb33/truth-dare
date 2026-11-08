# Asteria Multiplayer Room: API Contract & Validation Specification

**Document Version:** 1.0.0  
**Audit Date:** November 8, 2026  
**Auditor:** Senior Backend Engineer & Multiplayer Systems Architect  
**Subsystem:** Multiplayer REST API Endpoints & Contract Specification  
**Status:** **ACTIVE & PRODUCTION VERIFIED**

---

## 1. Overview & Architectural Principles

The Asteria Multiplayer API enables distributed party room creation, player joining, real-time turn synchronization, and game state replication. All endpoints follow strict REST standards:
1. **Canonical Identifiers:** Every room payload returns both canonical UUID `id` (`roomId`) and the 6-character user-facing alphanumeric code (`roomCode`).
2. **Deterministic HTTP Status Codes:** Distinct status codes differentiate between missing entities (`404 Not Found`), expired sessions (`410 Gone`), capacity limits (`409 Conflict`), and authorization breaches (`403 Forbidden`).
3. **Structured Machine-Readable Errors:** All failure responses supply an unambiguous `code` identifier alongside a human-readable `error` string.

---

## 2. Structured Error Code Registry

| HTTP Status | Error Code (`code`) | Scenario / Trigger | Client Action |
| :--- | :--- | :--- | :--- |
| **`400 Bad Request`** | `INVALID_ROOM_CODE` | Code is not 6 uppercase alphanumeric characters | Prompt user to verify code format |
| **`400 Bad Request`** | `INVALID_REQUEST` | Missing required payload parameters | Validate form fields before sending |
| **`403 Forbidden`** | `PERMISSION_DENIED` | Non-host attempted host-only action (e.g. Start Game, Kick) | Show authorization warning |
| **`404 Not Found`** | `ROOM_NOT_FOUND` | Room code does not exist in memory or database | Advise user to check code or create new room |
| **`409 Conflict`** | `ROOM_FULL` | Room already reached `maxPlayers` capacity | Notify user room is packed |
| **`409 Conflict`** | `DUPLICATE_NAME` | Player name already taken in the room | Prompt user to choose alternate display name |
| **`410 Gone`** | `ROOM_EXPIRED` | Room exceeded 3-hour inactivity TTL | Notify user room expired and redirect home |
| **`410 Gone`** | `ROOM_CLOSED` | Room was cancelled or disbanded by host | Inform user game was disbanded |
| **`503 Service Unavailable`** | `NETWORK_UNAVAILABLE` | Database connection or network timeout | Retry with exponential backoff |

---

## 3. Detailed Endpoint Specifications

### 3.1. Create Room

- **Endpoint:** `POST /api/rooms/create`
- **Auth:** None (Guest permitted)
- **Rate Limit:** 10 requests / min / IP

#### Request Payload
```json
{
  "hostName": "Alice",
  "avatar": "cat",
  "roomName": "Alice's Party",
  "language": "en",
  "category": "classic",
  "customDeckId": null,
  "maxPlayers": 12,
  "maxRounds": 10
}
```

#### Response (`200 OK` or `201 Created`)
```json
{
  "success": true,
  "roomId": "a3f5b721-689c-4b3a-9e11-85b42c67da12",
  "roomCode": "HL4J36",
  "code": "HL4J36",
  "hostPlayerId": "f1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "playerId": "f1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "sessionToken": "ast_sess_9a8b7c6d5e4f3a2b1c",
  "room": {
    "id": "a3f5b721-689c-4b3a-9e11-85b42c67da12",
    "code": "HL4J36",
    "name": "Alice's Party",
    "hostId": "f1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "status": "WAITING",
    "language": "en",
    "category": "classic",
    "maxPlayers": 12,
    "playerCount": 1,
    "createdAt": 1794121878673,
    "createdAtIso": "2026-11-08T07:11:18.673Z",
    "expiresAt": 1794132678673,
    "expiresAtIso": "2026-11-08T10:11:18.673Z",
    "players": [
      {
        "id": "f1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
        "name": "Alice",
        "avatar": "cat",
        "isHost": true,
        "isOnline": true,
        "score": 0
      }
    ]
  }
}
```

---

### 3.2. Get Room by Code

- **Endpoint:** `GET /api/rooms/[code]`
- **URL Parameter:** `code` (e.g., `HL4J36`)
- **Purpose:** Used for lobby polling and joining verification

#### Successful Response (`200 OK`)
```json
{
  "success": true,
  "room": {
    "id": "a3f5b721-689c-4b3a-9e11-85b42c67da12",
    "code": "HL4J36",
    "status": "WAITING",
    "language": "en",
    "playerCount": 1,
    "maxPlayers": 12,
    "expiresAt": 1794132678673,
    "players": [...]
  }
}
```

#### Error Response: Room Does Not Exist (`404 Not Found`)
```json
{
  "success": false,
  "code": "ROOM_NOT_FOUND",
  "error": "Room not found. Please verify the 6-character room code."
}
```

#### Error Response: Room Expired (`410 Gone`)
```json
{
  "success": false,
  "code": "ROOM_EXPIRED",
  "error": "This multiplayer room has expired due to inactivity."
}
```

---

### 3.3. Join Room

- **Endpoint:** `POST /api/rooms/join`

#### Request Payload
```json
{
  "roomCode": "HL4J36",
  "playerName": "Bob",
  "avatar": "dog"
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "roomId": "a3f5b721-689c-4b3a-9e11-85b42c67da12",
  "roomCode": "HL4J36",
  "playerId": "c4d5e6f7-a8b9-0c1d-2e3f-4a5b6c7d8e9f",
  "sessionToken": "ast_sess_112233445566778899",
  "isHost": false,
  "room": { ... }
}
```

#### Error Response: Room Full (`409 Conflict`)
```json
{
  "success": false,
  "code": "ROOM_FULL",
  "error": "Room has reached its maximum capacity of 12 players."
}
```

---

### 3.4. Room Action (Gameplay & Controls)

- **Endpoint:** `POST /api/rooms/action`
- **Supported Actions:**
  - `START_GAME` (Host only)
  - `CANCEL_ROOM` (Host only)
  - `SELECT_TYPE` (Current turn player only; choice: `TRUTH` | `DARE`)
  - `COMPLETE_TURN` (Current turn player only; outcome: `SUCCESS` | `FORFEIT`)
  - `SKIP_TURN` (Host or current player)
  - `KICK_PLAYER` (Host only; target: `targetPlayerId`)

#### Sample Request: Start Game (Host)
```json
{
  "roomCode": "HL4J36",
  "sessionToken": "ast_sess_9a8b7c6d5e4f3a2b1c",
  "playerId": "f1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "action": "START_GAME"
}
```

#### Unauthorized Action Response (`403 Forbidden`)
```json
{
  "success": false,
  "code": "PERMISSION_DENIED",
  "error": "Only the room host can start the game."
}
```

---

### 3.5. Session Reconnect

- **Endpoint:** `POST /api/rooms/reconnect`

#### Request Payload
```json
{
  "roomCode": "HL4J36",
  "sessionToken": "ast_sess_112233445566778899",
  "playerId": "c4d5e6f7-a8b9-0c1d-2e3f-4a5b6c7d8e9f"
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "reconnected": true,
  "room": {
    "status": "IN_PROGRESS",
    "currentRound": 1,
    "currentTurnIndex": 0,
    "activePlayerId": "f1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "currentQuestion": {
      "type": "TRUTH",
      "text": "What is the biggest secret you have kept from your friends?"
    }
  }
}
```

---

### 3.6. Heartbeat

- **Endpoint:** `POST /api/rooms/heartbeat`

#### Request Payload
```json
{
  "roomCode": "HL4J36",
  "sessionToken": "ast_sess_112233445566778899",
  "playerId": "c4d5e6f7-a8b9-0c1d-2e3f-4a5b6c7d8e9f"
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "timestamp": 1794121920000
}
```
