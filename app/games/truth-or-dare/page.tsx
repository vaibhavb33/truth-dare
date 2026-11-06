'use client';

import React, { useState, useEffect, useTransition, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Flame,
  HelpCircle,
  RotateCcw,
  SkipForward,
  CheckCircle,
  Plus,
  X,
  Volume2,
  Users,
  Settings,
  Trophy,
} from 'lucide-react';
import { Card3D } from '@/components/game/Card3D';
import { DareTimerRing } from '@/components/game/DareTimerRing';
import { AgeGateModal } from '@/components/game/AgeGateModal';
import { triggerConfetti } from '@/components/game/ConfettiCelebration';
import { Button } from '@/components/ui/Button';
import { sound } from '@/lib/audio/soundSynthesizer';
import { questionEngine } from '@/lib/questions/engine';
import { Question, CategoryId, Player } from '@/types';
import { JsonLd } from '@/components/seo/JsonLd';

const todWebAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Truth or Dare Online — Project Asteria',
  url: 'https://truthordarequiz.com/games/truth-or-dare',
  applicationCategory: 'GameApplication',
  operatingSystem: 'All modern web browsers (iOS, Android, Windows, macOS)',
  browserRequirements: 'Requires JavaScript. HTML5 Canvas & Web Audio API enabled.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
};

const todBreadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://truthordarequiz.com',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Games',
      item: 'https://truthordarequiz.com/games',
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Truth or Dare',
      item: 'https://truthordarequiz.com/games/truth-or-dare',
    },
  ],
};

function TruthOrDareContent() {
  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get('category') as CategoryId) || 'classic-party';

  // Game Setup States
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>(initialCategory);
  const [timerSeconds, setTimerSeconds] = useState<number>(30);
  const [players, setPlayers] = useState<Player[]>([
    { id: 'p1', name: 'Player 1', score: 0, skips: 0 },
    { id: 'p2', name: 'Player 2', score: 0, skips: 0 },
  ]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [showAgeGate, setShowAgeGate] = useState(false);

  // Active Gameplay States
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [currentCard, setCurrentCard] = useState<Question | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [drawnCardIds, setDrawnCardIds] = useState<string[]>([]);
  const [isDeckExhausted, setIsDeckExhausted] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [, startTransition] = useTransition();

  // Categories Metadata
  const categoriesList = [
    { id: 'classic-party' as CategoryId, name: 'Classic Party', icon: '🎉', nsfw: false },
    { id: 'couples-flirty' as CategoryId, name: 'Couples & Flirty', icon: '❤️', nsfw: false },
    { id: 'teens-hangout' as CategoryId, name: 'Teens & Hangouts', icon: '🍕', nsfw: false },
    { id: 'spicy-18' as CategoryId, name: 'Spicy 18+', icon: '🌶️', nsfw: true },
    { id: 'family-kids' as CategoryId, name: 'Family Clean', icon: '🌟', nsfw: false },
  ];

  // Handle Category Choice with Age Gate
  const handleSelectCategory = (catId: CategoryId) => {
    sound.triggerHaptic(15);
    if (catId === 'spicy-18') {
      const isConfirmed = localStorage.getItem('asteria_age_verified') === 'true';
      if (!isConfirmed) {
        setShowAgeGate(true);
        return;
      }
    }
    setSelectedCategory(catId);
  };

  const handleConfirmAge = () => {
    localStorage.setItem('asteria_age_verified', 'true');
    setShowAgeGate(false);
    setSelectedCategory('spicy-18');
  };

  // Add / Remove Players
  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    const newPlayer: Player = {
      id: 'p-' + Date.now(),
      name: newPlayerName.trim(),
      score: 0,
      skips: 0,
    };
    setPlayers([...players, newPlayer]);
    setNewPlayerName('');
    sound.triggerHaptic(15);
  };

  const handleRemovePlayer = (id: string) => {
    if (players.length <= 2) return;
    setPlayers(players.filter((p) => p.id !== id));
    sound.triggerHaptic(15);
  };

  // Start Game Session
  const handleStartGame = () => {
    sound.triggerHaptic(20);
    setIsPlaying(true);
    setIsFlipped(false);
    setCurrentCard(null);
    setDrawnCardIds([]);
    setIsDeckExhausted(false);
    setActivePlayerIndex(0);
  };

  // Turn Action: Choose Truth or Dare
  const handleChooseType = (type: 'truth' | 'dare') => {
    sound.playWhoosh();
    sound.triggerHaptic(25);

    const result = questionEngine.drawNextCard({
      gameId: 'truth-or-dare',
      categoryId: selectedCategory,
      type,
      drawnCardIds,
    });

    if (result.isExhausted || !result.card) {
      setIsDeckExhausted(true);
      setShowSummaryModal(true);
      return;
    }

    startTransition(() => {
      setCurrentCard(result.card);
      setIsFlipped(true);
      setDrawnCardIds((prev) => [...prev, result.card!.id]);
      sound.playChime();
    });
  };

  // Turn Action: Completed Dare / Truth
  const handleCompleteTurn = () => {
    sound.playVictory();
    sound.triggerHaptic([20, 40, 20, 40, 60]);
    triggerConfetti();

    // Increment player score
    setPlayers((prev) =>
      prev.map((p, idx) => (idx === activePlayerIndex ? { ...p, score: p.score + 1 } : p))
    );

    // Advance turn
    advanceTurn();
  };

  // Turn Action: Skip / Veto
  const handleSkipTurn = () => {
    sound.triggerHaptic(15);

    // Increment player skip count
    setPlayers((prev) =>
      prev.map((p, idx) => (idx === activePlayerIndex ? { ...p, skips: p.skips + 1 } : p))
    );

    advanceTurn();
  };

  const advanceTurn = () => {
    setIsFlipped(false);
    setCurrentCard(null);
    setActivePlayerIndex((prev) => (prev + 1) % players.length);
  };

  // Reshuffle / Reset Deck
  const handleResetSession = () => {
    sound.triggerHaptic(15);
    setDrawnCardIds([]);
    setIsDeckExhausted(false);
    setShowSummaryModal(false);
    setIsFlipped(false);
    setCurrentCard(null);
  };

  const activePlayer = players[activePlayerIndex] || players[0];

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-between p-4 md:p-8 max-w-4xl mx-auto">
      <JsonLd data={todWebAppSchema} />
      <JsonLd data={todBreadcrumbSchema} />
      {/* Age Gate Modal */}
      <AgeGateModal
        isOpen={showAgeGate}
        onConfirm={handleConfirmAge}
        onCancel={() => setShowAgeGate(false)}
      />

      {/* =========================================================
          VIEW A: SETUP SCREEN (Before Game Starts)
         ========================================================= */}
      {!isPlaying ? (
        <div className="w-full max-w-2xl space-y-8 my-auto py-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-dare-400">
              Pass & Play Setup
            </span>
            <h1 className="font-display font-extrabold text-3xl md:text-5xl text-white">
              Truth or Dare
            </h1>
            <p className="text-xs md:text-sm text-slate-400">
              Configure your game deck and add players to pass the phone around.
            </p>
          </div>

          {/* 1. Category Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              1. Choose Game Category:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {categoriesList.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-brand-500/20 border-brand-400 text-white shadow-glow-brand'
                      : 'bg-surface-elevated hover:bg-surface-highlight border-white/10 text-slate-300'
                  }`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <div className="overflow-hidden">
                    <p className="font-bold text-xs truncate">{cat.name}</p>
                    <p className="text-[10px] text-slate-400">{cat.nsfw ? '18+ Mature' : 'All Ages'}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Player Roster Management */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              2. Player Roster ({players.length} Players):
            </label>

            {/* Chips List */}
            <div className="flex flex-wrap gap-2">
              {players.map((p) => (
                <div
                  key={p.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-highlight border border-white/10 text-xs font-semibold text-white"
                >
                  <span>{p.name}</span>
                  {players.length > 2 && (
                    <button
                      onClick={() => handleRemovePlayer(p.id)}
                      className="text-slate-400 hover:text-rose-400 ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Player Input Form */}
            <form onSubmit={handleAddPlayer} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter player name..."
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                maxLength={20}
                className="flex-1 h-11 px-4 rounded-xl bg-surface-elevated border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-400"
              />
              <Button type="submit" variant="secondary" size="md" className="gap-1.5">
                <Plus className="w-4 h-4" /> Add
              </Button>
            </form>
          </div>

          {/* 3. Dare Timer Settings */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              3. Dare Timer Preset:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[0, 15, 30, 60].map((sec) => (
                <button
                  key={sec}
                  onClick={() => setTimerSeconds(sec)}
                  className={`py-2.5 rounded-xl border text-xs font-bold transition-colors ${
                    timerSeconds === sec
                      ? 'bg-brand-500 text-white border-brand-400'
                      : 'bg-surface-elevated text-slate-400 border-white/10 hover:text-white'
                  }`}
                >
                  {sec === 0 ? 'Off' : `${sec}s`}
                </button>
              ))}
            </div>
          </div>

          {/* Start CTA */}
          <Button variant="primary" size="xl" onClick={handleStartGame} className="w-full text-lg font-bold">
            Start Game Now →
          </Button>
        </div>
      ) : (
        /* =========================================================
            VIEW B: ACTIVE GAMEPLAY SCREEN (Distraction-Free)
           ========================================================= */
        <div className="w-full flex-1 flex flex-col items-center justify-between space-y-6">
          {/* Header Bar: Turn & Progress Indicator */}
          <div className="w-full flex items-center justify-between text-xs font-semibold px-2">
            {/* Active Player Pill */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/20 border border-brand-400/40 text-brand-300 shadow-glow-brand">
              <Users className="w-4 h-4 text-brand-400" />
              <span>It's {activePlayer.name}'s Turn!</span>
            </div>

            {/* Score & Exit Actions */}
            <div className="flex items-center gap-3">
              <span className="text-slate-400">Score: {activePlayer.score} pts</span>
              <button
                onClick={() => setIsPlaying(false)}
                className="px-2.5 py-1 rounded-lg bg-surface-elevated hover:bg-surface-highlight border border-white/10 text-slate-400 hover:text-white"
              >
                Setup
              </button>
            </div>
          </div>

          {/* Center 3D Flip Card */}
          <div className="w-full flex flex-col items-center justify-center my-auto">
            <Card3D
              question={currentCard}
              isFlipped={isFlipped}
              onChooseType={handleChooseType}
            />

            {/* Integrated Dare Timer (Shown when Dare is chosen & timer enabled) */}
            {isFlipped && currentCard?.type === 'dare' && timerSeconds > 0 && (
              <div className="mt-6 animate-fade-in">
                <DareTimerRing initialSeconds={timerSeconds} />
              </div>
            )}
          </div>

          {/* Bottom Action Controls (Thumb Zone) */}
          <div className="w-full max-w-md space-y-3 pt-4">
            {isFlipped ? (
              <div className="grid grid-cols-2 gap-3">
                <Button variant="skip" size="lg" onClick={handleSkipTurn} className="w-full gap-2">
                  <SkipForward className="w-5 h-5" />
                  <span>Skip / Veto</span>
                </Button>

                <Button variant="primary" size="lg" onClick={handleCompleteTurn} className="w-full gap-2 font-bold">
                  <CheckCircle className="w-5 h-5 text-emerald-300" />
                  <span>Completed (+1)</span>
                </Button>
              </div>
            ) : (
              <p className="text-center text-xs text-slate-500">
                Tap <strong>TRUTH</strong> or <strong>DARE</strong> on the card above to reveal your prompt.
              </p>
            )}

            {/* Session Reset / Deck Count Bar */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-2">
              <span>{drawnCardIds.length} cards played in session</span>
              <button
                onClick={handleResetSession}
                className="flex items-center gap-1 hover:text-slate-300 transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Reshuffle Deck
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          SUMMARY MODAL: Deck Complete
         ========================================================= */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas-deep/85 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl bg-surface-elevated border border-white/10 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-500/10 border border-brand-400/30 flex items-center justify-center text-brand-400">
              <Trophy className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="font-display font-extrabold text-2xl text-white">Deck Completed!</h3>
              <p className="text-xs text-slate-400">
                You’ve conquered all cards in this category deck without repetition!
              </p>
            </div>

            {/* Leaderboard Table */}
            <div className="p-4 rounded-2xl bg-canvas-base border border-white/5 space-y-2 text-left">
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Final Scores:</p>
              {players
                .slice()
                .sort((a, b) => b.score - a.score)
                .map((p, idx) => (
                  <div key={p.id} className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                    <span className="font-semibold text-white">
                      #{idx + 1} {p.name}
                    </span>
                    <span className="text-brand-400 font-mono font-bold">
                      {p.score} pts ({p.skips} skips)
                    </span>
                  </div>
                ))}
            </div>

            <div className="flex flex-col gap-2">
              <Button variant="primary" size="lg" onClick={handleResetSession} className="w-full">
                Reshuffle Deck & Play Again
              </Button>
              <Button variant="secondary" size="md" onClick={() => setIsPlaying(false)} className="w-full">
                Back to Setup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TruthOrDarePage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-96 flex items-center justify-center text-slate-400 text-sm">
          Loading Truth or Dare Engine...
        </div>
      }
    >
      <TruthOrDareContent />
    </Suspense>
  );
}
