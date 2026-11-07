'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Sparkles, Download, X, HelpCircle, ExternalLink, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { getPWAPromotionTranslation } from '@/lib/i18n/pwaPromotionTranslations';
import { usePWAPromotion } from '@/lib/pwa/usePWAPromotion';

interface PWAPromotionModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export function PWAPromotionModal({ forceOpen, onClose }: PWAPromotionModalProps = {}) {
  const { locale, isRTL } = useTranslation();
  const texts = getPWAPromotionTranslation(locale);
  const {
    isOpen: internalIsOpen,
    showDesktopHelp,
    dismissPromotion,
    handleInstallClick,
    setShowDesktopHelp,
  } = usePWAPromotion();

  const [mounted, setMounted] = useState(false);
  const isOpen = forceOpen !== undefined ? forceOpen : internalIsOpen;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (onClose) onClose();
        else dismissPromotion();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, dismissPromotion]);

  const handleDismiss = () => {
    if (onClose) onClose();
    else dismissPromotion();
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      role="region"
      aria-label="PWA Installation Promotion"
      className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-[95] flex items-end sm:items-center justify-center p-0 sm:p-0 pointer-events-none"
    >
      {/* Mobile Subtle Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] sm:hidden pointer-events-auto transition-opacity duration-300"
        onClick={handleDismiss}
        aria-hidden="true"
      />

      {/* Floating Promotional Card */}
      <div
        role="dialog"
        aria-modal="false"
        aria-labelledby="pwa-promo-title"
        aria-describedby="pwa-promo-desc"
        dir={isRTL ? 'rtl' : 'ltr'}
        className="pointer-events-auto relative w-full sm:w-[420px] max-w-full max-h-[85dvh] overflow-y-auto custom-scrollbar rounded-t-3xl sm:rounded-3xl bg-[#0D0D1F] border-t sm:border border-brand-500/30 p-4 sm:p-6 shadow-2xl sm:shadow-glow-brand text-slate-100 animate-in fade-in slide-in-from-bottom duration-300 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] sm:pb-6"
      >
        {/* Ambient Cosmic Background Accents */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-36 h-36 rounded-full bg-brand-500/15 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-36 h-36 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          aria-label={texts.closeAria}
          className={`absolute top-4 ${
            isRTL ? 'left-4' : 'right-4'
          } p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-brand-400`}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Main Content Area */}
        {!showDesktopHelp ? (
          <div className="space-y-4">
            {/* Header Badge & Brand Icon */}
            <div className="flex items-start gap-3.5 pr-8">
              <div className="relative shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-cyan-500 p-0.5 shadow-glow-brand">
                <div className="w-full h-full bg-[#0A0A16] rounded-[14px] flex items-center justify-center overflow-hidden">
                  <Image
                    src="/icon.svg"
                    alt="Asteria App"
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand-500/20 text-brand-300 border border-brand-400/30">
                  {texts.badge}
                </span>
                <h3
                  id="pwa-promo-title"
                  className="font-display font-extrabold text-lg sm:text-xl text-white tracking-tight leading-snug"
                >
                  {texts.headline}
                </h3>
              </div>
            </div>

            {/* Description Subtitle */}
            <p
              id="pwa-promo-desc"
              className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm"
            >
              {texts.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <Button
                variant="primary"
                size="md"
                onClick={handleInstallClick}
                className="flex-1 font-bold text-xs sm:text-sm min-h-[44px] shadow-glow-brand flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700"
              >
                <Download className="w-4 h-4 text-cyan-300" />
                <span>{texts.primaryButton}</span>
              </Button>

              <button
                type="button"
                onClick={handleDismiss}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-center"
              >
                {texts.secondaryButton}
              </button>
            </div>
          </div>
        ) : (
          /* Desktop / Unsupported Fallback Guidance */
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h4 className="font-display font-bold text-white text-base">
                {texts.desktopHelpTitle}
              </h4>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {texts.desktopHelpDesc}
            </p>

            <div className="pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowDesktopHelp(false)}
                className="w-full text-xs font-semibold"
              >
                {texts.gotIt}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

