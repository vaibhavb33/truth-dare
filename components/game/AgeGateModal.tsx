'use client';

import React from 'react';
import { AlertTriangle, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AgeGateModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function AgeGateModal({ isOpen, onConfirm, onCancel }: AgeGateModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas-deep/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md p-6 md:p-8 rounded-3xl bg-surface-elevated border border-dare-400/30 shadow-elevation-3 text-center space-y-6">
        <button
          onClick={onCancel}
          aria-label="Close Age Gate"
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-dare-500/10 border border-dare-400/30 flex items-center justify-center text-dare-400">
          <AlertTriangle className="w-8 h-8" />
        </div>

        {/* Headline & Body */}
        <div className="space-y-2">
          <h3 className="font-display font-extrabold text-2xl text-white tracking-tight">
            Adult Content Warning (18+)
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            This category features bold, provocative, and adult-oriented challenges meant exclusively for mature players.
          </p>
        </div>

        {/* Safety Assurances */}
        <div className="p-3.5 rounded-xl bg-canvas-base/60 border border-white/5 text-xs text-slate-400 flex items-center gap-2 text-left">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>All challenges are strictly consensual. Players may skip or veto any dare without penalty.</span>
        </div>

        {/* Affirmative Decision Actions */}
        <div className="flex flex-col gap-2.5">
          <Button
            variant="dare"
            size="lg"
            onClick={onConfirm}
            className="w-full font-bold"
          >
            I am 18 or Older — Enter
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={onCancel}
            className="w-full text-slate-400 hover:text-white"
          >
            Back to Family Safe Mode
          </Button>
        </div>
      </div>
    </div>
  );
}

