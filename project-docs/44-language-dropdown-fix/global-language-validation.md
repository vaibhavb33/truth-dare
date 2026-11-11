# Global Language Selector: Translation, Accessibility & Separation Validation

**Project:** Asteria — Multiplayer Party Gaming Platform  
**Components Validated:** `LanguageSelector.tsx`, `LanguageContext.tsx`, `LanguageModal.tsx`, `RoomClient.tsx`  
**Author:** Senior React Developer + UI/UX Engineer  
**Date:** 2026-11-11  
**Status:** **ALL 8 LANGUAGES, RTL, ACCESSIBILITY & SEPARATION VERIFIED**

---

## 1. Supported Languages Matrix (All 8 Locales)

All 8 configured locales in `lib/i18n/config.ts` render with their native script, flag emoji, English subtitle, and accurate directional alignment:

| Locale Code | Flag | Native Name | English Name | Text Direction (`dir`) | Status Badge / Marker | Verified Rendering |
|:---:|:---:|:---|:---|:---:|---|:---:|
| `en` | 🇺🇸 / 🇬🇧 | English | English | `ltr` | `Active` pill + checkmark when selected | **PASS** |
| `hi` | 🇮🇳 | हिन्दी | Hindi | `ltr` | `Active` pill + checkmark when selected | **PASS** |
| `es` | 🇪🇸 | Español | Spanish | `ltr` | `Active` pill + checkmark when selected | **PASS** |
| `pt` | 🇧🇷 | Português | Portuguese | `ltr` | `Active` pill + checkmark when selected | **PASS** |
| `fr` | 🇫🇷 | Français | French | `ltr` | `Active` pill + checkmark when selected | **PASS** |
| `id` | 🇮🇩 | Bahasa Indonesia | Indonesian | `ltr` | `Active` pill + checkmark when selected | **PASS** |
| `ar` | 🇸🇦 | العربية | Arabic | `rtl` | `RTL` tag + `Active` pill when active | **PASS** |
| `de` | 🇩🇪 | Deutsch | German | `ltr` | `Active` pill + checkmark when selected | **PASS** |

---

## 2. Hindi & Arabic RTL Deep Validation

### 2.1 Hindi (`hi`)
- Selecting **हिन्दी** updates `<html lang="hi">`, `localStorage`, and the `NEXT_LOCALE` cookie immediately.
- In active Party Room sessions (`/room/[code]`):
  - Header title translates cleanly to **`पार्टी रूम`**.
  - Host indicator translates to **`रूम होस्ट 👑`**.
  - Primary CTA translates to **`गेम शुरू करें →`**.
  - No 404 navigation crash occurs; the active room connection remains intact.
- Dropdown header translates dynamically to **`भाषा बदलें`** (`Interface Language`).

### 2.2 Arabic (`ar` — Right-to-Left)
- Selecting **العربية** updates `<html lang="ar" dir="rtl">`.
- Horizontal mirroring across `AppHeader` flips the language button to the top-left utility cluster.
- Portal positioning switches cleanly to RTL alignment (`left: 12px` flush under the RTL header utility controls on narrow mobile, or button-left-aligned on tablet/desktop), staying strictly within `[12px, viewportWidth - 12px]`.
- Text alignment inside option rows matches `isRTL` (`text-right`), while English informational helper text inside the footer preserves `dir="ltr"` so trailing punctuation (`.`) does not jump to the start of the line.
- Opening the dropdown while Arabic is active automatically calls `activeOptionRef.current.scrollIntoView({ block: 'nearest' })` so Arabic (`العربية`) is immediately visible in view with its `Active` pill and checkmark.

---

## 3. Separation of Concerns: Global UI Language vs Room Question Language

| Setting Domain | Owner / Storage | Controlled By | Effect on Party Room Questions | Verified Isolated? |
|---|---|---|---|---|
| **Global Interface Language** | `LanguageContext` (`locale`, `localStorage`, `NEXT_LOCALE`) | Top Header / Footer / Setup `LanguageSelector` | Translates menus, navigation links, labels, headers, and `<html dir>` ONLY. **Does NOT alter `room.language`.** | **PASS (Verified)** |
| **Shared Room Question Language** | Multiplayer Room State (`room.language`) | Host Room Settings Modal (`UPDATE_LOBBY_SETTINGS`) | Determines shared Truth & Dare card prompts and AI TTS voice synthesis language for all connected players. | **PASS (Verified)** |

- **Empirical Verification:** In automated testing (`qaLanguageDropdownAudit.js`), a Party Room created with `language: 'en'` kept `room.language === 'en'` even after the user switched the Global Interface Language to Hindi (`hi`), then Arabic (`ar`), and back to English (`en`) via the header dropdown. The footer note inside the dropdown explicitly informs users: *"Party room question language is configured separately inside the room."*

---

## 4. Interaction & Accessibility Checklist

| Requirement | Implementation Detail | Empirical Verification |
|---|---|---|
| **Open on click / tap** | Trigger `<button>` toggles `isDropdownOpen` with haptic pulse | **PASS** |
| **Close after selection** | `handleSelectLocale` updates locale and closes dropdown cleanly | **PASS** |
| **Close on outside click / tap** | Document `mousedown`/`touchstart` listener + mobile `inset-0` dim backdrop | **PASS** |
| **Close on Escape key** | Window `keydown` (`Escape`) closes menu and returns focus to trigger button | **PASS** |
| **ARIA Semantics** | Trigger has `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls`; menu has `role="listbox"`; options have `role="option"` & `aria-selected` | **PASS** |
| **Modal Portal Access Preserved** | `Full Language Modal →` button opens full-screen `LanguageModal` portal | **PASS** |
