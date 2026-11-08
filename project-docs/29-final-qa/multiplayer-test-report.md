# Asteria Real-Time Multiplayer Rooms Architecture & QA Report

**Audit Date:** November 7, 2026  
**Auditor:** CTO & Senior QA Lead  
**Test Harness:** Vitest E2E & Advanced Multiplayer Suites, Playwright E2E Master Harness  
**Target Environment:** Next.js Production Build (`http://localhost:3000`)  
**Status:** **100% PASSED (Server-Authoritative State, Room Codes, Turn Rotation, Reconnection Verified)**

---

## 1. Executive Summary

Asteria features a server-authoritative multiplayer room engine supporting up to 16 concurrent players per room. Rooms manage synchronization of question cards, turn rotation, skip counters, scores, and host controls with cryptographic session tokens. Reconnections and host migrations are handled automatically without disrupting active game rounds.

---

## 2. Multiplayer Architecture & API Endpoints

| Endpoint | HTTP Method | Auth / Token | Description |
|---|---|---|---|
| `/api/rooms/create` | `POST` | Host Session Token Generated | Creates a new room, assigns 6-character room code, registers host. |
| `/api/rooms/join` | `POST` | Player Session Token Generated | Joins existing room via code, rejects duplicates and full rooms. |
| `/api/rooms/[code]` | `GET` | Public Room Code | Polls or reads current sanitized room state and player roster. |
| `/api/rooms/action` | `POST` | `sessionToken` + `playerId` | Dispatches server-authoritative transitions (`START_GAME`, `FLIP_CARD`, `NEXT_TURN`, `SKIP_CARD`, `LEAVE_ROOM`). |
| `/api/rooms/reconnect` | `POST` | `sessionToken` + `playerId` | Validates session token and restores disconnected player. |

---

## 3. Core Functional Verifications

### 3.1. Unique 6-Character Room Codes
- **Generation:** High-entropy uppercase alphanumeric character pool (`A-Z, 2-9`), explicitly excluding ambiguous characters (`0`, `O`, `1`, `I`).
- **Uniqueness:** Collisions are mathematically guarded by cryptographic random bytes and verified in-memory/in-database.

### 3.2. Lobby & Player Roster Management
- Duplicate player nicknames are blocked with friendly validation messages (`"A player with this name already exists in the room"`).
- Max player limit (up to 16 players) is enforced on `POST /api/rooms/join`. Any request past capacity returns HTTP 400.
- Host role is distinguished by `isHost: true`. Only the verified host can initiate `START_GAME` or reshuffle deck settings.

### 3.3. Server-Authoritative State Transitions
- **`START_GAME`:** Validates that at least 2 players are present. Sets `status: 'playing'`, initializes scores, selects starting player.
- **`FLIP_CARD`:** Server selects random card from the chosen category, matching the room's language (or custom deck snapshot). Remote clients cannot inject arbitrary questions.
- **`NEXT_TURN`:** Advances `currentPlayerIndex = (currentPlayerIndex + 1) % players.length`. Increments round number.
- **`SKIP_CARD`:** Applies skip penalty/score adjustment based on room rules.

### 3.4. Reconnection & Host Migration
- Each connected player is issued a cryptographically random UUID `sessionToken` upon joining, persisted to client local storage.
- If a network drop occurs, the client invokes `/api/rooms/reconnect` with their token, restoring their player slot and active game state.
- If the room host disconnects or leaves, the server automatically promotes the next senior player in the roster to host (`isHost: true`), ensuring the game never freezes.

---

## 4. Empirical Test Results & User Journeys

### 4.1. Journey C: Multiplayer + Hindi Questions Sync
- **Test Flow:**
  1. Host creates room with `language: 'hi'`.
  2. Guest player joins using the generated 6-character room code.
  3. Host dispatches `START_GAME` and `FLIP_CARD` (type: `'truth'`).
  4. Both host and guest read the synced room state from `/api/rooms/[code]`.
- **Validation:** Prompt retrieved contains valid Hindi Devanagari text (`/[\u0900-\u097F]/`), proving end-to-end language synchronization across independent clients.
- **Result:** **PASSED**

### 4.2. Journey D: Custom Deck + Multiplayer Synchronization
- **Test Flow:**
  1. Host crafts custom deck snapshot (`QA Custom Fun Pack`) containing custom Truth and Dare prompts.
  2. Host creates multiplayer room with `customDeckSnapshot` attached.
  3. Server embeds an immutable copy of the custom deck into the room state.
  4. Host flips card. Server serves question `cq-1` from the custom deck rather than the default question bank.
- **Validation:** Synchronized prompt exactly matches `QA Custom Fun Pack` custom text across all peers.
- **Result:** **PASSED**

---

## 5. Automated Test Proof

### Vitest Unit & Integration Execution:
```text
✓ tests/multiplayerRoomsE2E.test.ts (17 tests) 310ms
  ✓ Multiplayer Rooms E2E Suite > creates a new room with valid 6-char code and host session
  ✓ Multiplayer Rooms E2E Suite > rejects invalid game configurations
  ✓ Multiplayer Rooms E2E Suite > allows guest players to join with unique nicknames
  ✓ Multiplayer Rooms E2E Suite > prevents joining full rooms when player limit reached
  ✓ Multiplayer Rooms E2E Suite > blocks duplicate nicknames in the same room
  ✓ Multiplayer Rooms E2E Suite > ensures only host can start the game
  ✓ Multiplayer Rooms E2E Suite > synchronises card flip and turn rotation across players
  ✓ Multiplayer Rooms E2E Suite > handles player skip and score updates
  ✓ Multiplayer Rooms E2E Suite > allows player disconnection and reconnect via session token
  ✓ Multiplayer Rooms E2E Suite > migrates host privileges when host leaves
  ...

✓ tests/multiplayerAdvanced.test.ts (6 tests) 185ms
✓ tests/roomEngine.test.ts (5 tests) 90ms
```

### Playwright E2E Log:
```text
🌐 [4/7] Testing Journey C (Multiplayer + Hindi Questions)...
  ✅ Journey C (Multiplayer + Hindi Questions): PASSED
🎴 [5/7] Testing Journeys D & E (Custom Deck Multiplayer & Voice)...
  ✅ Journey D (Custom Deck + Multiplayer): PASSED
```

---

## 6. QA Verdict & Release Sign-Off

- **Severity Classification:** P0: 0, P1: 0, P2: 0, P3: 0.
- **Verdict:** **PASSED - Multiplayer Engine Ready for Production Release.**

