'use client';

import React, { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { SUPPORTED_LOCALES } from '@/lib/i18n/config';
import { sound } from '@/lib/audio/soundSynthesizer';
import { cn } from '@/lib/utils';
import { LanguageModal } from './LanguageModal';

interface LanguageSelectorProps {
  variant?: 'header' | 'compact' | 'gameSetup' | 'footer';
  className?: string;
}

export function LanguageSelector({ variant = 'header', className }: LanguageSelectorProps) {
  const { locale, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentMeta = SUPPORTED_LOCALES[locale] || SUPPORTED_LOCALES.en;

  return (
    <div className={cn('relative inline-block text-left w-full sm:w-auto', variant === 'gameSetup' && 'w-full', className)}>
      {/* 1. Header Variant: Compact Action Button in Nav */}
      {variant === 'header' && (
        <button
          onClick={() => {
            sound.triggerHaptic(10);
            setIsOpen(true);
          }}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-label={t('common.changeLanguage')}
          className="h-9 sm:h-10 px-2.5 sm:px-3 rounded-xl bg-surface-elevated hover:bg-surface-highlight border border-white/10 hover:border-brand-400/30 flex items-center gap-1.5 sm:gap-2 text-slate-200 hover:text-white transition-all active:scale-95 shadow-sm"
        >
          <span className="text-sm select-none">{currentMeta.flag}</span>
          <span className="text-xs font-semibold tracking-wide hidden sm:inline">{currentMeta.nativeName}</span>
          <ChevronDown
            className={cn('w-3 h-3 text-slate-400 transition-transform duration-200', isOpen && 'rotate-180')}
          />
        </button>
      )}

      {/* 2. Compact Variant: Icon-Only Square */}
      {variant === 'compact' && (
        <button
          onClick={() => {
            sound.triggerHaptic(10);
            setIsOpen(true);
          }}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-label={t('common.changeLanguage')}
          className="w-9 h-9 rounded-xl bg-surface-elevated hover:bg-surface-highlight border border-white/10 hover:border-brand-400/30 flex items-center justify-center text-slate-200 hover:text-white transition-all active:scale-95 shadow-sm"
        >
          <Globe className="w-4 h-4 text-brand-400" />
        </button>
      )}

      {/* 3. Game Setup Variant: Single-Row Compact Dropdown (Low Vertical Footprint) */}
      {variant === 'gameSetup' && (
        <button
          data-testid="game-setup-language-selector"
          onClick={() => {
            sound.triggerHaptic(10);
            setIsOpen(true);
          }}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
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
                isOpen && 'rotate-180'
              )}
            />
          </div>
        </button>
      )}

      {/* 4. Footer Variant: Sleek Pill */}
      {variant === 'footer' && (
        <button
          onClick={() => {
            sound.triggerHaptic(10);
            setIsOpen(true);
          }}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          className="h-9 flex items-center gap-2 px-3 rounded-xl bg-surface-elevated hover:bg-surface-highlight border border-white/10 text-xs font-medium text-slate-300 hover:text-white transition-all shadow-sm"
        >
          <Globe className="w-3.5 h-3.5 text-brand-400" />
          <span>
            {currentMeta.flag} {currentMeta.nativeName}
          </span>
          <ChevronDown className={cn('w-3 h-3 text-slate-400 transition-transform', isOpen && 'rotate-180')} />
        </button>
      )}

      {/* Render the full-screen Portal Modal */}
      <LanguageModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
export { LanguageModal };
