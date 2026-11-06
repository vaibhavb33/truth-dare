'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Globe, Check, X, Sparkles } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { ALL_LOCALES, Locale, SUPPORTED_LOCALES } from '@/lib/i18n/config';
import { sound } from '@/lib/audio/soundSynthesizer';
import { cn } from '@/lib/utils';

export interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LanguageModal({ isOpen, onClose }: LanguageModalProps) {
  const { locale, setLocale, isRTL, t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // SSR hydration safety for React Portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [isOpen]);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSelectLanguage = (newLocale: Locale) => {
    sound.triggerHaptic(15);
    setLocale(newLocale);
    onClose();
  };

  const currentMeta = SUPPORTED_LOCALES[locale] || SUPPORTED_LOCALES.en;

  if (!isOpen || !mounted) {
    return null;
  }

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="language-modal-title"
      aria-describedby="language-modal-description"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-[#07070F]/90 backdrop-blur-md pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-all animate-in fade-in duration-200"
      onClick={(e) => {
        // Close when clicking directly on the backdrop outside the modal
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Modal Dialog Box */}
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'relative w-full max-w-[520px] max-h-[calc(100dvh-32px)] sm:max-h-[85vh] rounded-3xl bg-[#0F0F23] border border-white/15 shadow-[0_24px_64px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200',
          isRTL ? 'text-right' : 'text-left'
        )}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 px-4 sm:px-6 py-3.5 sm:py-4 bg-[#0F0F23]/98 backdrop-blur-xl border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2
                id="language-modal-title"
                className="font-display font-extrabold text-base sm:text-lg text-white tracking-tight flex items-center gap-1.5 truncate"
              >
                <span>{t('common.changeLanguage')}</span>
                <Sparkles className="w-3.5 h-3.5 text-brand-400 shrink-0 hidden xs:inline-block" />
              </h2>
              <p
                id="language-modal-description"
                className="text-xs text-slate-400 truncate leading-snug mt-0.5"
              >
                {t('common.languageSubtitle')}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.triggerHaptic(10);
              onClose();
            }}
            aria-label={t('common.close')}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 flex items-center justify-center text-slate-400 hover:text-white transition-all border border-white/10 shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Language Grid */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 custom-scrollbar space-y-3">
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-2.5">
            {ALL_LOCALES.map((code) => {
              const item = SUPPORTED_LOCALES[code];
              const isSelected = item.code === locale;

              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleSelectLanguage(item.code)}
                  role="button"
                  aria-pressed={isSelected}
                  aria-label={`${item.name} (${item.nativeName})`}
                  className={cn(
                    'group relative p-3 sm:p-3.5 rounded-2xl border transition-all duration-150 flex items-center justify-between text-left active:scale-[0.98]',
                    isSelected
                      ? 'bg-brand-500/20 border-brand-500/60 shadow-[0_0_20px_rgba(139,92,246,0.25)] ring-1 ring-brand-400/40 text-white'
                      : 'bg-[#14142B]/80 hover:bg-[#1C1C3B] border-white/10 hover:border-brand-500/40 text-slate-300 hover:text-white'
                  )}
                >
                  {/* Left: Flag & Stact-Aligned Names */}
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <span className="text-2xl sm:text-3xl select-none shrink-0 w-8 text-center" aria-hidden="true">
                      {item.flag}
                    </span>

                    <div className="flex flex-col min-w-0 truncate">
                      <span className="text-xs sm:text-sm font-bold tracking-tight text-white truncate leading-tight">
                        {item.name}
                      </span>
                      <span className="text-[11px] sm:text-xs font-semibold text-brand-300 truncate leading-tight mt-0.5">
                        {item.nativeName}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[9px] font-mono uppercase tracking-wider font-semibold text-slate-400">
                          {item.code}
                        </span>
                        {item.dir === 'rtl' && (
                          <span className="text-[8px] font-semibold uppercase px-1 py-0.2 rounded bg-brand-500/30 text-brand-200 border border-brand-400/20">
                            RTL
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Active Checkmark Indicator */}
                  <div className="shrink-0 flex items-center justify-center">
                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center text-white shadow-glow-brand ring-2 ring-brand-300/40">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border border-white/15 flex items-center justify-center opacity-40 group-hover:opacity-100 group-hover:border-brand-400/50 transition-all">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-brand-400 transition-colors" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Info Bar */}
        <div className="px-4 sm:px-5 py-2.5 bg-[#0A0A16] border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <div className="truncate">
            <span>🌍 {t('common.currentLanguage')}: </span>
            <strong className="text-brand-300 font-semibold">
              {currentMeta.name} ({currentMeta.nativeName})
            </strong>
          </div>
          <span className="hidden xs:inline-block text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 shrink-0 ml-2">
            8 Languages
          </span>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
