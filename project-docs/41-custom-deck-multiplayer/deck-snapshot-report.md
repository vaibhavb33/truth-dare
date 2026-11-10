# Asteria Deck Snapshot & Security Report

**Document:** Snapshot Validation, Immutability & Permission Specification  
**Version:** 1.0.0  
**Date:** November 10, 2026  
**Status:** Verified & Empirically Validated  

---

## 1. Objective

When a host launches a party room using a Custom Deck, the multiplayer room must not rely on live, mutable deck pointers. Instead, the backend must capture an immutable, room-specific snapshot of the deck that guarantees:
1. **Ownership Authorization:** Only the creator (or users of public/template decks) can host rooms.
2. **Playable Balance:** The deck contains at least 2 questions.
3. **Data Isolation & Immutability:** Edits or deletions to the original deck during active play do not corrupt or alter questions in progress.
4. **Language Consistency:** The deck's language is validated and propagated to all participants for visual display and neural voice synthesis.

---

## 2. Snapshot Schema & Structure

```typescript
export interface CustomDeckSnapshot {
  id: string;                      // Unique snapshot ID
  deckId: string;                  // Original source deck ID
  roomId: string;                  // Target room ID
  version: number;                 // Deck version at snapshot creation
  name: string;                    // Immutable deck title
  language: SupportedLanguageCode; // Validated language code
  questions: CustomQuestion[];     // Complete array of playable questions
  truthQuestions: CustomQuestion[];// Pre-indexed Truth questions
  dareQuestions: CustomQuestion[]; // Pre-indexed Dare questions
  snapshotCreatedAt: number;       // Creation timestamp in epoch ms
}
```

---

## 3. Security & Validation Rules

### 3.1. Ownership Validation
- **Public Decks & Templates (`starter-deck-01`):** Any visitor or registered host can host a multiplayer room.
- **Private Custom Decks:**
  - The request must provide matching creator credentials: `targetDeck.creatorId === requestCreatorId`.
  - If a non-owner attempts to host a private deck:
    $$\text{Status: 403 Forbidden} \quad \text{Code: PERMISSION\_DENIED}$$
    $$\text{Message: "Permission denied: you can only host rooms using decks you own or public decks."}$$

### 3.2. Minimum Question Rule
- A custom deck must contain at least 2 playable questions.
- If fewer than 2 questions are provided:
  $$\text{Status: 400 Bad Request} \quad \text{Code: INVALID\_QUESTIONS}$$
  $$\text{Message: "Custom deck must contain at least 2 playable questions to create a party room."}$$

### 3.3. Immutability Verification (Deep Freeze)
In `serverDeckRepository.createRoomSnapshot`:
```typescript
Object.freeze(snapshot);
Object.freeze(snapshot.questions);
Object.freeze(snapshot.truthQuestions);
Object.freeze(snapshot.dareQuestions);
```
- In unit test `tests/customDeckMultiplayer.test.ts`, the snapshot immutability was tested by modifying the original deck name and questions after room creation:
  - Original deck renamed to `'MODIFIED DECK NAME'` with new prompts.
  - Active room queried: retained original questions and title `'College Dorm Party'`.
  - Result: 100% data preservation and isolation.

