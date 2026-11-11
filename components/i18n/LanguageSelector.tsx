'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Globe, ChevronDown, Check, X } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { ALL_LOCALES, Locale, SUPPORTED_LOCALES } from '@/lib/i18n/config';
import { sound } from '@/lib/audio/soundSynthesizer';
import { cn } from '@/lib/utils';
import { LanguageModal } from './LanguageModal';

interface LanguageSelectorProps {
  variant?: 'header' | 'compact' | 'gameSetup' | 'footer';
  className?: string;
}

export function LanguageSelector({ variant = 'header', className }: LanguageSelectorProps) {
  const { locale, setLocale, isRTL, t } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownMenuRef = useRef<HTMLDivElement>(null);
  const activeOptionRef = useRef<HTMLButtonElement>(null);

  const currentMeta = SUPPORTED_LOCALES[locale] || SUPPORTED_LOCALES.en;

  // SSR hydration safety for React Portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll active language into view when menu opens
  useEffect(() => {
    if (isDropdownOpen) {
      requestAnimationFrame(() => {
        activeOptionRef.current?.scrollIntoView({ block: 'nearest' });
      });
    }
  }, [isDropdownOpen]);

  // Compute fixed position anchored directly to the trigger button
  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Sizing: min(320px, calc(100vw - 24px))
    const isGameSetup = variant === 'gameSetup';
    const menuWidth = isGameSetup
      ? Math.min(Math.max(rect.width, 280), Math.min(360, viewportWidth - 24))
      : Math.min(312, viewportWidth - 24);

    const maxHeight = Math.min(440, viewportHeight * 0.6);

    // Vertical positioning: check space below vs above
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const placeBelow = spaceBelow >= 260 || spaceBelow >= spaceAbove;

    const nextStyle: React.CSSProperties = {
      position: 'fixed',
      width: `${menuWidth}px`,
      maxHeight: `${maxHeight}px`,
      zIndex: 100,
      backgroundColor: '#0D0D1E',
    };

    if (placeBelow) {
      const topPos = rect.bottom + 8;
      nextStyle.top = `${topPos}px`;
      const availableH = viewportHeight - topPos - 12;
      nextStyle.maxHeight = `${Math.min(maxHeight, Math.max(availableH, 180))}px`;
    } else {
      const bottomPos = viewportHeight - rect.top + 8;
      nextStyle.bottom = `${bottomPos}px`;
      const availableH = rect.top - 12 - 8;
      nextStyle.maxHeight = `${Math.min(maxHeight, Math.max(availableH, 180))}px`;
    }

    if (isGameSetup) {
      // Align with setup card's left boundary, clamped to viewport margins
      const targetLeft = rect.left;
      const clampedLeft = Math.max(12, Math.min(targetLeft, viewportWidth - menuWidth - 12));
      nextStyle.left = `${clampedLeft}px`;
    } else if (isRTL) {
      // In RTL, align with button's left edge if it fits; otherwise keep anchored near left viewport edge (12px)
      if (rect.left + menuWidth <= viewportWidth - 12) {
        nextStyle.left = `${Math.max(12, rect.left)}px`;
      } else {
        nextStyle.left = '12px';
      }
    } else {
      // In LTR, align with button's right edge if it fits; otherwise keep anchored near right viewport edge (12px)
      if (rect.right - menuWidth >= 12) {
        nextStyle.right = `${Math.max(12, viewportWidth - rect.right)}px`;
      } else {
        nextStyle.right = '12px';
      }
    }

    setDropdownStyle(nextStyle);
  }, [variant, isRTL]);

  // Recalculate position on open, scroll, or resize
  useEffect(() => {
    if (!isDropdownOpen) return;
    updatePosition();

    const handleScroll = () => updatePosition();
    const handleResize = () => updatePosition();

    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isDropdownOpen, updatePosition]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isDropdownOpen) return;

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      if (
        dropdownMenuRef.current &&
        !dropdownMenuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Keyboard accessibility: Escape closes dropdown
  useEffect(() => {
    if (!isDropdownOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
        buttonRef.current?.focus();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDropdownOpen]);

  const handleSelectLocale = (newLocale: Locale) => {
    sound.triggerHaptic(15);
    setLocale(newLocale);
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    sound.triggerHaptic(10);
    setIsDropdownOpen((prev) => !prev);
  };

  return (
    <div
      className={cn(
        'relative inline-block text-left w-full sm:w-auto',
        variant === 'gameSetup' && 'w-full',
        className
      )}
    >
      {/* ========================================================
          1. HEADER VARIANT: Sleek Button in Navigation Bar
         ======================================================== */}
      {variant === 'header' && (
        <button
          ref={buttonRef}
          onClick={toggleDropdown}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isDropdownOpen}
          aria-controls="language-selector-dropdown"
          aria-label={t('common.changeLanguage')}
          className="h-9 sm:h-10 px-2.5 sm:px-3 rounded-xl bg-surface-elevated hover:bg-surface-highlight border border-white/10 hover:border-brand-400/30 flex items-center gap-1.5 sm:gap-2 text-slate-200 hover:text-white transition-all active:scale-95 shadow-sm"
        >
          <span className="text-sm select-none">{currentMeta.flag}</span>
          <span className="text-xs font-semibold tracking-wide hidden sm:inline">{currentMeta.nativeName}</span>
          <ChevronDown
            className={cn('w-3 h-3 text-slate-400 transition-transform duration-200', isDropdownOpen && 'rotate-180')}
          />
        </button>
      )}

      {/* ========================================================
          2. COMPACT VARIANT: Icon-Only Square
         ======================================================== */}
      {variant === 'compact' && (
        <button
          ref={buttonRef}
          onClick={toggleDropdown}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isDropdownOpen}
          aria-controls="language-selector-dropdown"
          aria-label={t('common.changeLanguage')}
          className="w-9 h-9 rounded-xl bg-surface-elevated hover:bg-surface-highlight border border-white/10 hover:border-brand-400/30 flex items-center justify-center text-slate-200 hover:text-white transition-all active:scale-95 shadow-sm"
        >
          <Globe className="w-4 h-4 text-brand-400" />
        </button>
      )}

      {/* ========================================================
          3. GAME SETUP VARIANT: Single-Row Compact Dropdown Tile
         ======================================================== */}
      {variant === 'gameSetup' && (
        <button
          ref={buttonRef}
          data-testid="game-setup-language-selector"
          onClick={toggleDropdown}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isDropdownOpen}
          aria-controls="language-selector-dropdown"
          aria-label={`${t('common.changeLanguage')}: ${currentMeta.nativeName}`}
          className="w-full h-10 sm:h-11 flex items-center justify-between px-3 sm:px-3.5 rounded-xl bg-surface-elevated hover:bg-surface-highlight border border-white/10 hover:border-brand-400/40 text-left transition-all active:scale-[0.99] shadow-sm group"
        >
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
      )}

      {/* ========================================================
          4. FOOTER VARIANT: Sleek Pill
         ======================================================== */}
      {variant === 'footer' && (
        <button
          ref={buttonRef}
          onClick={toggleDropdown}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isDropdownOpen}
          aria-controls="language-selector-dropdown"
          className="h-9 flex items-center gap-2 px-3 rounded-xl bg-surface-elevated hover:bg-surface-highlight border border-white/10 text-xs font-medium text-slate-300 hover:text-white transition-all shadow-sm"
        >
          <Globe className="w-3.5 h-3.5 text-brand-400" />
          <span>
            {currentMeta.flag} {currentMeta.nativeName}
          </span>
          <ChevronDown
            className={cn('w-3 h-3 text-slate-400 transition-transform', isDropdownOpen && 'rotate-180')}
          />
        </button>
      )}

      {/* ========================================================
          STANDALONE POPUP MENU (Rendered via React Portal)
         ======================================================== */}
      {mounted &&
        isDropdownOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <>
            {/* Mobile backdrop for clean separation and touch dismiss */}
            <div
              className="fixed inset-0 z-[95] bg-black/50 backdrop-blur-[1px] sm:hidden transition-opacity duration-200"
              onClick={() => setIsDropdownOpen(false)}
              aria-hidden="true"
            />

            {/* Standalone Dropdown Menu Container */}
            <div
              ref={dropdownMenuRef}
              id="language-selector-dropdown"
              role="listbox"
              aria-label={t('common.changeLanguage')}
              style={dropdownStyle}
              className={cn(
                'fixed z-[100] rounded-2xl bg-[#0D0D1E] border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.95),0_0_25px_rgba(139,92,246,0.2)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150',
                isRTL ? 'text-right' : 'text-left'
              )}
            >
              {/* Menu Header with clear title, count, and mobile close */}
              <div className="px-3.5 py-2 bg-[#13132B] border-b border-white/10 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
                    <Globe className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-white tracking-wide truncate">
                      {t('common.changeLanguage')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium truncate">
                      Interface Language
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className="text-[10px] font-mono text-brand-300 bg-brand-500/20 px-1.5 py-0.5 rounded border border-brand-500/30">
                    8 Langs
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors sm:hidden"
                    aria-label="Close language selector"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Language List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-1.5 scroll-py-2 space-y-1">
                {ALL_LOCALES.map((loc) => {
                  const meta = SUPPORTED_LOCALES[loc];
                  const isSelected = locale === loc;
                  return (
                    <button
                      key={loc}
                      ref={isSelected ? activeOptionRef : undefined}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelectLocale(loc)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-1.5 rounded-xl transition-all active:scale-[0.98] min-h-[40px]',
                        isRTL ? 'text-right' : 'text-left',
                        isSelected
                          ? 'bg-brand-500/25 border border-brand-400 text-white font-bold shadow-[0_0_12px_rgba(139,92,246,0.35)]'
                          : 'text-slate-200 hover:text-white hover:bg-white/5 active:bg-white/10 border border-transparent'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="text-base select-none shrink-0" aria-hidden="true">
                          {meta.flag}
                        </span>
                        <div className="min-w-0 flex-1">
                          <span
                            className={cn(
                              'text-xs sm:text-sm truncate block leading-tight',
                              isSelected ? 'font-bold text-white' : 'font-semibold text-slate-200'
                            )}
                          >
                            {meta.nativeName}
                          </span>
                          <span
                            className={cn(
                              'text-[10px] truncate block leading-tight',
                              isSelected ? 'text-brand-200/90 font-medium' : 'text-slate-400'
                            )}
                          >
                            {meta.name}
                          </span>
                        </div>
                      </div>

                      {isSelected ? (
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <span className="text-[10px] font-bold text-brand-300 bg-brand-500/20 px-1.5 py-0.5 rounded border border-brand-400/30">
                            Active
                          </span>
                          <Check className="w-3.5 h-3.5 text-brand-400 stroke-[3]" />
                        </div>
                      ) : meta.dir === 'rtl' ? (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400 shrink-0 ml-2">
                          RTL
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              {/* Menu Footer with Full Modal Portal Link & Scope Clarification */}
              <div className="px-2.5 py-1.5 bg-[#101026] border-t border-white/10 shrink-0 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsModalOpen(true);
                  }}
                  dir="ltr"
                  className="w-full text-center py-1.5 px-2 rounded-xl text-[11px] font-semibold text-brand-300 hover:text-brand-200 hover:bg-brand-500/15 border border-brand-500/25 transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                >
                  <Globe className="w-3.5 h-3.5 text-brand-400" />
                  <span>Full Language Modal →</span>
                </button>
                <p dir="ltr" className="text-[9px] text-slate-400 text-center leading-tight">
                  Party room question language is configured separately inside the room.
                </p>
              </div>
            </div>
          </>,
          document.body
        )}

      {/* Full-Screen Portal Modal (Preserved Functionality) */}
      <LanguageModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
export { LanguageModal };