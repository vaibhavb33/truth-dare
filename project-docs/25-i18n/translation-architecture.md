# Asteria Global Multilingual Architecture & Internationalisation Specification

## 1. Executive Summary & Internationalisation Standard
Asteria provides an authentic native experience across 8 primary global languages:
- **English (`en`)**: International Default (`ltr`)
- **Hindi (`hi`)**: हिन्दी (`ltr`, Devanagari script, Noto Sans Devanagari font)
- **Spanish (`es`)**: Español (`ltr`, European & Latin American standard)
- **Portuguese (`pt`)**: Português (`ltr`, Brazilian & Iberian standard)
- **French (`fr`)**: Français (`ltr`, Standard French typography)
- **Indonesian (`id`)**: Bahasa Indonesia (`ltr`, Modern conversational Indonesian)
- **Arabic (`ar`)**: العربية (`rtl`, Cairo font, bidirectional layout mirroring)
- **German (`de`)**: Deutsch (`ltr`, Standard High German)

All internationalisation is designed around strict separation of presentation chrome, localized SEO routes, and game engine mechanics. Crucially:
1. **Zero Silent Fallback**: The question and game engines never silently fall back to English when a user or room selects another language.
2. **Central Dictionary Schemas**: No UI components contain hardcoded strings; all strings are typed and accessed via `useTranslation()` or server-side `getTranslations(locale)`.
3. **Decoupled Multiplayer Room Protocol**: Multiplayer rooms have a single host-selected question language (ensuring all participants play the identical card), while each player's UI chrome (buttons, status banners, scoreboards, and navigation) remains in their own chosen interface language.

---

## 2. Directory Structure & File Map
```
truth&dare/
├── lib/
│   └── i18n/
│       ├── config.ts               # Supported locales, RTL metadata, native names
│       ├── LanguageContext.tsx     # Client-side context, cookie/localStorage persistence, dir/lang sync
│       ├── seo.ts                  # Canonical, reciprocal hreflang generator, OpenGraph localization
│       └── translations/
│           ├── index.ts            # Dictionary loader & getTranslations utility
│           ├── types.ts            # Strict TypeScript interface for all dictionaries
│           ├── en.ts               # English baseline dictionary
│           ├── hi.ts               # Hindi dictionary
│           ├── es.ts               # Spanish dictionary
│           ├── pt.ts               # Portuguese dictionary
│           ├── fr.ts               # French dictionary
│           ├── id.ts               # Indonesian dictionary
│           ├── ar.ts               # Arabic dictionary (RTL)
│           └── de.ts               # German dictionary
├── app/
│   ├── [locale]/                   # Localized App Router dynamic segment
│   │   ├── page.tsx                # Localized Homepage
│   │   ├── about/page.tsx          # Localized About Page
│   │   ├── contact/page.tsx        # Localized Contact Page
│   │   ├── privacy/page.tsx        # Localized Privacy Policy
│   │   ├── terms/page.tsx          # Localized Terms of Service
│   │   ├── blog/                   # Localized Blog Index & Post templates
│   │   └── games/                  # Localized Party Game routes
│   └── sitemap.ts                  # Multilingual sitemap with xhtml:link hreflangs
└── tests/
    ├── i18n.test.ts                # Locale config and baseline tests
    ├── multilingualQuestions.test.ts # Question counts and Devanagari/Arabic script validation
    └── multilingualGlobal.test.ts  # End-to-end 100% dictionary key parity and room engine isolation
```

---

## 3. Strict Type Definition (`lib/i18n/translations/types.ts`)
The schema enforces parity across every key:
- `nav`: Navigation bar, mobile dock, room join actions.
- `home`: Hero headline, CTA buttons, quick play, category grid titles.
- `game`: Gameplay controls, Truth/Dare buttons, turn indicators, forfeit timers.
- `categories`: Names and descriptions for all 13 standard question categories.
- `gamesList`: Titles and elevator pitches for all 6 party games.
- `spinner`: Wheel controls, winner proclamations, slice management.
- `neverHaveIEver`: Lives tracking, confession count, next statement.
- `wouldYouRather`: Dilemma prompts, percentages, community verdict.
- `mostLikelyTo`: Voting prompts, nomination triggers, vote counts.
- `thisOrThat`: Rapid-fire gauntlet rounds, selection buttons.
- `customDeck`: Deck studio, card creation, custom validation.
- `multiplayer`: Real-time room status, host badges, QR sharing, participant list.
- `about`, `contact`, `privacy`, `terms`, `blog`: Static informational chrome.
- `pwa`: Add to Home Screen prompts, offline notices.

---

## 4. State Persistence & Language Switching Flow
```
User clicks Language Selector Modal
            │
            ▼
Selects Target Language (e.g. 'ar' or 'hi')
            │
            ├─► Set 'NEXT_LOCALE' Cookie (1 Year Expiry, SameSite=Lax)
            ├─► Set 'localStorage.setItem("asteria_locale", locale)'
            ├─► Document Root Update:
            │     - document.documentElement.lang = locale
            │     - document.documentElement.dir = (locale === 'ar' ? 'rtl' : 'ltr')
            │     - document.body.classList.toggle('rtl-mode', locale === 'ar')
            │
            └─► Navigation Routing:
                  - If currently on localized route (/[locale]/...):
                      router.push(`/${newLocale}/${subpath}`)
                  - Active components re-render instantly via React Context
```

---

## 5. Multiplayer Decoupled Language Architecture
```
              ┌────────────────────────────────────────────────────────┐
              │                   Multiplayer Room                     │
              │  Code: "LUCK-77" | Language: "hi" (Selected by Host)   │
              └──────────────────────────┬─────────────────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 │                                               │
                 ▼                                               ▼
     ┌────────────────────────┐                     ┌────────────────────────┐
     │ Host Client (Arjun)    │                     │ Guest Client (Maria)   │
     │ UI Language: "hi"      │                     │ UI Language: "es"      │
     ├────────────────────────┤                     ├────────────────────────┤
     │ Shared Question:       │                     │ Shared Question:       │
     │ "क्या आपने कभी..."    │                     │ "क्या आपने कभी..."    │
     │                        │                     │                        │
     │ UI Chrome (Hindi):     │                     │ UI Chrome (Spanish):   │
     │ [कार्ड पलटें]          │                     │ [Girar carta]          │
     │ [लिंक कॉपी करें]       │                     │ [Copiar enlace]        │
     │ [खिलाड़ी छोड़ें]       │                     │ [Salir de la sala]     │
     └────────────────────────┘                     └────────────────────────┘
```
This guarantees synchronized social gameplay while keeping the interface completely native and understandable for participants across multiple regions.

