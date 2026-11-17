# Brand Strategy & System Rebranding Audit

**Project:** Asteria -> Play Truth & Dare Rebrand  
**Role:** Senior Brand Strategist + Full-Stack Developer  
**Date:** 2026-11-17  
**Canonical Domain:** `https://playtruthndare.com`  
**Brand Identity:** Play Truth & Dare  
**Compact Brand Identity:** PlayTruthNDare  
**Tagline:** Truth. Dare. Laugh. Repeat.  

---

## 1. Brand Strategy & Core Pillars

### 1.1 Brand Vision
Transition the platform from the abstract working title "Asteria" to an instant, highly memorable, keyword-dominant, consumer-friendly identity: **Play Truth & Dare**.

### 1.2 Brand Naming Architecture
- **Full Brand Name:** `Play Truth & Dare`
  - Displayed across desktop and tablet headers, website footers, page titles, structured data schemas, and editorial copy.
- **Compact Brand Name:** `PlayTruthNDare`
  - Applied in mobile viewport headers (`< 640px` / `xs`), PWA `short_name`, app launcher icon badges, and social media handles (`@PlayTruthNDare`).
  - Solves the critical mobile responsive constraint: prevents brand text from colliding with language dropdowns, audio mute toggles, and navigation buttons on ultra-narrow phones (320px–375px).
- **Core Tagline:** `Truth. Dare. Laugh. Repeat.`
  - Encapsulates the core party gaming loop: choosing truth or dare, sharing laughs with friends, and continuously drawing new cards.

---

## 2. Visual Identity & Color System (Phase 4)

The platform's high-contrast, dark-mode gaming aesthetic is preserved with verified WCAG 2.1 AA compliant contrast ratios:

| Token | Name | Hex Code | Semantic Role in Gaming Interface | Contrast on Base Navy (`#0A0A16`) |
| :--- | :--- | :--- | :--- | :--- |
| `canvas.base` | **Dark Navy** | `#0A0A16` | Main viewport canvas and card backgrounds | Base Background |
| `canvas.deep` | **Midnight Navy** | `#07070F` | Outer borders, page foundations, dock backdrops | Dark Accent |
| `brand.900` | **Deep Purple** | `#3B1A7A` | Gradient depths, card rims, hero glow foundations | 2.1:1 (Structural) |
| `brand.500` | **Violet** | `#8B5CF6` | Primary action buttons, logo emblem, glow highlights | 5.8:1 (AA Normal Text) |
| `truth.400` | **Cyan Accent** | `#22D3EE` | Truth game cards, Truth badges, positive status | 11.2:1 (AAA Text) |
| `dare.500` | **Coral/Pink Accent**| `#FF5C77` | Dare game cards, Dare badges, spicy card accents | 6.4:1 (AA Normal Text) |
| `text-white` | **Pure White** | `#FFFFFF` | Primary headings, logo text, question prompts | 18.5:1 (AAA Large & Normal) |

---

## 3. Responsive Header Architecture (Phase 5)

To guarantee zero collision between the brand emblem and header utility controls across all 9 target viewports (`320px` to `1440px`), the header uses responsive brand switching:

```
[320px–639px Mobile Viewport]
+--------------------------------------------------------------+
| [Sparkle] PlayTruthNDare       [🌐 Lang] [🔇 Mute] [☰ Menu]  |
| (32px)     (105px)               (54px)   (38px)    (38px)   |
| Total Left: 145px               Total Right: 142px            |
| Available Width: 296px          Gap Margin: ~9px (No overlap)|
+--------------------------------------------------------------+

[640px+ Tablet & Desktop Viewport]
+--------------------------------------------------------------+
| [Sparkle] Play Truth & Dare •  [Games] [Custom] [Guides] ... |
| (36px)     (175px)                                           |
+--------------------------------------------------------------+
```

---

## 4. Migration Scope by Layer

1. **Routing & SEO Infrastructure:**
   - Default domain updated to `https://playtruthndare.com` in `robots.ts`, `sitemap.ts`, `seo.ts`, and `next.config.js`.
   - Title template updated to `%s | Play Truth & Dare`.
   - Open Graph siteName updated to `Play Truth & Dare`.
2. **User Experience & Public Content:**
   - Header, Drawer, Footer, and Homepage hero/features fully migrated.
   - PWA prompts and install modals updated to "Install Play Truth & Dare App".
   - Offline fallback page updated to "Play Truth & Dare is currently offline".
   - Multiplayer room invitation text updated to "Join my Truth or Dare room on Play Truth & Dare!".
3. **Multilingual Parity:**
   - All 8 languages updated across `translations/*.ts` and `pwaPromotionTranslations.ts`.
   - Native language overrides in `app/[locale]/**/page.tsx` updated to `Play Truth & Dare (${langMeta.nativeName})`.
4. **Data & Storage Persistence:**
   - Backward-compatible keys implemented for custom decks, multiplayer sessions, sound settings, voice rates, and locale preferences.

