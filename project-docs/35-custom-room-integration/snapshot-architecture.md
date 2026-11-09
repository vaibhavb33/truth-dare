# Asteria Immutable Deck Snapshot Architecture

## Problem Statement
In multiplayer card and party games, an active game session must never break or experience mid-game state corruption if:
1. The creator modifies their deck in another browser tab while a game is ongoing.
2. The creator adds, edits, or deletes questions from the source deck.
3. The deck is deleted from the user's library or database.

Without isolation, players in an active room would experience sudden 404 errors, visual desynchronization, or unexpected prompt changes during another player's turn.

---

## 1. Immutable Snapshot Pattern

To solve this, Asteria implements the **Immutable Room-Specific Deck Snapshot Pattern**. When a multiplayer room is established, the server creates an isolated, point-in-time snapshot that is deeply cloned, validated, and frozen.

```
Source Custom Deck (Library)                  Active Multiplayer Room
+-----------------------------------+         +--------------------------------------+
| ID: deck-ky5zfy3                  |         | Room Code: 9DW79E                    |
| Version: 1                        |  CLONE  | Status: IN_PROGRESS                  |
| Questions: [Truth 1..10, Dare 1..10]------>| customDeckSnapshot:                  |
+-----------------------------------+         |   - deckId: deck-ky5zfy3             |
                   |                          |   - version: 1                       |
       (User edits deck later)                |   - truthQuestions: [1..10] (FROZEN) |
                   v                          |   - dareQuestions: [1..10]  (FROZEN) |
+-----------------------------------+         +--------------------------------------+
| ID: deck-ky5zfy3                  |                            ^
| Version: 2 (MUTATED)              |                            |
| Questions: [Mutated Q1, Q2...]    |         (Completely Isolated: Active Room      |
+-----------------------------------+          continues using Version 1 Snapshot!)  
```

---

## 2. Snapshot Data Structure

```ts
export interface CustomDeckSnapshot {
  id: string;                       // Snapshot identifier
  deckId: string;                   // Reference to origin deck
  roomId: string;                   // Canonical Room UUID
  version: number;                  // Deck version captured at room creation
  name: string;                     // Display name
  language: SupportedLanguageCode;  // Locked language
  questions: CustomQuestion[];      // All playable questions
  truthQuestions: CustomQuestion[]; // Pre-filtered truth cards for fast O(1) draw
  dareQuestions: CustomQuestion[];  // Pre-filtered dare cards for fast O(1) draw
  snapshotCreatedAt: number;        // UTC epoch timestamp
}
```

### Deep Freeze Enforcement
```ts
// Prevent runtime tampering or in-memory mutations
Object.freeze(snapshot);
Object.freeze(snapshot.questions);
Object.freeze(snapshot.truthQuestions);
Object.freeze(snapshot.dareQuestions);
```

---

## 3. Empirical Isolation Proof

In our automated integration test suite (`tests/e2e/multiplayerCustomDeckIntegration.test.js`):
1. **Creation:** A deck with 10 Truths and 10 Dares was created at `Version 1`.
2. **Room Spawn:** Room `9DW79E` was created referencing `Version 1` snapshot.
3. **External Mutation:** During active round 1, Alice updated the source deck via `PUT /api/custom-decks/:id` with new text `"MUTATED TRUTH: This should NEVER appear in the active room!"` and updated the version to `Version 2`.
4. **Verification:**
   - Charlie drew a truth card in the active room.
   - The drawn card was strictly from the original snapshot (`"Have you ever lied to get out of a date or social plan?"`).
   - The prompt `"MUTATED TRUTH"` was **0% leaked** into the room.
   - `room.customDeckSnapshot.version` remained strictly `1`.
   - `room.customDeckSnapshot.questions.length` remained strictly `20`.

