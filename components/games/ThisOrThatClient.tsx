'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { sound } from '@/lib/audio/soundSynthesizer';
import { questionEngine } from '@/lib/questions/engine';
import { Question } from '@/types';
import { useTranslation } from '@/lib/i18n/LanguageContext';

export function ThisOrThatClient() {
  const { t, dict, locale } = useTranslation();
  const [round, setRound] = useState(1);
  const [answers, setAnswers] = useState<string[]>([]);
  const [drawnIds, setDrawnIds] = useState<string[]>([]);
  const [currentCard, setCurrentCard] = useState<Question | null>(() => {
    const result = questionEngine.drawNextCard({
      gameId: 'this-or-that',
      language: locale,
      drawnCardIds: [],
    });
    return result.card;
  });

  // Re-draw if locale changes to keep language in sync
  useEffect(() => {
    const result = questionEngine.drawNextCard({
      gameId: 'this-or-that',
      language: locale,
      drawnCardIds: [],
    });
    if (result.card) {
      setCurrentCard(result.card);
      setDrawnIds([]);
    }
  }, [locale]);

  const handlePick = (choice: string) => {
    sound.playWhoosh();
    sound.triggerHaptic(15);
    setAnswers((prev) => [...prev, choice]);
    setRound((prev) => prev + 1);

    const nextIds = currentCard ? [...drawnIds, currentCard.id] : drawnIds;
    setDrawnIds(nextIds);

    const result = questionEngine.drawNextCard({
      gameId: 'this-or-that',
      language: locale,
      drawnCardIds: nextIds,
    });

    if (result.card) {
      setCurrentCard(result.card);
      sound.playChime();
    } else {
      setDrawnIds([]);
      const restart = questionEngine.drawNextCard({
        gameId: 'this-or-that',
        language: locale,
        drawnCardIds: [],
      });
      setCurrentCard(restart.card);
    }
  };

  const handleReset = () => {
    sound.triggerHaptic(15);
    setRound(1);
    setAnswers([]);
    setDrawnIds([]);
    const restart = questionEngine.drawNextCard({
      gameId: 'this-or-that',
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
        <span className="text-xs font-bold uppercase tracking-widest text-pink-400">
          {t('thisOrThat.round', { round })}
        </span>
      </div>

      <div className="text-center space-y-2 px-2">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl md:text-5xl text-white">
          {dict.thisOrThat.title}
        </h1>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          {dict.thisOrThat.subtitle}
        </p>
      </div>

      {/* Main Dual Cards */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {/* OPTION A */}
        <button
          onClick={() => handlePick(currentCard?.optionA || 'Choice A')}
          className="p-5 sm:p-8 rounded-3xl bg-gradient-to-b from-brand-900/40 via-surface-elevated to-surface-highlight border border-brand-400/30 hover:border-brand-400 text-center space-y-3 sm:space-y-4 hover:scale-[1.02] active:scale-95 transition-all shadow-glow-brand min-h-[120px] sm:min-h-[160px] flex flex-col justify-center"
        >
          <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold uppercase tracking-wider mx-auto">
            A
          </span>
          <p className="font-display font-extrabold text-lg sm:text-2xl text-white break-words">
            {currentCard?.optionA || 'Choice A'}
          </p>
        </button>

        {/* OPTION B */}
        <button
          onClick={() => handlePick(currentCard?.optionB || 'Choice B')}
          className="p-5 sm:p-8 rounded-3xl bg-gradient-to-b from-truth-700/30 via-surface-elevated to-surface-highlight border border-truth-400/30 hover:border-truth-400 text-center space-y-3 sm:space-y-4 hover:scale-[1.02] active:scale-95 transition-all shadow-glow-truth min-h-[120px] sm:min-h-[160px] flex flex-col justify-center"
        >
          <span className="px-3 py-1 rounded-full bg-truth-500/20 text-truth-300 text-xs font-bold uppercase tracking-wider mx-auto">
            B
          </span>
          <p className="font-display font-extrabold text-lg sm:text-2xl text-white break-words">
            {currentCard?.optionB || 'Choice B'}
          </p>
        </button>
      </div>

      {/* Answers Summary & Reset */}
      <div className="w-full max-w-md flex items-center justify-between text-xs text-slate-400 px-2 pt-1">
        <span>{answers.length} choices</span>
        <button
          onClick={handleReset}
          className="flex items-center gap-1 hover:text-white transition-colors py-1 min-h-[30px]"
        >
          <RotateCcw className="w-3.5 h-3.5" /> {dict.thisOrThat.reset}
        </button>
      </div>
    </div>
  );
}
