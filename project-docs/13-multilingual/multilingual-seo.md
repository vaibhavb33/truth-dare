# Asteria — Multilingual SEO & International Search Strategy

**Document Reference:** `DOC-I18N-SEO-001`  
**Role:** Senior Full-Stack Developer + Internationalisation Architect  
**Project:** Asteria — Multilingual Truth or Dare Platform  
**Target Domain:** `https://truthordarequiz.com`  
**Initial Supported Locales:** 8 (`en`, `hi`, `es`, `pt`, `fr`, `id`, `ar`, `de`)  
**Status:** Approved & Implemented in Production  

---

## 1. Executive Summary & SEO Objectives

International organic search dominance requires rigorous technical compliance with Google’s multilingual indexing protocols. When a gaming platform expands into non-English markets, common architectural mistakes include:
- Relying on client-side IP geolocation redirects that bounce Googlebot away.
- Pointing localized pages to an English canonical URL, causing non-English pages to be de-indexed as duplicates.
- Failing to provide reciprocal `hreflang` tags across all language equivalents.
- Mixing translated UI text with English metadata.

Asteria’s international SEO architecture implements **explicit subpath routing, self-referencing canonicals, full reciprocal hreflang clusters, and localized metadata tags** across all 8 supported languages.

---

## 2. URL Structure & Indexing Strategy

Asteria uses dedicated language sub-directories:

```
https://truthordarequiz.com/            -> Global x-default & English Root
https://truthordarequiz.com/en/         -> English Homepage
https://truthordarequiz.com/hi/         -> Hindi Homepage
https://truthordarequiz.com/es/         -> Spanish Homepage
https://truthordarequiz.com/pt/         -> Portuguese Homepage
https://truthordarequiz.com/fr/         -> French Homepage
https://truthordarequiz.com/id/         -> Indonesian Homepage
https://truthordarequiz.com/ar/         -> Arabic Homepage (RTL)
https://truthordarequiz.com/de/         -> German Homepage
```

### Direct Game Route Equivalents:
```
https://truthordarequiz.com/en/truth-or-dare/
https://truthordarequiz.com/hi/truth-or-dare/
https://truthordarequiz.com/es/truth-or-dare/
https://truthordarequiz.com/pt/truth-or-dare/
https://truthordarequiz.com/fr/truth-or-dare/
https://truthordarequiz.com/id/truth-or-dare/
https://truthordarequiz.com/ar/truth-or-dare/
https://truthordarequiz.com/de/truth-or-dare/
```

---

## 3. Reciprocal Hreflang Tag Implementation

Google requires that **every language version links to all other language versions AND itself**. If Page A links to Page B via hreflang, but Page B does not link back to Page A, Google disregards the hreflang annotation.

Asteria automatically injects the complete 9-point hreflang cluster in `<head>` for every route:

```html
<!-- Example: Rendered on https://truthordarequiz.com/es/truth-or-dare -->
<link rel="canonical" href="https://truthordarequiz.com/es/truth-or-dare" />
<link rel="alternate" hreflang="en" href="https://truthordarequiz.com/en/truth-or-dare" />
<link rel="alternate" hreflang="hi" href="https://truthordarequiz.com/hi/truth-or-dare" />
<link rel="alternate" hreflang="es" href="https://truthordarequiz.com/es/truth-or-dare" />
<link rel="alternate" hreflang="pt" href="https://truthordarequiz.com/pt/truth-or-dare" />
<link rel="alternate" hreflang="fr" href="https://truthordarequiz.com/fr/truth-or-dare" />
<link rel="alternate" hreflang="id" href="https://truthordarequiz.com/id/truth-or-dare" />
<link rel="alternate" hreflang="ar" href="https://truthordarequiz.com/ar/truth-or-dare" />
<link rel="alternate" hreflang="de" href="https://truthordarequiz.com/de/truth-or-dare" />
<link rel="alternate" hreflang="x-default" href="https://truthordarequiz.com/truth-or-dare" />
```

### Role of `x-default`:
The `x-default` directive specifies the fallback URL for international searchers whose language is not explicitly targeted or whose browser sends unexpected language headers.

---

## 4. Self-Referencing Canonical Policy

> [!IMPORTANT]
> **Strict Rule:** Never point different language versions to a single English canonical URL. Doing so signals to Googlebot that the localized pages are mere duplicates of the English page, resulting in immediate suppression from regional SERPs.

### Verified Canonical Architecture:
- The canonical of `/es` is `https://truthordarequiz.com/es`
- The canonical of `/es/truth-or-dare` is `https://truthordarequiz.com/es/truth-or-dare`
- The canonical of `/ar/truth-or-dare` is `https://truthordarequiz.com/ar/truth-or-dare`
- The canonical of `/hi/truth-or-dare` is `https://truthordarequiz.com/hi/truth-or-dare`

Each localized URL asserts its own distinct canonical identity.

---

## 5. Localized Metadata & Open Graph

Each locale receives native `<title>`, `<meta name="description">`, and Open Graph tags:

```
┌──────────┬────────────────────────────────────────────────────────┬──────────────────────┐
│ Locale   │ Localized Page Title Tag                               │ Open Graph Locale    │
├──────────┼────────────────────────────────────────────────────────┼──────────────────────┤
│ en       │ Truth or Dare Online — Play Free Party Game in Browser │ en_US                │
│ hi       │ ट्रुथ या डेयर Online — Asteria (हिन्दी)                │ hi_IN                │
│ es       │ Verdad o Reto Online — Asteria (Español)               │ es_ES                │
│ pt       │ Verdade ou Desafio Online — Asteria (Português)        │ pt_BR                │
│ fr       │ Action ou Vérité Online — Asteria (Français)           │ fr_FR                │
│ id       │ Truth or Dare Online — Asteria (Bahasa Indonesia)      │ id_ID                │
│ ar       │ صراحة أم جرأة Online — Asteria (العربية)               │ ar_SA                │
│ de       │ Wahrheit oder Pflicht Online — Asteria (Deutsch)       │ de_DE                │
└──────────┴────────────────────────────────────────────────────────┴──────────────────────┘
```

---

## 6. XML Sitemap Multilingual Integration

In compliance with Google’s XML Sitemap specifications, `app/sitemap.ts` generates structured entries with `alternates.languages` for all canonical URLs:

```xml
<url>
  <loc>https://truthordarequiz.com/games/truth-or-dare</loc>
  <lastmod>2026-11-06</lastmod>
  <changefreq>daily</changefreq>
  <priority>0.95</priority>
  <xhtml:link rel="alternate" hreflang="en" href="https://truthordarequiz.com/en/games/truth-or-dare"/>
  <xhtml:link rel="alternate" hreflang="hi" href="https://truthordarequiz.com/hi/games/truth-or-dare"/>
  <xhtml:link rel="alternate" hreflang="es" href="https://truthordarequiz.com/es/games/truth-or-dare"/>
  <xhtml:link rel="alternate" hreflang="pt" href="https://truthordarequiz.com/pt/games/truth-or-dare"/>
  <xhtml:link rel="alternate" hreflang="fr" href="https://truthordarequiz.com/fr/games/truth-or-dare"/>
  <xhtml:link rel="alternate" hreflang="id" href="https://truthordarequiz.com/id/games/truth-or-dare"/>
  <xhtml:link rel="alternate" hreflang="ar" href="https://truthordarequiz.com/ar/games/truth-or-dare"/>
  <xhtml:link rel="alternate" hreflang="de" href="https://truthordarequiz.com/de/games/truth-or-dare"/>
</url>
```

This notifies search spiders of all 8 localized versions in a single crawl pass.

---

## 7. Geo-Targeting & IP Redirection Policy

Asteria **strictly bans automatic 301/302 redirects based solely on client IP address**.

### Why IP Redirects Harm SEO:
1. Googlebot crawls primarily from IP addresses originating in California, USA. An IP-based redirect would prevent Googlebot from ever indexing the Spanish, Hindi, French, or Arabic versions.
2. Users traveling abroad or preferring English in non-English countries become trapped in undesired regional redirects.

### Asteria’s Compliant Approach:
- Users always land on the exact URL requested.
- If a returning user has a stored preference cookie (`asteria_locale=es`), client-side navigation smoothly updates their interface while preserving direct URL integrity.
- Manual switching via `LanguageSelector` is always instantaneous.

---

*Signed off by Senior Full-Stack Developer + Internationalisation Architect.*
