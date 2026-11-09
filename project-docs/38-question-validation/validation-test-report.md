# Custom Deck Question Validation & Error Handling Test Report

> **Project:** Asteria — Truth & Dare Gaming Platform  
> **Module:** Custom Deck Question Validation & Button Behaviour (Task 38)  
> **Execution Date:** November 9, 2026  
> **Environment:** Next.js 15.5.29, Node.js v20, Vitest v3.2.7, Playwright (Google Chrome Headless)  
> **Test Status:** 100% Passed (154/154 Vitest Suite Tests, 25/25 Dedicated Validation Tests, 8/8 E2E Visual Audits)

---

## 1. Executive Summary

This QA report documents the comprehensive validation overhaul of the Asteria Custom Deck question entry and error management pipeline. All reported bugs—including premature error banners on initial page load, clickable Add Question buttons on empty input, uninformative technical error messages, and rapid double-click race conditions—have been fully resolved and verified.

---

## 2. Test Execution Breakdown

### 2.1 Dedicated Question Validation Unit & Integration Suite (`tests/questionValidation.test.ts`)
Total Tests: **25 Passed** | Failed: **0** | Duration: **27ms**

| Category | Test Case Description | Tested Input | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Input Rules** | Case 1: Empty string | `""` | Rejects with `"Write a question before adding it."` | Matched exactly | ✅ PASS |
| **Input Rules** | Case 2: Spaces-only | `"   "` | Rejects with `"Your question cannot contain only spaces."` | Matched exactly | ✅ PASS |
| **Input Rules** | Case 3: Tabs-only | `"\t\t"` | Rejects with `"Your question cannot contain only spaces."` | Matched exactly | ✅ PASS |
| **Input Rules** | Case 4: Newlines-only | `"\n\r\n"` | Rejects with `"Your question cannot contain only spaces."` | Matched exactly | ✅ PASS |
| **Input Rules** | Case 5: 1-char valid | `"A"` | Accepted (`isValid: true`) | Matched | ✅ PASS |
| **Input Rules** | Case 6: 250-char boundary | 250 `'Q'` chars | Accepted (`isValid: true`) | Matched | ✅ PASS |
| **Input Rules** | Case 7: 251-char overflow | 251 `'Q'` chars | Rejects with `"Maximum 250 characters allowed."` | Matched exactly | ✅ PASS |
| **Input Rules** | Case 8: Hindi Devanagari | `"क्या आपने कभी..."` | Accepted (`isValid: true`) | Matched | ✅ PASS |
| **Input Rules** | Case 9: English text | `"What is the most..."` | Accepted (`isValid: true`) | Matched | ✅ PASS |
| **Input Rules** | Case 10: Special chars | `"$100 prize! #1?"` | Accepted (`isValid: true`) | Matched | ✅ PASS |
| **Input Rules** | Duplicate detection | Case & whitespace match | Rejects with `"This question is already in your deck."` | Matched exactly | ✅ PASS |
| **Input Rules** | Content safety check | Hazardous stunts | Rejects with `"Dangerous physical stunts..."` | Matched | ✅ PASS |
| **Button State** | Empty input disable | `""` | Button disabled, `inlineError: null` (no red banner!) | Matched | ✅ PASS |
| **Button State** | Spaces input disable | `"    "` | Button disabled, shows spaces error | Matched | ✅ PASS |
| **Button State** | >250 chars disable | 251 chars | Button disabled, shows length error | Matched | ✅ PASS |
| **Button State** | Duplicate disable | Existing prompt | Button disabled, shows duplicate error | Matched | ✅ PASS |
| **Button State** | In-flight submission | `isSubmitting: true` | Button disabled during in-flight processing | Matched | ✅ PASS |
| **Button State** | Valid input enable | Valid text | Button enabled, vibrant styling | Matched | ✅ PASS |
| **Success Flow** | Question add success | Add prompt | Clears input, preserves type, updates counters | Matched | ✅ PASS |
| **Save Deck** | Truths-only deck | 3 Truths, 0 Dares | Successfully saves deck without requiring Dares | Matched | ✅ PASS |
| **Save Deck** | Dares-only deck | 0 Truths, 2 Dares | Successfully saves deck without requiring Truths | Matched | ✅ PASS |
| **Save Deck** | 0 questions check | 0 questions | Rejects with `"Deck must contain at least one question."` | Matched | ✅ PASS |
| **Save Deck** | Empty deck name | `"     "` | Rejects with `"Deck name cannot be empty."` | Matched | ✅ PASS |
| **Error Handling**| Offline server failure | Server API error | Local storage deck preserved intact | Matched | ✅ PASS |
| **Error Handling**| Error clearance | User types valid text | Error state clears immediately on change | Matched | ✅ PASS |

---

## 3. Playwright Visual Audit & Screenshot Proof

The automated visual audit script (`tests/e2e/questionValidationVisualAudit.js`) ran against the production Next.js build on `http://localhost:3000`.

| Screenshot File | Description | Visual State Validated |
| :--- | :--- | :--- |
| `01-initial-empty-state.png` | Initial Custom Deck page load | **0 red error banners**; Add Question button is disabled (`opacity-40 cursor-not-allowed pointer-events-none`). |
| `02-inline-error-spaces.png` | Input filled with spaces (`"   "`) | Add Question button remains disabled; inline text `"Your question cannot contain only spaces."` is displayed directly below input. |
| `03-inline-error-too-long.png`| Input filled with 251 characters | Add Question button disabled; character count shows `251/250`; inline text `"Maximum 250 characters allowed."` displayed. |
| `04-valid-input-1char.png` | Input filled with 1 valid character (`"A"`) | Add Question button immediately unlocks with cyan/brand gradient and glow; zero error notices. |
| `05-success-question-added.png` | Valid Hindi question added | Question input cleared; question appended to list; green success notice `"✓ Truth added! (6 total)"` displayed. |
| `06-inline-error-duplicate.png` | Duplicate question typed | Add Question button disabled; inline text `"This question is already in your deck."` displayed. |
| `07-save-deck-success.png` | Save Deck clicked | Green `"✓ Deck Saved!"` notification displayed; local and server persistence verified. |
| `08-mobile-validation-viewport.png` | iPhone 14 Viewport (390x844) | Compact mobile layout; inline error fits without horizontal scrolling; buttons stack cleanly. |

Screenshots are persisted in:
`project-docs/38-question-validation/screenshots/`

---

## 4. Full Vitest Test Suite Results

```bash
> truth-and-dare-premium@1.0.0 test
> vitest run

 ✓ tests/spinnerMath.test.ts (17 tests) 118ms
 ✓ tests/neuralVoiceEngine.test.ts (17 tests) 52ms
 ✓ tests/gameEngines.test.ts (10 tests) 14ms
 ✓ tests/multiplayerRoomsE2E.test.ts (17 tests) 33ms
 ✓ tests/questionValidation.test.ts (25 tests) 44ms
 ✓ tests/i18n.test.ts (5 tests) 14ms
 ✓ tests/multilingualGlobal.test.ts (7 tests) 169ms
 ✓ tests/multiplayerAdvanced.test.ts (6 tests) 17ms
 ✓ tests/multilingualQuestions.test.ts (8 tests) 1059ms
 ✓ tests/securityAndApi.test.ts (3 tests) 10ms
 ✓ tests/speechService.test.ts (7 tests) 29ms
 ✓ tests/seoAndSitemap.test.ts (2 tests) 19ms
 ✓ tests/roomEngine.test.ts (5 tests) 18ms
 ✓ tests/customDecks.test.ts (22 tests) 85ms
 ✓ tests/questionEngine.test.ts (3 tests) 26ms

 Test Files  15 passed (15)
      Tests  154 passed (154)
   Duration  7.21s
```

All 15 test suites and 154 unit and integration tests passed with zero failures.

