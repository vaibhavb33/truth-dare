# Party Room Mobile Toolbar: Root Cause Analysis

**Project:** Asteria — Multiplayer Party Gaming Platform  
**Component:** `app/room/[code]/RoomClient.tsx` (Global Room Top Bar)  
**Author:** Senior Frontend Developer + Mobile UI/UX Engineer  
**Date:** 2026-11-10  
**Status:** **ROOT CAUSES DIAGNOSED & DOCUMENTED**  

---

## 1. Executive Summary

When viewed on mobile viewport widths (320px to 430px), the Party Room toolbar experienced severe layout degradation:
1. The title `"PARTY ROOM"` was crushed into a tiny vertical strip displaying only `"PAI\nRO"`.
2. The language selector (`English`), Settings gear, QR code button, and Room Code share button were squashed into a single overflowing row.
3. An unwanted vertical purple line artifact appeared adjacent to the broken title.
4. Controls collided and buttons were pushed against screen edges.

This document identifies the exact structural, CSS, and DOM root causes responsible for every defect observed in the reference screenshot (`IMG_5271.jpg`).

---

## 2. Component Inspection & DOM Hierarchy

The legacy toolbar was defined in `app/room/[code]/RoomClient.tsx` as a single horizontal flexbox container:

```tsx
{/* LEGACY IMPLEMENTATION */}
<div className="flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-2xl bg-surface-elevated border border-white/10 shrink-0 backdrop-blur-md">
  {/* Left: Navigation & Title Container */}
  <div className="flex items-center gap-2 min-w-0">
    {isJoined && (
      <button className="p-1.5 sm:p-2 rounded-xl bg-surface-highlight ... shrink-0">
        <ArrowLeft className="w-4 h-4" />
      </button>
    )}

    <div className="overflow-hidden">
      <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
        <span>{dict.multiplayer.title}</span>
        {isInGame && (
          <span className="px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 ...">
            Round {room.roundNumber}
          </span>
        )}
        {room?.customDeckSnapshot && (
          <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 ...">
            Deck: {room.customDeckSnapshot.name}
          </span>
        )}
      </span>
    </div>
  </div>

  {/* Right: Action Buttons Cluster */}
  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
    <span className="hidden xs:inline-flex items-center gap-1 px-2 ... bg-surface-highlight">
      <Globe className="w-3.5 h-3.5 text-brand-400" />
      <span>{roomLangMeta.flag} {roomLangMeta.nativeName}</span>
    </span>

    {isHost && isLobby && (
      <button className="p-2 rounded-xl bg-surface-elevated min-h-[36px] min-w-[36px] ...">
        <Settings className="w-4 h-4" />
      </button>
    )}

    <button className="p-2 rounded-xl bg-surface-elevated min-h-[36px] min-w-[36px] ...">
      <QrCode className="w-4 h-4" />
    </button>

    <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl ... min-h-[36px]">
      <span>{roomCode}</span>
      <Share2 className="w-3.5 h-3.5" />
    </button>
  </div>
</div>
```

---

## 3. Detailed Root Cause Breakdown

### Issue 1: Party Room Title Squeezed & Broken into Multiple Lines (`"PAI\nRO"`)
- **Available Width Math on Mobile (375px Device):**
  - Viewport width: `375px`
  - Container padding: `px-3` (24px total)
  - Toolbar padding: `p-2.5` (20px total)
  - **Net available inner width: ~331px**
- **Right-Side Control Cluster Consumption:**
  - Language badge (`Globe + Flag + English`): **~90px**
  - Settings button: **36px**
  - QR Code button: **36px**
  - Room Code share button (`Room Code + Share Icon`): **~95px**
  - Inter-element flex gaps: **~15px**
  - **Total Right Cluster Width: ~272px (fixed via `shrink-0`)**
- **Residual Width for Left Side:**
  - Residual space: `331px - 272px = 59px`
  - Back button (`ArrowLeft`) consumes **36px**
  - Gap consumes **8px**
  - **Usable width for Title: ONLY ~15px to 25px!**
- **CSS Wrapping Defect:**
  - `<span>{dict.multiplayer.title}</span>` lacked `whitespace-nowrap`.
  - The browser had no choice but to break words letter by letter vertically into `"PAI"` on line 1 and `"RO"` on line 2, with the remaining characters clipped off by `overflow-hidden`.

---

### Issue 2: Origin of the Unwanted Vertical Purple Line
- **Investigation:**
  - In `RoomClient.tsx`, right after `<span>{dict.multiplayer.title}</span>`, the template rendered:
    ```tsx
    {room?.customDeckSnapshot && (
      <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold">
        Deck: {room.customDeckSnapshot.name}
      </span>
    )}
    ```
    or in-game:
    ```tsx
    {isInGame && (
      <span className="px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 text-[10px] font-mono font-bold">
        Round {room.roundNumber}
      </span>
    )}
    ```
  - Both badges utilize a purple/indigo tinted background (`bg-purple-500/20` or `bg-brand-500/20`).
  - Because the parent `overflow-hidden` container was forcibly compressed down to ~25px, the badge immediately adjacent to the text was clipped.
  - The leftmost **1px to 2px border and background edge** of the purple badge was rendered right against the bounding clipping edge.
  - **Visual Result:** To the human eye, this 1px to 2px clipped purple border appeared exactly as an **unwanted vertical purple line** running down the header.

---

### Issue 3: Language Selector Overlap & Breakpoint Collision
- The language badge had classes: `hidden xs:inline-flex`.
- In `tailwind.config.js`, `xs` is defined as `360px`.
- Consequently, on almost all modern smartphones (360px Galaxy, 375px iPhone, 390px iPhone 14, 414px iPhone XR, 430px iPhone 15 Pro Max), the language badge was forced into the right cluster without enough available horizontal space, compressing all adjacent buttons.

---

### Issue 4: Room Code and Share Controls Squeezed
- The room code was bundled inside the share button (`<span>{roomCode}</span>` + `<Share2>`).
- When compressed by sibling buttons, the font-mono room code was either truncated or encroached upon by icon padding.
- Users lacked separate, clear affordances for copying the room link versus sharing via the Web Share API.

---

### Issue 5: Lack of Responsive Toolbar Adaptation
- A single horizontal row cannot comfortably house 6 distinct action buttons and text badges on a 320px–430px screen while meeting touch target standards (minimum 36px to 48px).
- The desktop layout was simply forced onto mobile without an adaptive multi-row layout pattern.

---

## 4. Root Cause Summary Table

| Defect | Source Code Location | Exact Technical Root Cause |
|---|---|---|
| **Squeezed Title** | `RoomClient.tsx:559` | Parent flexbox allocated < 30px due to right-side `shrink-0` controls taking 272px. |
| **Multi-Line Text Wrap** | `RoomClient.tsx:561` | Lack of `whitespace-nowrap` on `{dict.multiplayer.title}` inside flexible container. |
| **Vertical Purple Line** | `RoomClient.tsx:567-571` | `bg-purple-500/20` badge clipped at 2px width by `overflow-hidden`. |
| **Language Badge Collision** | `RoomClient.tsx:579` | `xs:inline-flex` activates at 360px, injecting a 90px element into an overcrowded row. |
| **Squeezed Room Code** | `RoomClient.tsx:607-611` | Combined room code + share button lacked dedicated width and clear copy separation. |
| **Mobile Width Failure** | `RoomClient.tsx:547` | Absence of dedicated multi-row mobile layout below 768px (`md`). |
