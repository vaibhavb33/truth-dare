# Asteria Custom Deck — Simplified New User Workflow

> **Role:** Senior UI/UX Designer & Full-Stack Developer  
> **Date:** November 9, 2026  
> **Project:** Asteria Custom Deck Subsystem  
> **Target Audience:** Ordinary users, party hosts, and mobile gamers without technical background  
> **Status:** Production Verified & Implemented

---

## 1. Problem Analysis & UX Pain Points of Legacy Interface

Prior to this redesign, user testing and error analytics identified key usability hurdles:

| Legacy Problem | UX Impact | Root Cause in Code | Resolution |
| :--- | :--- | :--- | :--- |
| **Too many configuration fields** | Overwhelmed first-time users before they could even add a single question. | Description, Category, and Visibility were rendered prominently alongside Deck Name. | **Moved to Collapsed Advanced Settings:** Only Deck Name and Language are visible by default. |
| **Empty question validation error** | Clicking "Add Question" while empty triggered an aggressive red banner error and buzzer sound. | Button had no `disabled` prop; clicked handler called validator on empty string. | **Smart Button Disabling:** `disabled={!newPromptText.trim()}` prevents accidental submission of empty inputs. |
| **Add Question button always active** | Misled users into thinking empty questions could be added or confused them about the form state. | Active CSS styles regardless of input state. | **Dynamic State Styling:** Button is visibly muted (`opacity-40 cursor-not-allowed`) until valid text is entered. |
| **Confusion on how to save questions** | Users thought they had to "Save Deck" after every single question. | No clear visual hierarchy separating "Add to draft" vs "Save Deck". | **Immediate Inline Feedback:** Adding a question displays a bright green checkmark notification (*"✓ Truth added! (N total)"*). |
| **Excessive vertical height** | Required continuous scrolling on mobile devices to see the questions list. | Giant configuration card and padded headers pushed cards below the fold. | **Compact Vertical Rhythm:** Consolidated deck metadata into a single-row 44px container; streamlined question form. |

---

## 2. The New 7-Step Intuitive Workflow

The simplified flow eliminates all friction and requires zero technical knowledge:

```
┌─────────────────────────────────────────────────────────────────┐
│                    THE 7-STEP STREAMLINED FLOW                  │
│                                                                 │
│  [1. Enter Deck Name] ─────────► [2. Select Truth or Dare]      │
│                                            │                    │
│                                            ▼                    │
│  [4. Click Add Question] ◄───── [3. Write Your Question]        │
│          │                                                      │
│          ▼                                                      │
│  [5. Repeat for More Questions] ──► [6. Click Save Deck]        │
│                                            │                    │
│                                            ▼                    │
│                                    [7. Click Play!]             │
└─────────────────────────────────────────────────────────────────┘
```

### Detailed Step-by-Step Walkthrough

#### Step 1: Enter Deck Name
- The user lands on the Deck Editor.
- The **Deck Name** field is prominent and pre-filled with an inviting default or blank placeholder (`"e.g., Friday Night Party, Dorm Secrets..."`).
- The **Language** defaults to the user's active locale (e.g. English, Hindi, Spanish) with flag indicator.

#### Step 2: Select Truth or Dare
- A single tap switches between:
  - **TRUTH** (Cyan pill with question mark icon).
  - **DARE** (Magenta pill with flame icon).
- The input placeholder dynamically adapts:
  - Truth: *"Type a truth question (e.g. What is your most embarrassing secret?)..."*
  - Dare: *"Type a dare challenge (e.g. Do your best impression of someone in this room!)..."*

#### Step 3: Write a Question
- Clean text input with a live character counter (`N/250`).
- Prevents text from exceeding 250 characters.

#### Step 4: Click "Add Question"
- The **Add Question** button illuminates with glowing brand colors as soon as the user starts typing.
- When clicked:
  1. The question is immediately appended to the visual deck list.
  2. The input box clears automatically.
  3. The chosen type (Truth or Dare) remains selected, allowing rapid addition of consecutive prompts.
  4. A gentle chime sound plays.
  5. A reassuring green notice appears: *"✓ Truth added! (3 total)"*.

#### Step 5: Repeat to Add More Questions
- Users rapidly build their party pack without re-configuring metadata.
- Total count and breakdown (`X Truths`, `Y Dares`) update in real time.

#### Step 6: Click "Save Deck"
- Click the prominent **Save Deck** button at the bottom.
- The deck is saved to local storage and the server repository.
- Displays a prominent green confirmation: *"✓ Deck Saved Successfully!"*.

#### Step 7: Click "Play" or "Save Deck & Play"
- Users can click **Save Deck & Play** to launch into Pass & Play mode in one click.
- Alternatively, hosts can click **Host Room** to create an instant private multiplayer lobby.

---

## 3. Preserved Sensible Defaults for Advanced Settings

For power users who wish to customize themes and discovery, an optional collapsible toggle is provided:
- **Collapsed by Default:** Does not clutter the primary workflow.
- **Sensible Defaults:**
  - `Description`: Empty string (`""`).
  - `Category`: `"classic-party"` (General Party).
  - `Visibility`: `"public"` (Accessible in library).

---

## 4. Unsaved Draft Protection

If a user accidentally navigates away, refreshes the browser, or switches tabs:
- The editor automatically serializes the active draft (`name`, `language`, `questions`) into `localStorage.getItem('asteria_custom_deck_draft')`.
- On return, the in-progress questions are instantly restored without loss.

