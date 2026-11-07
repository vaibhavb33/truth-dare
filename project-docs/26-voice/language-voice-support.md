# Language Voice Support & BCP-47 Resolution Specification

## 1. Supported Languages & Target BCP-47 Codes

Asteria maps its 8 official application languages to specific regional BCP-47 language targets for the Web Speech API:

| Language Code | Language Name | Primary BCP-47 Target | Fallback Prefix | Example Native Voices | Script |
|---|---|---|---|---|---|
| **`en`** | English | `en-US` | `en` | Google US English, Samantha, Microsoft David, Daniel (en-GB) | Latin |
| **`hi`** | Hindi (हिन्दी) | `hi-IN` | `hi` | Google हिन्दी, Lekha, Microsoft Hemant, Kalpana | Devanagari |
| **`es`** | Spanish (Español) | `es-ES` | `es` | Monica, Jorge, Google español, Paulina (es-MX) | Latin |
| **`pt`** | Portuguese (Português) | `pt-BR` | `pt` | Luciana, Google português do Brasil, Joana (pt-PT) | Latin |
| **`fr`** | French (Français) | `fr-FR` | `fr` | Thomas, Google français, Amélie, Audrey | Latin |
| **`id`** | Indonesian (Bahasa Indonesia) | `id-ID` | `id` | Damayanti, Google Bahasa Indonesia, Gadis | Latin |
| **`ar`** | Arabic (العربية) | `ar-SA` | `ar` | Tarik, Maged (ar-EG), Laila, Google العربية | Arabic |
| **`de`** | German (Deutsch) | `de-DE` | `de` | Anna, Markus, Google Deutsch, Petra | Latin |

---

## 2. Multi-Tiered Voice Resolution Algorithm

The `SpeechService.getVoicesForLanguage(langCode)` method resolves voices using a deterministic two-tiered filter:

1. **Tier 1 — Exact Regional Target Match**:
   - Searches for voices with an exact BCP-47 match (e.g. `hi-IN`, `ar-SA`, `pt-BR`).
   - Normalizes underscores to hyphens (e.g. `hi_IN` -> `hi-IN`).

2. **Tier 2 — Language Family Dialect Match**:
   - If no exact regional dialect is installed, it permits dialects strictly within the same language family (e.g., if `pt-BR` is missing, `pt-PT` will be accepted).

3. **Strict Rejection Policy**:
   - If **zero** voices matching the language prefix exist on the user's operating system or browser, the resolver returns `null`.
   - **Crucial Rule**: The service **never** falls back to an unrelated language (such as attempting to read a Hindi Devanagari prompt using an English synthesis engine, which produces unintelligible gibberish).

---

## 3. Graceful User Notification
When a user requests voice playback for a language with no installed synthesizer on their machine:
1. Playback is safely prevented.
2. An accessible banner notification is displayed:
   - *"Native text-to-speech voice for this language is not available on your browser or device."*
3. The notification auto-dismisses after 4 seconds and does not block normal visual gameplay.
