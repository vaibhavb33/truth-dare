# Asteria Typography & Multilingual Font Rendering Report (Task 23)

## 1. Executive Summary & Design System Foundations
Typography is the primary medium of party game interaction in Asteria. A game prompt must be instantly readable under dim party lighting, across varying viewing distances, and in different linguistic scripts (Latin, Devanagari, Arabic).

This report details the fluid clamp mathematics, multilingual font stack, line-height geometries, and character collision mitigations implemented in Task 23.

---

## 2. Font Stack Specification

| Font Family | Usage | Weights | Fallback Hierarchy |
| :--- | :--- | :--- | :--- |
| **Plus Jakarta Sans** | Display Headings, Hero titles, Game Titles, Card Headers | 600, 700, 800 | `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` |
| **Inter** | Body prose, UI navigation, button labels, settings controls | 400, 500, 600, 700 | `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` |
| **Noto Sans Devanagari** | Hindi prompts, native language modal labels, Hindi game rules | 500, 700, 800 | `'Inter', system-ui, sans-serif` |
| **Cairo** | Arabic prompts, RTL game interface, Arabic modal labels | 500, 700, 800 | `'Inter', system-ui, sans-serif` |
| **JetBrains Mono** | Turn timers, countdown digits, score badges, room codes | 500, 700 | `'Courier New', monospace` |

---

## 3. Fluid Typography Clamp Formats

To ensure that text scales harmoniously from a 320px screen up to a 1920px 4K monitor without breakpoint jitter or wrapping collisions, fluid typography uses CSS `clamp()` functions:

### A. Fluid Hero Heading (`.heading-fluid-hero`)
Used for page titles like "Pass & Play Setup", "Custom Deck Studio", and "All Online Party Games":
```css
.heading-fluid-hero {
  /* Min: 1.75rem (28px) at 320px viewport
     Scaling: 5vw + 0.5rem (scales proportionally with screen width)
     Max: 3.25rem (52px) at 1440px+ viewport */
  font-size: clamp(1.75rem, 5vw + 0.5rem, 3.25rem);
  line-height: 1.15;
}
```

### B. Fluid Section Heading (`.heading-fluid-section`)
Used for modal titles, category headers, and leaderboard titles:
```css
.heading-fluid-section {
  /* Min: 1.35rem (21.6px)
     Max: 2.25rem (36px) */
  font-size: clamp(1.35rem, 3.5vw + 0.25rem, 2.25rem);
  line-height: 1.2;
}
```

### C. Fluid 3D Card Challenge Text (`.text-fluid-card`)
Used inside `Card3D.tsx` for active Truth and Dare statements:
```css
.text-fluid-card {
  /* Min: 0.95rem (15.2px) on 320px mobile
     Scaling: 2.8vw + 0.15rem
     Max: 1.35rem (21.6px) on desktop */
  font-size: clamp(0.95rem, 2.8vw + 0.15rem, 1.35rem);
  line-height: 1.5;
}
```

---

## 4. Devanagari & Arabic Script Rendering Solutions

### The Devanagari Matra Clipping Problem
In Hindi typography, vowel signs (*matras*) extend significantly above and below the baseline (e.g., `ि` [chhoti ee ki matra], `ी` [badi ee ki matra], `ु` [chhota u], `ू` [bada u], `े`, `ै`, `्` [halant]):
- **Previous Defect:** With standard Latin `line-height: 1.25` or `leading-tight`, upper matras in words like `हिन्दी` collided with elements above, and lower matras were clipped by card bounding boxes.
- **Implemented Fix:**
  In `app/globals.css`, explicit rules guarantee a line-height of 1.6 whenever Hindi is rendered:
  ```css
  [lang="hi"], .font-hindi {
    font-family: var(--font-hindi), var(--font-body);
    line-height: 1.6;
  }
  ```

### The Arabic Diacritics & RTL Solution
Arabic script requires connected cursive glyphs and vertical diacritics (*harakat* like *fathah*, *kasrah*, *dammah*):
- **Previous Defect:** Standard sans-serif caused disconnected glyph rendering on some Android WebViews and lacked vertical clearance.
- **Implemented Fix:**
  Applied `Cairo` font family with 1.6 line-height and automatic `dir="rtl"` alignment:
  ```css
  [lang="ar"], [dir="rtl"], .font-arabic {
    font-family: var(--font-arabic), var(--font-body);
    line-height: 1.6;
  }
  ```

---

## 5. Line-Height & Ellipsis Hierarchy in Components

| Component | Text Role | Font Family | Size | Line Height | Overflow Handling |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `AppHeader.tsx` | Brand Logo | Plus Jakarta Sans | 18px / 20px | 1.1 | Fixed height, flex align |
| `LanguageModal.tsx` | Native Language Name | Devanagari / Cairo / Inter | 12px / 13px | 1.6 (`leading-relaxed`) | Single column on mobile, `truncate` with `min-w-0` |
| `Card3D.tsx` (Front) | Choice Titles ("Truth" / "Dare") | Plus Jakarta Sans | 16px / 18px | 1.0 (`leading-none`) | Centered button icon + bold text |
| `Card3D.tsx` (Back) | Prompt Statement | Plus Jakarta Sans / Inter | `clamp(0.95rem, 1.35rem)` | 1.55 (`leading-relaxed`) | `break-words` with `max-h-[170px]` custom scrollbar |
| `DareTimerRing.tsx` | Seconds Counter | JetBrains Mono | 16px / 20px | 1.0 (`leading-none`) | Centered SVG radial counter |
| `MobileDock.tsx` | Nav Tab Labels | Inter | 10px / 11px | 1.1 | `truncate max-w-full px-0.5` |

