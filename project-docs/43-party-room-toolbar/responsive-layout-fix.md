# Party Room Toolbar: Responsive Layout Redesign & Architecture

**Project:** Asteria — Multiplayer Party Gaming Platform  
**Component:** `app/room/[code]/RoomClient.tsx`  
**Author:** Senior Frontend Developer + Mobile UI/UX Engineer  
**Date:** 2026-11-10  
**Status:** **IMPLEMENTED & DEPLOYED**  

---

## 1. Architectural Strategy

To solve all identified mobile layout failures without sacrificing desktop sophistication or removing any existing controls, the Party Room toolbar was redesigned using a dual-mode responsive layout pattern:
1. **Mobile Layout (`< 768px` / `< md`):** A dedicated 3-row vertical card layout utilizing consistent 38px control heights, clear visual hierarchy, and dedicated slots for navigation, settings, and sharing.
2. **Desktop & Tablet Layout (`>= 768px` / `md:`):** A streamlined, unified single horizontal toolbar with ample spacing, prominent title, and aligned action buttons.

---

## 2. Mobile Layout Architecture (< 768px)

On mobile viewports (320px to 430px), controls are logically grouped into three balanced rows inside a single cohesive card container (`bg-surface-elevated/90 border border-white/10 rounded-2xl p-3 backdrop-blur-md`):

```
+-------------------------------------------------------------+
| [<-]  PARTY ROOM                [● LOBBY]  [Party Jokes]    |  <-- ROW 1: Nav & Status
+-------------------------------------------------------------+
| [  🌐 🇬🇧 English  ]                   [ ⚙️ ]     [ 🔲 QR ]  |  <-- ROW 2: Language & Settings
+-------------------------------------------------------------+
| [ ROOM: VNC9ZR ]           [ 📋 Copy ]      [ 🚀 Share ]    |  <-- ROW 3: Code & Actions
+-------------------------------------------------------------+
```

### ROW 1: Navigation, Title & Room Status
- **Back Button (`ArrowLeft`):** Accessible `min-h-[36px] min-w-[36px]` square button triggering the leave room confirmation dialog.
- **Party Room Title (`h1`):** Styled with `font-display font-extrabold text-sm xs:text-base uppercase tracking-wider text-white whitespace-nowrap min-w-0`. Guaranteed to stay on a single line on all screens down to 320px.
- **Compact Room Status Pills:**
  - In Lobby: `● LOBBY` pill with an emerald pulsing indicator.
  - In Game: `Round X` pill with high-contrast mono typography.
  - Custom Deck: Displays custom deck name (`hidden xs:inline-block max-w-[110px] truncate` on >= 360px) without causing title clipping on 320px.

### ROW 2: Language Selector, Lobby Settings & QR Code
- **Shared Language Indicator / Selector:**
  - Generous full-width button showing `Globe icon`, flag emoji, and native language name.
  - Interactive for room hosts to directly adjust the shared question language in lobby settings.
- **Lobby Settings Button:**
  - Dedicated 38x38px icon button for the host to configure room settings, categories, and player capacity.
- **QR Code Button:**
  - Dedicated 38x38px icon button opening the mobile scan QR modal.

### ROW 3: Room Code Card, Dedicated Copy & Dedicated Share Buttons
- **Room Code Display Card:**
  - High-contrast monospace code display (`font-mono font-black text-xs xs:text-sm tracking-widest text-white`).
  - Guaranteed never to clip or truncate.
  - Clicking the code card directly copies the link to the clipboard with real-time green feedback.
- **Dedicated Copy Button:**
  - Button with `<Copy>` icon and label `"Copy"`.
  - Turns into a green checkmark with label `"Copied"` for 2 seconds upon click.
- **Dedicated Share Button:**
  - Full-color brand gradient button (`from-brand-600 to-indigo-600`) with `<Share2>` icon and label `"Share"`.
  - Seamlessly invokes the Web Share API (`navigator.share`) on mobile devices.

---

## 3. Desktop & Tablet Layout Architecture (>= 768px)

On screen widths 768px and wider (`md:` breakpoint), the toolbar automatically switches to a unified single horizontal flex row:

```
+-------------------------------------------------------------------------------------------------+
| [<-] PARTY ROOM  [● LOBBY]  [Deck: Party Jokes]  |  [🌐 🇬🇧 English]  [⚙️]  [🔲]  [VNC9ZR  Share] |
+-------------------------------------------------------------------------------------------------+
```

- **Left Section:** Back button + `"PARTY ROOM"` title + Room status badges (`● LOBBY` / `Round X`) + Custom deck badge.
- **Right Section:** Language badge + Settings gear button (if host) + QR code modal button + Combined room code & share button.
- **Zero Squeezing:** Desktop viewports (768px to 1440px) provide between 720px and 1400px of usable width, allowing all 6 control clusters to breathe comfortably.

---

## 4. Key CSS & DOM Enhancements Applied

```diff
- <div className="flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-2xl bg-surface-elevated ...">
-   <div className="flex items-center gap-2 min-w-0">
-     <button ...><ArrowLeft /></button>
-     <div className="overflow-hidden">
-       <span>{dict.multiplayer.title}</span>
-       {/* Clipped badge causing unwanted vertical purple line */}
-       <span className="bg-purple-500/20 ...">Deck: {name}</span>
-     </div>
-   </div>
-   <div className="flex items-center gap-1.5 shrink-0">
-     <span className="hidden xs:inline-flex ..."><Globe /> English</span>
-     <button ...><Settings /></button>
-     <button ...><QrCode /></button>
-     <button ...>{roomCode} <Share2 /></button>
-   </div>
- </div>

+ {/* 1. MOBILE TOOLBAR (< 768px: 3 Balanced Rows) */}
+ <div className="flex md:hidden flex-col gap-2.5 p-3 rounded-2xl bg-surface-elevated border border-white/10 shrink-0 backdrop-blur-md shadow-elevation-1">
+   {/* ROW 1: Back Navigation, Title & Status */}
+   <div className="flex items-center justify-between gap-2 min-w-0">
+     <div className="flex items-center gap-2 min-w-0">
+       <button ...><ArrowLeft /></button>
+       <h1 className="font-display font-extrabold text-sm xs:text-base tracking-wider uppercase text-white whitespace-nowrap min-w-0">
+         {dict.multiplayer.title}
+       </h1>
+     </div>
+     <div className="flex items-center gap-1.5 shrink-0">
+       <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 ...">● Lobby</span>
+       <span className="hidden xs:inline-block px-2 py-0.5 rounded-lg bg-purple-500/20 ...">{name}</span>
+     </div>
+   </div>
+
+   {/* ROW 2: Language, Settings, QR */}
+   <div className="flex items-center gap-2 pt-1 border-t border-white/5">
+     <button ...><Globe /> {flag} {nativeName}</button>
+     <button ...><Settings /></button>
+     <button ...><QrCode /></button>
+   </div>
+
+   {/* ROW 3: Room Code Card, Copy, Share */}
+   <div className="flex items-center gap-1.5 xs:gap-2 pt-1">
+     <div className="flex-1 ...">Room: <span className="font-mono font-black">{roomCode}</span></div>
+     <button ...><Copy /> Copy</button>
+     <button ...><Share2 /> Share</button>
+   </div>
+ </div>
+
+ {/* 2. DESKTOP TOOLBAR (>= 768px: Single Unified Row) */}
+ <div className="hidden md:flex items-center justify-between gap-3 p-3 rounded-2xl bg-surface-elevated border border-white/10 shrink-0 backdrop-blur-md shadow-elevation-1">
+   ...
+ </div>
```

---

## 5. Verification Checklist

- [x] **No overlapping controls:** Verified across all screen sizes.
- [x] **No unwanted vertical purple line:** Eradicated by separating status pills and eliminating clipping artifacts.
- [x] **No horizontal scroll:** Document scrollWidth strictly equals client width.
- [x] **No clipped room code:** 6-character monospace code is 100% visible on all viewports down to 320px.
- [x] **No broken title:** Title maintains `whitespace-nowrap` on a single line.
- [x] **Touch targets >= 36px:** All buttons satisfy WCAG touch accessibility guidelines.
- [x] **Desktop appearance preserved:** Desktop toolbar looks clean, unified, and professional.
