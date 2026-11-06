'use client';

import React, { useState } from 'react';
import { Question } from '@/types';
import { HelpCircle, Flame, Sparkles, Copy, Check, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { sound } from '@/lib/audio/soundSynthesizer';
import { DareTimerRing } from '@/components/game/DareTimerRing';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface Card3DProps {
  question: Question | null;
  isFlipped: boolean;
  onChooseType: (type: 'truth' | 'dare') => void;
  timerSeconds?: number;
  className?: string;
  isNsfwMode?: boolean;
}

export function Card3D({ question, isFlipped, onChooseType, timerSeconds = 0, className }: Card3DProps) {
  const { t } = useTranslation();
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
    <div
      className={cn(
        'relative w-full max-w-[360px] sm:max-w-md h-[400px] sm:h-[450px] md:h-[490px] perspective-1000 select-none mx-auto',
        className
      )}
    >
      <div
        className={cn(
          'w-full h-full preserve-3d flip-spring rounded-3xl relative',
          isFlipped ? 'rotate-y-180' : ''
        )}
      >
        {/* ========================================================
            FRONT FACE: THE CHOICE ARENA (TRUTH VS DARE)
            Uses .card-face-front + explicit visibility fallback
           ======================================================== */}
        <div
          className={cn(
            'absolute inset-0 w-full h-full card-face-front rounded-3xl bg-gradient-to-b from-[#161630] via-surface-elevated to-[#0C0C1C] border border-white/15 shadow-elevation-3 flex flex-col p-5 sm:p-6 md:p-8 items-center justify-between text-center',
            isFlipped
              ? 'opacity-0 pointer-events-none [visibility:hidden] transition-[opacity,visibility] duration-200'
              : 'opacity-100 pointer-events-auto [visibility:visible] transition-[opacity] duration-300 delay-150'
          )}
        >
          {/* Inner overflow container for decorative ambient blurs */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -left-24 w-48 sm:w-52 h-48 sm:h-52 bg-truth-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 sm:w-52 h-48 sm:h-52 bg-dare-500/15 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Top Pill Header */}
          <div className="relative z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-brand-300 shadow-glow-brand backdrop-blur-md">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand-400" />
            <span>{t('game.choosePath')}</span>
          </div>

          {/* Center Emblem & Headline */}
          <div className="relative z-10 space-y-2 sm:space-y-3 my-auto">
            {/* Visual Emblem */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-gradient-to-tr from-brand-600/30 to-surface-highlight border border-brand-400/30 flex items-center justify-center shadow-glow-brand group animate-float">
              <div className="relative flex items-center justify-center">
                <HelpCircle className="w-7 h-7 sm:w-8 sm:h-8 text-truth-400 -translate-x-1.5 -translate-y-1 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]" />
                <Flame className="w-8 h-8 sm:w-9 sm:h-9 text-dare-400 translate-x-1 translate-y-1 drop-shadow-[0_0_12px_rgba(255,92,119,0.8)]" />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="font-display font-extrabold text-xl sm:text-2xl md:text-3xl text-white tracking-tight">
                {t('home.heroTitle')}
              </h3>
              <p className="text-[11px] sm:text-xs md:text-sm text-slate-400 max-w-[260px] sm:max-w-xs mx-auto leading-relaxed">
                {t('game.revealQuestion')}
              </p>
            </div>
          </div>

          {/* Dual Decision Cards */}
          <div className="relative z-10 w-full grid grid-cols-2 gap-2.5 sm:gap-3.5 pt-1 sm:pt-2">
            <Button
              variant="truth"
              size="lg"
              onClick={() => onChooseType('truth')}
              className="w-full flex-col h-22 sm:h-26 md:h-28 gap-1 rounded-2xl group hover:-translate-y-1 min-h-[48px] p-2"
            >
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-base sm:text-lg font-black tracking-wider">{t('game.truth')}</span>
              <span className="text-[9px] sm:text-[10px] font-medium text-truth-100/80 truncate max-w-full">
                {t('game.truthSub')}
              </span>
            </Button>

            <Button
              variant="dare"
              size="lg"
              onClick={() => onChooseType('dare')}
              className="w-full flex-col h-22 sm:h-26 md:h-28 gap-1 rounded-2xl group hover:-translate-y-1 min-h-[48px] p-2"
            >
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-base sm:text-lg font-black tracking-wider">{t('game.dare')}</span>
              <span className="text-[9px] sm:text-[10px] font-medium text-dare-100/80 truncate max-w-full">
                {t('game.dareSub')}
              </span>
            </Button>
          </div>
        </div>

        {/* ========================================================
            BACK FACE: PROMPT REVEALED ARENA
            Uses .card-face-back + explicit visibility fallback
           ======================================================== */}
        <div
          className={cn(
            'absolute inset-0 w-full h-full card-face-back rounded-3xl border shadow-elevation-3 flex flex-col p-5 sm:p-6 md:p-8 items-center justify-between text-center',
            isDare
              ? 'bg-gradient-to-b from-[#240F1D] via-[#160A13] to-[#0D050B] border-dare-400/40 shadow-glow-dare'
              : 'bg-gradient-to-b from-[#0C1E30] via-[#081320] to-[#040A12] border-truth-400/40 shadow-glow-truth',
            !isFlipped
              ? 'opacity-0 pointer-events-none [visibility:hidden] transition-[opacity,visibility] duration-200'
              : 'opacity-100 pointer-events-auto [visibility:visible] transition-[opacity] duration-300 delay-150'
          )}
        >
          {/* Inner overflow container for watermark */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
            <div className="absolute right-0 bottom-0 pointer-events-none opacity-[0.04] translate-x-12 translate-y-12">
              {isDare ? (
                <Flame className="w-64 sm:w-72 h-64 sm:h-72 text-white" />
              ) : (
                <HelpCircle className="w-64 sm:w-72 h-64 sm:h-72 text-white" />
              )}
            </div>
          </div>

          {/* Top Header Badge */}
          <div className="relative z-10 flex items-center justify-between w-full">
            <span
              className={cn(
                'px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider border shadow-sm flex items-center gap-1.5',
                isDare
                  ? 'bg-dare-500/20 text-dare-300 border-dare-400/40'
                  : 'bg-truth-500/20 text-truth-300 border-truth-400/40'
              )}
            >
              {isDare ? (
                <>
                  <Flame className="w-3.5 h-3.5 text-dare-400" />
                  <span>{t('game.dare')}</span>
                </>
              ) : (
                <>
                  <HelpCircle className="w-3.5 h-3.5 text-truth-400" />
                  <span>{t('game.truth')}</span>
                </>
              )}
            </span>

            {/* Copy Prompt Quick Action */}
            <button
              onClick={handleCopyPrompt}
              aria-label={t('common.copyLink')}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/10 active:scale-95"
              title="Copy challenge text"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
          </div>

          {/* Center Challenge Statement */}
          <div className="relative z-10 my-auto py-2 px-1 max-w-full">
            <p className="font-display font-bold text-base sm:text-lg md:text-xl text-white leading-relaxed line-clamp-6 text-center select-text">
              {question?.prompt || t('game.revealQuestion')}
            </p>
          </div>

          {/* Bottom Dare Timer Ring (if Dare with Timer) or Safety Pill */}
          <div className="relative z-10 w-full flex items-center justify-center pt-1">
            {isDare && timerSeconds > 0 ? (
              <DareTimerRing initialSeconds={timerSeconds} />
            ) : (
              <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{t('game.questionSafeNotice')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
