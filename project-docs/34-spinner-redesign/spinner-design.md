# Asteria Spinner Wheel Visual Design Specification

## Executive Summary
The Asteria Spinner Wheel (`/games/spin-the-bottle`) has been completely overhauled from a low-fidelity, static demonstration into a high-end, premium gaming centerpiece. Combining physics-governed motion, HiDPI Retina canvas rendering, multi-stop linear gradients with radial depth shading, perimeter metallic rims with 3D gold rivet studs, and a jewel-encrusted central hub, the new spinner delivers an authentic luxury casino/arcade feel while preserving complete dark-mode elegance.

---

## 1. Visual Geometry & Aesthetics

### 1.1 Circular Canvas Structure
- **Canvas Resolution:** Scaled dynamically by `window.devicePixelRatio` (2x to 3x on modern devices), eliminating blurriness on Retina iPhones, iPads, and high-density Android displays.
- **Outer Diameter:** Responsive bounding box adapting seamlessly from 330px on small mobile phones up to 450px on desktop monitors.
- **Multi-Ring Construction:**
  1. **Ambient Dark Background:** `#090D1A` with subtle radial glow and deep cosmic ambience.
  2. **Outer Metallic Bevel Ring:** 14px outer platinum/indigo rim (`#1E2235` to `#0B0E17`) with a 2px interior metallic stroke (`#4F46E5`).
  3. **3D Radial Rivet Studs (Pegs):** Positioned along the circumference at each segment divider. Each peg features a 3-stop radial gradient simulating brass/gold chrome:
     - Center highlight: `#FFFFFF`
     - Mid-tone: `#F59E0B` (amber gold)
     - Edge shadow: `#78350F` (deep bronze)
     - Outer drop-shadow: `rgba(0,0,0,0.6)`
  4. **Inner Segment Ring:** Distinct multi-stop linear gradient slices radiating from the center to the perimeter.
  5. **Central Multi-Tier Jewel Hub:**
     - Outer metallic bezel: 36px radius with chrome stroke (`#312E81` / `#6366F1`)
     - Mid-ring dark obsidian core: 24px radius (`#090D1A`) with soft brand drop shadow
     - Inner diamond pivot: 8px gold core with radial gradient (`#FFFFFF` to `#D97706`)

---

## 2. Segment Palette & Color Harmony

To ensure maximum contrast and clear visual separation between neighboring slices, a 10-tier cyclical color palette was developed. Each slice employs a customized 2-stop linear gradient:

| Segment Index | Gradient Start | Gradient End | Theme Tone | Text Color |
|---|---|---|---|---|
| **0** | `#4F46E5` (Indigo) | `#7C3AED` (Violet) | Royal Mystic | `#FFFFFF` |
| **1** | `#06B6D4` (Cyan) | `#0284C7` (Sky) | Electric Neon | `#FFFFFF` |
| **2** | `#E11D48` (Rose) | `#BE123C` (Ruby) | Passion Coral | `#FFFFFF` |
| **3** | `#D97706` (Amber) | `#B45309` (Gold) | Solar Glow | `#FFFFFF` |
| **4** | `#059669` (Emerald) | `#047857` (Forest) | Jade Emerald | `#FFFFFF` |
| **5** | `#8B5CF6` (Purple) | `#6D28D9` (Deep Violet) | Astral Purple | `#FFFFFF` |
| **6** | `#F43F5E` (Pink) | `#E11D48` (Rose Pink) | Sunset Blush | `#FFFFFF` |
| **7** | `#2563EB` (Blue) | `#1D4ED8` (Ocean Deep) | Midnight Blue | `#FFFFFF` |
| **8** | `#10B981` (Teal) | `#059669` (Mint) | Neon Mint | `#FFFFFF` |
| **9** | `#D946EF` (Fuchsia) | `#A21CAF` (Magenta) | Cyber Fuchsia | `#FFFFFF` |

### Radial Depth Shadowing
An inner dark gradient ring (`rgba(0,0,0,0.5)` to `rgba(0,0,0,0.0)`) is rendered directly over the slices from $r=0$ to $r=0.45 \times R$, providing dimensional depth that makes the central hub appear elevated above the surface.

---

## 3. Typography & Radial Legibility

- **Font Family:** `system-ui, -apple-system, sans-serif` for ultra-crisp vector rendering across all browser platforms.
- **Dynamic Font Scaling:**
  - $N \le 4$ slices: `15px font-weight: 800`
  - $5 \le N \le 8$ slices: `13px font-weight: 700`
  - $9 \le N \le 14$ slices: `11px font-weight: 600`
  - $N > 14$ slices: `9.5px font-weight: 600`
- **Radial Orientation:** Slices are rotated to angle $\theta = \frac{\Delta\theta}{2}$, and text is translated outwards to $r = 0.58 \times R$.
- **High-Contrast Text Shadows:** Every label is rendered with a 3px dark stroke shadow (`rgba(0, 0, 0, 0.85)`), ensuring 100% legibility against both bright cyan and dark indigo backgrounds.
- **Smart Truncation:** Segment labels exceeding 24 characters are truncated cleanly with double-dots (`formatSegmentLabel`) to prevent canvas boundary clipping.

---

## 4. Top Pointer & Mechanical Flapper Physics

- **Position:** Fixed at 12 o'clock ($\frac{3\pi}{2}$ radians).
- **Geometry:** Luxury dagger flapper needle with triangular point extending 28px downward into the wheel perimeter.
- **Needle Palette:**
  - Linear gradient from `#FF4567` (ruby core) to `#BE123C` (deep crimson).
  - Gold perimeter outline (`#FCD34D`, 1.5px stroke).
  - Ruby neon drop shadow (`rgba(244, 63, 94, 0.6)`).
  - Central white pivot stud (`#FFFFFF`, $r=4$px).
- **Animated Deflection (Flapper Kickback):**
  When a wheel peg passes under the pointer, the flapper kicks backward by $\delta = +0.18$ radians ($\approx 10.3^\circ$), accompanied by an acoustic tick sound. As the peg clears, the flapper smoothly dampens back to $0$ with exponential decay factor $0.85$.

---

## 5. Responsive Layout Architecture

- **Desktop Viewport ($\ge 1024$px):**
  - **Split-Screen Dual Column:**
    - Left Column: Interactive Canvas Wheel, Central "SPIN THE WHEEL" CTA, and Quick Sound Mute Toggle.
    - Right Column: Player Roster & Slice Management Console, Mode Selector, Add Slice Form, and Shuffle/Demo/Reset Action Grid.
- **Mobile Viewport ($< 1024$px):**
  - **Vertical Stacked Flow:**
    - Top: Game Mode Switcher Pills (horizontal scroll / flex wrap).
    - Center: HiDPI Wheel Canvas with prominent top pointer.
    - Below Wheel: Big Touch-Friendly Spin CTA (`min-h-[52px]` thumb zone).
    - Bottom: Expandable Player Roster Accordion with inline edit, remove, and add inputs.
