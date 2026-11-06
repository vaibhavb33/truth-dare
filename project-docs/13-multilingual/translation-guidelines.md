# Asteria — Translation Guidelines & Linguistic Style Guide

**Document Reference:** `DOC-I18N-GUIDE-001`  
**Role:** Senior Full-Stack Developer & Internationalisation Architect  
**Project:** Asteria — Multilingual Truth or Dare Platform  
**Target Domain:** `https://truthordarequiz.com`  
**Status:** Approved Standard  

---

## 1. Translation Philosophy

Asteria is not a dry corporate utility; it is a **fast-paced, high-energy party gaming product**. All localized interface copy must reflect the excitement, humor, and social comfort of playing games with close friends.

### Core Translation Directives:
1. **Idiomatic over Literal:** Never translate word-for-word. Translate for the natural social context of a party night. (e.g., "Pick your poison" becomes "Elige tu veneno" or "اختر مسارك", not a literal food reference).
2. **Playful Informal Register:** Use the informal, friendly address across all European and Asian languages:
   - Spanish: Use **Tú** (e.g., "Elige tu camino", not "Elija su camino").
   - French: Use **Tu** (e.g., "Choisis ta voie", "Au tour de {name}").
   - German: Use **Du** (e.g., "Wähle deinen Weg", not "Wählen Sie").
   - Portuguese: Use informal Brazilian register ("Escolha seu caminho").
3. **Inclusive & Consent-Focused:** Asteria’s Safe Skipping policy must be translated with clarity, empathy, and zero ambiguity. Players must always feel empowered to skip any card without embarrassment or social pressure.

---

## 2. Scope of UI Translations vs. Content Engine

To avoid codebase bloat and architectural pollution, contributors must follow this strict separation of concerns:

### What Belongs in UI Translation Dictionaries (`lib/i18n/translations/*.ts`):
- Navigation bar links and mobile dock items.
- Game setup forms (player roster, add player, timer dropdown, start button).
- Gameplay control badges (`TRUTH`, `DARE`, `RANDOM`, `SKIP / VETO`, `COMPLETED`).
- Turn status statements (`Player 1's Turn`, `Time Remaining`, `Game Over`).
- Category names and marketing descriptions.
- Error toasts and validation alerts (`Please enter a 6-digit code`).
- Accessibility `aria-label` tags and modal close buttons.

### What MUST NOT Be Translated in UI Dictionaries:
- ❌ **Game Question Vault:** 500+ Truth and Dare questions belong to the separate Question Content Engine (`lib/questions/database.ts`). Questions must be localized through dedicated regional datasets, not hardcoded into UI string files.
- ❌ **Room Codes & Identifiers:** Codes like `PARTY9` or `ROOM42` are alphanumeric tokens and must remain untranslated.
- ❌ **Player-Created Names:** User input in player chips or custom deck creators must render verbatim.

---

## 3. String Interpolation Standards

### Token Syntax Rule:
Always use single curly braces `{token}` for variable interpolation:
```ts
// Approved
playerTurn: "{name}'s Turn"
skipsRemaining: "{count} Skips Left"
timerSeconds: "{seconds}s"
```

### Formatting Constraints:
1. **Never concatenate localized strings with `+`:**
   ```ts
   // BANNED:
   const label = t('game.player') + ' ' + player.name + ' ' + t('game.turn');

   // APPROVED:
   const label = t('game.playerTurn', { name: player.name });
   ```
2. **Preserve Token Names:** When translating into Hindi, Arabic, or German, do **not** translate the word inside the curly braces:
   - English: `"{name}'s Turn"`
   - Hindi: `"{name} की बारी"`
   - Spanish: `"Turno de {name}"`
   - Arabic: `"دور اللاعب: {name}"`
   - German: `"{name} ist am Zug"`

---

## 4. Text Expansion & Visual Budgeting

Translating from concise English into languages such as German, Spanish, French, or Indonesian frequently causes **text expansion of 20% to 35%**:

| English Original | German Translation | Spanish Translation | Indonesian Translation | Expansion % |
| :--- | :--- | :--- | :--- | :---: |
| `Start Game` | `Spiel Starten` | `Comenzar Partida` | `Mulai Game` | +38% |
| `Truth or Dare` | `Wahrheit oder Pflicht` | `Verdad o Reto` | `Truth or Dare` | +62% |
| `Dare Timer` | `Aufgaben-Timer` | `Temporizador de Reto` | `Waktu Tantangan` | +45% |
| `Quick Play` | `Schnellstart` | `Partida Rápida` | `Main Cepat` | +27% |

### Layout Rules to Prevent Overflow:
- **Button Sizing:** Use `min-h-[48px]` with flex wrapping or truncation rather than rigid fixed widths.
- **Card Badges:** Ensure `truncate max-w-full` is applied on card sub-labels so longer German compound words or Spanish descriptors do not clip off-screen.
- **Font Scaling:** Where necessary, reduce helper text from `text-xs` (12px) to `text-[11px]` on mobile devices to preserve single-line aesthetics.

---

## 5. Right-to-Left (RTL) Guidelines for Arabic

1. **Direction Declaration:**
   The `LanguageProvider` automatically toggles `dir="rtl"` on `<html>`. Components should rely on standard CSS logical properties (`margin-inline-start`, `text-start`, `text-end`) rather than hardcoded `left-0` or `right-0`.
2. **Icon Reversal:**
   Icons indicating forward progression (`ChevronRight`, `ArrowRight`) must be flipped in Arabic:
   ```tsx
   <ChevronRight className={cn("w-4 h-4", isRTL && "rotate-180")} />
   ```
3. **Punctuation & Numerals:**
   In Arabic typography, exclamation marks (`!`), commas (`،`), and question marks (`؟`) must appear on the correct semantic side of the sentence without manual spaces.
4. **Game Controller Order:**
   Controls that represent binary gameplay choices (Truth vs Dare) must remain consistent with the visual color scheme (Cyan on Left, Coral on Right on desktop) rather than swapping positions, which disorients repeat players.

---

*Standards enforced by Internationalisation Architect — Asteria Engineering Team.*
