'use client';

import React, { useState } from 'react';
import { Question } from '@/types';
import { HelpCircle, Flame, Sparkles, Copy, Check, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { sound } from '@/lib/audio/soundSynthesizer';

interface Card3DProps {
  question: Question | null;
  isFlipped: boolean;
  onChooseType: (type: 'truth' | 'dare') => void;
  className?: string;
  isNsfwMode?: boolean;
}

export function Card3D({ question, isFlipped, onChooseType, className }: Card3DProps) {
  const isDare = question?.type === 'dare';
  const [copied, setCopied] = useState(false);

  const handleCopyPrompt = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!question?.prompt) return;
    navigator.clipboard.writeText(question.prompt);
    sound.triggerHaptic(20);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn('relative w-full max-w-md h-[470px] md:h-[510px] perspective-1000 select-none', className)}>
      <div
        className={cn(
          'w-full h-full preserve-3d flip-spring rounded-3xl relative',
          isFlipped ? 'rotate-y-180' : ''
        )}
      >
        {/* ========================================================
            FRONT FACE: THE CHOICE ARENA (TRUTH VS DARE)
           ======================================================== */}
        <div
          className={cn(
            'absolute inset-0 w-full h-full backface-hidden rounded-3xl bg-gradient-to-b from-[#161630] via-surface-elevated to-[#0C0C1C] border border-white/15 shadow-elevation-3 flex flex-col p-6 md:p-8 items-center justify-between text-center overflow-hidden'
          )}
        >
          {/* Subtle Background Glow Rings */}
          <div className="absolute -top-24 -left-24 w-52 h-52 bg-truth-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-52 h-52 bg-dare-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Pill Header */}
          <div className="relative z-10 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider text-brand-300 shadow-glow-brand backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>PICK YOUR POISON</span>
          </div>

          {/* Center Emblem & Headline */}
          <div className="relative z-10 space-y-3 my-auto">
            {/* Visual Emblem */}
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-tr from-brand-600/30 to-surface-highlight border border-brand-400/30 flex items-center justify-center shadow-glow-brand group animate-float">
              <div className="relative flex items-center justify-center">
                <HelpCircle className="w-8 h-8 text-truth-400 -translate-x-2 -translate-y-1 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]" />
                <Flame className="w-9 h-9 text-dare-400 translate-x-1.5 translate-y-1 drop-shadow-[0_0_12px_rgba(255,92,119,0.8)]" />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="font-display font-extrabold text-2xl md:text-3xl text-white tracking-tight">
                Truth or Dare?
              </h3>
              <p className="text-xs md:text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
                Choose wisely. Once selected, your challenge will be locked into the circle.
              </p>
            </div>
          </div>

          {/* Dual Decision Cards */}
          <div className="relative z-10 w-full grid grid-cols-2 gap-3.5 pt-2">
            <Button
              variant="truth"
              size="lg"
              onClick={() => onChooseType('truth')}
              className="w-full flex-col h-28 gap-1.5 rounded-2xl group hover:-translate-y-1"
            >
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <HelpCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-black tracking-wider">TRUTH</span>
              <span className="text-[10px] font-medium text-truth-100/80">Confess Honestly</span>
            </Button>

            <Button
              variant="dare"
              size="lg"
              onClick={() => onChooseType('dare')}
              className="w-full flex-col h-28 gap-1.5 rounded-2xl group hover:-translate-y-1"
            >
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-black tracking-wider">DARE</span>
              <span className="text-[10px] font-medium text-dare-100/80">Conquer The Risk</span>
            </Button>
          </div>
        </div>

        {/* ========================================================
            BACK FACE: PROMPT REVEALED ARENA
           ======================================================== */}
        <div
          className={cn(
            'absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-3xl border shadow-elevation-3 flex flex-col p-6 md:p-8 items-center justify-between text-center overflow-hidden',
            isDare
              ? 'bg-gradient-to-b from-[#240F1D] via-[#160A13] to-[#0D050B] border-dare-400/40 shadow-glow-dare'
              : 'bg-gradient-to-b from-[#0C1E30] via-[#081320] to-[#040A12] border-truth-400/40 shadow-glow-truth'
          )}
        >
          {/* Subtle Watermark Icon in Background */}
          <div className="absolute right-0 bottom-0 pointer-events-none opacity-[0.04] translate-x-12 translate-y-12">
            {isDare ? <Flame className="w-72 h-72 text-white" /> : <HelpCircle className="w-72 h-72 text-white" />}
          </div>

          {/* Top Header Badge */}
          <div className="relative z-10 flex items-center justify-between w-full">
            <span
              className={cn(
                'px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border shadow-sm flex items-center gap-1.5',
                isDare
                  ? 'bg-dare-500/20 text-dare-300 border-dare-400/40'
                  : 'bg-truth-500/20 text-truth-300 border-truth-400/40'
              )}
            >
              {isDare ? <Flame className="w-3.5 h-3.5 fill-dare-400 text-dare-400" /> : <HelpCircle className="w-3.5 h-3.5 text-truth-400" />}
              <span>{isDare ? 'DARE' : 'TRUTH'}</span>
              <span>•</span>
              <span>LVL {question?.intensity || 2}</span>
            </span>

            <button
              onClick={handleCopyPrompt}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-semibold text-slate-400 hover:text-white transition-colors border border-white/10"
              title="Copy prompt text"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          {/* Central Question Prompt */}
          <div className="relative z-10 my-auto px-2 py-4 space-y-4">
            <p className="font-display font-extrabold text-2xl md:text-3xl text-white leading-relaxed tracking-tight drop-shadow-md">
              {question?.prompt || 'Preparing next challenge...'}
            </p>
          </div>

          {/* Footer Safety Indicator */}
          <div className="relative z-10 w-full pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Safe Veto Allowed</span>
            </span>
            <span className="capitalize text-slate-400 font-medium">
              {question?.categoryId ? question.categoryId.replace(/-/g, ' ') : 'Classic'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
