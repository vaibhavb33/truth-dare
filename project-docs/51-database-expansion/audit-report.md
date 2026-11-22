# Phase 1: Question Database Audit Report
**Project:** Play Truth & Dare (https://playtruthndare.com)  
**Date:** November 2026  
**Auditor:** Senior Full-Stack Next.js Developer & Game Engine Architect

---

## 1. Executive Summary

A comprehensive programmatic audit of all game modes, database repositories, API endpoints, and randomization algorithms was conducted across the codebase.

### Key Finding: Severe Content Starvation in Non-Truth-or-Dare Games
While the Truth or Dare core engine contains **2,636 multilingual questions** (636 in English), other party games have critically low question counts:
- **Most Likely To**: **Only 7 English questions** in total (15 worldwide across 8 languages).
- **Never Have I Ever**: **Only 10 English statements** in total (20 worldwide).
- **Would You Rather**: **Only 7 English dilemmas** in total (15 worldwide).
- **This or That**: **Only 5 English pairs** in total (13 worldwide).

As a direct consequence, players cycling through rounds in *Most Likely To*, *Never Have I Ever*, *Would You Rather*, or *This or That* experience repetitive prompts within 2 to 5 minutes of gameplay.

---

## 2. Statistical Breakdown of Existing Questions

### Total Database Records: **2,699 Questions**

### A. Breakdown by Game Type
| Game Mode | Total Worldwide | English (`en`) | Hindi (`hi`) | Spanish (`es`) | Portuguese (`pt`) | French (`fr`) | Indonesian (`id`) | Arabic (`ar`) | German (`de`) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **Truth or Dare** | **2,636** | 636 | 600 | 300 | 300 | 200 | 200 | 200 | 200 |
| **Never Have I Ever** | **20** | 10 | 3 | 2 | 1 | 1 | 1 | 1 | 1 |
| **Would You Rather** | **15** | 7 | 2 | 1 | 1 | 1 | 1 | 1 | 1 |
| **Most Likely To** | **15** | 7 | 2 | 1 | 1 | 1 | 1 | 1 | 1 |
| **This or That** | **13** | 5 | 2 | 1 | 1 | 1 | 1 | 1 | 1 |
| **Total** | **2,699** | **665** | **609** | **305** | **304** | **204** | **204** | **204** | **204** |

### B. Breakdown by Question Type
| Type | Count |
|---|---:|
| `truth` | 1,320 |
| `dare` | 1,316 |
| `never_have_i_ever` | 20 |
| `would_you_rather` | 15 |
| `most_likely_to` | 15 |
| `this_or_that` | 13 |

### C. Breakdown by Category (English Truth or Dare & Party Games)
| Category ID | Current Count | Games Associated |
|---|---:|---|
| `funny-dare` | 277 | Truth or Dare, NHIE |
| `romantic` | 213 | Truth or Dare, couples |
| `couples` | 211 | Truth or Dare, couples |
| `family-friendly` | 206 | Truth or Dare, family |
| `friendship` | 204 | Truth or Dare, teens |
| `awkward` | 204 | Truth or Dare, funny |
| `embarrassing` | 204 | Truth or Dare, wild |
| `personal` | 204 | Truth or Dare, deep |
| `funny-truth` | 200 | Truth or Dare, funny |
| `party` | 200 | Truth or Dare, party |
| `teen-friendly` | 192 | Truth or Dare, teens |
| `icebreaker` | 192 | Truth or Dare, clean |
| `creative-challenges` | 192 | Truth or Dare, dares |

---

## 3. Storage Architecture & Codebase Map

| Game / Feature | Client Component | Storage File | API Endpoints |
|---|---|---|---|
| **Truth or Dare** | `components/games/TruthOrDareGameClient.tsx` | `lib/questions/database/en.ts`, `hi.ts`, `es.ts`, etc. | `/api/questions` |
| **Most Likely To** | `components/games/MostLikelyToClient.tsx` | `lib/questions/database/partyGamesCatalog.ts` | `/api/questions` |
| **Never Have I Ever** | `components/games/NeverHaveIEverClient.tsx` | `lib/questions/database/partyGamesCatalog.ts` | `/api/questions` |
| **Would You Rather** | `components/games/WouldYouRatherClient.tsx` | `lib/questions/database/partyGamesCatalog.ts` | `/api/questions` |
| **This or That** | `components/games/ThisOrThatClient.tsx` | `lib/questions/database/partyGamesCatalog.ts` | `/api/questions` |
| **Spinner Wheel** | `components/games/SpinnerWheelClient.tsx` | Hardcoded `DEMO_PLAYERS` & preset string arrays | Client-side Canvas |
| **Custom Decks** | `components/custom/CustomDeckClient.tsx` | `lib/custom/serverDeckRepository.ts` | `/api/custom-decks`, `/api/custom-decks/[id]` |
| **Multiplayer Rooms** | `app/room/[code]/RoomClient.tsx` | In-memory `RoomEngine` + `ALL_QUESTIONS` | `/api/rooms/create`, `/api/rooms/action`, `/api/rooms/[code]` |
| **Question Library** | `components/questions/QuestionsClient.tsx` | `lib/questions/database/en.ts` | Client-side filter |

---

## 4. Randomization & Anti-Repetition Deficiencies Identified

1. **Session Exhaustion Vulnerability**:
   In `engine.ts`, `drawNextCard()` filters out `params.drawnCardIds`. When `drawnCardIds.length === eligible.length`, `isExhausted` is returned.
   In `MostLikelyToClient` and `NeverHaveIEverClient`, the component simply clears `drawnCardIds = []` and draws again.
   Without a persistent cycle shuffle-bag, the first question drawn in the second cycle has a 1-in-N chance of being identical to the last question just played, causing immediate repeats.

2. **No Persistent History Across Page Reloads or Quick Restarts**:
   If a user navigates away or reloads, `drawnCardIds` resets to `[]`, immediately exposing them to questions they just answered.

3. **No Cross-Session Frequency Decay**:
   Frequent players always draw from the exact same uniform distribution, leading to the impression that the game is repetitive.

---

## 5. Expansion Objectives (Minimum Targets)

| Game / Category | Current Count | Target Count | Net Addition Required |
|---|---:|---:|---:|
| **Truth questions** | 318 | **1,000+** | +682 |
| **Dare challenges** | 318 | **1,000+** | +682 |
| **Most Likely To** | 7 | **500+** | +493 |
| **Never Have I Ever** | 10 | **500+** | +490 |
| **Would You Rather** | 7 | **500+** | +493 |
| **This or That** | 5 | **500+** | +495 |
| **Couples / Romantic** | 211 | **400+** | +189 |
| **Friendship / Teen** | 204 | **400+** | +196 |
| **Icebreakers / Clean** | 192 | **400+** | +208 |

---

*Phase 1 Audit Complete. Moving to Phase 2 (Research) and Phase 3 (Database Expansion).*

