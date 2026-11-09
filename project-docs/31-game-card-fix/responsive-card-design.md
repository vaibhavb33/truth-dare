# Asteria Truth & Dare Game Card: Responsive Design Specification

**Document Version:** 1.0.0  
**Audit Date:** November 9, 2026  
**Auditor:** Senior Mobile UI/UX Designer + Frontend Developer  
**Subsystem:** 3D Responsive Gaming Card Architecture  
**Status:** **ACTIVE & PRODUCTION VERIFIED**

---

## 1. Design Overview & Philosophy

The redesigned Asteria Truth and Dare game card elevates the core gameplay interaction from an overcrowded mobile card into a sleek, console-grade gaming tile. 

```text
+-------------------------------------------------------------+
|                      [ ?  🔥 ]                               | <-- Compact Emblem (40px)
|                   Truth or Dare                             | <-- Fluid Heading
|      Pick your challenge to reveal the question             | <-- Unclipped Instruction
|                                                             |
|  +-------------------------+   +-------------------------+  |
|  |       [ ? ] TRUTH       |   |       [ 🔥 ] DARE       |  | <-- Symmetrical Decision Tiles
|  |     Answer honestly,    |   |  Complete the challenge |  |     (Flexible height,
|  |      no secrets held    |   |   or face the penalty   |  |      identical dimensions)
|  +-------------------------+   +-------------------------+  |
|  ---------------------------------------------------------  |
|  [ 🔊 Listen to Truth ]        [ 🔊 Listen to Dare ]        | <-- Dedicated Voice Bar
+-------------------------------------------------------------+
```

---

## 2. Card Hierarchy & Structure

The front face of the 3D card implements a strict 5-tier vertical hierarchy:

```mermaid
flowchart TD
    Card["Card Container (h-[375px...410px])"]
    T1["1. Game Icon Emblem (HelpCircle + Flame in Glass Tile)"]
    T2["2. Truth or Dare Heading (Fluid Typography)"]
    T3["3. Short Instruction (Clean line-height, no overlap)"]
    T4["4. Symmetrical Choice Buttons (CSS Grid, items-stretch)"]
    T5["5. Dedicated Voice Controls Bar (border-t border-white/10)"]

    Card --> T1
    Card --> T2
    Card --> T3
    Card --> T4
    Card --> T5
```

### 2.1. Tier 1: Game Icon & Emblem
- **Dimensions:** 36px $\times$ 36px (320px mobile) to 44px $\times$ 44px (desktop).
- **Styling:** Glassmorphism container with `bg-gradient-to-tr from-brand-600/30 to-surface-highlight border border-brand-400/30 rounded-2xl shadow-glow-brand`.
- **Icons:** Overlapping `HelpCircle` (cyan `#22D3EE`) and `Flame` (coral `#FB7185`) with ambient drop shadows.

### 2.2. Tier 2: Truth or Dare Heading
- **Typography:** `font-display font-extrabold text-base xs:text-lg sm:text-xl text-white tracking-tight leading-tight`.
- **Internationalization:** Adapts to localized titles (`t('home.heroTitle')`).

### 2.3. Tier 3: Short Instruction
- **Typography:** `text-[11px] xs:text-xs sm:text-sm text-slate-300 leading-normal max-w-[270px] sm:max-w-xs mx-auto`.
- **Spacing:** Managed with `my-auto` without colliding with Tier 4 buttons below.

### 2.4. Tier 4: Truth & Dare Selection Buttons
Both buttons are placed inside a balanced CSS Grid:
```tsx
<div className="relative z-10 w-full grid grid-cols-2 gap-2 xs:gap-2.5 sm:gap-3 items-stretch shrink-0">
```

| Parameter | Truth Button | Dare Button |
| :--- | :--- | :--- |
| **Theme / Gradient** | Cyan / Turquoise: `from-truth-500 via-cyan-500 to-truth-700` | Coral / Pink-Red: `from-dare-500 via-rose-500 to-dare-700` |
| **Glow / Shadow** | `shadow-glow-truth` (Cyan aura) | `shadow-glow-dare` (Rose aura) |
| **Icon** | `HelpCircle` in `w-5 h-5` rounded glass badge | `Flame` in `w-5 h-5` rounded glass badge |
| **Label** | `t('game.truth')` (uppercase, `leading-none`) | `t('game.dare')` (uppercase, `leading-none`) |
| **Description** | `t('game.truthSub')` (`text-[10px] leading-snug break-words`) | `t('game.dareSub')` (`text-[10px] leading-snug break-words`) |
| **Height Invariant** | Flexible `min-h-[76px] sm:min-h-[82px] h-full` | Flexible `min-h-[76px] sm:min-h-[82px] h-full` |
| **Touch Target** | $> 76$px height $\times > 130$px width (Exceeds 48px standard) | $> 76$px height $\times > 130$px width (Exceeds 48px standard) |

### 2.5. Tier 5: Dedicated Voice Controls Bar
- **Positioning:** Full-width bottom bar separated by `pt-1.5 sm:pt-2 mt-auto border-t border-white/10`.
- **Layout:** Flex row with two balanced buttons (`flex-1 min-w-0 min-h-[36px]`).
- **Truth Voice:** `bg-truth-500/10 hover:bg-truth-500/20 text-truth-300 border border-truth-400/25`.
- **Dare Voice:** `bg-dare-500/10 hover:bg-dare-500/20 text-dare-300 border border-dare-400/25`.
- **Icons:** Compact `Volume2` (`w-3.5 h-3.5`).
- **Text:** Full unclipped translation (`t('voice.listenTruth')`, `t('voice.listenDare')`).

---

## 3. Responsive Breakpoint Matrix

| Viewport Category | Width $\times$ Height | Card Width | Card Height | Layout Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **Ultra-Narrow Mobile** | `320px x 600px` | `300px` | `375px` | Compact `p-3`, 36px emblem, 87px button height, zero text clipping. |
| **Standard Mobile** | `360px x 740px` | `340px` | `385px` | `p-3.5`, 40px emblem, 95px button height, balanced 2-column grid. |
| **iPhone SE / Mini** | `375px x 667px` | `355px` | `385px` | `p-3.5`, comfortable margins, 80px button height, instant touch feedback. |
| **Modern Flagship** | `390px x 844px` | `360px` | `385px` | Optimal proportion, generous breathing room. |
| **Large Mobile (Max/Plus)**| `414px - 430px` | `360px` | `385px` | Centered thumb-zone positioning, zero stretching. |
| **Tablet Portrait** | `768px x 1024px` | `440px` | `410px` | Desktop card profile, 84px button height, crisp glass borders. |
| **Desktop Laptop** | `1024px x 768px` | `440px` | `410px` | Eliminates old 480px empty space, zero horizontal overflow. |
| **Desktop Full HD** | `1440px x 900px` | `440px` | `410px` | High-DPI anti-aliased gradients, 3D spring hover physics. |

---

## 4. Multilingual & RTL Typography Specifications

### 4.1. Hindi (Devanagari)
- **Font Stack:** `'Noto Sans Devanagari', 'Inter', sans-serif`
- **Line Height:** Enforced `leading-snug` or `leading-normal` (1.375 multiplier) to preserve matras (`ी`, `ु`, `े`, `ै`, `ं`) without clipping.
- **Labels:** `सच (Truth)` and `हिम्मत (Dare)` render legibly without word truncation.

### 4.2. German
- **Handling Long Compound Nouns:**
  - `Wahrheit vorlesen` (17 chars) and `Pflicht vorlesen` (16 chars) fit inside the voice bar with `text-[11px]`.
  - `truthSub` (`Antworte ehrlich und ohne Geheimnisse`) wraps cleanly across 2 lines within the flexible button container.

### 4.3. Arabic (RTL)
- **Font Stack:** `'Cairo', sans-serif`
- **Direction:** Automatic `dir="rtl"` inheritance flips flex order, placing Truth on the right and Dare on the left according to natural reading flow.
- **Diacritics:** Fully preserved with comfortable line-height.
