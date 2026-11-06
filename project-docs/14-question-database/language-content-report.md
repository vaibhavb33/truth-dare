# Asteria Multilingual Language Content Report

**Audit Subject**: Live Multilingual Question Pool Breakdown & Validation  
**Date of Audit**: November 2026  
**Test Suite**: `tests/multilingualQuestions.test.ts` (100% Passed)  
**Total Production Questions**: **2,652 Validated Prompts**  

---

## 1. Master Language Content Audit

| Language Code | Language Name | Native Script | Truths | Dares | Legacy Retained | Total Questions | Verified Distinct |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|
| `en` | English | English | 300 | 300 | 52 | **652** | 100% (0 duplicates) |
| `hi` | Hindi | हिन्दी | 300 | 300 | 0 | **600** | 100% (0 duplicates) |
| `es` | Spanish | Español | 150 | 150 | 0 | **300** | 100% (0 duplicates) |
| `pt` | Portuguese | Português | 150 | 150 | 0 | **300** | 100% (0 duplicates) |
| `fr` | French | Français | 100 | 100 | 0 | **200** | 100% (0 duplicates) |
| `id` | Indonesian | Bahasa Indonesia | 100 | 100 | 0 | **200** | 100% (0 duplicates) |
| `ar` | Arabic | العربية | 100 | 100 | 0 | **200** | 100% (0 duplicates) |
| `de` | German | Deutsch | 100 | 100 | 0 | **200** | 100% (0 duplicates) |
| **TOTAL** | **8 Languages** | — | **1,300** | **1,300** | **52** | **2,652** | **100% Pass** |

---

## 2. Language-Specific Content Highlights

### 2.1 English (`en`) — 652 Questions
- **Files**: `lib/questions/database/en.ts` & `lib/questions/database/legacy.ts`
- **Tones Covered**: College party banter, funny dilemmas, awkward childhood confessions, couples milestones, high-energy physical challenges.
- **Sample Truth**: *"What is the most ridiculous lie you told to get out of an awkward conversation?"*
- **Sample Dare**: *"Speak in an over-the-top dramatic Shakespearean or pirate accent for your next two turns."*

### 2.2 Hindi (`hi`) — 600 Questions
- **File**: `lib/questions/database/hi.ts`
- **Script**: 100% Native Devanagari script (`\u0900-\u097F`) verified.
- **Cultural Adaptations**: Indian wedding situations, family gatherings, college hostel/canteen dynamics, Bollywood music and impressions.
- **Sample Truth**: *"किसी बोरिंग बातचीत से बचने के लिए आपने सबसे अजीब बहाना क्या बनाया है?"*
- **Sample Dare**: *"कमरे के केंद्र में खड़े होकर किसी पुरानी बॉलीवुड फिल्म के विलेन की तरह जोर से ठहाका लगाएं।"*

### 2.3 Spanish (`es`) — 300 Questions
- **File**: `lib/questions/database/es.ts`
- **Cultural Tone**: Natural Latin American & Peninsular Spanish social banter, lively party challenges, romantic confessions.
- **Sample Truth**: *"¿Cuál es la mentira más ridícula que has dicho para escapar de una reunión social?"*
- **Sample Dare**: *"Haz una muerte dramática de telenovela en cámara lenta en el centro de la sala."*

### 2.4 Portuguese (`pt`) — 300 Questions
- **File**: `lib/questions/database/pt.ts`
- **Cultural Tone**: Upbeat Brazilian & Portuguese party interactions, expressive humor, music and dance references.
- **Sample Truth**: *"Qual foi a mentira mais absurda que você já inventou para fugir de um rolê chato?"*
- **Sample Dare**: *"Dance como se estivesse desfilando no Carnaval durante 20 segundos sem parar."*

### 2.5 French (`fr`) — 200 Questions
- **File**: `lib/questions/database/fr.ts`
- **Cultural Tone**: Francophone dinner party banter (*soirée entre amis*), subtle comedic reflections, creative mime/theater challenges.
- **Sample Truth**: *"Quel est le mensonge le plus ridicule que tu aies inventé pour annuler une soirée ?"*
- **Sample Dare**: *"Fais semblant d'être un critique gastronomique trois étoiles en goûtant un simple verre d'eau."*

### 2.6 Indonesian (`id`) — 200 Questions
- **File**: `lib/questions/database/id.ts`
- **Cultural Tone**: Authentic Indonesian *nongkrong* culture, youth slang, playful neighborly humor (*bapak-bapak* jokes).
- **Sample Truth**: *"Kebohongan paling konyol apa yang pernah kamu buat demi bolos dari janji kumpul?"*
- **Sample Dare**: *"Ceritakan lelucon bapak-bapak paling garing tanpa boleh tersenyum sedikit pun."*

### 2.7 Arabic (`ar`) — 200 Questions
- **File**: `lib/questions/database/ar.ts`
- **Script**: 100% Authentic Arabic Unicode range (`\u0600-\u06FF`) with full RTL alignment.
- **Cultural Tone**: Family-respectful party humor, modern conversational youth banter, expressive storytelling.
- **Sample Truth**: *"ما هي أسخف كذبة قلتها للتهرب من مناسبة اجتماعية مملة؟"*
- **Sample Dare**: *"تحدث بلهجة مختلفة ومبالغ فيها تماماً خلال الجولتين القادمتين من اللعبة."*

### 2.8 German (`de`) — 200 Questions
- **File**: `lib/questions/database/de.ts`
- **Cultural Tone**: Classic German game night (*Spieleabend*) wit, candid friendship questions, self-deprecating humor.
- **Sample Truth**: *"Was ist die absurdeste Ausrede, die du je erfunden hast, um eine Verabredung abzusagen?"*
- **Sample Dare**: *"Tu so, als wärst du ein vornehmer Gourmet-Kritiker, der ein Glas Leitungswasser bewertet."*

---

## 3. Rating & Safety Distribution

| Content Rating | Definition | Questions | Percentage |
|:---:|:---|:---:|:---:|
| **G** | General Audience (Family & Kids Clean) | 520 | 19.6% |
| **PG-13** | Teen & Casual Party (Mild cheekiness, no explicit content) | 1,832 | 69.1% |
| **R-18** | Spicy Adult (Flirty, mature confessions; strictly age-gated) | 300 | 11.3% |
| **TOTAL** | — | **2,652** | **100.0%** |

