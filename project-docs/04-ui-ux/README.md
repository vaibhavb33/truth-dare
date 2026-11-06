# 04 - UI/UX Design System & Experience Architecture

This directory houses the comprehensive design system, typography scales, color tokens, responsive blueprints, and visual experience audit authored by the **Senior UI/UX Designer & Frontend Experience Engineer** for **Project Asteria** (`https://truthordarequiz.com/`).

---

## Design System Deliverables

1. [**Master Design System**](design-system.md) — 8pt spatial grid, design tokens, elevation shadows, corner radiuses, and glassmorphic cards.
2. [**Color System & Contrast Matrix**](colour-system.md) — Deep navy (`#0A0A16`), electric violet (`#8B5CF6`), truth cyan (`#06B6D4`), dare coral (`#FF5C77`), and WCAG 2.1 AA contrast verification.
3. [**Typography Scale & Font Hierarchy**](typography.md) — Plus Jakarta Sans, Inter, and JetBrains Mono fluid `clamp()` scale.
4. [**Component Specifications**](component-specifications.md) — 3D flip card, buttons, timer ring, player chips, modals, and navigation dock.
5. [**Responsive Viewport Guidelines**](responsive-guidelines.md) — Breakpoints for 360px, 390px, 430px, tablet, and desktop viewports with 100dvh boundaries.
6. [**Interaction & Motion Guidelines**](interaction-guidelines.md) — 3D perspective physics, procedural audio sync, haptic vibration curves, and confetti celebrations.
7. [**Master 20-Screen Page Specifications**](page-design-specifications.md) — Complete ASCII wireframes and specs for all 20 platform screens.
8. [**Visual Experience Audit & Upgrade Report**](ui-ux-visual-audit-report.md) — 15-point visual audit, micro-interactions, luxury spinner wheel, and empty/loading states.

---

## UI Component Library

- [`components/ui/Button.tsx`](../../components/ui/Button.tsx) — Tactile button matrix with gradient highlights, haptic clicks, and focus rings.
- [`components/ui/States.tsx`](../../components/ui/States.tsx) — Loading shimmer skeleton, empty state, and error state components.
- [`components/game/Card3D.tsx`](../../components/game/Card3D.tsx) — Spring-flip 3D card arena with choice crest, watermark, and copy prompt button.
- [`components/game/DareTimerRing.tsx`](../../components/game/DareTimerRing.tsx) — SVG neon countdown timer ring with warning transitions.
- [`components/layout/AppHeader.tsx`](../../components/layout/AppHeader.tsx) — Glassmorphic navigation header with active route pills and audio toggle.
- [`components/layout/MobileDock.tsx`](../../components/layout/MobileDock.tsx) — Thumb-zone fixed bottom navigation dock.
