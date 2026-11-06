# Reusable Component Specifications

**Project Name:** Project Asteria  
**Document:** Component Architecture & Micro-Specifications  
**Role:** Senior UI/UX Designer & Product Design Lead  
**Date:** November 5, 2026  
**Status:** Complete — Ready for Review

---

## 1. Master Component Inventory

```
┌────────────────────────────────────────────────────────────────────────┐
│                        COMPONENT LIBRARY MAP                           │
├───────────────────────┬────────────────────────────────────────────────┤
│ ATOMIC ELEMENTS       │ Buttons, Badges, Input Fields, Toggles, Sliders│
│ COMPOSITE ELEMENTS    │ 3D Game Card, Dare Timer Ring, Player Chips    │
│ OVERLAYS & SHEETS     │ Age Gate Modal, Summary Dialog, Drawer Sheet   │
│ INTERACTIVE CONTROLS  │ Header Bar, Mobile Dock, Floating Reactions    │
└───────────────────────┴────────────────────────────────────────────────┘
```

---

## 2. The 3D Game Card (`Card3D.tsx`)

The centerpiece of the entire gaming platform. Must deliver physical weight, depth, and satisfying tactile motion.

```
                  ┌────────────────────────────────────────┐
                  │ 3D PERSPECTIVE CONTAINER (perspective) │
                  │                                        │
                  │   ┌────────────────────────────────┐   │
                  │   │        ACTIVE FLIP CARD        │   │
                  │   │   preserve-3d / rotateY(180)   │   │
                  │   │                                │   │
                  │   │  [FRONT: Choice] [BACK: Prompt]│   │
                  │   └────────────────────────────────┘   │
                  └────────────────────────────────────────┘
```

### Specifications:
* **Dimensions:**
  * Mobile (360px–430px): Width `calc(100vw - 32px)`, Max-Width `380px`, Height `460px` (or aspect ratio `3 : 4`).
  * Tablet & Desktop: Width `440px`, Height `540px`.
* **Container Styling:**
  * Background: `#121229` with subtle vertical gradient (`from-[#181836] to-[#0E0E22]`).
  * Border: `1px solid rgba(255, 255, 255, 0.12)`.
  * Corner Radius: `radius-2xl` (32px).
  * Glow: Dynamic based on choice (`0 0 45px rgba(6, 182, 212, 0.25)` for Truth; `0 0 45px rgba(255, 92, 119, 0.28)` for Dare).
* **Face Down State (Pre-Choice):**
  * Vertically split or dual-button surface inviting player to choose:
    * Left/Top zone: Cyan Truth Zone with glowing `?` icon.
    * Right/Bottom zone: Coral Dare Zone with glowing `⚡` icon.
* **Face Up State (Prompt Revealed):**
  * Category Badge at top center (e.g., `CLASSIC PARTY • LEVEL 2`).
  * Centered Prompt Typography (`h2-prompt`, bold, high-contrast `#F8FAFC`).
  * Timer integration if Dare is selected.
* **Motion Specs:**
  * `transform-style: preserve-3d;`
  * `transition: transform 450ms cubic-bezier(0.34, 1.56, 0.64, 1);` (Subtle spring bounce on arrival).
  * `backface-visibility: hidden;` on both front and back faces.

---

## 3. Button System

Every button must meet a minimum hit target of **48px × 48px** with explicit focus, hover, active, and disabled states.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        BUTTON COMPONENT SPECS                          │
├─────────────────┬──────────────┬───────────────────┬───────────────────┤
│ VARIANT         │ BASE BG      │ HOVER STATE       │ ACTIVE / PRESSED  │
├─────────────────┼──────────────┼───────────────────┼───────────────────┤
│ Primary Action  │ Violet Grad  │ Brightness 1.1    │ Scale 0.97        │
│ Truth Action    │ Cyan Grad    │ Cyan Glow + 1.08x │ Scale 0.97 + Dark │
│ Dare Action     │ Coral Grad   │ Coral Glow + 1.08x│ Scale 0.97 + Dark │
│ Secondary / Out │ Transparent  │ bg-white/10       │ bg-white/15       │
│ Ghost / Icon    │ Transparent  │ bg-white/8        │ bg-white/12       │
│ Floating Pill   │ #1A1A38      │ border-violet-400 │ Scale 0.95        │
└─────────────────┴──────────────┴───────────────────┴───────────────────┘
```

### Detailed Token Definitions:
1. **Primary Brand Button (`BtnPrimary`):**
   * Background: `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)`.
   * Height: `52px` (Mobile: `56px` for primary CTAs).
   * Corner Radius: `radius-lg` (16px).
   * Shadow: `0 8px 24px -4px rgba(124, 58, 237, 0.5)`.
   * Typography: `ui-button`, SemiBold 17px, `#FFFFFF`.
2. **Truth Button (`BtnTruth`):**
   * Background: `linear-gradient(135deg, #06B6D4 0%, #0284C7 100%)`.
   * Glow: `0 8px 25px -4px rgba(6, 182, 212, 0.5)`.
   * Icon: Lucide `HelpCircle` (22px).
3. **Dare Button (`BtnDare`):**
   * Background: `linear-gradient(135deg, #FF5C77 0%, #E11D48 100%)`.
   * Glow: `0 8px 25px -4px rgba(255, 92, 119, 0.55)`.
   * Icon: Lucide `Flame` (22px).
4. **Skip / Veto Button (`BtnSkip`):**
   * Background: `rgba(255, 255, 255, 0.06)`, Border: `1px solid rgba(255, 255, 255, 0.12)`.
   * Typography: Medium 15px, `#CBD5E1`.
   * Hover: Border turns `border-rose-400/40`, Text `text-rose-300`.

---

## 4. Dare Countdown Timer Ring (`DareTimerRing.tsx`)

An animated circular SVG indicator that communicates remaining dare time visually and colorimetrically.

* **Geometry:** Diameter `80px` (Compact: `64px`), Stroke Width `6px`.
* **Track:** Background SVG circle with `stroke="rgba(255, 255, 255, 0.1)"`.
* **Indicator Stroke:** SVG `stroke-dasharray` and `stroke-dashoffset` driven by CSS transition (`transition: stroke-dashoffset 1s linear`).
* **Color States:**
  * `> 10s Remaining`: `#10B981` (Emerald / Normal).
  * `5s – 10s Remaining`: `#F59E0B` (Amber / Caution).
  * `< 5s Remaining`: `#FF5C77` (Coral / Urgent) with subtle pulse animation (`scale 1.05`).
* **Center Display:** Monospace seconds counter (`font-mono`, bold 24px `#FFFFFF`).

---

## 5. Player Roster Chips (`PlayerChip.tsx`)

Used in Pass & Play mode and multiplayer room headers to represent connected players.

* **Structure:** Avatar Pill containing:
  * Optional 2-letter monogram avatar circle (`w-7 h-7 bg-violet-600 rounded-full`).
  * Player Name (`text-sm font-medium`).
  * Score Badge (`px-1.5 py-0.5 text-xs bg-white/10 rounded-md font-mono`).
  * Dismiss Icon (`✕`) during setup mode.
* **Active Player Glow:**
  * When it is this player’s turn, the chip is highlighted with `border-violet-400 bg-violet-950/40 shadow-[0_0_15px_rgba(139,92,246,0.4)]`.

---

## 6. Age Gate Consent Modal (`AgeGateModal.tsx`)

* **Backdrop:** Full-screen overlay with `bg-[#07070F]/85 backdrop-blur-md`.
* **Dialog Container:**
  * Dimensions: Max-Width `420px`, Padding `32px`.
  * Background: `#161632`, Border: `1px solid rgba(255, 92, 119, 0.3)`.
  * Corner Radius: `radius-2xl` (32px).
* **Header Icon:** Amber Warning Shield (`w-12 h-12 text-amber-400 mb-4`).
* **Copy:** Bold title *"Mature Content Warning (18+)"*, followed by explicit consent disclaimer.
* **Actions:**
  * Primary: *"I am 18 or Older — Enter"* (`btn-dare`, full width).
  * Secondary: *"Exit to Family Safe Mode"* (`btn-secondary`, full width).

---

## 7. Universal Header Bar (`AppHeader.tsx`)

* **Height:** `64px` (Mobile: `56px`), sticky at top with `backdrop-blur-md bg-[#0A0A16]/80`.
* **Left:** Brand Logo (Wordmark *"ASTERIA"* in Plus Jakarta Sans ExtraBold with electric violet dot).
* **Right Actions:**
  * **Room Code Indicator** (if in room): Pill displaying `ROOM: ABC89` with 1-tap copy.
  * **Master Audio Mute Toggle:** 40px circular button with Speaker / Speaker-Off icon.
  * **Theme / Preferences Cog:** Opens quick drawer for sound, vibration, and safe mode.

---

## 8. Mobile Dock / Bottom Thumb Zone (`MobileDock.tsx`)

To optimize for single-handed mobile usage:
* **Position:** Fixed at bottom of screen with `safe-area-inset-bottom`.
* **Height:** `68px`.
* **Controls Placement:** Primary game decision buttons ("Completed", "Skip", "Next") are pinned within the bottom **25% of the mobile screen**, ensuring users never have to stretch their thumbs to the top corners.

