# Language Modal Bug Analysis & Root Cause Report

**Project:** Asteria — Multilingual Truth or Dare Gaming Platform  
**Target Component:** `components/i18n/LanguageSelector.tsx`  
**Engineer:** Senior Frontend Developer + Mobile UI/UX Engineer  
**Date:** November 2026  

---

## 1. Executive Summary

A comprehensive architectural and mobile UX audit of the language selection interface revealed critical flaws in DOM structure, layout containment, CSS positioning, responsive typography, and viewport boundaries. The previous implementation rendered an uncontained absolute dropdown menu anchored inside the sticky header element. On mobile devices (particularly narrow screens from 320px to 390px), this resulted in severe layout collisions, text truncation, background bleed-through, and clipping.

---

## 2. In-Depth Root Cause Analysis

### Bug 1: Modal Extends Outside the Viewport
* **Symptom:** On mobile viewports (320px, 360px, 375px), opening the language selector causes the popup to extend beyond the left and right screen boundaries, introducing horizontal scrolling and clipping.
* **Root Cause:**
  1. The dropdown was styled with fixed utility widths: `w-80` (320px) and `sm:w-96` (384px).
  2. It was positioned using `absolute right-0 mt-2` inside a relative parent within `<header>`.
  3. On a 320px or 360px screen with 12px–16px header horizontal padding, a 320px box anchored at `right-0` requires at least `320px + 16px = 336px` of width to fit. On a 320px screen, it overflows into negative coordinates (`left: -16px`), extending outside the left viewport edge.

### Bug 2: Background Text Appears Through the Modal
* **Symptom:** Text and gameplay elements from the underlying page bleed through the modal, making language options illegible.
* **Root Cause:**
  1. The dropdown relied solely on `bg-[#0F0F23]/98 backdrop-blur-2xl` on its own small container without rendering a dedicated full-screen backdrop overlay.
  2. Because the surrounding page remained completely uncovered and fully illuminated, the high-contrast white text of the hero section and game cards was visible directly alongside and beneath the dropdown borders.
  3. No body scroll lock was active, allowing background text to move underneath while interacting with the dropdown.

### Bug 3: Language Cards Overlap & Collide
* **Symptom:** On mobile devices, language cards collided horizontally with one another, creating an unreadable cluster.
* **Root Cause:**
  1. The container used a naive grid layout without accounting for compact viewports: `grid grid-cols-1 sm:grid-cols-2`.
  2. On compact screens between 320px and 359px, forcing content into constrained widths without responsive padding caused card elements to bleed into neighbouring margins.

### Bug 4: Hindi and English Text Collide
* **Symptom:** In language cards, English and Native names collided, clipped, or wrapped into broken characters (e.g. `Hindi - हिन्दी` overlapping into illegible glyphs).
* **Root Cause:**
  1. The card template used a single horizontal span:
     ```tsx
     <span className="text-xs font-bold leading-tight truncate">
       {item.name} - {item.nativeName}
     </span>
     ```
  2. Inside a 2-column layout on mobile, each column is at most 130px–150px wide. Deducting the flag (24px), checkmark icon (24px), and internal padding (24px), only ~60px–80px remained for the text span.
  3. Compounding both the English name ("Indonesian", "Portuguese") and Native name ("Bahasa Indonesia", "Português") horizontally with a hyphen on a single line forced severe truncation or text collision. Furthermore, Devanagari script for Hindi (`हिन्दी`) requires adequate vertical line-height for matras; inline truncation clipped the top and bottom vowels.

### Bug 5: Header and Modal Compete for Space
* **Symptom:** The modal was trapped within the header boundary and clipped on mobile devices.
* **Root Cause:**
  1. In `components/layout/AppHeader.tsx`, line 37:
     ```tsx
     <header className="sticky top-0 z-40 w-full h-16 ... overflow-hidden sm:overflow-visible">
     ```
  2. On mobile screens (`< 640px`), `<header>` enforces `overflow-hidden`. Any absolutely positioned child that extended beyond the 64px header height was abruptly clipped by CSS overflow rules!
  3. Furthermore, `<header>` established its own stacking context via `backdrop-blur-xl` and `z-40`, preventing the dropdown from rendering over higher-index elements like `MobileDock`.

### Bug 6: Content Extends Underneath Bottom Navigation
* **Symptom:** On mobile screens, the language options extended beneath the fixed `MobileDock` navigation bar, preventing players from clicking lower language options (such as Arabic or German).
* **Root Cause:**
  1. `MobileDock` is rendered as `fixed bottom-0 z-40`.
  2. The language selector had no coordination with the bottom dock, no safe-area inset padding (`env(safe-area-inset-bottom)`), and lacked a z-index hierarchy that placed it above both navigation layers (`z-[100]`).

---

## 3. Comparative Summary

| Defect Area | Previous Behavior | Corrected Behavior |
| :--- | :--- | :--- |
| **DOM Placement** | Child of relative container inside `<header>` | Detached portal directly into `document.body` |
| **Stacking Context** | Trapped inside `header` (`z-40`, `overflow-hidden`) | Independent top-level stacking context (`z-[100]`) |
| **Backdrop** | None (only semi-transparent popover background) | Full viewport `#07070F/90` with `backdrop-blur-md` |
| **Viewport Dimensions** | Fixed `w-80 sm:w-96` overflowing screens <= 375px | Responsive `min(100% - 24px, 520px)`, max-h `calc(100dvh - 32px)` |
| **Typography Hierarchy** | Single horizontal line: `{name} - {nativeName}` | Vertical stack: English title over Native subtitle with ISO badge |
| **Responsive Grid** | Inflexible columns on ultra-narrow displays | 1 column (< 360px), 2 columns (>= 360px / desktop) |
| **Background Scrolling**| Allowed; page scrolls behind menu | Prevented via `document.body.style.overflow = 'hidden'` |
| **Mobile Dock Collision**| Covered by dock or clipped by header | Completely overlays all navigation with safe area margins |

---

## 4. Architectural Recommendation
The resolution requires decoupling the modal from the header hierarchy via **React Portal (`createPortal`)**, introducing an opaque full-viewport backdrop, implementing strict scroll-locking and keyboard event listeners, restructuring the card typography into vertical stacks, and adapting the grid dynamically based on available viewport width.

