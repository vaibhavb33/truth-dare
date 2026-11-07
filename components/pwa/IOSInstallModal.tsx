'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Share, PlusSquare, X, Smartphone, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface IOSInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function IOSInstallModal({ isOpen, onClose }: IOSInstallModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ios-install-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-[#07070F]/90 backdrop-blur-md pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-sm sm:max-w-md p-6 rounded-3xl bg-surface-elevated border border-brand-500/30 shadow-elevation-3 text-center space-y-5 max-h-[calc(100dvh-2rem)] overflow-y-auto custom-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Install Instructions"
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* App Icon Preview */}
        <div className="flex flex-col items-center justify-center space-y-2 pt-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-500 via-brand-600 to-indigo-500 flex items-center justify-center shadow-glow-brand border border-white/20 p-2">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h3 id="ios-install-title" className="font-display font-extrabold text-xl text-white">
            Install Asteria on iPhone / iPad
          </h3>
          <p className="text-xs text-slate-400 max-w-xs">
            Add to your home screen for full-screen standalone gameplay and offline access.
          </p>
        </div>

        {/* 3 Step Instruction Guide */}
        <div className="p-4 rounded-2xl bg-canvas-base border border-white/5 space-y-4 text-left text-xs">
          {/* Step 1 */}
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-brand-500/20 border border-brand-400/30 flex items-center justify-center text-brand-300 font-bold shrink-0 text-xs">
              1
            </div>
            <div className="space-y-0.5">
              <p className="font-semibold text-white flex items-center gap-1.5">
                <span>Tap the Safari Share button</span>
                <span className="p-1 rounded bg-white/10 text-white inline-flex">
                  <Share className="w-3 h-3 text-brand-300" />
                </span>
              </p>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Located at the bottom of your screen (or top on iPad).
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-truth-500/20 border border-truth-400/30 flex items-center justify-center text-truth-300 font-bold shrink-0 text-xs">
              2
            </div>
            <div className="space-y-0.5">
              <p className="font-semibold text-white flex items-center gap-1.5">
                <span>Choose "Add to Home Screen"</span>
                <span className="p-1 rounded bg-white/10 text-white inline-flex">
                  <PlusSquare className="w-3 h-3 text-truth-300" />
                </span>
              </p>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Scroll down in the sharing action menu to locate the option.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-bold shrink-0 text-xs">
              3
            </div>
            <div className="space-y-0.5">
              <p className="font-semibold text-white flex items-center gap-1.5">
                <span>Tap "Add" in Top-Right</span>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              </p>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Asteria will launch with zero browser bars like a native app.
              </p>
            </div>
          </div>
        </div>

        {/* Dismiss Button */}
        <Button
          variant="primary"
          size="lg"
          onClick={onClose}
          className="w-full font-bold min-h-[48px]"
        >
          Got It, Thanks!
        </Button>
      </div>
    </div>,
    document.body
  );
}

