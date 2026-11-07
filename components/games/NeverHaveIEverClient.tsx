'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, Heart, Check, X, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { sound } from '@/lib/audio/soundSynthesizer';
import { questionEngine } from '@/lib/questions/engine';
import { Question } from '@/types';
import { useTranslation } from '@/lib/i18n/LanguageContext';

export function NeverHaveIEverClient() {
  const { t, dict, locale } = useTranslation();
  const [lives, setLives] = useState(10);
  const [confessionsCount, setConfessionsCount] = useState(0);
  const [drawnIds, setDrawnIds] = useState<string[]>([]);
  const [currentCard, setCurrentCard] = useState<Question | null>(() => {
    const result = questionEngine.drawNextCard({
      gameId: 'never-have-i-ever',
      language: locale,
      drawnCardIds: [],
    });
    return result.card;
  });

  // Re-draw if locale changes to keep language purely in sync
  useEffect(() => {
    const result = questionEngine.drawNextCard({
      gameId: 'never-have-i-ever',
      language: locale,
      drawnCardIds: [],
    });
    if (result.card) {
      setCurrentCard(result.card);
      setDrawnIds([]);
    }
  }, [locale]);

  const handleNextPrompt = () => {
    sound.playWhoosh();
    sound.triggerHaptic(15);

    const nextIds = currentCard ? [...drawnIds, currentCard.id] : drawnIds;
    setDrawnIds(nextIds);

    const result = questionEngine.drawNextCard({
      gameId: 'never-have-i-ever',
      language: locale,
      drawnCardIds: nextIds,
    });

    if (result.card) {
      setCurrentCard(result.card);
      sound.playChime();
    } else {
      // Reshuffle if exhausted
      setDrawnIds([]);
      const restart = questionEngine.drawNextCard({
        gameId: 'never-have-i-ever',
        language: locale,
        drawnCardIds: [],
      });
      setCurrentCard(restart.card);
    }
  };

  const handleIHave = () => {
    sound.playBuzzer();
    sound.triggerHaptic([25, 50, 25]);
    setConfessionsCount((prev) => prev + 1);
    setLives((prev) => Math.max(0, prev - 1));
    handleNextPrompt();
  };

  const handleINever = () => {
    sound.playTick();
    sound.triggerHaptic(15);
    handleNextPrompt();
  };

  const handleResetGame = () => {
    sound.triggerHaptic(15);
    setLives(10);
    setConfessionsCount(0);
    setDrawnIds([]);
    const restart = questionEngine.drawNextCard({
      gameId: 'never-have-i-ever',
      language: locale,
      drawnCardIds: [],
    });
    if (restart.card) {
      setCurrentCard(restart.card);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-6 sm:space-y-8 flex-1 flex flex-col justify-between items-center">
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between">
        <Link
          href={`/${locale}/games`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> {dict.nav.allGames}
        </Link>
        <span className="text-xs font-bold uppercase tracking-widest text-truth-400">
          {dict.neverHaveIEver.badge}
        </span>
      </div>

      <div className="text-center space-y-2 px-2">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl md:text-5xl text-white">
          {dict.neverHaveIEver.title}
        </h1>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          {dict.neverHaveIEver.subtitle}
        </p>
      </div>

      {/* 10 Fingers / Lives Visualizer */}
      <div className="space-y-2 text-center w-full max-w-sm px-1">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1">
          <span>{t('neverHaveIEver.livesLeft', { lives })}</span>
          <span>{t('neverHaveIEver.confessions', { count: confessionsCount })}</span>
        </div>
        <div className="flex items-center justify-center gap-1 sm:gap-1.5 p-2.5 sm:p-3 rounded-2xl bg-surface-elevated border border-white/10 max-w-full overflow-hidden">
          {Array.from({ length: 10 }).map((_, i) => (
            <Heart
              key={i}
              className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 transition-all ${
                i < lives ? 'text-rose-500 fill-rose-500 scale-100' : 'text-slate-700 scale-75'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Question Card */}
      <div className="w-full p-5 sm:p-8 md:p-12 rounded-3xl bg-surface-elevated border border-truth-400/30 shadow-glow-truth text-center space-y-4 sm:space-y-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-truth-500/10 text-truth-400 text-xs font-bold uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {dict.neverHaveIEver.badge}
        </div>

        <p className="font-display font-bold text-xl sm:text-2xl md:text-3xl text-white leading-relaxed break-words">
          {currentCard?.question_text || currentCard?.prompt || dict.neverHaveIEver.subtitle}
        </p>

        <p className="text-[11px] text-slate-400">
          {lives === 0 ? dict.neverHaveIEver.outOfLives : dict.neverHaveIEver.drinkPenalty}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-md space-y-2.5 sm:space-y-3">
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <Button
            variant="dare"
            size="lg"
            onClick={handleIHave}
            className="w-full gap-1.5 sm:gap-2 px-2 sm:px-4 text-xs sm:text-base font-bold min-h-[48px]"
          >
            <Check className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="truncate">{dict.neverHaveIEver.iHave} (-1)</span>
          </Button>

          <Button
            variant="truth"
            size="lg"
            onClick={handleINever}
            className="w-full gap-1.5 sm:gap-2 px-2 sm:px-4 text-xs sm:text-base font-bold min-h-[48px]"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="truncate">{dict.neverHaveIEver.iNever}</span>
          </Button>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 px-2 pt-1 sm:pt-2">
          <span>{drawnIds.length} cards</span>
          <button
            onClick={handleResetGame}
            className="flex items-center gap-1 hover:text-slate-300 transition-colors py-1 min-h-[30px]"
          >
            <RotateCcw className="w-3.5 h-3.5" /> {dict.neverHaveIEver.resetGame}
          </button>
        </div>
      </div>
    </div>
  );
}
