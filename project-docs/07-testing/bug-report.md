# Formal Defect & Bug Tracking Ledger
**Project Asteria — Party Gaming Platform**
**Senior QA Engineer & Software Testing Lead**
*Date: November 2026 | Ledger Status: All P0/P1/P2 Defects Resolved & Retested*

---

## 1. Defect Summary Table

| Defect ID | Severity | Category | Title | Status | Retest Verification |
|---|:---:|---|---|:---:|:---:|
| **BUG-001** | **P1** | Security | Unauthenticated Question Creation API (`/api/admin/questions`) | **RESOLVED** | `tests/securityAndApi.test.ts` (PASS) |
| **BUG-002** | **P1** | Multiplayer | Active Player Disconnect Deadlocks Turn Rotation | **RESOLVED** | `tests/multiplayerAdvanced.test.ts` (PASS) |
| **BUG-003** | **P2** | Multiplayer | Non-Active Guest Can Flip Cards and Steal Points | **RESOLVED** | `tests/multiplayerAdvanced.test.ts` (PASS) |
| **BUG-004** | **P2** | Game Logic | Duplicate `FLIP_CARD` Overwrites Active Prompt | **RESOLVED** | `tests/multiplayerAdvanced.test.ts` (PASS) |
| **BUG-005** | **P2** | Security | Missing Rate Limiter on Admin Auth & Room Creation | **RESOLVED** | `tests/securityAndApi.test.ts` (PASS) |
| **BUG-006** | **P3** | Input Validation | Missing Room Code Format Regex & HTML Tag Stripping | **RESOLVED** | `tests/roomEngine.test.ts` (PASS) |

**Current Open Defects:** **0 P0 | 0 P1 | 0 P2 | 0 P3**

---

## 2. Granular Bug Reports & Remediation Records

---

### BUG-001: Unauthenticated Question Injection via Admin API
- **Severity:** **P1 (High Security / Data Integrity)**
- **Component:** [`app/api/admin/questions/route.ts`](file:///Users/vaibhavborkar/truth&dare/app/api/admin/questions/route.ts)
- **Description:** The `POST` endpoint on `/api/admin/questions` accepted question creation requests from any client without validating authentication credentials or user session tokens.
- **Steps to Reproduce:**
  1. Send `curl -X POST http://localhost:3000/api/admin/questions -H "Content-Type: application/json" -d '{"prompt":"Malicious prompt","gameId":"truth-or-dare"}'`.
  2. Observe HTTP 200 OK and prompt injected into active game pool.
- **Root Cause:** Handler lacked authentication middleware or Authorization header check.
- **Remediation Applied:**
  - Added strict `Authorization: Bearer asteria_admin_*` header verification.
  - Stripped HTML tags from submitted prompts before appending to memory.
  - Returns HTTP 401 Unauthorized for missing or invalid tokens.
- **Retest Verification:** Verified via automated test in `tests/securityAndApi.test.ts`. Unauthorized requests fail with 401.

---

### BUG-002: Active Player Disconnect Deadlocks Multiplayer Turn Rotation
- **Severity:** **P1 (Core Multiplayer Broken)**
- **Component:** [`lib/multiplayer/roomEngine.ts`](file:///Users/vaibhavborkar/truth&dare/lib/multiplayer/roomEngine.ts)
- **Description:** When the current `activePlayerId` disconnected or closed their browser tab mid-turn, `room.activePlayerId` remained assigned to the departed player ID. Consequently, no remaining connected player was authorized to draw cards or complete turns, permanently deadlocking the room.
- **Steps to Reproduce:**
  1. Create a room with Alice and Bob. Start game with Alice as active player.
  2. Alice closes her browser tab (`leaveRoom(code, aliceId)`).
  3. Bob attempts to flip card or advance turn. Action rejected because Bob is not active player.
- **Root Cause:** `leaveRoom` filtered the departed player from `room.players` and migrated `isHost`, but failed to migrate `room.activePlayerId` when the departing player was active.
- **Remediation Applied:**
  - Updated `leaveRoom` to detect when `room.activePlayerId === playerId`.
  - Automatically rotates `activePlayerId` to `room.players[0].id` and resets card state (`isCardFlipped = false, currentCard = null`).
- **Retest Verification:** Verified via automated test `tests/multiplayerAdvanced.test.ts:74` ("correctly migrates active player when current active player leaves mid-turn"). PASSED.

---

### BUG-003: Non-Active Guest Can Flip Cards and Steal Points
- **Severity:** **P2 (Multiplayer Integrity Issue)**
- **Component:** [`lib/multiplayer/roomEngine.ts`](file:///Users/vaibhavborkar/truth&dare/lib/multiplayer/roomEngine.ts)
- **Description:** Any connected guest in a multiplayer room could call `FLIP_CARD` or `COMPLETE_DARE`. Furthermore, `COMPLETE_DARE` awarded the point to `params.playerId` instead of the player whose turn it actually was.
- **Steps to Reproduce:**
  1. Room is in game; Alice is active player.
  2. Bob sends `FLIP_CARD` action.
  3. Bob sends `COMPLETE_DARE` action. Bob's score increments while Alice's turn is skipped.
- **Root Cause:** Missing active player ID check in `dispatchAction`.
- **Remediation Applied:**
  - Enforced that only `room.activePlayerId` or room host can execute `FLIP_CARD`, `COMPLETE_DARE`, or `SKIP_TURN`.
  - In `COMPLETE_DARE`, points are awarded strictly to `activePlayer` (`room.players.find(p => p.id === room.activePlayerId)`).
- **Retest Verification:** Verified via automated tests in `tests/multiplayerAdvanced.test.ts`. Unauthorized flips and score thefts fail with explicit error messages.

---

### BUG-004: Duplicate Card Flip without Turn Resolution
- **Severity:** **P2 (Game Logic)**
- **Component:** [`lib/multiplayer/roomEngine.ts`](file:///Users/vaibhavborkar/truth&dare/lib/multiplayer/roomEngine.ts)
- **Description:** Repeated calls to `FLIP_CARD` while a card was already displayed drew new cards immediately, allowing players to skip difficult dares without taking a penalty.
- **Steps to Reproduce:**
  1. Active player flips card.
  2. Active player taps flip button again.
  3. Previous dare is erased and replaced by a new card.
- **Root Cause:** Missing `if (room.isCardFlipped)` guard in `FLIP_CARD` handler.
- **Remediation Applied:**
  - Added guard returning `{ success: false, error: 'Card has already been flipped for this turn.' }`.
- **Retest Verification:** Verified in `tests/multiplayerAdvanced.test.ts`. Duplicate flips rejected cleanly.

---

### BUG-005: Missing Rate Limiting on Admin Auth & Room Creation
- **Severity:** **P2 (Security / Resource Exhaustion)**
- **Component:** [`lib/security/rateLimiter.ts`](file:///Users/vaibhavborkar/truth&dare/lib/security/rateLimiter.ts), [`app/api/admin/auth/route.ts`](file:///Users/vaibhavborkar/truth&dare/app/api/admin/auth/route.ts), [`app/api/rooms/create/route.ts`](file:///Users/vaibhavborkar/truth&dare/app/api/rooms/create/route.ts)
- **Description:** Endpoints had no rate-limiting barriers, allowing automated brute-force password guessing on `/api/admin/auth` and memory exhaustion via automated room generation.
- **Remediation Applied:**
  - Engineered in-memory sliding window rate limiter.
  - Implemented 5 attempts/min limit on admin login and 20 creations/min limit on room creation with HTTP 429 status.
- **Retest Verification:** Verified in `tests/securityAndApi.test.ts`. Request bursts over limit are throttled.

---

### BUG-006: Room Code Length Validation & HTML Script Injection
- **Severity:** **P3 (Input Validation)**
- **Component:** [`lib/multiplayer/roomEngine.ts`](file:///Users/vaibhavborkar/truth&dare/lib/multiplayer/roomEngine.ts)
- **Description:** Arbitrary string lengths were accepted by `joinRoom` before map lookup, and player names containing HTML tags were stored without stripping.
- **Remediation Applied:**
  - Added regex format check `/^[A-Z0-9]{6}$/`.
  - Added `sanitizeName()` utility stripping HTML tags and truncating names to 25 characters.
- **Retest Verification:** Verified in `tests/roomEngine.test.ts` and `tests/multiplayerAdvanced.test.ts`. PASSED.

