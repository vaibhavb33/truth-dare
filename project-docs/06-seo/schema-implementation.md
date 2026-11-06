# Structured Data & Schema.org Implementation Guide

**Project Name:** Project Asteria  
**Document:** JSON-LD Schema Architecture & Rich Result Validation  
**Role:** Senior Technical SEO Specialist (5+ Years Exp)  
**Date:** November 5, 2026  
**Status:** Approved & Implemented

---

## 1. Schema Strategy Overview

Structured data provides search engines with explicit semantic clues regarding page content, enabling rich result eligibility in Google Search (Search Action box, Breadcrumbs, FAQs, Article badges).

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SCHEMA.ORG MAPPING MATRIX                       │
├────────────────────┬────────────────────┬──────────────────────────────┤
│ TARGET PAGE        │ SCHEMA TYPE        │ RICH RESULT BENEFIT          │
├────────────────────┼────────────────────┼──────────────────────────────┤
│ Universal Root `/` │ `Organization`     │ Knowledge Panel Brand Signals│
│ Universal Root `/` │ `WebSite`          │ Sitelinks Search Box         │
│ Game Engines       │ `WebApplication`   │ Software Application Feature │
│ Game Directory     │ `BreadcrumbList`   │ Clean SERP Breadcrumb Trail  │
│ Homepage / Rules   │ `FAQPage`          │ Expandable FAQ Search Accordion│
│ Blog Articles      │ `Article`          │ News / Article Carousel      │
└────────────────────┴────────────────────┴──────────────────────────────┘
```

---

## 2. Complete JSON-LD Code Templates

### A. Organization & WebSite Schema (Injected on Homepage `/`)
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://truthordarequiz.com/#organization",
      "name": "Asteria Party Gaming",
      "url": "https://truthordarequiz.com",
      "logo": "https://truthordarequiz.com/icon.png",
      "sameAs": [
        "https://twitter.com/AsteriaGames",
        "https://discord.gg/asteria"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://truthordarequiz.com/#website",
      "url": "https://truthordarequiz.com",
      "name": "Asteria",
      "publisher": {
        "@id": "https://truthordarequiz.com/#organization"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://truthordarequiz.com/questions?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  ]
}
```

---

### B. WebApplication Schema (Injected on `/games/truth-or-dare`)
```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Truth or Dare Online — Project Asteria",
  "url": "https://truthordarequiz.com/games/truth-or-dare",
  "applicationCategory": "GameApplication",
  "operatingSystem": "All modern web browsers (iOS, Android, Windows, macOS)",
  "browserRequirements": "Requires JavaScript. Requires HTML5 Canvas & Web Audio API.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "1420"
  }
}
```

---

### C. BreadcrumbList Schema (Injected on Sub-Pages)
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://truthordarequiz.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Games",
      "item": "https://truthordarequiz.com/games"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Truth or Dare",
      "item": "https://truthordarequiz.com/games/truth-or-dare"
    }
  ]
}
```

---

### D. FAQPage Schema (Injected on Homepage `/`)
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is Project Asteria completely free to play?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, 100% free! You can play all core party games, access hundreds of curated cards, and host online multiplayer rooms without paywalls or forced subscriptions."
      }
    },
    {
      "@type": "Question",
      "name": "Do my friends need to download an app or create an account to join?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No app download is required. Guests simply scan your room QR code with their smartphone camera or enter your 6-character room code in any web browser."
      }
    },
    {
      "@type": "Question",
      "name": "How does the anti-repetition question engine work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our game engine uses a Fisher-Yates cryptographically random shuffle coupled with an in-memory session history set. A prompt will never appear twice in the same session until the entire deck is exhausted."
      }
    }
  ]
}
```

