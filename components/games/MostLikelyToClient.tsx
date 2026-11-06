'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Trophy, RotateCcw, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { sound } from '@/lib/audio/soundSynthesizer';
import { triggerConfetti } from '@/components/game/ConfettiCelebration';
import { questionEngine } from '@/lib/questions/engine';
import { Question } from '@/types';

export function MostLikelyToClient() {
  const [players, setPlayers] = useState([
    { name: 'Alex', votes: 0 },
    { name: 'Maya', votes: 0 },
    { name: 'Jordan', votes: 0 },
    { name: 'Sarah', votes: 0 },
  ]);

  const [currentCard, setCurrentCard] = useState<Question | null>(() => {
    const result = questionEngine.drawNextCard({
      gameId: 'most-likely-to',
      drawnCardIds: [],
    });
    return result.card;
  });

  const [votedPlayer, setVotedPlayer] = useState<string | null>(null);
  const [drawnIds, setDrawnIds] = useState<string[]>([]);

  const handleVotePlayer = (name: string) => {
    if (votedPlayer !== null) return;

    sound.playVictory();
    sound.triggerHaptic([25, 40, 25]);
    triggerConfetti();
    setVotedPlayer(name);

    setPlayers((prev) =>
      prev.map((p) => (p.name === name ? { ...p, votes: p.votes + 1 } : p))
    );
  };

  const handleNextPrompt = () => {
    sound.playWhoosh();
    sound.triggerHaptic(15);
    setVotedPlayer(null);

    const nextIds = currentCard ? [...drawnIds, currentCard.id] : drawnIds;
    setDrawnIds(nextIds);

    const result = questionEngine.drawNextCard({
      gameId: 'most-likely-to',
      drawnCardIds: nextIds,
    });

    if (result.card) {
      setCurrentCard(result.card);
      sound.playChime();
    } else {
      setDrawnIds([]);
      const restart = questionEngine.drawNextCard({
        gameId: 'most-likely-to',
        drawnCardIds: [],
      });
      setCurrentCard(restart.card);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-6 sm:space-y-8 flex-1 flex flex-col justify-between items-center">
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between">
        <Link
          href="/games"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> All Games
        </Link>
        <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
          Player Voting
        </span>
      </div>

      <div className="text-center space-y-2 px-2">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl md:text-5xl text-white">
          Most Likely To
        </h1>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Vote for the person in your group who fits the prompt best!
        </p>
      </div>

      {/* Main Question Card */}
      <div className="w-full p-5 sm:p-8 md:p-10 rounded-3xl bg-surface-elevated border border-amber-400/30 shadow-[0_0_35px_rgba(245,158,11,0.25)] text-center space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Group Callout
        </span>

        <p className="font-display font-bold text-xl sm:text-2xl md:text-3xl text-white leading-relaxed break-words">
          {currentCard?.prompt || 'Who is most likely to win the lottery and lose the ticket?'}
        </p>
      </div>

      {/* Player Voting Roster Grid */}
      <div className="w-full space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center">
          Tap a player to cast your vote:
        </p>

        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {players.map((p) => {
            const isWinner = votedPlayer === p.name;
            return (
              <button
                key={p.name}
                onClick={() => handleVotePlayer(p.name)}
                disabled={votedPlayer !== null}
                className={`p-2.5 sm:p-4 rounded-2xl border flex items-center justify-between gap-1.5 min-w-0 transition-all ${
                  isWinner
                    ? 'bg-amber-500/20 border-amber-400 text-white shadow-glow-brand scale-[1.02]'
                    : 'bg-surface-elevated hover:bg-surface-highlight border-white/10 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand-600 flex items-center justify-center font-bold text-xs text-white shrink-0">
                    {p.name.charAt(0)}
                  </div>
                  <span className="font-bold text-xs sm:text-sm truncate">{p.name}</span>
                </div>
                {isWinner && <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 animate-bounce shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Next Prompt */}
      <div className="w-full max-w-md pt-2">
        {votedPlayer !== null ? (
          <Button
            variant="primary"
            size="xl"
            onClick={handleNextPrompt}
            className="w-full text-base font-bold gap-2 min-h-[48px]"
          >
            <span>Next Player Callout</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
        ) : (
          <p className="text-center text-xs text-slate-500">
            Votes are locked in as soon as you tap a player card.
          </p>
        )}
      </div>
    </div>
  );
}

