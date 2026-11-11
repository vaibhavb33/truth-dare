# Global Language Dropdown Mobile QA Report (`TEST 2`)

**Project:** Asteria Multiplayer Party Gaming Platform  
**Test Suites:** [qaMobilePartyRoomFinal.js](file:///Users/vaibhavborkar/truth&dare/tests/e2e/qaMobilePartyRoomFinal.js) & [qaLanguageDropdownAudit.js](file:///Users/vaibhavborkar/truth&dare/tests/e2e/qaLanguageDropdownAudit.js)  
**Telemetry Source:** [qa-results.json](file:///Users/vaibhavborkar/truth&dare/project-docs/45-mobile-ui-final-qa/qa-results.json)  
**Overall Verdict:** **PASS**

---

## 1. Dropdown Behavior & Accessibility Matrix (`TEST 2`)

Executed in Chromium mobile context (`390×844px`, touch enabled) inside active Party Room `ESB5PS` ([qaMobilePartyRoomFinal.js](file:///Users/vaibhavborkar/truth&dare/tests/e2e/qaMobilePartyRoomFinal.js)) and cross-checked across 10 viewports (`320px`–`1440px`) in room `E9F5KQ` ([qaLanguageDropdownAudit.js](file:///Users/vaibhavborkar/truth&dare/tests/e2e/qaLanguageDropdownAudit.js)).

| Test Criterion | Empirical Measurement / Observed Behavior | Verdict |
| :--- | :--- | :--- |
| **Open & Close Toggle** | `header button[aria-controls="language-selector-dropdown"]` opens portal reliably (`opensOnClick: true`); closes via trigger, outside click, and `Escape`. | **PASS** |
| **Outside Click Dismissal** | Clicking `(10, 300)` outside dropdown dismisses menu cleanly (`outsideClickCloses: true`). | **PASS** |
| **Language Selection & Route Integrity** | Switching to `Español`, `हिन्दी (Hindi)`, and `العربية (Arabic)` keeps the active `/room/[code]` route intact without 404 errors (`<html lang="hi">`, `<html dir="rtl">`, `<html lang="es">`). | **PASS** |
| **Selected Language Indicator** | Selected option renders bordered highlight + explicit `Active` badge + checkmark (`activeIndicatorAccurate: true`). | **PASS** |
| **Background Opacity & Surface** | Computed style `rgb(13, 13, 30)` with `opacity: 1` and portal mounted directly on `<body>`, preventing background bleed-through or stacking traps (`solidOpaque: true`). | **PASS** |
| **Viewport Positioning & RTL Bounds** | All 10 viewports stay `>= 8px` within viewport margins (`withinViewport: true`); on `320px`: `296×360px` (`Left: 12px, Right: 308px`); on `390px`: `312×440px` (`Left: 66px, Right: 378px`); Arabic RTL on `390px`: `Left: 12px, Right: 324px`. | **PASS** |
| **Scrolling** | Option container measures `320px` visible height over `372px` scroll content (`scrollable: true`); scrolling reaches bottom item `Deutsch` cleanly (`scrollToLastItem: true`). | **PASS** |
| **Keyboard Interaction** | Pressing `Escape` closes the open dropdown and restores DOM focus to the header trigger (`escapeKeyCloses: true`, `focusRestored: true`). | **PASS** |
| **Global Language Persistence** | Reloading the Party Room preserves the selected UI language across navigation (`<html lang="es">`, `persistenceAfterReload: true`). | **PASS** |
| **Separation from Room Question Language** | Changing global UI language does not overwrite the Host-selected Party Room question language (`'en'` preserved). | **PASS** |

---

## 2. Visual Verification Screenshots

- **320px Ultra-Compact Phone:** [dropdown-320px.png](file:///Users/vaibhavborkar/truth&dare/project-docs/45-mobile-ui-final-qa/screenshots/dropdown-320px.png) — Fits `296px` wide with clean horizontal margins and visible `"Active"` badge + `"Full Language Modal ->"` CTA.
- **375px Compact Phone:** [dropdown-375px.png](file:///Users/vaibhavborkar/truth&dare/project-docs/45-mobile-ui-final-qa/screenshots/dropdown-375px.png) — Standalone menu cleanly overlays dimmed page content above bottom navigation.
- **390px Modern Phone:** [dropdown-390px.png](file:///Users/vaibhavborkar/truth&dare/project-docs/45-mobile-ui-final-qa/screenshots/dropdown-390px.png) — Displays solid `rgb(13, 13, 30)` card, RTL indicator on Arabic option, and explanatory footer note without transparency artifacts.
- **768px Tablet & 1440px Desktop:** [dropdown-768px.png](file:///Users/vaibhavborkar/truth&dare/project-docs/45-mobile-ui-final-qa/screenshots/dropdown-768px.png), [dropdown-1440px.png](file:///Users/vaibhavborkar/truth&dare/project-docs/45-mobile-ui-final-qa/screenshots/dropdown-1440px.png) — Anchored beneath header trigger without clipping toolbar controls underneath.
