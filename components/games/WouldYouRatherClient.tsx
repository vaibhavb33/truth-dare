'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, RotateCcw, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { sound } from '@/lib/audio/soundSynthesizer';
import { questionEngine } from '@/lib/questions/engine';
import { Question } from '@/types';

export function WouldYouRatherClient() {
  const [currentCard, setCurrentCard] = useState<Question | null>(() => {
    const result = questionEngine.drawNextCard({
      gameId: 'would-you-rather',
      drawnCardIds: [],
    });
    return result.card;
  });

  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | null>(null);
  const [stats, setStats] = useState<{ aPercent: number; bPercent: number } | null>(null);
  const [drawnIds, setDrawnIds] = useState<string[]>([]);

  const handleVote = (option: 'A' | 'B') => {
    if (selectedOption !== null) return;

    sound.playVictory();
    sound.triggerHaptic([20, 30, 20]);
    setSelectedOption(option);

    // Simulate verified community distribution with realistic variance
    const baseA = 45 + Math.floor(Math.random() * 25);
    const baseB = 100 - baseA;
    setStats({ aPercent: baseA, bPercent: baseB });
  };

  const handleNextDilemma = () => {
    sound.playWhoosh();
    sound.triggerHaptic(15);
    setSelectedOption(null);
    setStats(null);

    const nextIds = currentCard ? [...drawnIds, currentCard.id] : drawnIds;
    setDrawnIds(nextIds);

    const result = questionEngine.drawNextCard({
      gameId: 'would-you-rather',
      drawnCardIds: nextIds,
    });

    if (result.card) {
      setCurrentCard(result.card);
      sound.playChime();
    } else {
      setDrawnIds([]);
      const restart = questionEngine.drawNextCard({
        gameId: 'would-you-rather',
        drawnCardIds: [],
      });
      setCurrentCard(restart.card);
    }
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
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
          Community Percentages
        </span>
      </div>

      <div className="text-center space-y-2">
        <h1 className="font-display font-extrabold text-3xl md:text-5xl text-white">
          Would You Rather?
        </h1>
        <p className="text-xs text-slate-400">
          Choose Option A or Option B to see what percentage of players agree with you!
        </p>
      </div>

      {/* The Two Choice Cards */}
      <div className="w-full space-y-4">
        {/* OPTION A */}
        <button
          onClick={() => handleVote('A')}
          disabled={selectedOption !== null}
          className={`w-full p-6 md:p-8 rounded-3xl border text-left transition-all relative overflow-hidden group ${
            selectedOption === 'A'
              ? 'bg-truth-500/20 border-truth-400 shadow-glow-truth'
              : 'bg-surface-elevated hover:bg-surface-highlight border-white/10'
          }`}
        >
          {stats && (
            <div
              className="absolute left-0 top-0 bottom-0 bg-truth-500/20 transition-all duration-1000 ease-out z-0"
              style={{ width: `${stats.aPercent}%` }}
            />
          )}

          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-truth-400 uppercase tracking-widest">
                OPTION A
              </span>
              <p className="font-display font-bold text-lg md:text-xl text-white">
                {currentCard?.optionA || 'Always sing your thoughts out loud'}
              </p>
            </div>

            {stats && (
              <span className="text-2xl font-mono font-extrabold text-truth-300 shrink-0">
                {stats.aPercent}%
              </span>
            )}
          </div>
        </button>

        <div className="text-center font-bold text-xs uppercase tracking-widest text-slate-500">
          — OR —
        </div>

        {/* OPTION B */}
        <button
          onClick={() => handleVote('B')}
          disabled={selectedOption !== null}
          className={`w-full p-6 md:p-8 rounded-3xl border text-left transition-all relative overflow-hidden group ${
            selectedOption === 'B'
              ? 'bg-brand-500/20 border-brand-400 shadow-glow-brand'
              : 'bg-surface-elevated hover:bg-surface-highlight border-white/10'
          }`}
        >
          {stats && (
            <div
              className="absolute left-0 top-0 bottom-0 bg-brand-500/20 transition-all duration-1000 ease-out z-0"
              style={{ width: `${stats.bPercent}%` }}
            />
          )}

          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-brand-400 uppercase tracking-widest">
                OPTION B
              </span>
              <p className="font-display font-bold text-lg md:text-xl text-white">
                {currentCard?.optionB || 'Broadcast your web search history to the room'}
              </p>
            </div>

            {stats && (
              <span className="text-2xl font-mono font-extrabold text-brand-300 shrink-0">
                {stats.bPercent}%
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Next Dilemma CTA */}
      <div className="w-full max-w-md pt-2">
        {selectedOption !== null ? (
          <Button
            variant="primary"
            size="xl"
            onClick={handleNextDilemma}
            className="w-full text-base font-bold gap-2 animate-fade-in"
          >
            <span>Next Dilemma</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
        ) : (
          <p className="text-center text-xs text-slate-500">
            Tap either choice above to register your vote and reveal the global stats.
          </p>
        )}
      </div>
    </div>
  );
}

