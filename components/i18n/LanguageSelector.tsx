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
    <div className={cn('relative inline-block text-left', className)}>
      {/* Trigger Button based on Variant */}
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
          className="h-10 px-3 rounded-xl bg-surface-elevated hover:bg-surface-highlight border border-white/10 hover:border-white/25 flex items-center gap-2 text-slate-200 hover:text-white transition-all active:scale-95 shadow-sm"
        >
          <span className="text-base select-none">{currentMeta.flag}</span>
          <span className="text-xs font-semibold tracking-wide hidden sm:inline">{currentMeta.nativeName}</span>
          <ChevronDown
            className={cn('w-3.5 h-3.5 text-slate-400 transition-transform duration-200', isOpen && 'rotate-180')}
          />
        </button>
      )}

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
          className="w-10 h-10 rounded-xl bg-surface-elevated hover:bg-surface-highlight border border-white/10 hover:border-white/25 flex items-center justify-center text-slate-200 hover:text-white transition-all active:scale-95 shadow-sm"
        >
          <Globe className="w-4 h-4 text-brand-400" />
        </button>
      )}

      {variant === 'gameSetup' && (
        <button
          onClick={() => {
            sound.triggerHaptic(10);
            setIsOpen(true);
          }}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          className="w-full flex items-center justify-between px-3.5 sm:px-4 py-3 rounded-2xl bg-surface-elevated/80 hover:bg-surface-highlight border border-white/10 hover:border-brand-500/40 text-left transition-all active:scale-[0.99] shadow-sm group"
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 pr-2">
            <div className="w-9 h-9 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-lg select-none group-hover:scale-105 transition-transform shrink-0">
              {currentMeta.flag}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] sm:text-xs font-medium text-slate-400 truncate">{t('common.currentLanguage')}</div>
              <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 truncate">
                <span className="truncate">{currentMeta.name} — {currentMeta.nativeName}</span>
                {currentMeta.dir === 'rtl' && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-brand-500/30 text-brand-300 shrink-0">
                    RTL
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-semibold text-brand-400 group-hover:text-brand-300 shrink-0 ml-1">
            <span className="hidden xs:inline">{t('common.changeLanguage')}</span>
            <ChevronDown className={cn('w-4 h-4 transition-transform duration-200', isOpen && 'rotate-180')} />
          </div>
        </button>
      )}

      {variant === 'footer' && (
        <button
          onClick={() => {
            sound.triggerHaptic(10);
            setIsOpen(true);
          }}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-elevated hover:bg-surface-highlight border border-white/10 text-xs font-medium text-slate-300 hover:text-white transition-all shadow-sm"
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
