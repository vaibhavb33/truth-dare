# Asteria Language Selector: Compact Redesign Specification

**Document Version:** 1.1.0  
**Audit Date:** November 9, 2026  
**Auditor:** Senior UI/UX Designer + Frontend Developer  
**Subsystem:** Global Internationalization & Game Setup Language Selector (`components/i18n/LanguageSelector.tsx`)  
**Status:** **ACTIVE & PRODUCTION VERIFIED**

---

## 1. Executive Summary & Problem Reference

In the Pass & Play Game Setup screen (referenced in user screenshot 3), the language selector component occupied excessive vertical space, created cognitive redundancy, and pushed critical interactive elements ("1. Select Category", player roster, and start buttons) far down the mobile viewport.

### 1.1. Identified Deficiencies in Legacy Component
1. **Redundant External Label:** An uppercase label `<label>CHANGE LANGUAGE:</label>` sat above the selector, while the selector interior duplicated both `"Current Language"` and `"Change Language"`.
2. **Excessive Vertical Footprint (~100px total):**
   - External label: ~24px height
   - Button padding: `py-3` (24px padding)
   - Large flag container: `w-9 h-9` (36px box with heavy purple background and border)
   - Two stacked lines of text inside the button
   - Margins: `space-y-2` (8px)
   - Total vertical space consumed: **~96px to 104px**.
3. **Pushed Game Categories Down:** On standard mobile screens (320px–390px), the 100px block forced the user to scroll before even seeing category options or player lists.
4. **Oversized Appearance:** The large purple flag box and duplicated phrasing looked disproportionate and visually heavy.

---

## 2. Redesigned Compact Component Architecture

The redesigned `LanguageSelector` (`variant="gameSetup"`) streamlines the component into a sleek, single-row dropdown trigger:

```text
BEFORE (OVERSIZED & DUPLICATIVE ~100px):
+-----------------------------------------------------------+
|  CHANGE LANGUAGE:                                         | <-- Redundant External Label
|  +-----------------------------------------------------+  |
|  | [ PURPLE BOX ]  Current Language                    |  |
|  | [    FLAG    ]  English — English                   |  | <-- Two-tier vertical text
|  |                 Change Language >                   |  |
|  +-----------------------------------------------------+  |
+-----------------------------------------------------------+

AFTER (COMPACT SINGLE-ROW DROPDOWN ~40px):
+-----------------------------------------------------------+
|  [ 🌐  🇺🇸  English (English)          Change Language ▾ ] | <-- 40px Single-Row Trigger
+-----------------------------------------------------------+
   |
   v Clicking opens anchored floating dropdown:
+-----------------------------------------------------------+
| CHANGE LANGUAGE                             8 Languages   |
| --------------------------------------------------------- |
| [x] 🇺🇸 English (English)                                  |
| [ ] 🇮🇳 हिन्दी (Hindi)                                      |
| [ ] 🇪🇸 Español (Spanish)                                  |
| [ ] 🇧🇷 Português (Portuguese)                             |
| [ ] 🇫🇷 Français (French)                                  |
| [ ] 🇮🇩 Bahasa Indonesia (Indonesian)                      |
| [ ] 🇸🇦 العربية (Arabic)                              [RTL] |
| [ ] 🇩🇪 Deutsch (German)                                   |
| --------------------------------------------------------- |
| 🌐 Full Language Modal →                                  |
+-----------------------------------------------------------+
```

### 2.1. Structural Specifications

```tsx
<button
  data-testid="game-setup-language-selector"
  onClick={toggleDropdown}
  type="button"
  aria-haspopup="listbox"
  aria-expanded={isDropdownOpen}
  aria-label={`${t('common.changeLanguage')}: ${currentMeta.nativeName}`}
  className="w-full h-10 sm:h-11 flex items-center justify-between px-3 sm:px-3.5 rounded-xl bg-surface-elevated hover:bg-surface-highlight border border-white/10 hover:border-brand-400/40 text-left transition-all active:scale-[0.99] shadow-sm group"
>
  {/* Left: Globe Icon + Flag Emoji + Native Name + English Name */}
  <div className="flex items-center gap-2 min-w-0 flex-1 pr-1.5">
    <Globe className="w-3.5 h-3.5 text-brand-400 shrink-0" />
    <span className="text-sm select-none shrink-0">{currentMeta.flag}</span>
    <span className="text-xs sm:text-sm font-bold text-white truncate">
      {currentMeta.nativeName}
      <span className="text-slate-400 font-normal ml-1.5 hidden xs:inline text-xs">
        ({currentMeta.name})
      </span>
    </span>
    {currentMeta.dir === 'rtl' && (
      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 shrink-0">
        RTL
      </span>
    )}
  </div>

  {/* Right: Subtle Action Hint + Animated Chevron */}
  <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-400 group-hover:text-brand-300 shrink-0 ml-1">
    <span className="text-[11px] sm:text-xs font-medium text-slate-400 group-hover:text-slate-300 hidden sm:inline">
      {t('common.changeLanguage')}
    </span>
    <ChevronDown
      className={cn(
        'w-3.5 h-3.5 text-slate-400 group-hover:text-brand-400 transition-transform duration-200',
        isDropdownOpen && 'rotate-180'
      )}
    />
  </div>
</button>
```

---

## 3. Key Design Improvements

1. **Elimination of External Label:** Removed the `<label>CHANGE LANGUAGE:</label>` element from `TruthOrDareGameClient.tsx`. The selector communicates its purpose through the inline `Globe` icon, native flag, native language name, and chevron indicator.
2. **60% Reduction in Vertical Height:** Total component height decreased from ~100px to **40px on mobile** (`h-10`) and **44px on desktop** (`sm:h-11`). Reclaims ~60px of screen real estate.
3. **Optimized Icon Size:** Replaced the 36px purple container with an inline 14px `Globe` icon (`text-brand-400`) and standard flag emoji.
4. **Single-Row Mobile Layout:** Designed with flexbox to fit within 320px viewports without wrapping or line collision.
5. **Native Language Legibility:** The native script name is displayed in bold (`text-xs sm:text-sm font-bold text-white`), with English name in parentheses on $\ge 360$px devices (`hidden xs:inline`).
6. **Dual Interaction Paradigm (Dropdown + Preserved Modal):**
   - **Compact Dropdown Popover:** Fast 1-click language switcher displaying all 8 supported languages with flags, native scripts, active checks, and RTL badges.
   - **Full Language Modal:** Preserved for users desiring the immersive search/modal view via the "Full Language Modal →" button at the bottom of the popover.
   - **Keyboard & Click-Away:** Escape key and outside mouse clicks immediately dismiss the floating dropdown.
