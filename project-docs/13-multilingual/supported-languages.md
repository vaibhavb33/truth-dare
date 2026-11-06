# Asteria — Supported Languages & Linguistic Specifications

**Document Reference:** `DOC-I18N-LANGS-001`  
**Role:** Internationalisation Architect & Localization Specialist  
**Platform:** Asteria Gaming Platform  
**Target Domain:** `https://truthordarequiz.com`  
**Initial Launch Languages:** 8  
**Status:** Deployed in Production  

---

## 1. Supported Languages Matrix

Below is the verified inventory of the 8 initial launch languages supported across Asteria:

| ISO Code | English Name | Native Name (Endonym) | Writing Script | Layout Direction | BCP 47 Locale | Flag | Primary Regional Markets |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **`en`** | English | **English** | Latin | LTR | `en-US` | 🇬🇧 | USA, UK, Canada, Australia, Global |
| **`hi`** | Hindi | **हिन्दी** | Devanagari | LTR | `hi-IN` | 🇮🇳 | India, South Asian Diaspora |
| **`es`** | Spanish | **Español** | Latin | LTR | `es-ES` | 🇪🇸 | Spain, Mexico, Argentina, Colombia, LatAm |
| **`pt`** | Portuguese | **Português** | Latin | LTR | `pt-BR` | 🇧🇷 | Brazil, Portugal, Angola, Mozambique |
| **`fr`** | French | **Français** | Latin | LTR | `fr-FR` | 🇫🇷 | France, Canada (QC), Belgium, Switzerland, West Africa |
| **`id`** | Indonesian | **Bahasa Indonesia** | Latin | LTR | `id-ID` | 🇮🇩 | Indonesia, Southeast Asia |
| **`ar`** | Arabic | **العربية** | Arabic | **RTL** | `ar-SA` | 🇸🇦 | Saudi Arabia, UAE, Egypt, Levant, North Africa |
| **`de`** | German | **Deutsch** | Latin | LTR | `de-DE` | 🇩🇪 | Germany, Austria, Switzerland |

---

## 2. Core Game Terminology & Cultural Adaptations

Literal translations of game terms often fail in social party settings. Asteria uses culturally recognized colloquial phrasing for each language:

### Game Titles & Core Mechanics:

```
┌──────────┬────────────────────────┬───────────────────┬──────────────────────┬──────────────────────┐
│ ISO Code │ Platform Game Title    │ Truth Label       │ Dare Label           │ Action Button CTA    │
├──────────┼────────────────────────┼───────────────────┼──────────────────────┼──────────────────────┤
│ en       │ Truth or Dare          │ TRUTH             │ DARE                 │ Start Game           │
│ hi       │ ट्रुथ या डेयर          │ सच्चाई (TRUTH)    │ चुनौती (DARE)        │ गेम शुरू करें        │
│ es       │ Verdad o Reto          │ VERDAD            │ RETO                 │ Comenzar Partida     │
│ pt       │ Verdade ou Desafio     │ VERDADE           │ DESAFIO              │ Iniciar Jogo         │
│ fr       │ Action ou Vérité       │ VÉRITÉ            │ ACTION               │ Démarrer la Partie   │
│ id       │ Truth or Dare          │ JUJUR (TRUTH)     │ TANTANGAN (DARE)     │ Mulai Game           │
│ ar       │ صراحة أم جرأة          │ صراحة (TRUTH)     │ جرأة (DARE)          │ بدء اللعبة           │
│ de       │ Wahrheit oder Pflicht  │ WAHRHEIT          │ PFLICHT              │ Spiel Starten        │
└──────────┴────────────────────────┴───────────────────┴──────────────────────┴──────────────────────┘
```

---

## 3. Language Profiles & Typography

### 1. English (`en`)
- **Tone:** Energetic, social, sleek, playful.
- **Font Stack:** Plus Jakarta Sans (Headings), Inter (Body & UI), JetBrains Mono (Codes & Numbers).
- **Nuances:** Clear distinction between party and mature decks.

### 2. Hindi (`hi` — हिन्दी)
- **Tone:** Warm, relatable, high-energy ("मस्ती और चुनौतियां").
- **Font Stack:** Noto Sans Devanagari, Plus Jakarta Sans fallback.
- **Script Handling:** Full Devanagari Unicode support with verified conjuncts and matra alignments. Dual labeling (`सच्चाई / TRUTH` and `चुनौती / DARE`) allows both traditional and Hinglish-speaking youth to navigate comfortably.

### 3. Spanish (`es` — Español)
- **Tone:** Festive, expressive, social ("Noches de juego inolvidables").
- **Font Stack:** Plus Jakarta Sans, Inter.
- **Nuances:** Neutral Latin American and Castilian neutral phrasing (e.g., using "Partida" and "Baraja" which translate universally without regional friction).

### 4. Portuguese (`pt` — Português)
- **Tone:** Spontaneous, cheerful, direct ("Diversão sem filtros").
- **Font Stack:** Plus Jakarta Sans, Inter.
- **Nuances:** Brazilian Portuguese phrasing optimized for casual party settings ("Pular Pergunta", "Desafio Cumprido", "Jogo Rápido").

### 5. French (`fr` — Français)
- **Tone:** Stylish, witty, engaging ("Fous rires garantis").
- **Font Stack:** Plus Jakarta Sans, Inter.
- **Nuances:** Traditional terminology "Action ou Vérité". Proper French non-breaking spaces before colons and punctuation are respected in dictionaries.

### 6. Indonesian (`id` — Bahasa Indonesia)
- **Tone:** Friendly, casual, youth-oriented ("Keseruan tanpa batas").
- **Font Stack:** Plus Jakarta Sans, Inter.
- **Nuances:** Clear distinction between "Jujur" and "Tantangan", widely adopted across Jakarta and Southeast Asian casual gaming streams.

### 7. Arabic (`ar` — العربية)
- **Tone:** Respectful, lively, welcoming ("ضحك متواصل وتحديات جريئة").
- **Font Stack:** Cairo, Tahoma, Segoe UI, sans-serif.
- **Direction:** **Right-to-Left (RTL)**.
- **Nuances:** Modern Standard Arabic (Fusha) accessible across GCC, Levant, and North Africa. Replaces generic text with idiomatic gaming phrases ("صراحة أم جرأة", "تخطي السؤال", "تم إنجاز التحدي").

### 8. German (`de` — Deutsch)
- **Tone:** Precise, fun, punchy ("Ungefilterter Spaß").
- **Font Stack:** Plus Jakarta Sans, Inter.
- **Nuances:** Standard German compounding handled cleanly to avoid text clipping in cards and buttons ("Wahrheit oder Pflicht", "Aufgaben-Timer").

---

## 4. Market Sizing & Growth Potential

| Language | Global Speaker Base | Target Organic Search Keywords | Traffic Growth Target |
| :--- | :--- | :--- | :--- |
| **English** | 1.5 Billion | `truth or dare online`, `play truth or dare free` | Baseline Tier 1 |
| **Spanish** | 560 Million | `juego de verdad o reto online`, `preguntas verdad o reto` | +40% Global Organic |
| **Hindi** | 610 Million | `truth or dare game online`, `truth or dare questions in hindi` | High-Volume Growth |
| **Portuguese** | 260 Million | `verdade ou desafio online`, `brincadeira verdade ou desafio` | +25% Social Engagement |
| **French** | 320 Million | `jeu action ou vérité en ligne`, `questions action ou vérité` | High Conversion |
| **Arabic** | 420 Million | `لعبة صراحة أو جرأة اون لاين`, `اسئلة صراحة وجرأة` | Untapped Blue Ocean |
| **German** | 135 Million | `wahrheit oder pflicht online spielen`, `flaschendrehen online` | High-RPM European Core |
| **Indonesian**| 200 Million | `main truth or dare online`, `game pesta online seru` | Viral Mobile Market |

---

*Document approved by Internationalisation Architect — Asteria Platform Launch.*

