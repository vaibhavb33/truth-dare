'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Zap, RotateCcw, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { sound } from '@/lib/audio/soundSynthesizer';
import { questionEngine } from '@/lib/questions/engine';
import { Question } from '@/types';

export function ThisOrThatClient() {
  const [round, setRound] = useState(1);
  const [answers, setAnswers] = useState<string[]>([]);
  const [drawnIds, setDrawnIds] = useState<string[]>([]);
  const [currentCard, setCurrentCard] = useState<Question | null>(() => {
    const result = questionEngine.drawNextCard({
      gameId: 'this-or-that',
      drawnCardIds: [],
    });
    return result.card;
  });

  const handlePick = (choice: string) => {
    sound.playWhoosh();
    sound.triggerHaptic(15);
    setAnswers((prev) => [...prev, choice]);
    setRound((prev) => prev + 1);

    const nextIds = currentCard ? [...drawnIds, currentCard.id] : drawnIds;
    setDrawnIds(nextIds);

    const result = questionEngine.drawNextCard({
      gameId: 'this-or-that',
      drawnCardIds: nextIds,
    });

    if (result.card) {
      setCurrentCard(result.card);
      sound.playChime();
    } else {
      setDrawnIds([]);
      const restart = questionEngine.drawNextCard({
        gameId: 'this-or-that',
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
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 space-y-8 flex-1 flex flex-col justify-between items-center">
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between">
        <Link
          href="/games"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> All Games
        </Link>
        <span className="text-xs font-bold uppercase tracking-widest text-pink-400">
          Round #{round}
        </span>
      </div>

      <div className="text-center space-y-2">
        <h1 className="font-display font-extrabold text-3xl md:text-5xl text-white">
          This or That
        </h1>
        <p className="text-xs text-slate-400">
          Rapid-fire choices! Tap your gut reaction without overthinking.
        </p>
      </div>

      {/* Main Dual Cards */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* OPTION A */}
        <button
          onClick={() => handlePick(currentCard?.optionA || 'Road Trip')}
          className="p-8 rounded-3xl bg-gradient-to-b from-brand-900/40 via-surface-elevated to-surface-highlight border border-brand-400/30 hover:border-brand-400 text-center space-y-4 hover:scale-[1.02] active:scale-95 transition-all shadow-glow-brand"
        >
          <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold uppercase tracking-wider">
            THIS
          </span>
          <p className="font-display font-extrabold text-2xl text-white">
            {currentCard?.optionA || 'Spontaneous Road Trip'}
          </p>
        </button>

        {/* OPTION B */}
        <button
          onClick={() => handlePick(currentCard?.optionB || 'Resort')}
          className="p-8 rounded-3xl bg-gradient-to-b from-truth-700/30 via-surface-elevated to-surface-highlight border border-truth-400/30 hover:border-truth-400 text-center space-y-4 hover:scale-[1.02] active:scale-95 transition-all shadow-glow-truth"
        >
          <span className="px-3 py-1 rounded-full bg-truth-500/20 text-truth-300 text-xs font-bold uppercase tracking-wider">
            THAT
          </span>
          <p className="font-display font-extrabold text-2xl text-white">
            {currentCard?.optionB || 'All-Inclusive Luxury Resort'}
          </p>
        </button>
      </div>

      {/* Answers Summary & Reset */}
      <div className="w-full max-w-md flex items-center justify-between text-xs text-slate-400 px-2">
        <span>{answers.length} choices made so far</span>
        <button
          onClick={handleReset}
          className="flex items-center gap-1 hover:text-white transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Start Over
        </button>
      </div>
    </div>
  );
}

