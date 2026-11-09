# Asteria Custom Deck Security & Permissions Report

## Security Objectives
1. **Server-Side Authorization:** Never trust client-supplied deck identifiers or permissions blindly.
2. **Creator Ownership Isolation:** Users must only be capable of editing or deleting their own decks.
3. **Room Creation Security:** Hosts cannot launch private decks belonging to other users.
4. **Input Sanitization & Content Safety:** Ensure all custom prompts comply with Asteria's content policy before persisting.

---

## 1. Security Architecture & Threat Matrix

| Threat Vector | Severity | Mitigation Architecture | Verification Result |
|---|---|---|---|
| **Unauthorized Deck Edit** | High | `PUT /api/custom-decks/:id` enforces `existing.creatorId === requestCreatorId`. Returns `403 Forbidden` on mismatch. | Unit Test Verified (`Phase 7`) |
| **Unauthorized Deck Deletion**| High | `DELETE /api/custom-decks/:id` checks creator ID before deleting. Returns `403 Forbidden` if creator ID differs. | Unit Test Verified (`Phase 7`) |
| **Private Deck Hijacking in Room Creation** | High | `POST /api/rooms/create` passes `deckId` and `creatorId` to `serverDeckRepository.createRoomSnapshot`. If deck is `private` and creator does not match, returns `403 Forbidden`. | Unit Test Verified (`Phase 7`) |
| **Non-Existent / Deleted Deck Room Creation** | Medium | `POST /api/rooms/create` verifies deck exists. Returns `400 Bad Request` (`code: 'INVALID_DECK'`) if deck is missing or deleted. | Unit Test Verified (`Phase 7`) |
| **Empty or Underpopulated Deck Exploits** | Medium | Rooms require a minimum of 2 playable questions. Decks with $<2$ questions are rejected with `400 Bad Request` (`code: 'INVALID_QUESTIONS'`). | Unit Test Verified (`Phase 7`) |
| **Malicious XSS / Script Injection in Questions** | High | Every question prompt is sanitized via `validateCustomQuestion`, stripping HTML tags and limiting length to 250 characters. | E2E + Unit Verified |
| **Harmful / Dangerous Stunt Prompts** | Critical | Content safety filter regex scans for self-harm, fire, poisons, illegal acts, and harassment before saving. | Unit Test Verified |

---

## 2. Server-Authoritative Verification Implementation

### 2.1 Ownership Check in `serverDeckRepository.ts`
```ts
public validateDeckOwnership(
  deckId: string,
  creatorId: string
): { valid: boolean; deck?: CustomDeck; error?: string } {
  this.loadFromDisk();
  const deck = this.decks.get(deckId);
  if (!deck) {
    return { valid: false, error: 'Custom deck not found or has been deleted.' };
  }

  // Permission check: must be owner or public
  if (deck.visibility === 'private' && deck.creatorId !== creatorId) {
    return { valid: false, error: 'Access denied: you do not have permission to use this private deck.' };
  }

  return { valid: true, deck };
}
```

### 2.2 Rate Limiting Safeguards
- `POST /api/custom-decks`: Rate-limited to 30 requests per minute per IP via `rateLimiter.check`.
- `POST /api/rooms/create`: Rate-limited to 30 room creations per minute per IP.
- Mismatched session tokens on turn actions are immediately rejected with `403 Forbidden` (`PERMISSION_DENIED`).
