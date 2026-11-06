'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown, X, Sparkles } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { ALL_LOCALES, Locale, SUPPORTED_LOCALES } from '@/lib/i18n/config';
import { sound } from '@/lib/audio/soundSynthesizer';
import { cn } from '@/lib/utils';

interface LanguageSelectorProps {
  variant?: 'header' | 'compact' | 'gameSetup' | 'footer';
  className?: string;
}

export function LanguageSelector({ variant = 'header', className }: LanguageSelectorProps) {
  const { locale, setLocale, isRTL, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelectLanguage = (newLocale: Locale) => {
    sound.triggerHaptic(15);
    setLocale(newLocale);
    setIsOpen(false);
  };

  const currentMeta = SUPPORTED_LOCALES[locale] || SUPPORTED_LOCALES.en;

  return (
    <div className={cn('relative inline-block text-left', className)} ref={containerRef}>
      {/* Trigger Button based on Variant */}
      {variant === 'header' && (
        <button
          onClick={() => {
            sound.triggerHaptic(10);
            setIsOpen(!isOpen);
          }}
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
            setIsOpen(!isOpen);
          }}
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
            setIsOpen(!isOpen);
          }}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-surface-elevated/80 hover:bg-surface-highlight border border-white/10 hover:border-brand-500/40 text-left transition-all active:scale-[0.99] shadow-sm group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-lg select-none group-hover:scale-105 transition-transform">
              {currentMeta.flag}
            </div>
            <div>
              <div className="text-xs font-medium text-slate-400">{t('common.currentLanguage')}</div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                {currentMeta.name} — {currentMeta.nativeName}
                {currentMeta.dir === 'rtl' && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-500/30 text-brand-300">
                    RTL
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-400 group-hover:text-brand-300">
            <span>{t('common.changeLanguage')}</span>
            <ChevronDown className={cn('w-4 h-4 transition-transform duration-200', isOpen && 'rotate-180')} />
          </div>
        </button>
      )}

      {variant === 'footer' && (
        <button
          onClick={() => {
            sound.triggerHaptic(10);
            setIsOpen(!isOpen);
          }}
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

      {/* Dropdown / Modal Menu */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('common.changeLanguage')}
          className={cn(
            'absolute z-50 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0F0F23]/98 backdrop-blur-2xl border border-white/15 p-3 shadow-[0_16px_48px_rgba(0,0,0,0.85)] animate-in fade-in zoom-in-95 duration-150',
            isRTL ? 'left-0 origin-top-left' : 'right-0 origin-top-right'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                {t('common.changeLanguage')}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label={t('common.close')}
              className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Languages Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[380px] overflow-y-auto p-0.5 custom-scrollbar">
            {ALL_LOCALES.map((code) => {
              const item = SUPPORTED_LOCALES[code];
              const isSelected = item.code === locale;
              return (
                <button
                  key={item.code}
                  onClick={() => handleSelectLanguage(item.code)}
                  className={cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all group',
                    isSelected
                      ? 'bg-brand-500/25 border border-brand-400/50 shadow-[0_0_15px_rgba(139,92,246,0.25)] text-white'
                      : 'hover:bg-white/5 border border-transparent text-slate-300 hover:text-white'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xl select-none flex-shrink-0">{item.flag}</span>
                    <div className="flex flex-col truncate">
                      <span className="text-xs font-bold leading-tight truncate">
                        {item.name} - {item.nativeName}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                        {item.code.toUpperCase()}
                        {item.dir === 'rtl' && (
                          <span className="text-[9px] px-1 rounded bg-white/10 text-brand-300">RTL</span>
                        )}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0 text-white shadow-glow-brand">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="mt-2.5 pt-2 border-t border-white/10 px-2 text-[11px] text-slate-400 text-center">
            🌍 {t('common.currentLanguage')}:{' '}
            <span className="font-semibold text-brand-300">{currentMeta.nativeName}</span>
          </div>
        </div>
      )}
    </div>
  );
}

