# Asteria Question Content Strategy

**Platform**: Asteria — Truth or Dare Gaming Platform (`https://truthordarequiz.com`)  
**Role**: Senior Gaming Content Researcher + Native Language Content Localisation Specialist  
**Status**: APPROVED & IMPLEMENTED  
**Date**: November 2026  

---

## 1. Executive Summary

Asteria's gameplay experience depends entirely on high-engagement, emotionally resonant, culturally authentic party prompts. Unlike generic generators that rely on machine-translated or repetitive content, Asteria enforces an authentic native-language database architecture serving **8 tier-one gaming markets**:

1. **English (en)**: Global party, collegiate, and couples culture
2. **Hindi (hi)**: Indian social gatherings, college fests, family weddings, and informal *yaari-dosti* circles (Devanagari script)
3. **Spanish (es)**: Latin American & Spanish social culture, festive gatherings, and peer celebrations
4. **Portuguese (pt)**: Brazilian & Portuguese party culture, beach/house gatherings, and upbeat humor
5. **French (fr)**: Francophone witty banter, evening *soirées*, and nuanced dinner discussions
6. **Indonesian (id)**: Indonesian *nongkrong* culture, college *kos* hangouts, and playful youth slang
7. **Arabic (ar)**: Modern conversational Arab youth culture (*shabab* sessions, family game nights, RTL typography)
8. **German (de)**: German game night (*Spieleabend*) culture, clever situational comedy, and direct playful challenges

---

## 2. Content Pillars & Tone of Voice

### 2.1 The Four Psychological Pillars
Every question on Asteria is designed around one of four core emotional drivers:

1. **Relatable Confessions (Truth)**: Encouraging players to share amusing everyday vulnerabilities (bad haircuts, late-night searches, guilty pleasures) without fear of toxic judgment.
2. **Social Bonding (Friendship & Icebreakers)**: Deepening connections by highlighting positive group dynamics, mutual memories, and gentle interpersonal observations.
3. **High-Energy Physical Comedy (Dare)**: Safe, highly visual actions (mime, runway walks, voice accents, robot dances) that produce contagious group laughter.
4. **Romantic & Flirty Chemistry (Couples / Spicy)**: Safe, consensual romantic prompts tailored for dating couples, anniversaries, or intimate late-night game rounds.

### 2.2 Cultural Adaptation vs. Literal Translation
- **Literal translation fails in party games**: Idioms, cultural taboos, and humor vary drastically across cultures.
- **Transcreation approach**: Prompts are contextualized for each language rather than directly translated. For example:
  - English prompts referencing "stuck at airport" are adapted to "stuck at train station / late auto-rickshaw" or "stranded after midnight" in local dialects.
  - Hindi prompts use natural conversational terms (*yaari, jugad, filmy*) rather than stiff formal book Hindi.
  - Arabic prompts reflect modern conversational phrases while upholding community modesty guidelines.

---

## 3. Production Targets & Achievement Matrix

| Language | Code | Truth Target | Dare Target | Minimum Goal | Actual Delivered | Status |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| **English** | `en` | 300 | 300 | 600 | 652 *(600 new + 52 legacy)* | **Exceeded (108.7%)** |
| **Hindi** | `hi` | 300 | 300 | 600 | 600 | **Met (100.0%)** |
| **Spanish** | `es` | 150 | 150 | 300 | 300 | **Met (100.0%)** |
| **Portuguese** | `pt` | 150 | 150 | 300 | 300 | **Met (100.0%)** |
| **French** | `fr` | 100 | 100 | 200 | 200 | **Met (100.0%)** |
| **Indonesian** | `id` | 100 | 100 | 200 | 200 | **Met (100.0%)** |
| **Arabic** | `ar` | 100 | 100 | 200 | 200 | **Met (100.0%)** |
| **German** | `de` | 100 | 100 | 200 | 200 | **Met (100.0%)** |
| **TOTALS** | — | **1,300** | **1,300** | **2,600** | **2,652** | **100% Verified** |

---

## 4. Metadata Schema & Data Governance

Each question adheres strictly to the following normalized data model:

```typescript
export interface Question {
  id: string;                      // Globally unique deterministic ID (e.g., 'hi-t-042')
  game_type: GameType;             // 'truth-or-dare' | 'never-have-i-ever' | etc.
  question_type: QuestionType;     // 'truth' | 'dare' | 'would_you_rather' | etc.
  language_code: SupportedLanguageCode; // 'en' | 'hi' | 'es' | 'pt' | 'fr' | 'id' | 'ar' | 'de'
  category: QuestionCategory;      // 1 of 13 official categories
  difficulty: number;              // 1 to 5 scale (mild to intense)
  question_text: string;           // Localized prompt string
  content_rating: ContentRating;   // 'G' | 'PG-13' | 'R-18'
  age_group: AgeGroup;             // 'kids' | 'teens' | 'adults' | 'all-ages'
  is_active: boolean;              // Toggleable for instant moderation
  safety_reviewed: boolean;        // Verified by editorial screening
  created_at: string;              // ISO 8601 audit timestamp
}
```

---

## 5. Session Anti-Repetition Guarantee

A key failure mode in online party games is drawing the same card multiple times in a single evening. Asteria's `QuestionEngine` implements:
1. **Drawn-card session tracking**: `drawnCardIds: string[]` is maintained across state updates.
2. **O(1) Set filtering**: Eliminates previously seen cards before selecting from eligible pool.
3. **Exhaustion awareness**: When all cards in a category/language have been played, the engine signals `isExhausted: true`, triggering the Victory Leaderboard modal instead of silently cycling or crashing.
4. **No cross-language contamination**: Hindi sessions draw exclusively from Hindi cards; Arabic sessions draw exclusively from Arabic cards.

