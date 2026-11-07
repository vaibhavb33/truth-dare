'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AgeGateModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function AgeGateModal({ isOpen, onConfirm, onCancel }: AgeGateModalProps) {
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
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-[#07070F]/90 backdrop-blur-md pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-all animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md p-5 sm:p-6 md:p-8 rounded-3xl bg-surface-elevated border border-dare-400/30 shadow-elevation-3 text-center space-y-5 max-h-[calc(100dvh-2rem)] overflow-y-auto custom-scrollbar">
        <button
          onClick={onCancel}
          aria-label="Close Age Gate"
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-dare-500/10 border border-dare-400/30 flex items-center justify-center text-dare-400 shrink-0">
          <AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>

        {/* Headline & Body */}
        <div className="space-y-2">
          <h3 id="age-gate-title" className="font-display font-extrabold text-xl sm:text-2xl text-white tracking-tight">
            Adult Content Warning (18+)
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            This category features bold, provocative, and adult-oriented challenges meant exclusively for mature players.
          </p>
        </div>

        {/* Safety Assurances */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-canvas-base/60 border border-white/5 text-[11px] sm:text-xs text-slate-400 flex items-center gap-2 text-left">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>All challenges are strictly consensual. Players may skip or veto any dare without penalty.</span>
        </div>

        {/* Affirmative Decision Actions */}
        <div className="flex flex-col gap-2.5 pt-1">
          <Button
            variant="dare"
            size="lg"
            onClick={onConfirm}
            className="w-full font-bold min-h-[48px]"
          >
            I am 18 or Older — Enter
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={onCancel}
            className="w-full text-slate-400 hover:text-white min-h-[44px]"
          >
            Back to Family Safe Mode
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
