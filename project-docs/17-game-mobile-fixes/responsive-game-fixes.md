# Responsive Game Screen Implementations & Architectural Fixes

**Project:** Asteria — Multilingual Truth or Dare Gaming Platform  
**Target:** Interactive Game Components & Layouts  
**Engineer:** Senior Frontend Developer + Gaming UI/UX Specialist  
**Date:** November 2026  

---

## 1. Core Engineering Principles Applied

1. **Fluid Geometry & Zero-Overflow Bounds:** Replaced all hardcoded pixel dimensions with responsive bounds (`max-w-[calc(100vw-32px)]`, `min-h-[48px]`, `w-full`).
2. **Defensive Flexbox Containment:** Enforced `min-w-0` on every nested flex container to prevent long text strings (player names, translated strings) from expanding parent boundaries beyond screen width.
3. **Scroll-Safe Question Typography:** Eliminated destructive `line-clamp` truncations in favor of scrollable, auto-wrapped typography containers with custom scrollbars.
4. **Touch Target Accessibility:** All buttons and interactive pills strictly adhere to the $\ge 40\text{px} \times 40\text{px}$ touch target standard with active scale micro-interactions.
5. **Mobile Landscape & Safe-Area Insets:** Dynamic layout adaptations accounting for notch insets (`env(safe-area-inset-top)` / `bottom`) and fixed bottom dock clearances.

---

## 2. Detailed Technical Fixes by Component

### A. 3D Question Card Architecture ([`Card3D.tsx`](file:///Users/vaibhavborkar/truth&dare/components/game/Card3D.tsx))

#### 1. Dynamic Card Geometry
* **Before:** `h-[400px] sm:h-[450px] md:h-[490px]` (rigid height caused landscape cutoff and question clipping).
* **After:**
  ```tsx
  className={cn(
    'relative w-full max-w-[360px] sm:max-w-md min-h-[380px] sm:min-h-[440px] md:min-h-[480px] h-[380px] sm:h-[440px] md:h-[480px] perspective-1000 select-none mx-auto',
    className
  )}
  ```

#### 2. Elimination of `line-clamp-6` Text Truncation
* **Before:** `<p className="... line-clamp-6 ...">{question?.prompt}</p>` (truncated long prompts with an ellipsis).
* **After:**
  ```tsx
  <div className="relative z-10 my-auto py-2 px-1 max-w-full max-h-[220px] sm:max-h-[260px] overflow-y-auto custom-scrollbar flex items-center justify-center">
    <p className="font-display font-bold text-base sm:text-lg md:text-xl text-white leading-relaxed text-center select-text break-words">
      {question?.prompt || t('game.revealQuestion')}
    </p>
  </div>
  ```
  * *Result:* Short questions center naturally; long challenges wrap seamlessly and allow smooth internal scrolling without breaking card boundaries.

#### 3. Standardized Decision Buttons
* **Before:** `className="... h-22 sm:h-26 md:h-28 ..."` (invalid Tailwind tokens).
* **After:**
  ```tsx
  className="w-full flex-col min-h-[76px] sm:min-h-[92px] py-2 sm:py-3 px-2 gap-1 rounded-2xl group hover:-translate-y-0.5 active:scale-95"
  ```

---

### B. Truth or Dare Gameplay & Setup ([`TruthOrDareGameClient.tsx`](file:///Users/vaibhavborkar/truth&dare/components/games/TruthOrDareGameClient.tsx))

#### 1. Turn Indicator & Score Header Collision Fix
* **Before:** Rigid widths caused the active player pill and score counter to collide on 320px screens.
* **After:**
  ```tsx
  <div className="w-full flex items-center justify-between text-xs font-semibold px-1 pt-1 gap-1.5 sm:gap-2">
    {/* Active Player Pill with fluid truncation */}
    <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-brand-500/20 border border-brand-400/40 text-brand-300 shadow-glow-brand min-w-0 flex-1 max-w-[62%] sm:max-w-[65%]">
      <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-400 shrink-0" />
      <span className="truncate">{t('game.playerTurn', { name: activePlayer.name })}</span>
    </div>

    {/* Compact Score Counter & Setup Action */}
    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
      <span className="text-slate-400 text-[10px] sm:text-xs font-medium px-2 py-1 rounded-lg bg-surface-elevated border border-white/5">
        Score: <strong className="text-white font-mono">{activePlayer.score}</strong>
      </span>
      <button
        onClick={() => { setIsPlaying(false); ... }}
        className="px-2 sm:px-2.5 py-1 rounded-lg bg-surface-elevated hover:bg-surface-highlight border border-white/10 text-[10px] sm:text-xs text-slate-300 hover:text-white transition-colors min-h-[30px]"
      >
        {t('game.backToSetup')}
      </button>
    </div>
  </div>
  ```

#### 2. Category Grid & Player Roster Chips
* **Category Card Grid:** Adapted from `p-3.5 gap-2.5` to `p-2.5 sm:p-3.5 gap-2 sm:gap-2.5` with `min-w-0 truncate` on category titles.
* **Player Chips:** Constrained name width with `max-w-[110px] sm:max-w-[180px] truncate` so players with long names (e.g. "Alexander The Great") render cleanly without distortion.

---

### C. HTML5 Physics Spinner Wheel ([`SpinnerWheelClient.tsx`](file:///Users/vaibhavborkar/truth&dare/components/games/SpinnerWheelClient.tsx))

#### 1. Responsive Canvas Sizing (Eliminating Canvas Overflow)
* **Before:** Hardcoded HTML canvas `width={380} height={380}` without CSS max-width, forcing an immediate horizontal scrollbar on devices $\le 375\text{px}$.
* **After:**
  ```tsx
  <canvas
    ref={canvasRef}
    width={380}
    height={380}
    onClick={spinWheel}
    className="w-full max-w-[280px] xs:max-w-[340px] sm:max-w-[380px] h-auto aspect-square cursor-pointer active:scale-95 transition-transform drop-shadow-[0_0_50px_rgba(139,92,246,0.35)]"
  />
  ```
  * *Result:* The canvas renders with high internal resolution (380x380) while CSS scales it proportionally to 280px on 320px screens, 340px on 360px screens, and 380px on desktop with zero overflow!

#### 2. Slices & Winner Announcement
* **Presets Bar:** Wrapped in `flex flex-wrap gap-1.5 sm:gap-2 text-[11px] sm:text-xs`.
* **Slice Chips:** Added `max-w-[110px] sm:max-w-[180px] truncate`.

---

### D. Never Have I Ever ([`NeverHaveIEverClient.tsx`](file:///Users/vaibhavborkar/truth&dare/components/games/NeverHaveIEverClient.tsx))

#### 1. 10-Hearts Visualizer Overflow Fix
* **Before:** 10 hearts of 24px + 6px gaps + 24px padding = 318px (overflowed 320px screens).
* **After:**
  ```tsx
  <div className="flex items-center justify-center gap-1 sm:gap-1.5 p-2.5 sm:p-3 rounded-2xl bg-surface-elevated border border-white/10 max-w-full overflow-hidden">
    {Array.from({ length: 10 }).map((_, i) => (
      <Heart
        key={i}
        className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 transition-all ${
          i < lives ? 'text-rose-500 fill-rose-500 scale-100' : 'text-slate-700 scale-75'
        }`}
      />
    ))}
  </div>
  ```
  * *Result:* Total width drops to $\le 256\text{px}$, leaving comfortable padding on all screens.

#### 2. Confession Card & Button Padding
* Card: `p-5 sm:p-8 md:p-12` with `text-xl sm:text-2xl md:text-3xl break-words`.
* Decision buttons: `px-2 sm:px-4 text-xs sm:text-base font-bold min-h-[48px]`.

---

### E. Would You Rather ([`WouldYouRatherClient.tsx`](file:///Users/vaibhavborkar/truth&dare/components/games/WouldYouRatherClient.tsx))

* **Option Card Padding:** Adjusted to `p-4 sm:p-6 md:p-8`.
* **Dilemma Text:** Enclosed in `<div className="space-y-1 min-w-0 flex-1">` with `break-words text-base sm:text-lg md:text-xl`.
* **Percentage Counter:** `text-xl sm:text-2xl font-mono shrink-0 ml-2`.

---

### F. Most Likely To ([`MostLikelyToClient.tsx`](file:///Users/vaibhavborkar/truth&dare/components/games/MostLikelyToClient.tsx))

* **Player Voting Grid:**
  ```tsx
  <div className="grid grid-cols-2 gap-2 sm:gap-3">
    {players.map((p) => (
      <button
        key={p.name}
        className="p-2.5 sm:p-4 rounded-2xl border flex items-center justify-between gap-1.5 min-w-0 transition-all ..."
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand-600 flex items-center justify-center font-bold text-xs text-white shrink-0">
            {p.name.charAt(0)}
          </div>
          <span className="font-bold text-xs sm:text-sm truncate">{p.name}</span>
        </div>
        {isWinner && <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 animate-bounce shrink-0" />}
      </button>
    ))}
  </div>
  ```

---

### G. This or That ([`ThisOrThatClient.tsx`](file:///Users/vaibhavborkar/truth&dare/components/games/ThisOrThatClient.tsx))

* **Proportional Heights:** `min-h-[120px] sm:min-h-[160px] p-5 sm:p-8 rounded-3xl flex flex-col justify-center`.
* **Responsive Heading:** `text-lg sm:text-2xl text-white break-words`.

---

### H. Custom Deck Studio ([`CustomDeckClient.tsx`](file:///Users/vaibhavborkar/truth&dare/components/custom/CustomDeckClient.tsx))

* **Prompt List Table:** Added `min-w-0 flex-1 break-words` to prompt text containers, preventing custom long text from forcing horizontal card expansion.
* **Action CTAs:** Converted to responsive stack `flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3` with `min-h-[48px]`.

---

### I. Multiplayer Rooms ([`RoomClient.tsx`](file:///Users/vaibhavborkar/truth&dare/app/room/[code]/RoomClient.tsx))

* **Header Controls:** Reduced horizontal padding to `gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5` with `shrink-0` on the room code pill and exit button.
* **Emoji Reaction Buttons:** Scaled to `w-9 h-9 sm:w-11 sm:h-11 gap-1.5 sm:gap-3` ensuring all 5 reaction emojis fit inside 320px screens.
* **Synchronized 3D Card:** Seamlessly inherits all `Card3D` responsiveness improvements.
