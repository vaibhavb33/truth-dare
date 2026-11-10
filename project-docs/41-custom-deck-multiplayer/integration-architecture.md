# Asteria Custom Deck Multiplayer Integration Architecture

**Author:** Senior Multiplayer Full-Stack Developer  
**Status:** Complete & Production Ready  
**Date:** November 10, 2026  
**Test Coverage:** 172 Vitest Tests Passing + Playwright 3-Context E2E Passing  

---

## 1. Architectural Overview

The Asteria Custom Deck Multiplayer system connects user-created Truth and Dare decks with server-authoritative multiplayer rooms. Ordinary party users can create custom decks in their browser, save them, click **"Play with Friends"**, and instantly generate an isolated party room with an immutable deck snapshot. Friends joining via a 6-character room code participate in synchronized rounds with zero latency and non-duplicate challenge draws.

```
+---------------------------------------------------------------------------------------------------+
|                                  USER BROWSER: CUSTOM DECK STUDIO                                |
|                                                                                                   |
|  [ Deck Editor ]  -->  [ Add Truth / Dare ]  -->  [ Save Deck ]  -->  [ Play with Friends ]     |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  | POST /api/rooms/create
                                                  v
+---------------------------------------------------------------------------------------------------+
|                                      ASTERIA BACKEND ENGINE                                       |
|                                                                                                   |
|  1. serverDeckRepository.createRoomSnapshot()                                                    |
|     • Validates deck ownership (owner or public/template)                                         |
|     • Validates minimum question requirement (>= 2 questions)                                     |
|     • Performs deep clone and freeze (Object.freeze)                                              |
|                                                                                                   |
|  2. roomEngine.createRoom()                                                                       |
|     • Sets room.status = 'WAITING' (canonical lifecycle)                                         |
|     • Attaches room.customDeckSnapshot                                                            |
|     • Initializes host session token and 2-hour TTL                                               |
|     • Binds engine to globalThis singleton                                                        |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  | Real-time Synchronization
                                                  v
+---------------------------------------------------------------------------------------------------+
|                                  MULTIPLAYER ROOM: /room/[CODE]                                   |
|                                                                                                   |
|  Host Screen (Alice)               Player 2 (Bob)                    Player 3 (Charlie)           |
|  • Starts game (host-only)         • Receives Card                   • Receives Card              |
|  • Flips Truth/Dare card           • Listens to Speech Audio         • Listens to Speech Audio    |
|  • Synchronized Card3D             • Synchronized Card3D             • Synchronized Card3D        |
|  • Resolves turn (+10 pts)         • Turn advances to Bob            • Reconnects seamlessly      |
+---------------------------------------------------------------------------------------------------+
```

---

## 2. Key Components

### 2.1. `ServerDeckRepository` (`lib/custom/serverDeckRepository.ts`)
- **Global Singleton Binding:** Bound to `globalThis.__asteria_server_deck_repo__` to eliminate Next.js module closure fragmentation between API routes.
- **Ownership Verification:** Enforces creator validation (`creatorId`). Grants full customization for template decks (`starter-deck-01`) while securing private custom decks.
- **Deep-Frozen Snapshots:** Generates deep-copied snapshots (`Object.freeze(snapshot)`). Questions in an active room remain immutable even if the creator later edits or deletes the original deck in their library.

### 2.2. `RoomEngine` (`lib/multiplayer/roomEngine.ts`)
- **Server-Authoritative State:** Centralized management of `players`, `activePlayerId`, `roundNumber`, and `isCardFlipped`.
- **Fair, Non-Duplicate Question Selection:**
  When a player draws a card:
  1. Filters matching questions by type (`truth` vs `dare`). Falls back to full pool if a type is empty.
  2. Queries `room.questionHistory` to calculate draw frequencies (`drawCounts`).
  3. Restricts selection to questions with `minCount` draws:
     $$\text{Eligible} = \{ q \in \text{Pool} \mid \text{drawCount}(q) = \min(\text{drawCounts}) \}$$
  4. Guarantees zero duplicate questions until the pool of that type is completely exhausted.
- **Synchronized Turns:** Round-robin turn rotation with round increments upon full rotation. Only the active player or host can resolve or skip turns.
- **Heartbeat & Reconnection:** Reconnects players using cryptographically secure session tokens without losing scores or game state.

### 2.3. Frontend Client (`CustomDeckClient.tsx` & `RoomClient.tsx`)
- **"Play with Friends" Primary CTA:** Clear, prominent button in both the Editor (beside "Save Deck & Play") and on each saved deck card in the Library.
- **Optimized Room Creation:** Saves deck locally, registers payload, creates room, persists session credentials in `localStorage`, and transitions client-side to `/room/[code]`.
- **Contradictory Error Elimination:** Case-normalizes room codes, handles initial polling without false 404 banners, and displays custom deck metadata (`Custom: {deckName} ({count} cards)`).
- **Synchronized Voice Audio:** Card3D components render question-specific voice speaker buttons allowing all connected players to listen to custom questions in the room's shared language.

