# Clean URL Architecture & Canonical Routing Hierarchy

**Project Name:** Project Asteria  
**Document:** Master URL Architecture & Routing Specification  
**Role:** Senior Technical SEO Specialist (5+ Years Exp)  
**Date:** November 5, 2026  
**Status:** Approved & Implemented

---

## 1. Master Routing Architecture

We employ a **flat-to-shallow hierarchical URL structure** with maximum semantic relevance, avoiding unnecessary subfolder nesting and keeping URL length under 60 characters:

```
https://truthordarequiz.com/ (Root Domain)
├── /                                           # Homepage (Primary Hub)
├── /games                                      # Game Directory
│   ├── /truth-or-dare                          # Truth or Dare Core Engine
│   ├── /spin-the-bottle                        # Spinner Wheel / Spin the Bottle
│   ├── /never-have-i-ever                      # Never Have I Ever Engine
│   ├── /would-you-rather                       # Would You Rather Engine
│   ├── /most-likely-to                         # Most Likely To Engine
│   └── /this-or-that                           # This or That Gauntlet
├── /questions                                  # Searchable Public Question Library
├── /custom                                     # Custom Deck Creator
├── /blog                                       # Editorial Hub (Article Directory)
│   ├── /official-truth-or-dare-rules           # Pillar Guide: Rules & Variations
│   ├── /50-best-dares-over-facetime            # Spoke Guide: Long-Distance Dares
│   └── /clean-icebreakers-for-work             # Spoke Guide: Safe Icebreakers
├── /about                                      # Platform Story & Mission
├── /contact                                    # Feedback & Submissions
├── /privacy                                    # Privacy Policy
├── /terms                                      # Terms of Service
└── /admin                                      # [NOINDEX] Administrative Portal
```

---

## 2. Canonicalization & Duplicate Content Protection

Party game platforms frequently suffer from duplicate content caused by query parameters (e.g. `?category=couples`, `?filter=party`, `?ref=share`). We enforce strict canonicalization rules:

1. **Self-Referential Canonical Tag:** Every indexable page declares its exact canonical origin in the HTML `<head>`:
   ```html
   <link rel="canonical" href="https://truthordarequiz.com/games/truth-or-dare" />
   ```
2. **Query Parameter Filtering:**
   * Dynamic setup parameters like `?category=couples-flirty` or `?timer=30` maintain canonical attribution to `/games/truth-or-dare` (or dedicated subpages), preventing duplicate indexation.
3. **Trailing Slash Policy:**
   * Strict adherence to **no-trailing-slash** (e.g., `/games/truth-or-dare` without a trailing `/`). Any requests with trailing slashes automatically return a 308 permanent redirect.
4. **Case Sensitivity:**
   * All URLs are strictly lowercase. Mixed-case URLs are normalized via Next.js middleware.

---

## 3. Dynamic Multiplayer Room URL Isolation

Ephemeral multiplayer rooms (`/room/[code]`) must **never be indexed** by search engines to prevent soft 404s, index bloat, and broken user sessions:

* **Directive:** Every `/room/[code]` page serves an explicit HTTP header and meta tag:
  ```html
  <meta name="robots" content="noindex, nofollow" />
  ```
* **Robots.txt Exclusion:**
  ```text
  Disallow: /room/
  Disallow: /api/
  Disallow: /admin
  ```

