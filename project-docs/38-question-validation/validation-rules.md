# Custom Deck Question Validation Rules & Specifications

> **Project:** Asteria — Truth & Dare Gaming Platform  
> **Module:** Custom Deck Studio (`/custom`)  
> **Status:** Production Ready & Verified  
> **Standard:** GSD Methodology Specification Lock

---

## 1. Overview & Objectives

In Asteria Custom Deck Studio, user-generated questions are the lifeblood of personalized party gameplay. Previously, users could experience an immediate red error banner (`"Question prompt cannot be empty or only spaces."`) on page load, or find that the **Add Question** button remained active even when the input was empty or invalid.

This document establishes the definitive validation specification implemented symmetrically across the React frontend and Next.js / TypeScript backend.

---

## 2. Core Validation Rules

### 2.1 Question Prompt Constraints
| Rule ID | Constraint | Specification | Failure Message | Enforced Layers |
| :--- | :--- | :--- | :--- | :--- |
| **VAL-01** | **Trimmed Presence** | Prompt cannot be empty or contain only whitespace (`trim().length > 0`) | `"Write a question before adding it."` *(empty)*<br>`"Your question cannot contain only spaces."` *(spaces)* | Client UI & API Routes |
| **VAL-02** | **Length Range** | Prompt character length must be between 1 and 250 characters inclusive (`1 <= clean.length <= 250`) | `"Maximum 250 characters allowed."` | Client UI & API Routes |
| **VAL-03** | **Uniqueness (Deck)** | Question prompt must not duplicate an existing question in the same deck (case-insensitive & trimmed) | `"This question is already in your deck."` | Client UI & API Routes |
| **VAL-04** | **Content Safety** | Prohibits severe physical harm, dangerous chemical stunts, illegal acts, or non-consensual harassment | Contextual safety reason (e.g. `"Dangerous physical stunts..."`) | Safety Engine & API |
| **VAL-05** | **Language Support** | Supports all 8 official languages including Hindi Devanagari, Arabic RTL, English, Spanish, French, German, Portuguese, Indonesian | Handled transparently | Full Stack |

---

## 3. Boundary & Input Test Matrix

| Input Scenario | Input Value | Cleaned (`trim()`) | Status | Inline Error Message | Button State |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Initial Empty** | `""` | `""` | ❌ Invalid | *None (clean initial load)* | **Disabled** (`opacity-40 cursor-not-allowed`) |
| **Spaces Only** | `"   "` | `""` | ❌ Invalid | `"Your question cannot contain only spaces."` | **Disabled** (`pointer-events-none`) |
| **Tabs Only** | `"\t\t"` | `""` | ❌ Invalid | `"Your question cannot contain only spaces."` | **Disabled** (`pointer-events-none`) |
| **Newlines Only** | `"\n\r\n"` | `""` | ❌ Invalid | `"Your question cannot contain only spaces."` | **Disabled** (`pointer-events-none`) |
| **1 Character** | `"A"` | `"A"` | ✅ **Valid** | *None* | **Enabled** (`shadow-glow-brand`) |
| **Boundary (250)** | 250 characters | 250 characters | ✅ **Valid** | *None* | **Enabled** (`shadow-glow-brand`) |
| **Exceeds (251)** | 251 characters | 251 characters | ❌ Invalid | `"Maximum 250 characters allowed."` | **Disabled** (`pointer-events-none`) |
| **Hindi Devanagari** | `"क्या आपने कभी झूठ बोला है?"` | Valid string | ✅ **Valid** | *None* | **Enabled** (`shadow-glow-brand`) |
| **Special Chars** | `"$100 prize & trophy! #1?"` | Valid string | ✅ **Valid** | *None* | **Enabled** (`shadow-glow-brand`) |
| **Duplicate Prompt** | Identical to existing question | Trimmed match | ❌ Invalid | `"This question is already in your deck."` | **Disabled** (`pointer-events-none`) |

---

## 4. Deck-Level Validation Rules

When a player clicks **Save Deck**, **Save & Play**, or **Host Multiplayer Room**, deck-level rules are evaluated:

1. **Deck Name Requirement:**
   - Must contain meaningful text (`name.trim().length > 0`).
   - Default fallback: `"My Custom Deck"`.
   - Empty name triggers: `"Deck name cannot be empty."`
2. **Minimum Question Count:**
   - For Local Saving: At least **1 valid question** is required.
   - For Pass & Play: At least **1 valid question** is required.
   - For Multiplayer Party Rooms: At least **2 valid questions** are required (to allow room turns).
3. **Single-Type Deck Freedom (Truths-Only or Dares-Only):**
   - The system **does NOT** require both Truth and Dare questions.
   - A deck containing 10 Truths and 0 Dares is 100% valid.
   - A deck containing 0 Truths and 10 Dares is 100% valid.
   - The game engine gracefully falls back to available questions if a player requests a type not present in the deck.

---

## 5. Architectural Implementation

### 5.1 Client-Side Validation (`CustomDeckClient.tsx`)
```typescript
const cleanedQuestion = useMemo(() => newPromptText.trim(), [newPromptText]);
const isOnlySpaces = useMemo(
  () => newPromptText.length > 0 && cleanedQuestion.length === 0,
  [newPromptText, cleanedQuestion]
);
const isTooLong = useMemo(
  () => newPromptText.length > 250 || cleanedQuestion.length > 250,
  [newPromptText, cleanedQuestion]
);
const isDuplicatePrompt = useMemo(() => {
  if (!cleanedQuestion) return false;
  const normalized = cleanedQuestion.toLowerCase();
  return questions.some((q) => q.prompt.trim().toLowerCase() === normalized);
}, [cleanedQuestion, questions]);

// Button is strictly disabled when any condition fails:
const isInputValidToAdd = useMemo(() => {
  return (
    cleanedQuestion.length > 0 &&
    !isTooLong &&
    !isDuplicatePrompt &&
    !isSubmittingQuestion
  );
}, [cleanedQuestion, isTooLong, isDuplicatePrompt, isSubmittingQuestion]);
```

### 5.2 Server-Side Validation (`lib/custom/safetyFilter.ts` & API Routes)
```typescript
export function validateCustomQuestion(
  prompt: string,
  existingPrompts: string[] = [],
  maxLength: number = 250
): { isValid: boolean; error?: string } {
  const raw = prompt ?? '';
  const clean = raw.trim();

  // 1. Empty Check
  if (!clean) {
    if (raw.length > 0) {
      return { isValid: false, error: 'Your question cannot contain only spaces.' };
    }
    return { isValid: false, error: 'Write a question before adding it.' };
  }

  // 2. Length Check
  if (clean.length > maxLength) {
    return {
      isValid: false,
      error: `Maximum ${maxLength} characters allowed.`,
    };
  }

  // 3. Duplicate Check
  const normalized = clean.toLowerCase();
  const isDuplicate = existingPrompts.some((p) => p.trim().toLowerCase() === normalized);
  if (isDuplicate) {
    return { isValid: false, error: 'This question is already in your deck.' };
  }

  // 4. Content Safety Check
  const safety = validateQuestionSafety(clean);
  if (!safety.isValid) {
    return { isValid: false, error: safety.reason || 'This question contains prohibited content.' };
  }

  return { isValid: true };
}
```
