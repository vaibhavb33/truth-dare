# Custom Deck Error Handling & User Experience Architecture

> **Project:** Asteria — Truth & Dare Gaming Platform  
> **Module:** Custom Deck Question Validation & State Management  
> **Status:** Production Ready & Verified  
> **Standard:** GSD Methodology Specification Lock

---

## 1. Problem Diagnosis & Architecture Overhaul

### 1.1 The Previous Bug
Prior to this release, an unhandled empty check or premature form validation state caused the interface to display a global red attention banner reading:
`"Question prompt cannot be empty or only spaces."`
Furthermore:
1. The **Add Question** button was clickable even with an empty or whitespace-only input.
2. Clicking or pressing enter triggered the global error banner at the top of the entire page, confusing users who had not even begun typing.
3. Rapid clicking resulted in duplicate submissions or unhandled concurrency conflicts.
4. Server network interruptions could cause user loss of unsaved draft questions.

### 1.2 The New Layered Error Architecture

```
┌───────────────────────────────────────────────────────────┐
│                    User Interface Layers                  │
├───────────────────────────────────────────────────────────┤
│  Layer 1: Real-Time Input Guard                          │
│  - Reactive trimming & boundary check                     │
│  - Inline helper directly below input                     │
│  - Zero global banners during input workflow             │
├───────────────────────────────────────────────────────────┤
│  Layer 2: Button State & Concurrency Lock                │
│  - Native HTML `disabled` & ARIA `aria-disabled`          │
│  - CSS `pointer-events-none` & `cursor-not-allowed`       │
│  - `isSubmittingQuestion` debounce lock                   │
├───────────────────────────────────────────────────────────┤
│  Layer 3: Local Data Protection & Storage Shield         │
│  - Real-time `localStorage` draft persistence             │
│  - Optimistic local save before server sync               │
│  - Offline tolerance (network failure != data loss)       │
└───────────────────────────────────────────────────────────┘
```

---

## 2. Key Error Handling Mechanisms

### 2.1 Direct Inline Error Presentation (No Global Banners)
Instead of displacing the viewport with a red banner at the top of the page, all input validation errors appear directly under the text box in real-time:

- **Empty Input:** Add button remains disabled. No alarming error is rendered on initial load. If submitted via enter: `"Write a question before adding it."`
- **Spaces Only:** When `newPromptText.length > 0 && !newPromptText.trim()`:
  - Error: `"Your question cannot contain only spaces."`
  - Style: Amber/Rose alert with `AlertCircle` icon, rendered with `role="alert"` and `aria-live`.
- **Exceeding Character Limit:** When `newPromptText.length > 250`:
  - Error: `"Maximum 250 characters allowed."`
  - Counter changes to bold rose: `251/250`.
- **Duplicate Question:** When question exists in deck:
  - Error: `"This question is already in your deck."`
  - Button disables automatically.

### 2.2 Instant Error Clearance
All error states are reactive:
- When a user modifies or deletes invalid text (`onChange`), the inline error clears immediately.
- When an invalid question is corrected to valid text, the button turns vibrant cyan/fuchsia and unlocks.
- If a user changes tabs or creates a new deck, all error states reset to `null`.

### 2.3 Concurrency Control & Duplicate Submission Prevention
To eliminate race conditions from rapid double-clicks:
1. `isSubmittingQuestion` state lock is engaged synchronously upon submission initiation.
2. The button renders an active loading spinner (`Adding...`) and disables user events (`pointer-events-none`).
3. Once the question is safely pushed into the deck and input cleared, the lock releases.

```typescript
if (isSubmittingQuestion) return;
setIsSubmittingQuestion(true);
// ... synchronous state update ...
setIsSubmittingQuestion(false);
```

### 2.4 Offline & Database Failure Resilience
Custom decks are designed for high party resilience. If an API request or cloud database timeout occurs:
1. The deck is saved immediately to local persistent storage (`deckStorage` / `localStorage`).
2. Server synchronization runs asynchronously in the background with graceful `.catch()` interception.
3. Unsaved questions are never cleared upon network or server errors.
4. Auto-save draft storage (`asteria_custom_deck_draft`) continuously mirrors unsaved work across page reloads.

---

## 3. Inline Question Card Edit Error Handling

When editing questions in the deck list:
1. Each editing card manages its own localized `editError` state.
2. If an edited prompt is empty, contains only spaces, or exceeds 250 characters, the error appears strictly inside that question's card.
3. Cancelling the edit clears `editError` without disturbing any other part of the UI.

