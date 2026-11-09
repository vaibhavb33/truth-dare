# Asteria Custom Deck — UI & Visual Design Specification

> **Role:** Senior UI/UX Designer & Frontend Developer  
> **Date:** November 9, 2026  
> **Project:** Asteria Custom Deck Subsystem  
> **Scope:** Visual design, component architecture, button interaction states, typography, and responsive styling  
> **Status:** Production Verified & Implemented

---

## 1. Visual Hierarchy & Design System

The redesigned Custom Deck interface uses Asteria’s dark gaming aesthetic with high-contrast neon accents, glassmorphic card containers, and clear numerical step indicators.

```
┌─────────────────────────────────────────────────────────────────┐
│ [★ DECK CREATOR]                                                │
│ Custom Deck Studio                                              │
│                                                                 │
│ [ Deck Editor ]       [ My Decks (3) ]        [ Pass & Play ]   │
├─────────────────────────────────────────────────────────────────┤
│ ┌─ 1. DECK DETAILS ───────────────────────────────────────────┐ │
│ │ Deck Name: [ Ultra Fun Friday Pack             ]            │ │
│ │ Language:  [ 🇺🇸 English                       ]             │ │
│ │ > Advanced Settings (Description, Category, Visibility)     │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─ 2. ADD A QUESTION ────────────────────────── [ 42/250 chars ]┐
│ │ [ ? TRUTH ]   [ 🔥 DARE ]                                    │ │
│ │ [ Type a truth question...              ] [ + Add Question ] │ │
│ │ ✓ Truth added! (3 total)                                    │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─ 3. DECK QUESTIONS (3) ─────────────────────────────────────┐ │
│ │ 1. [TRUTH] What is your biggest guilty pleasure? [🔊][✏️][🗑️]│ │
│ │ 2. [DARE]  Do 15 jumping jacks right now!       [🔊][✏️][🗑️]│ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─ 4. ACTIONS ────────────────────────────────────────────────┐ │
│ │ [ 💾 Save Deck ]   [ ▶️ Save Deck & Play ]   [ 🔗 Host Room ] │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Structure & Specifications

### Section 1: Deck Details (Step 1)
- **Container:** `p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-surface-elevated/90 border border-white/10`.
- **Numerical Badge:** A circular numbered pill (`w-5 h-5 rounded-full bg-brand-500/20 text-brand-300 font-black`) establishes linear progression.
- **Deck Name Input:** 
  - Height: `h-11` (44px touch target).
  - Background: `bg-canvas-base`, border `border-white/10`, focus `border-brand-400`.
  - Max length: 60 characters.
- **Language Selector:** 
  - Compact dropdown with native flags and language names.
- **Advanced Settings Accordion:**
  - Collapsed by default.
  - Subtly expands to reveal `Description` (optional), `Category` dropdown, and `Visibility` selector without page jump.

---

### Section 2: Question Creator (Step 2)
- **Truth / Dare Switcher:**
  - **TRUTH:** Cyan gradient pill (`bg-truth-500/25 border-truth-400 text-truth-300 shadow-glow-truth`) with question mark icon.
  - **DARE:** Hot magenta pill (`bg-dare-500/25 border-dare-400 text-dare-300 shadow-glow-dare`) with flame icon.
- **Character Counter:**
  - Mono-spaced counter in upper-right corner (`N/250`).
  - Colors: Muted gray below 220 chars; bold amber at 221–249 chars; red at 250 chars.
- **Question Input Box:**
  - Full width on mobile, flexible row on desktop (`h-11 sm:h-12`).
  - Dynamic placeholder reflecting active question type.
- **Add Question Button:**
  - **Disabled State (`disabled={!isInputValidToAdd}`):** Visually muted (`opacity-40 cursor-not-allowed bg-slate-800 text-slate-500`). Clicking does nothing and produces zero validation errors.
  - **Active State:** Glowing brand gradient (`bg-brand-500 hover:bg-brand-400 text-white shadow-glow-brand cursor-pointer`).
  - **Success Alert:** Shows green check alert with smooth fade-in (`✓ Truth added! (N total)`).

---

### Section 3: Question Cards (Step 3)
- **Container:** Scrollable list capped at `max-h-[380px]` with custom scrollbar styling.
- **Question Card Row:**
  - Background: `bg-surface-highlight border border-white/5 hover:border-white/15`.
  - Left: Sequential number (`#1`), uppercase colored badge (`TRUTH` in cyan, `DARE` in magenta).
  - Middle: Question text with `leading-relaxed break-words` preventing text clipping.
  - Right:
    - **Voice Button:** Compact audio player powered by natural neural TTS.
    - **Edit Button (Pencil):** Toggles inline edit mode with prompt input and Save/Cancel buttons.
    - **Delete Button (Trash):** Removes question with instant haptic response.

---

### Section 4: Action Bar (Step 4)
- **Dual Primary Actions:**
  1. **Save Deck:** Saves to local storage and syncs to database. Shows green check icon upon success.
  2. **Save Deck & Play:** Automatically saves and opens Pass & Play setup in one click.
  3. **Host Room:** Creates a synchronized multiplayer room using the deck snapshot.

---

## 3. Mobile UI & Responsive Touch Optimization

On mobile viewports (320px–430px):
1. **Single-Column Flow:** The grid collapses into a unified vertical column.
2. **Full-Width Buttons:** Action buttons stretch to `w-full` for easy thumb tapping.
3. **Touch Targets:** All inputs and buttons maintain a minimum height of 44px–48px, complying with WCAG 2.1 AAA mobile ergonomics.
4. **Zero Horizontal Overflow:** Tested at 320px, 360px, 375px, 390px, 414px, and 430px with `diff = 0px`.

---

## 4. Visual Evidence Screenshots

High-resolution visual evidence captured during testing in `/project-docs/37-custom-deck-simplification/screenshots/`:
- `01-simplified-deck-editor-desktop.png`: Clean 4-step desktop interface with collapsed advanced settings.
- `02-question-editor-add-truth.png`: Adding a Truth question with active button and character counter.
- `03-question-editor-add-dare.png`: Adding a Dare challenge with inline green success notice.
- `04-question-card-list.png`: Formatted question cards with edit, delete, and voice listen controls.
- `05-advanced-settings-expanded.png`: Accordion expansion revealing optional Description and Category.
- `06-save-deck-success.png`: Prominent green confirmation banner upon saving.
- `07-save-and-play-transition.png`: Instant transition into Pass & Play mode.
- `08-mobile-simplified-deck-editor.png`: Single-column mobile layout with zero overflow.
- `09-my-decks-library.png`: My Decks library view with Play, Edit, and Delete actions.
