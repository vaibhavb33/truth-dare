'use client';

import React, { useState } from 'react';
import { Question } from '@/types';
import { HelpCircle, Flame, Sparkles, Copy, Check, ShieldCheck, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sound } from '@/lib/audio/soundSynthesizer';
import { DareTimerRing } from '@/components/game/DareTimerRing';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { QuestionVoiceControls } from '@/components/voice/QuestionVoiceControls';

interface Card3DProps {
  question: Question | null;
  isFlipped: boolean;
  onChooseType: (type: 'truth' | 'dare') => void;
  onListenType?: (type: 'truth' | 'dare') => void;
  timerSeconds?: number;
  className?: string;
  isNsfwMode?: boolean;
}

export function Card3D({
  question,
  isFlipped,
  onChooseType,
  onListenType,
  timerSeconds = 0,
  className,
}: Card3DProps) {
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
        'relative w-full max-w-[340px] xs:max-w-[360px] sm:max-w-[420px] md:max-w-[440px] h-[375px] xs:h-[385px] sm:h-[400px] md:h-[410px] perspective-1000 select-none mx-auto',
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
            FRONT FACE: COMPACT PREMIUM GAMING ARENA (TRUTH VS DARE)
            Uses .card-face-front + explicit visibility fallback
           ======================================================== */}
        <div
          className={cn(
            'absolute inset-0 w-full h-full card-face-front rounded-3xl bg-gradient-to-b from-[#161630] via-surface-elevated to-[#0C0C1C] border border-white/15 shadow-elevation-3 flex flex-col p-3 xs:p-3.5 sm:p-5 md:p-6 items-center justify-between text-center overflow-hidden',
            isFlipped
              ? 'opacity-0 pointer-events-none [visibility:hidden] transition-[opacity,visibility] duration-200'
              : 'opacity-100 pointer-events-auto [visibility:visible] transition-[opacity] duration-300 delay-150'
          )}
        >
          {/* Inner overflow container for decorative ambient blurs */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -left-20 w-44 sm:w-52 h-44 sm:h-52 bg-truth-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-44 sm:w-52 h-44 sm:h-52 bg-dare-500/15 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* 1. Game Icon & Emblem */}
          <div className="relative z-10 flex flex-col items-center gap-1 shrink-0 pt-0.5">
            <div className="w-9 h-9 xs:w-10 xs:h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-brand-600/30 to-surface-highlight border border-brand-400/30 flex items-center justify-center shadow-glow-brand group">
              <div className="relative flex items-center justify-center">
                <HelpCircle className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 text-truth-400 -translate-x-1 -translate-y-0.5 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                <Flame className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 text-dare-400 translate-x-1 translate-y-0.5 drop-shadow-[0_0_8px_rgba(255,92,119,0.8)]" />
              </div>
            </div>
          </div>

          {/* 2 & 3. Truth or Dare Heading + Short Instruction */}
          <div className="relative z-10 space-y-1 px-1 my-auto shrink-0 max-w-full">
            <h3 className="font-display font-extrabold text-base xs:text-lg sm:text-xl text-white tracking-tight leading-tight">
              {t('home.heroTitle')}
            </h3>
            <p className="text-[11px] xs:text-xs sm:text-sm text-slate-300 max-w-[270px] sm:max-w-xs mx-auto leading-normal">
              {t('game.revealQuestion')}
            </p>
          </div>

          {/* 4. Truth and Dare selection buttons (Consistent Dimensions, Flexible Height, No Text Clipping) */}
          <div className="relative z-10 w-full grid grid-cols-2 gap-2 xs:gap-2.5 sm:gap-3 items-stretch shrink-0">
            {/* TRUTH SELECTION BUTTON */}
            <button
              type="button"
              onClick={() => {
                sound.triggerHaptic(20);
                onChooseType('truth');
              }}
              className="group relative flex flex-col items-center justify-between p-2.5 xs:p-3 rounded-2xl bg-gradient-to-br from-truth-500 via-cyan-500 to-truth-700 text-white shadow-glow-truth hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] hover:brightness-110 active:scale-[0.97] border border-truth-300/40 transition-all duration-200 h-full min-h-[76px] sm:min-h-[82px] text-center cursor-pointer select-none"
              aria-label={t('game.truth')}
            >
              <div className="w-full flex items-center justify-center gap-1.5 mb-1">
                <div className="w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-lg bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </div>
                <span className="font-display font-black text-xs xs:text-sm sm:text-base tracking-wider uppercase leading-none">
                  {t('game.truth')}
                </span>
              </div>
              <p className="text-[10px] xs:text-[11px] font-medium text-truth-100/95 leading-snug text-center break-words max-w-full">
                {t('game.truthSub')}
              </p>
            </button>

            {/* DARE SELECTION BUTTON */}
            <button
              type="button"
              onClick={() => {
                sound.triggerHaptic(20);
                onChooseType('dare');
              }}
              className="group relative flex flex-col items-center justify-between p-2.5 xs:p-3 rounded-2xl bg-gradient-to-br from-dare-500 via-rose-500 to-dare-700 text-white shadow-glow-dare hover:shadow-[0_0_35px_rgba(255,92,119,0.6)] hover:brightness-110 active:scale-[0.97] border border-dare-300/40 transition-all duration-200 h-full min-h-[76px] sm:min-h-[82px] text-center cursor-pointer select-none"
              aria-label={t('game.dare')}
            >
              <div className="w-full flex items-center justify-center gap-1.5 mb-1">
                <div className="w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-lg bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </div>
                <span className="font-display font-black text-xs xs:text-sm sm:text-base tracking-wider uppercase leading-none">
                  {t('game.dare')}
                </span>
              </div>
              <p className="text-[10px] xs:text-[11px] font-medium text-dare-100/95 leading-snug text-center break-words max-w-full">
                {t('game.dareSub')}
              </p>
            </button>
          </div>

          {/* 5. Separate Compact Voice Controls Bar */}
          {onListenType && (
            <div className="relative z-10 w-full pt-1.5 sm:pt-2 mt-auto border-t border-white/10 flex items-center justify-between gap-1.5 xs:gap-2 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  sound.triggerHaptic(15);
                  onListenType('truth');
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-truth-500/10 hover:bg-truth-500/20 active:bg-truth-500/30 text-truth-300 border border-truth-400/25 hover:border-truth-400/50 text-[10px] xs:text-[11px] sm:text-xs font-semibold transition-all active:scale-95 shadow-sm min-h-[36px]"
                title={t('voice.listenTruth')}
                aria-label={t('voice.listenTruth')}
              >
                <Volume2 className="w-3.5 h-3.5 text-truth-400 shrink-0" />
                <span className="leading-tight text-center">{t('voice.listenTruth')}</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  sound.triggerHaptic(15);
                  onListenType('dare');
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-dare-500/10 hover:bg-dare-500/20 active:bg-dare-500/30 text-dare-300 border border-dare-400/25 hover:border-dare-400/50 text-[10px] xs:text-[11px] sm:text-xs font-semibold transition-all active:scale-95 shadow-sm min-h-[36px]"
                title={t('voice.listenDare')}
                aria-label={t('voice.listenDare')}
              >
                <Volume2 className="w-3.5 h-3.5 text-dare-400 shrink-0" />
                <span className="leading-tight text-center">{t('voice.listenDare')}</span>
              </button>
            </div>
          )}
        </div>

        {/* ========================================================
            BACK FACE: PROMPT REVEALED ARENA
            Uses .card-face-back + explicit visibility fallback
           ======================================================== */}
        <div
          className={cn(
            'absolute inset-0 w-full h-full card-face-back rounded-3xl border shadow-elevation-3 flex flex-col p-3 xs:p-3.5 sm:p-5 md:p-6 items-center justify-between text-center overflow-hidden',
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
          <div className="relative z-10 flex items-center justify-between w-full shrink-0">
            <span
              className={cn(
                'px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider border shadow-sm flex items-center gap-1.5',
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

            {/* Quick Actions: Voice Player + Copy */}
            <div className="flex items-center gap-1.5">
              {question?.prompt && (
                <QuestionVoiceControls
                  text={question.prompt}
                  language={question.language_code}
                  type={isDare ? 'dare' : 'truth'}
                  variant="card"
                />
              )}
              <button
                onClick={handleCopyPrompt}
                aria-label={t('common.copyLink')}
                className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/10 active:scale-95"
                title="Copy challenge text"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          {/* Center Challenge Statement with auto-scroll if long */}
          <div className="relative z-10 my-auto py-1 sm:py-2 px-1 max-w-full max-h-[170px] sm:max-h-[200px] overflow-y-auto custom-scrollbar flex items-center justify-center">
            <p className="font-display font-bold text-[clamp(0.95rem,2.8vw+0.15rem,1.25rem)] text-white leading-relaxed text-center select-text break-words">
              {question?.prompt || t('game.revealQuestion')}
            </p>
          </div>

          {/* Bottom Dare Timer Ring (if Dare with Timer) or Safety Pill */}
          <div className="relative z-10 w-full flex items-center justify-center pt-1 shrink-0">
            {isDare && timerSeconds > 0 ? (
              <DareTimerRing initialSeconds={timerSeconds} compact={true} />
            ) : (
              <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400 bg-white/5 px-2.5 sm:px-3 py-1 rounded-full border border-white/10 max-w-full">
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
