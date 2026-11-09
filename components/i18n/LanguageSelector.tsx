'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentMeta = SUPPORTED_LOCALES[locale] || SUPPORTED_LOCALES.en;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  // Keyboard accessibility: Escape closes dropdown
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
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
      ref={dropdownRef}
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
          onClick={toggleDropdown}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isDropdownOpen}
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
          onClick={toggleDropdown}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isDropdownOpen}
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
          data-testid="game-setup-language-selector"
          onClick={toggleDropdown}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isDropdownOpen}
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
          onClick={toggleDropdown}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isDropdownOpen}
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
          COMPACT DROPDOWN POPOVER (Fast 1-Click Language Switcher)
         ======================================================== */}
      {isDropdownOpen && (
        <div
          role="listbox"
          aria-label={t('common.changeLanguage')}
          className={cn(
            'absolute top-full mt-1.5 z-50 rounded-2xl bg-[#0F0F23]/98 backdrop-blur-xl border border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.85)] p-1.5 animate-in fade-in zoom-in-95 duration-150',
            variant === 'header'
              ? isRTL
                ? 'left-0 sm:left-auto sm:right-0 w-64'
                : 'right-0 w-64'
              : 'left-0 right-0 sm:right-auto sm:w-72'
          )}
        >
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/10 mb-1 flex items-center justify-between">
            <span>{t('common.changeLanguage')}</span>
            <span className="text-[9px] text-brand-400 font-mono">8 Languages</span>
          </div>

          <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-0.5">
            {ALL_LOCALES.map((loc) => {
              const meta = SUPPORTED_LOCALES[loc];
              const isSelected = locale === loc;
              return (
                <button
                  key={loc}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectLocale(loc)}
                  className={cn(
                    'w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all active:scale-[0.98]',
                    isSelected
                      ? 'bg-brand-500/20 text-white font-bold border border-brand-400/40 shadow-glow-brand'
                      : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-base select-none shrink-0">{meta.flag}</span>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs sm:text-sm font-semibold truncate block">
                        {meta.nativeName}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate block">
                        {meta.name}
                      </span>
                    </div>
                  </div>
                  {isSelected ? (
                    <Check className="w-4 h-4 text-brand-400 shrink-0 ml-1.5" />
                  ) : meta.dir === 'rtl' ? (
                    <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-brand-500/20 text-brand-300 shrink-0">
                      RTL
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Footer Action: Full Modal Portal Option */}
          <div className="border-t border-white/10 mt-1 pt-1">
            <button
              type="button"
              onClick={() => {
                setIsDropdownOpen(false);
                setIsModalOpen(true);
              }}
              className="w-full text-center py-1.5 px-2 rounded-lg text-[11px] font-medium text-brand-400 hover:text-brand-300 hover:bg-brand-500/10 transition-colors flex items-center justify-center gap-1.5"
            >
              <Globe className="w-3 h-3" />
              <span>Full Language Modal →</span>
            </button>
          </div>
        </div>
      )}

      {/* Full-Screen Portal Modal (Preserved Functionality) */}
      <LanguageModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
export { LanguageModal };
