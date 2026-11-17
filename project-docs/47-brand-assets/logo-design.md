# Play Truth & Dare — Brand Logo Design Specification

**Domain:** `https://playtruthndare.com`  
**Brand Name:** Play Truth & Dare  
**Short Name:** PlayTruthNDare  
**Tagline:** Truth. Dare. Laugh. Repeat.  
**Created:** November 2026  
**Version:** 1.0.0 (Production Release)

---

## 1. Executive Summary & Design Vision

The **Play Truth & Dare** visual identity captures the high-energy, electric excitement of real-time browser party gaming. The logo moves away from legacy emoji placeholders or generic starbursts, introducing an original, mathematically constructed dual-interlocking emblem that fuses the twin pillars of party gaming:

1. **Truth (The Hook):** A sweeping question mark arc representing curiosity, secrets, confessions, and personal discovery. Rendered with an electric Cyan-to-Violet gradient (`#38BDF8` → `#22D3EE` → `#8B5CF6`).
2. **Dare (The Blade):** An ascending dynamic flame/arrowhead blade nested inside the question mark curve, symbolizing courage, playful adrenaline, challenge, and forward momentum. Rendered in fiery Coral-to-Rose-to-Amber (`#FB7185` → `#F43F5E` → `#F59E0B`).
3. **The Spark (The Dot):** Anchoring the emblem at the base is a four-pointed gaming star diamond (`#FB7185` with `#FFFFFF` core), representing laughter, connection, and the thrill of the round.

```
       .-''''-.
     .'  TRUTH '.     <- Sweeping Cyan-to-Violet question mark arc
    /    ( ? )   \
   |      /\      |   <- Interlocking Rose-Coral Dare flame blade
   |     /  \     |
    \    \  /    /
     '.   \/   .'
       '--++--'
          <>          <- 4-Point Diamond Spark dot
```

---

## 2. Brand Color Palette

The color system is optimized for high-contrast visibility against the dark gaming canvas (`#0A0A16`) as well as high-key light environments.

| Role | Color Name | Hex Code | RGB | HSL | Usage |
|---|---|---|---|---|---|
| **Canvas Deep** | Space Obsidian | `#070414` | `7, 4, 20` | `251°, 67%, 5%` | Primary background canvas |
| **Canvas Base** | Dark Violet Navy | `#0A0A16` | `10, 10, 22` | `240°, 38%, 6%` | Component background |
| **Surface Elevated** | Violet Tint Box | `#180C34` | `24, 12, 52` | `258°, 63%, 13%` | Logo container badge |
| **Brand Primary** | Electric Violet | `#8B5CF6` | `139, 92, 246` | `258°, 90%, 66%` | Primary glow & highlights |
| **Truth Accent** | Cyan Neon | `#22D3EE` | `34, 211, 238` | `187°, 85%, 53%` | Truth cards & gradients |
| **Dare Accent** | Coral Pink | `#FB7185` | `251, 113, 133` | `351°, 95%, 71%` | Dare cards & wordmark ampersand |
| **Dare Heat** | Crimson Rose | `#F43F5E` | `244, 63, 94` | `347°, 89%, 60%` | Dare blade flame gradient |
| **Text Primary** | Pure White | `#FFFFFF` | `255, 255, 255` | `0°, 0%, 100%` | High-contrast typography |
| **Text Muted** | Slate Gray | `#94A3B8` | `148, 163, 184` | `215°, 20%, 65%` | Subtitles and meta tags |

---

## 3. Logo Geometry & Vector Construction

### 3.1 Dimensions & Coordinate Space
- **Icon Coordinate Box:** `512 x 512` viewport (`viewBox="0 0 512 512"`).
- **Horizontal Logo Box:** `800 x 200` viewport (`viewBox="0 0 800 200"`).
- **Center of Emblem:** Optical center at `(256, 245)` to accommodate the lower spark dot at `y = 382`.

### 3.2 Key Vector Paths
- **Dare Flame Blade:**
  ```svg
  <path d="M256 160 C256 160 292 205 284 252 C278 288 256 304 256 304 C256 304 234 288 228 252 C220 205 256 160 256 160 Z" />
  ```
- **Truth Question Mark Hook:**
  ```svg
  <path d="M212 304 C202 292 206 274 218 262 C236 244 266 226 288 206 C314 182 324 154 310 128 C294 98 254 90 220 102 C188 114 168 138 160 166 C157 176 147 182 136 179 C126 176 120 165 124 154 C136 114 166 78 212 64 C262 48 322 62 346 106 C368 146 352 190 316 224 C290 248 266 266 254 280 C248 288 246 296 244 306 C242 318 228 324 218 316 C215 313 213 309 212 304 Z" />
  ```
- **Base Spark Diamond:**
  ```svg
  <g transform="translate(256, 382)">
    <path d="M0 -34 C0 -10 10 0 34 0 C10 0 0 10 0 34 C0 10 -10 0 -34 0 C-10 0 0 -10 0 -34 Z" />
    <circle cx="0" cy="0" r="6" fill="#FFFFFF" />
  </g>
  ```

---

## 4. Logo Variations & Asset Deliverables

All master assets are versioned and stored locally in `/public/branding/`:

| File Name | Format | Dimensions | Purpose |
|---|---|---|---|
| `logo-horizontal-dark.svg` | SVG | 800 x 200 | Primary brand header / dark backgrounds |
| `logo-horizontal-light.svg` | SVG | 800 x 200 | Inverted variant for white/light documents |
| `logo-horizontal-transparent.svg` | SVG | 800 x 200 | Transparent container variant |
| `logo-icon-dark.svg` | SVG | 512 x 512 | Standalone icon with dark rounded tile |
| `logo-icon-light.svg` | SVG | 512 x 512 | Standalone icon with light tile |
| `logo-icon-transparent.svg` | SVG | 512 x 512 | Standalone vector emblem with zero background |

---

## 5. React Integration Architecture

To eliminate external HTTP requests and prevent cumulative layout shifts (CLS), the brand logo is available through native TypeScript React components:

1. **`@/components/branding/BrandIcon.tsx`**
   - Renders the responsive inline vector emblem.
   - Props: `size` (number | string), `variant` (`'transparent' | 'dark' | 'light'`), `idPrefix` (prevents SVG gradient ID collisions when rendered multiple times).
   - Used in `AppHeader.tsx` (desktop & mobile drawer) and `AppFooter.tsx`.

2. **`@/components/branding/BrandLogo.tsx`**
   - Renders the complete brand lockup with vector emblem + styled typography wordmark + optional tagline.
   - Props: `variant` (`'horizontal' | 'icon'`), `theme` (`'dark' | 'light'`), `showTagline` (boolean), `iconSize`.

---

## 6. Social Media & Open Graph Integration

- **OG Card (`/public/og-image.png`):** Rendered at `1200 x 630 px` via headless Chrome.
- **Composition:** Official vector emblem on elevated glassmorphism tile (`backdrop-filter: blur(20px)`), typography wordmark (`58px font-weight: 900`), tagline, and party game capability badges.
- **No Emoji Used:** Complies strictly with zero-emoji branding requirements.

