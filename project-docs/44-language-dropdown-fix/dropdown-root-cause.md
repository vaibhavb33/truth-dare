# Global Language Dropdown: Root Cause Analysis

**Project:** Asteria — Multiplayer Party Gaming Platform  
**Components:**  
- `components/i18n/LanguageSelector.tsx`  
- `components/layout/AppHeader.tsx`  
- `lib/i18n/LanguageContext.tsx`  
**Reference Defect:** `IMG_5272.jpg` (Mobile Language Dropdown in Party Room)  
**Author:** Senior React Developer + UI/UX Engineer  
**Date:** 2026-11-11  
**Status:** **ROOT CAUSES IDENTIFIED & RESOLVED**

---

## 1. Executive Summary

On mobile viewports (`320px` – `430px`), opening the Global Language Selector in the top header while inside a Party Room produced critical layout, visual, and functional failures:

1. **Background Bleed-Through & Text Ghosting:** Underlying Party Room headings, badges, and buttons visibly bled through the open dropdown surface.
2. **Stacking Context Entrapment:** Rendering the dropdown inside `<header className="sticky top-0 z-40 ... backdrop-blur-xl">` trapped its stacking context within the header and allowed conflicts with underlying backdrop layers.
3. **Unclamped Positioning & Overflow:** Using `absolute top-full right-0 w-64` without viewport edge clamping risked clipping on narrow viewports (`320px`) and overflowed in RTL mode (`left-0`).
4. **Oversized Touch Containers / Poor Density:** Item rows lacked refined vertical density and scrolled awkwardly without auto-focusing the active item.
5. **Unclear Selected Language State:** Active selection relied on a subtle translucent purple tint without a bold badge or clear indicator.
6. **Critical Routing Bug (404 Inside Party Room):** Switching language while on `/room/[code]` unconditionally triggered `router.push('/hi/room/[code]')`, causing a 404 Page Not Found because `/room/[code]` does not exist under `[locale]`.

---

## 2. Detailed Root Cause Breakdown

### 2.1 Background Transparency & Text Ghosting
In `components/i18n/LanguageSelector.tsx` (prior implementation):
```tsx
className="... bg-[#0F0F23]/98 backdrop-blur-xl border border-white/15 ..."
```
- The Tailwind opacity modifier `/98` compiled to `rgba(15, 15, 35, 0.98)`.
- Combined with `backdrop-blur-xl` over high-contrast glowing elements (`PARTY ROOM`, `Start Game →`, share badges) inside `RoomClient.tsx`, mobile compositors rendered underlying text as ghostly smudges through the dropdown background.
- Because text inside the dropdown (`English`, `हिन्दी`, `العربية`) sat directly over blurred background headings, language names appeared to overlap with Party Room UI text.

### 2.2 Parent Stacking Context & Clipping Trap
In `components/layout/AppHeader.tsx`:
```tsx
<header className="sticky top-0 z-40 w-full h-16 bg-[#0A0A16]/85 backdrop-blur-xl border-b border-white/10 ...">
  ...
  <LanguageSelector variant="header" />
</header>
```
- A `sticky` header with `backdrop-blur-xl` creates an isolated CSS **stacking context**.
- Placing a `position: absolute` menu inside the header meant the dropdown could never truly escape the header's compositing boundary, rendering it vulnerable to clipping or z-index inversion against other transformed containers in the viewport.

### 2.3 Naive CSS Positioning & RTL Edge Overflow
Previously:
```tsx
variant === 'header'
  ? isRTL
    ? 'left-0 sm:left-auto sm:right-0 w-64'
    : 'right-0 w-64'
  : 'left-0 right-0 sm:right-auto sm:w-72'
```
- In LTR mobile (`AppHeader`), the language trigger sits to the left of the Mute and Hamburger Menu buttons (`~104px` from the right edge of the viewport).
- A fixed `w-64` (`256px`) dropdown positioned `right-0` relative to that trigger extended past `320px` viewport bounds or crowded the left screen margin asymmetrically.
- Furthermore, there was no mobile backdrop overlay (`inset-0 bg-black/50`) to isolate focus from the underlying Party Room UI or allow instant outside tap dismissal without triggering buttons behind the menu.

### 2.4 Critical Discovery During Testing: 404 Navigation on Non-Localized Routes
During visual screenshot verification of `hindi_party_room_view.png`, switching interface language inside `/room/[code]` navigated the browser to `/hi/room/[code]`:
- In `lib/i18n/LanguageContext.tsx`, `setLocale` unconditionally prefixed `pathname` with `/${newLocale}` and called `router.push(nextUrl)`.
- However, dynamic routes like `/room/[code]` and `/offline` are excluded in `middleware.ts` (`matcher: ['/((?!_next|api|admin|room|.*\\..*).*)']`) and exist only at root `/room/[code]`.
- Therefore, selecting a language in the header dropdown inside a Party Room crashed the session into a **404 Page Not Found** screen!

---

## 3. Summary Matrix

| Bug ID | Symptom (`IMG_5272.jpg` & Regression) | Technical Root Cause | Resolution |
| :--- | :--- | :--- | :--- |
| **RC-1** | Background content visible through menu | `bg-[#0F0F23]/98 backdrop-blur-xl` translucent rgba + blur | Replaced with 100% solid opaque `#0D0D1E` (`opacity: 1`) |
| **RC-2** | Overlaps Party Room / traps z-index | Inline `absolute` menu trapped inside sticky `backdrop-blur` `<header>` | Portaled menu to `document.body` (`createPortal`) + mobile dim backdrop |
| **RC-3** | Misaligned / oversized on narrow phones | Static `w-64` without viewport clamping or vertical space check | Dynamic `fixed` calculation capped at `min(312px, calc(100vw - 24px))` and `60vh` |
| **RC-4** | Selected language difficult to spot | Faint background tint without badge or scroll-into-view | Added solid brand highlight border, `Active` pill, bold check icon, & auto-scroll |
| **RC-5** | Switching language inside Party Room throws 404 | `LanguageContext.setLocale` pushed `/[locale]/room/[code]` | Skipped URL prefix navigation on `/room`, `/offline`, and `/admin` routes |
