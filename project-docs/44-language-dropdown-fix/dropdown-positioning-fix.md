# Global Language Dropdown: Positioning & Visual Architecture Fix

**Project:** Asteria — Multiplayer Party Gaming Platform  
**Modified Files:**  
- `components/i18n/LanguageSelector.tsx`  
- `lib/i18n/LanguageContext.tsx`  
**Author:** Senior React Developer + UI/UX Engineer  
**Date:** 2026-11-11  
**Status:** **IMPLEMENTED & EMPIRICALLY VERIFIED**

---

## 1. Architecture Overview

To completely decouple the language dropdown from parent stacking contexts, eliminate transparency bleed-through, and guarantee pixel-accurate viewport clamping from `320px` to `1440px`, `LanguageSelector.tsx` was rebuilt around three architectural pillars:

1. **React Portal Isolation (`createPortal` to `document.body`)**
2. **Coordinate-Clamped Fixed Anchoring (`getBoundingClientRect` + Resize/Scroll Sync)**
3. **100% Opaque Surface Elevation & Standalone Menu Visual System**

---

## 2. React Portal & Stacking Context Resolution

### Previous Problem
The dropdown rendered directly inside `AppHeader`'s sticky element (`z-40 backdrop-blur-xl`), making it subject to header compositing rules and background bleed.

### Fix Applied
When `mounted && isDropdownOpen`, both a mobile dim backdrop and the floating listbox are portaled directly to `document.body`:
```tsx
createPortal(
  <>
    {/* Mobile backdrop for clean separation and touch dismiss */}
    <div
      className="fixed inset-0 z-[95] bg-black/50 backdrop-blur-[1px] sm:hidden transition-opacity duration-200"
      onClick={() => setIsDropdownOpen(false)}
      aria-hidden="true"
    />
    {/* Standalone Dropdown Menu Container */}
    <div
      ref={dropdownMenuRef}
      id="language-selector-dropdown"
      role="listbox"
      style={dropdownStyle}
      className="fixed z-[100] rounded-2xl bg-[#0D0D1E] border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.95),0_0_25px_rgba(139,92,246,0.2)] flex flex-col overflow-hidden"
    >
      ...
    </div>
  </>,
  document.body
)
```
This guarantees zero stacking traps across every page (`AppHeader`, `AppFooter`, `TruthOrDareGameClient`, and `RoomClient`).

---

## 3. Dynamic Viewport-Clamped Positioning Logic

`updatePosition()` runs on open, window `resize`, and capturing `scroll` events:

```ts
const rect = buttonRef.current.getBoundingClientRect();
const viewportWidth = window.innerWidth;
const viewportHeight = window.innerHeight;

// Width constraint: min(312px, calc(100vw - 24px)) for standard triggers
const menuWidth = isGameSetup
  ? Math.min(Math.max(rect.width, 280), Math.min(360, viewportWidth - 24))
  : Math.min(312, viewportWidth - 24);

const maxHeight = Math.min(440, viewportHeight * 0.6);

// Vertical flip check: prefers placing below button, flips above if near viewport bottom
const spaceBelow = viewportHeight - rect.bottom;
const spaceAbove = rect.top;
const placeBelow = spaceBelow >= 260 || spaceBelow >= spaceAbove;
```

### Horizontal Anchoring Strategy (LTR vs RTL)
- **LTR Mode:**
  - If aligning the menu's right edge with the button's right edge keeps `left >= 12px` (`rect.right - menuWidth >= 12`), set `right = Math.max(12, viewportWidth - rect.right)`.
  - On narrow mobile viewports where aligning strictly to the trigger's right edge would cross the left margin, anchor `right = '12px'` so the menu sits cleanly beneath the top-right utility cluster (`[Flag] [Mute] [Menu]`) with symmetrical viewport framing.
- **RTL Mode (`dir="rtl"`):**
  - If `rect.left + menuWidth <= viewportWidth - 12`, align `left = Math.max(12, rect.left)`.
  - Otherwise, anchor `left = '12px'` flush with the RTL utility edge.

---

## 4. Solid Opaque Surface & Standalone UI Contrast

1. **Zero Ghosting Guarantee:**
   - Removed `bg-[#0F0F23]/98` and `backdrop-blur-xl` from the listbox itself.
   - Applied both Tailwind `bg-[#0D0D1E]` and explicit inline `backgroundColor: '#0D0D1E'` (`rgb(13, 13, 30)`, `opacity: 1`).
2. **Clear Selected State Identification:**
   - Selected item receives `bg-brand-500/25 border border-brand-400 text-white font-bold shadow-[0_0_12px_rgba(139,92,246,0.35)]`.
   - Renders an illuminated **`Active`** badge alongside a crisp bold checkmark (`stroke-[3]`).
   - Automatically calls `activeOptionRef.current?.scrollIntoView({ block: 'nearest' })` on open so active items lower in the list (e.g., Arabic, German) appear immediately in view.
3. **Typography & Compact Mobile Density:**
   - Compact `min-h-[40px]` rows allow ~6+ languages to display simultaneously without scrolling on typical mobile screens, bounded strictly by `maxHeight <= 60vh`.
   - Clear header (`Change Language` / `Interface Language`, `8 Langs` counter, mobile `X` button) and footer (`Full Language Modal →` + explicit note explaining that Party Room question language is configured separately inside the room).

---

## 5. In-Place Translation Guard for Party Rooms (`LanguageContext.tsx`)

Prevented 404 crashes when switching global interface language inside `/room/[code]`:
```ts
if (
  targetSubpath.startsWith('/room') ||
  targetSubpath.startsWith('/offline') ||
  targetSubpath.startsWith('/admin')
) {
  return;
}
```
State, cookies (`NEXT_LOCALE`), `localStorage`, `<html lang>`, and `<html dir="rtl"|"ltr">` update live in-place without disrupting the active WebSocket/polling session or leaving `/room/[code]`.
