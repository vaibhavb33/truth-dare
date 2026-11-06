# Master Design System Specification

**Project Name:** Project Asteria  
**Document:** Master Design System (Design Tokens & Spatial Architecture)  
**Role:** Senior UI/UX Designer & Product Design Lead  
**Date:** November 5, 2026  
**Status:** Complete — Ready for Review & Handover (Phase 3 Deliverable)  
**Upstream Inputs:** [master-prd.md](file:///Users/vaibhavborkar/truth&dare/project-docs/03-product-requirements/master-prd.md), [functional-requirements.md](file:///Users/vaibhavborkar/truth&dare/project-docs/03-product-requirements/functional-requirements.md), [user-personas.md](file:///Users/vaibhavborkar/truth&dare/project-docs/02-research/user-personas.md).

---

## 1. Design Vision & Guiding Principles

Project Asteria’s visual identity balances **modern digital entertainment polish** with **frictionless party utility**. The design feels like a premier gaming application on mobile, not a static blog or ad-heavy listicle.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CORE DESIGN PILLARS                             │
├───────────────────────┬────────────────────────────────────────────────┤
│ 1. VISUALLY IMPRESSIVE│ Deep neon-lit night vibe, sleek glowing depth  │
│ 2. MOBILE-FIRST ERGO  │ Thumb-zone primary controls, generous touch    │
│ 3. DISTRACTION-FREE   │ Maximum immersion during active game turns     │
│ 4. TACTILE SENSORY    │ Hardware-accelerated 3D flips, haptics, audio  │
│ 5. WCAG AA ACCESSIBLE │ High-contrast text, clear focus rings, scale   │
└───────────────────────┴────────────────────────────────────────────────┘
```

### Visual Metaphor: "The Midnight Lounge"
The visual identity evokes an energetic, late-night party atmosphere:
* **Base Atmosphere:** Inky deep navy and dark twilight purple backgrounds (`#0A0A16`, `#121229`) that preserve battery on mobile OLED screens and provide an immersive dark room experience.
* **Focal Energy:** Electric Violet primary glows (`#8B5CF6`) anchoring the brand, paired with high-energy Coral (`#FF5C77`) for Dares/challenges and vibrant Cyan (`#06B6D4`) for Truths/confessions.
* **Surface Materials:** Semi-translucent frosted glass surfaces (`backdrop-blur-md` over subtle gradient meshes) and elevated card layers with clean 1px borders (`border-white/10`).

---

## 2. Spatial Grid & Layout Architecture

We employ an **8pt Spatial Grid** with a 4pt sub-grid for micro-alignment and icon pairing.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          SPATIAL SCALE SYSTEM                          │
├───────────────┬────────────┬───────────────────────────────────────────┤
│ TOKEN         │ VALUE (PX) │ INTENDED APPLICATION                      │
├───────────────┼────────────┼───────────────────────────────────────────┤
│ `space-0.5`   │ 2px        │ Hairline borders, micro-offsets           │
│ `space-1`     │ 4px        │ Icon padding, tight badge spacing         │
│ `space-2`     │ 8px        │ Inner chip padding, adjacent text gaps    │
│ `space-3`     │ 12px       │ Compact button padding, card micro-gutters│
│ `space-4`     │ 16px       │ Standard container padding, form field gap│
│ `space-6`     │ 24px       │ Card inner padding, section sub-gaps      │
│ `space-8`     │ 32px       │ Standard section margins, modal padding   │
│ `space-12`    │ 48px       │ Hero element gaps, major section divider  │
│ `space-16`    │ 64px       │ Large desktop page margins                │
│ `space-24`    │ 96px       │ Major desktop landing section spacing     │
└───────────────┴────────────┴───────────────────────────────────────────┘
```

---

## 3. Surface & Elevation Hierarchy

Elevation in dark mode is expressed through **surface lightness** and **ambient color glow**, rather than deep black drop-shadows.

```
Level 0: Canvas Base (#0A0A16)
   └── Level 1: Surface Elevated / Cards (#121229 with border-white/8)
        └── Level 2: Interactive Floating Elements (#1A1A38 with border-white/12)
             └── Level 3: Modals & Drawers (#222248 with border-violet-500/30)
                  └── Level 4: Active 3D Flip Card (Glow: 0 0 40px rgba(139, 92, 246, 0.25))
```

### Elevation Token Definitions (Tailwind CSS Extended)

```css
/* Elevation Level 1 - Standard Card */
--shadow-elevation-1: 0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08);

/* Elevation Level 2 - Hover / Active Surface */
--shadow-elevation-2: 0 8px 30px -4px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.14);

/* Elevation Level 3 - Modal / Floating Action Bar */
--shadow-elevation-3: 0 20px 50px -10px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(139, 92, 246, 0.3);

/* Card Glows */
--glow-truth: 0 0 35px -5px rgba(6, 182, 212, 0.35);
--glow-dare: 0 0 35px -5px rgba(255, 92, 119, 0.40);
--glow-brand: 0 0 40px -5px rgba(139, 92, 246, 0.35);
```

---

## 4. Corner Radius System

We prioritize **large, friendly rounded cards** to maximize tactile affordance and visual softness:

* `radius-sm` (6px): Badges, tooltips, sub-controls.
* `radius-md` (10px): Form input fields, dropdown menus.
* `radius-lg` (16px): Standard buttons, chip selectors, modal sub-panels.
* `radius-xl` (24px): Standard content cards, directory tiles, summary containers.
* `radius-2xl` (32px): Primary 3D game card, modal dialog frames, hero banners.
* `radius-full` (9999px): Avatar pills, floating action buttons, audio mute toggle.

---

## 5. Iconography Guidelines

* **Icon Family:** Lucide Icons (react-lucide) configured at a 2.0px stroke weight.
* **Base Grid:** 24px × 24px bounding box.
* **Sizing Rules:**
  * Micro (Header badges, chip tags): 14px – 16px.
  * Standard (Buttons, input adornments): 20px.
  * Prominent (Card heroes, empty states): 32px – 48px.
* **Color Rule:** Icons inherit text color (`currentColor`) or carry specific semantic accents (e.g., `text-cyan-400` for Truth, `text-coral-400` for Dare).

---

## 6. Accessibility & Contrast Safeguards

* **All interactive states** must carry a 2px offset focus ring: `focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A16]`.
* Text on dark navy backgrounds must maintain at least **4.5:1** contrast ratio for body text (`#E2E8F0` on `#0A0A16` achieves **14.8:1**).
* Headlines on colored cards must achieve at least **3:1** for large text (`#FFFFFF` on `#8B5CF6` achieves **4.6:1**).

