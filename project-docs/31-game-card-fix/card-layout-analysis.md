# Asteria Truth & Dare Game Card: Layout Defect Root Cause Analysis

**Document Version:** 1.0.0  
**Audit Date:** November 9, 2026  
**Auditor:** Senior Mobile UI/UX Designer + Frontend Developer  
**Subsystem:** Truth or Dare 3D Choice Arena (`components/game/Card3D.tsx`)  
**Status:** **RESOLVED & EMPIRICALLY VALIDATED**

---

## 1. Executive Summary & Defect Reference

The Truth and Dare game card presented several critical visual and interactive bugs identified in the reference screenshot (blue marked area):
1. **Text Hidden Under Buttons:** The central game instructions and subheadings overlapped and collided directly with the Truth and Dare buttons on mobile viewports.
2. **Button Descriptions Clipped:** Subtitle texts (`truthSub` and `dareSub`) were forcibly clipped with ellipsis (`...`) due to rigid `truncate` styling inside button spans.
3. **Card Too Tall:** On desktop and tablet viewports, an inflexible height constraint (`md:h-[480px]`) created 100px+ of dead empty vertical space.
4. **Question Selection Layout Unbalanced:** Decision buttons had uneven heights, inconsistent internal padding, and distorted touch boundaries.
5. **Hindi & Multilingual Rendering Issues:** Devanagari script matras (ascenders `ी`, `े`, `ै` and descenders `ु`, `ू`, `ृ`) suffered vertical clipping due to rigid `leading-none` and `leading-tight` line-height properties.
6. **Voice Controls Misplaced:** Small "Listen to Truth" and "Listen to Dare" buttons were cramped directly underneath each individual choice button, crowding the touch targets and causing severe text truncation.

---

## 2. Deep Root Cause Analysis

### 2.1. Root Cause A: Viewport Height Squeeze & Vertical Overlap
In the legacy implementation of `components/game/Card3D.tsx`, the card container was defined as:
```tsx
// DEFECTIVE IMPLEMENTATION:
className={cn(
  'relative w-full max-w-[340px] xs:max-w-[360px] sm:max-w-[420px] md:max-w-[460px] min-h-[290px] sm:min-h-[360px] md:min-h-[420px] h-[min(48dvh,400px)] sm:h-[min(52dvh,460px)] md:h-[480px] perspective-1000 select-none mx-auto',
  className
)}
```
- On compact mobile viewports (e.g., iPhone SE at 320x568px or 375x667px), `min(48dvh, 400px)` resolved to only **272px to 320px**.
- The children inside the front face (top emblem, badge, title, subtitle, two tall decision buttons, and two voice buttons) required at least **330px to 350px** of vertical space.
- Because `card-face-front` was an `absolute inset-0` flex container with `justify-between`, the bottom buttons were pushed upward directly over the central instruction text, rendering the text invisible or hidden beneath the buttons.

### 2.2. Root Cause B: Forcible Text Clipping via `truncate`
Inside `Button.tsx` and `Card3D.tsx`, button subtitles were styled with:
```tsx
// DEFECTIVE IMPLEMENTATION:
<span className="text-[8px] sm:text-[10px] font-medium text-truth-100/90 truncate max-w-full leading-tight">
  {t('game.truthSub')}
</span>
```
- In CSS, `truncate` applies:
  ```css
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  ```
- Subtitle strings such as:
  - English: `"Answer honestly, no secrets held"` (34 chars)
  - Hindi: `"ईमानदारी से जवाब दें, कोई रहस्य न छिपाएं"` (40 chars)
  - German: `"Antworte ehrlich und ohne Geheimnisse"` (37 chars)
- In a two-column mobile layout where each button width is ~130px, fitting 34–40 characters on a single line is mathematically impossible. The strings were truncated after 12–15 characters into unreadable fragments like `"ईमानदारी से ज..."` or `"Antworte eh..."`.

### 2.3. Root Cause C: Misplaced Voice Buttons in Vertical Button Stacks
The legacy layout nested voice buttons into the vertical flex stack of each choice column:
```tsx
// DEFECTIVE NESTED VOICE CONTROLS:
<div className="flex flex-col gap-1 w-full">
  <Button variant="truth" size="lg" ...>
    ...
  </Button>
  {onListenType && (
    <button className="inline-flex items-center justify-center gap-1 py-1 px-1.5 ...">
      <Volume2 className="w-3 h-3 text-truth-400 shrink-0" />
      <span className="truncate">{t('voice.listenTruth')}</span>
    </button>
  )}
</div>
```
- Squeezing the voice button beneath the main button inside the column forced the column height to expand unevenly, while adding another `truncate` span that cut off `"Listen to Truth"` in German (`"Wahrheit vorlesen"`) and Hindi (`"सच (Truth) सुनें"`).
- It also increased accidental tap risk between the selection action and the speech playback trigger.

### 2.4. Root Cause D: Devanagari Ascender/Descender Clipping
Devanagari characters used in Hindi require a line-height multiplier of at least `1.3` to `1.4` (`leading-snug` or `leading-normal`). The use of `leading-none` and `leading-tight` on uppercase labels clipped vowel signs like `ी` and `े` at the upper edge and `ु` and `ू` at the bottom edge.

---

## 3. Remediation Strategy

1. **Compact, Proportional Card Geometry:**
   - Unified card height: `h-[375px] xs:h-[385px] sm:h-[400px] md:h-[410px]`.
   - Prevents the vertical collapse on mobile while eliminating the 480px excessive dead whitespace on desktop.
2. **Dedicated 5-Tier Component Architecture:**
   - Tier 1: Compact Emblem (40px)
   - Tier 2: Game Title (`font-display font-extrabold`)
   - Tier 3: Concise Instruction (`leading-normal`)
   - Tier 4: Symmetrical Decision Buttons (`grid grid-cols-2 items-stretch`)
   - Tier 5: Dedicated Bottom Voice Bar (`border-t border-white/10`)
3. **Elimination of Text Truncation:**
   - Replaced `truncate` with `break-words text-wrap leading-snug`.
   - Allowed multi-line text wrapping within flexible `min-h-[76px] sm:min-h-[82px]` buttons.
4. **Independent Voice Control Bar:**
   - Relocated voice buttons to a full-width bottom bar below the decision tiles.
   - Distinct, accessible touch targets ($\ge 36$px) with `Volume2` icons.
