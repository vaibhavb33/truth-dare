# Responsive Guidelines & Mobile-First Viewport Rules

**Project Name:** Project Asteria  
**Document:** Responsive Layout Architecture & Ergonomic Specifications  
**Role:** Senior UI/UX Designer & Product Design Lead  
**Date:** November 5, 2026  
**Status:** Complete — Ready for Review

---

## 1. Targeted Viewport Matrix

More than **80% of party game traffic** originates from mobile smartphones passed around in physical circles or held during video calls. The platform is designed **mobile-first**, scaling gracefully up to tablets and 4K living-room televisions.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        VIEWPORT TARGET MATRIX                          │
├───────────────┬────────────┬─────────────┬─────────────────────────────┤
│ DEVICE CLASS  │ WIDTH (PX) │ PRIMARY UX  │ KEY DESIGN CONSTRAINTS      │
├───────────────┼────────────┼─────────────┼─────────────────────────────┤
│ Compact Phone │ 360px      │ iPhone SE   │ Tight horizontal margins    │
│ Standard Phone│ 390px      │ iPhone 15   │ Primary design baseline     │
│ Large Phone   │ 430px      │ Pro Max     │ Generous thumb zones        │
│ Tablet        │ 768–1024px │ iPad / Tab  │ Centered canvas, 2-col setup│
│ Desktop / TV  │ 1280–1920+ │ Mac / TV    │ Keyboard nav, multi-panel   │
└───────────────┴────────────┴─────────────┴─────────────────────────────┘
```

---

## 2. The 1-Handed Mobile Thumb Zone

During in-person parties, users typically hold the phone in one hand while standing, eating, or holding a drink. All mission-critical controls must reside within the **"Natural Thumb Zone"**:

```
┌────────────────────────────────────────┐
│ [TOP ZONE: HARD REACH]                 │
│ Header, Room Code Pill, Mute Toggle    │
│ (View-only or infrequent taps)         │
├────────────────────────────────────────┤
│                                        │
│ [CENTER ZONE: COMFORTABLE GLANCE]      │
│ 3D Active Card Prompt Display          │
│ Animated Countdown Timer Ring          │
│                                        │
├────────────────────────────────────────┤
│ [BOTTOM ZONE: EASY NATURAL REACH]      │
│ Primary "Truth" & "Dare" Action Buttons│
│ "Completed (+1)" & "Skip / Veto" Taps  │
│ Player Rotation "Next Turn" Button     │
│ [Safe Area Inset Bottom: 24px-34px]    │
└────────────────────────────────────────┘
```

### Thumb Zone Rules:
1. **Interactive Height Threshold:** Never place primary game advancement buttons in the top 35% of the mobile screen.
2. **Touch Target Size:** Minimum `48px × 48px`, recommended `54px` height for the primary "Completed" and "Truth/Dare" buttons.
3. **Safe Area Inset:** Always integrate `padding-bottom: max(16px, env(safe-area-inset-bottom))` on mobile bottom bars to prevent interference with iOS home indicator swipe bars.

---

## 3. Viewport Height Ergonomics: Dynamic Viewport Units (`dvh`)

Traditional `100vh` on mobile browsers causes critical layout issues because mobile browser chrome (address bars, bottom toolbars) expands and collapses during user interaction, pushing buttons off-screen.

```css
/* Core Viewport Rule */
.game-viewport {
  height: 100vh; /* Fallback for legacy browsers */
  height: 100dvh; /* Dynamic Viewport Height: Adapts to browser URL bars */
  min-height: -webkit-fill-available;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Prevents unwanted bounce scrolling during game */
}
```

---

## 4. Breakpoint Behaviors

### A. Compact Phone (360px – 389px)
* Card Width: `calc(100vw - 24px)`.
* Padding: Screen horizontal gutter is `12px` (prevents card crowding).
* Typography: Headline prompt scales via `clamp()` to `20px–22px`.
* Controls: Truth and Dare buttons stack vertically if language strings are long, or remain side-by-side with `gap-2`.

### B. Standard & Large Phone (390px – 430px)
* Baseline design canvas.
* Card Width: `calc(100vw - 32px)`, Max-Width `390px`.
* Gutter: `16px`.
* Layout: Dual Truth / Dare buttons side-by-side (`h-14 flex-1`).

### C. Tablet Canvas (768px – 1024px)
* Ideal for the "Coffee Table iPad" game night.
* Card Width: `460px`, centered with elegant ambient backdrop glow.
* Side Panels: Active player roster and scoreboard render as a permanent left or right sidebar instead of a hidden drawer.
* Roster: Avatars rendered with live scores in a clean column.

### D. Desktop & TV Presentation (1025px – 1920px+)
* Ideal for house parties connected to living room Smart TVs or remote Discord screen shares.
* Canvas Max-Width: `1200px` centered.
* Card Width: `480px`, Height `560px`.
* Font Size: `h2-prompt` expands to `32px` so participants seated 10 feet away on the couch can read prompts effortlessly.
* Keyboard Nav: Prominent visual keyboard shortcuts displayed beneath cards (`[T] for Truth`, `[D] for Dare`, `[Space] for Complete`, `[S] for Skip`).

---

## 5. Mobile Orientation Rules

* **Portrait Mode (Default / Recommended):**
  * Vertical flow: Header -> Player Turn Indicator -> 3D Card -> Bottom Action Bar.
* **Landscape Mode (Mobile & Tablet):**
  * Automatic dual-pane transformation:
    * Left Pane (40% width): Active player indicator, countdown timer ring, and roster summary.
    * Right Pane (60% width): 3D Card with horizontal Truth/Dare action buttons.
  * Card scales down height to fit within horizontal `dvh` without vertical scrolling.

