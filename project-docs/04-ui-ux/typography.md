# Typography System & Fluid Type Scale

**Project Name:** Project Asteria  
**Document:** Typography System & Responsive Hierarchy  
**Role:** Senior UI/UX Designer & Product Design Lead  
**Date:** November 5, 2026  
**Status:** Complete — Ready for Review

---

## 1. Typeface Architecture

Party games require typography that is **instantly legible across a crowded room or over a video call**, yet expressive, modern, and friendly.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TYPEFACE ROLES & SYSTEM                         │
├───────────────────────┬────────────────────────────────────────────────┤
│ 1. DISPLAY / HEADINGS │ Plus Jakarta Sans (Geometric, bold, playful)   │
│ 2. BODY & UI LABELS   │ Inter (Neutral, ultra-clear at small sizes)    │
│ 3. MONOSPACE / NUMBERS│ JetBrains Mono (Timers, codes, leaderboards)   │
└───────────────────────┴────────────────────────────────────────────────┘
```

* **Display Family (`font-display`):** **Plus Jakarta Sans** (Weights: 600 SemiBold, 700 Bold, 800 ExtraBold).
  * Used for: Hero taglines, 3D card prompts, game titles, modal headers.
* **Body Family (`font-body`):** **Inter** (Weights: 400 Regular, 500 Medium, 600 SemiBold).
  * Used for: Explanatory copy, rules text, button text, form inputs.
* **Numeric / Code Family (`font-mono`):** **JetBrains Mono** / `ui-monospace`.
  * Used for: 6-digit room codes, countdown timer seconds, player scores.

---

## 2. Fluid Type Scale & Clamp Definitions

To eliminate jarring layout shifts across mobile (360px) and wide desktop monitors (1920px), all primary typographic tokens utilize CSS fluid `clamp()` equations:

```css
/* Fluid Typography Token Map */
:root {
  /* Display Hero (Used for Homepage Hero Headline) */
  --font-display-hero: clamp(2.25rem, 1.8rem + 2.5vw, 4.25rem); /* 36px -> 68px */
  --line-display-hero: 1.1;
  --letter-display-hero: -0.03em;

  /* Heading 1 (Page Titles, Primary Screen Headers) */
  --font-h1: clamp(1.85rem, 1.5rem + 1.8vw, 3.00rem); /* 30px -> 48px */
  --line-h1: 1.15;
  --letter-h1: -0.025em;

  /* Heading 2 (Card Prompts - Crucial for Game Legibility) */
  --font-h2-card: clamp(1.35rem, 1.1rem + 1.2vw, 2.15rem); /* 22px -> 34px */
  --line-h2-card: 1.35;
  --letter-h2-card: -0.015em;

  /* Heading 3 (Section Headers, Modal Titles) */
  --font-h3: clamp(1.20rem, 1.05rem + 0.8vw, 1.65rem); /* 19px -> 26px */
  --line-h3: 1.25;
  --letter-h3: -0.01em;

  /* Body Large (Introductory copy, featured callouts) */
  --font-body-lg: clamp(1.05rem, 0.98rem + 0.3vw, 1.25rem); /* 17px -> 20px */
  --line-body-lg: 1.6;

  /* Body Standard (General copy, FAQ text, rules) */
  --font-body-base: clamp(0.95rem, 0.92rem + 0.15vw, 1.05rem); /* 15px -> 17px */
  --line-body-base: 1.6;

  /* Body Small / UI Labels (Buttons, inputs, chip selectors) */
  --font-body-sm: 0.875rem; /* 14px */
  --line-body-sm: 1.45;

  /* Caption / Overline (Card counters, intensity tags, timestamps) */
  --font-caption: 0.75rem; /* 12px */
  --line-caption: 1.4;
  --letter-caption: 0.05em; /* Tracked out for uppercase badges */
}
```

---

## 3. Typographic Hierarchy & Application Matrix

| Token Name | Size (Mobile -> Desktop) | Weight | Line Height | Case & Tracking | Primary Usage |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `display-hero`| `36px -> 68px` | `800` | `1.1` | Sentence, `-0.03em` | Landing page hero banner |
| `h1-title` | `30px -> 48px` | `700` | `1.15`| Sentence, `-0.025em`| Directory header, Game title |
| `h2-prompt` | `22px -> 34px` | `700` | `1.35`| Sentence, `-0.015em`| **Active Truth/Dare Card Prompt** |
| `h3-section` | `19px -> 26px` | `600` | `1.25`| Sentence, `-0.01em` | Section headers, modal headers |
| `body-large` | `17px -> 20px` | `400` | `1.6` | Standard | Sub-headlines, How-to-play lead |
| `body-base` | `15px -> 17px` | `400` | `1.6` | Standard | FAQ answers, blog copy |
| `ui-button` | `16px -> 18px` | `600` | `1.0` | Sentence / Title | Truth/Dare buttons, CTAs |
| `ui-badge` | `12px` | `700` | `1.0` | **UPPERCASE**, `+0.05em` | Deck intensity tags, "18+" badge |
| `mono-code` | `24px -> 36px` | `700` | `1.0` | **UPPERCASE**, `+0.1em` | 6-digit multiplayer room code |

---

## 4. Legibility Rules for Party Gaming

Party games operate under extreme environmental constraints:
1. **The "Arm's Length" Rule:** A mobile phone resting on a coffee table or passed in a dimly lit living room must be readable from at least **1 meter away**.
   * Prompt text (`h2-prompt`) must never render below `22px` on any device.
   * Prompts are constrained to a maximum width of `580px` (`max-w-xl`) to prevent overly long line lengths that strain visual tracking.
2. **Dynamic Text Resizing (Safety Fallback):**
   * If a prompt exceeds 140 characters, the card component dynamically steps down font size:
     * `< 100 characters`: `font-h2-card` (24px–34px).
     * `100–180 characters`: `19px–24px`.
     * `> 180 characters`: `17px–20px`.
   * Cards must never trigger internal scrollbars during a game turn.
3. **No Decorative All-Caps Body Copy:**
   * Prompts must always be formatted in clear sentence case with standard punctuation. All-caps is strictly limited to 1–2 word category badges (e.g., `TRUTH`, `SPICY 18+`).

