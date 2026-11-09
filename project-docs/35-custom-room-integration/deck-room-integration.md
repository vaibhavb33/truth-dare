# Asteria Custom Deck & Multiplayer Room Integration

## Executive Summary
This document specifies the end-to-end integration between Asteria's **Custom Deck Builder** and **Multiplayer Party Rooms**. The system enables players to create personalized question packages (with custom Truths and Dares), persist them securely with creator ownership, spin up synchronized multiplayer rooms using their custom decks, and share gameplay across multiple phones and desktops.

---

## 1. System Integration Flow

```
+---------------------------------------------------------------------------+
|                          Custom Deck Management                           |
|  - Create deck with Name, Description, Category, Language, Visibility     |
|  - Add/Edit/Delete custom Truth and Dare questions                        |
|  - Content safety and duplicate validation                                |
|  - Sync to Client Storage + Server Deck Repository                        |
+-------------------------------------+-------------------------------------+
                                      |
                                      v
+---------------------------------------------------------------------------+
|                          Room Creation Entry Points                       |
|  Entry A: Custom Deck Page ("Host Party Room" CTA)                        |
|  Entry B: Home Page Create Modal ("My Custom Decks" tab)                  |
|  Entry C: Lobby Settings Modal (Host adjustments)                         |
+-------------------------------------+-------------------------------------+
                                      |
                                      v
+---------------------------------------------------------------------------+
|                  Server Deck Validation & Security Gate                   |
|  (POST /api/rooms/create)                                                 |
|  1. Validate deck exists in serverDeckRepository                          |
|  2. Validate host creatorId owns the deck (or deck is public)             |
|  3. Validate playable question count (minimum 2 questions)                |
|  4. Validate supported language code (en, hi, es, fr, de, id, pt, ar)     |
+-------------------------------------+-------------------------------------+
                                      |
                                      v
+---------------------------------------------------------------------------+
|                      Immutable Room Snapshot Generation                   |
|  - Clone and deep-freeze truthQuestions and dareQuestions                 |
|  - Bind to canonical Room ID and version number                           |
|  - Isolate from future external deck edits or deletions                   |
+-------------------------------------+-------------------------------------+
                                      |
                                      v
+---------------------------------------------------------------------------+
|                    Real-Time Multiplayer State Sync                       |
|  - 3D Card Flip draws strictly from room's custom deck snapshot           |
|  - Question prompt, type, active player, and history replicated to all    |
|  - Turn rotation, completion score increment, and skip counting           |
|  - Session token reconnection on drop                                     |
+---------------------------------------------------------------------------+
```

---

## 2. API Contract & Integration Specifications

### 2.1 Deck Creation & Persistence (`POST /api/custom-decks`)
- **Headers:** `x-creator-id: <creator-uuid>`, `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "name": "Ultimate Friday Party Pack",
    "description": "Handcrafted group secrets and wild dares.",
    "language": "en",
    "category": "classic-party",
    "visibility": "private",
    "creatorId": "usr_alice_123",
    "questions": [
      { "id": "q1", "type": "truth", "prompt": "Who in this room is the most adventurous?" },
      { "id": "q2", "type": "dare", "prompt": "Do 10 pushups while singing happy birthday." }
    ]
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "deck": {
      "id": "deck-ky5zfy3-mw97xpaz",
      "version": 1,
      "createdAt": 1731154780000,
      "updatedAt": 1731154780000
    }
  }
  ```

### 2.2 Room Creation with Custom Deck (`POST /api/rooms/create`)
- **Headers:** `x-creator-id: <creator-uuid>`, `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "gameId": "truth-or-dare",
    "hostName": "Alice (Host)",
    "deckId": "deck-ky5zfy3-mw97xpaz",
    "creatorId": "usr_alice_123",
    "timerSeconds": 30,
    "maxPlayers": 12
  }
  ```
- **Server Processing:**
  1. Calls `serverDeckRepository.createRoomSnapshot(...)`.
  2. Verifies `creatorId` matches `targetDeck.creatorId`.
  3. Verifies `questions.length >= 2`.
  4. Binds frozen snapshot to the newly generated `MultiplayerRoom`.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "roomId": "rm-sqhhgg58-mw97xpbp",
    "roomCode": "9DW79E",
    "hostPlayerId": "p-y5kzdro",
    "sessionToken": "tok-928xms-12a",
    "room": {
      "id": "rm-sqhhgg58-mw97xpbp",
      "roomCode": "9DW79E",
      "status": "WAITING",
      "customDeckSnapshot": {
        "id": "deck-ky5zfy3-mw97xpaz",
        "version": 1,
        "name": "Ultimate Friday Party Pack",
        "questions": [...],
        "truthQuestions": [...],
        "dareQuestions": [...]
      }
    }
  }
  ```

---

## 3. Real-Time Gameplay Synchronisation

1. **Card Draw Authority:**
   When the active player (or host) dispatches `FLIP_CARD`:
   - If `payload.type === 'truth'`, card is chosen randomly from `customDeckSnapshot.truthQuestions`.
   - If `payload.type === 'dare'`, card is chosen randomly from `customDeckSnapshot.dareQuestions`.
   - Card metadata is assigned (`game_type: 'truth-or-dare'`, `category: 'custom'`).
2. **Synchronized History:**
   The action is recorded in `room.questionHistory`:
   ```ts
   {
     id: 'hist-x92a',
     questionId: 'custom-truth-1',
     type: 'truth',
     prompt: 'What is the most embarrassing thing in your search history?',
     playerId: 'p-y5kzdro',
     playerName: 'Alice (Host)',
     action: 'flipped',
     timestamp: 1731154800000
   }
   ```
3. **Turn Progression:**
   - `COMPLETE_DARE`: updates player score $+1$, marks history entry as `'completed'`, rotates `activePlayerId` to the next player.
   - `SKIP_TURN`: updates player skips $+1$, marks history entry as `'skipped'`, rotates `activePlayerId` to the next player.
