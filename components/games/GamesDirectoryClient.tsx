'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Flame, Disc, HelpCircle, Sparkles, Users, Zap, ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/States';

export function GamesDirectoryClient() {
  const [activeFilter, setActiveFilter] = useState('all');

  const games = [
    {
      id: 'truth-or-dare',
      title: 'Truth or Dare',
      slug: 'truth-or-dare',
      icon: Flame,
      color: 'from-dare-500 to-rose-600',
      tag: 'Classic Party',
      players: '2–20 Players',
      intensity: '🌶️ Lvl 1–5',
      desc: 'The legendary party game with 3D card flips, dare timer, and 5 curated intensity decks.',
      categories: ['party', 'couples', 'teens', 'spicy'],
    },
    {
      id: 'spin-the-bottle',
      title: 'Spinner Wheel (Spin the Bottle)',
      slug: 'spin-the-bottle',
      icon: Disc,
      color: 'from-brand-500 to-indigo-600',
      tag: 'Physics Wheel',
      players: '2–20 Players',
      intensity: '🌶️ Lvl 1–3',
      desc: 'Realistic physics wheel to randomly choose who goes next or pick wild dare consequences.',
      categories: ['party', 'drinking'],
    },
    {
      id: 'never-have-i-ever',
      title: 'Never Have I Ever',
      slug: 'never-have-i-ever',
      icon: HelpCircle,
      color: 'from-truth-500 to-cyan-600',
      tag: '10 Fingers Down',
      players: '3–15 Players',
      intensity: '🌶️ Lvl 1–4',
      desc: 'Confession game tracking lives or drinks with juicy group reveals and zero setup.',
      categories: ['party', 'teens', 'drinking'],
    },
    {
      id: 'would-you-rather',
      title: 'Would You Rather',
      slug: 'would-you-rather',
      icon: Sparkles,
      color: 'from-emerald-500 to-teal-600',
      tag: 'Live % Stats',
      players: '2–12 Players',
      intensity: '🌶️ Lvl 1–3',
      desc: 'Dilemmas with instant live community percentages after every single vote.',
      categories: ['couples', 'icebreaker', 'party'],
    },
    {
      id: 'most-likely-to',
      title: 'Most Likely To',
      slug: 'most-likely-to',
      icon: Users,
      color: 'from-amber-500 to-orange-600',
      tag: 'Group Voting',
      players: '3–15 Players',
      intensity: '🌶️ Lvl 1–4',
      desc: 'Secret ballot voting where room friends crown the person who best fits the wild prompt.',
      categories: ['party', 'teens'],
    },
    {
      id: 'this-or-that',
      title: 'This or That Gauntlet',
      slug: 'this-or-that',
      icon: Zap,
      color: 'from-pink-500 to-rose-600',
      tag: '60s Gauntlet',
      players: '1–4 Players',
      intensity: '🌶️ Lvl 1–2',
      desc: 'Rapid-fire swipe preference game for dating couples and quick social icebreakers.',
      categories: ['couples', 'icebreaker'],
    },
  ];

  const filteredGames = games.filter((g) => {
    if (activeFilter === 'all') return true;
    return g.categories.includes(activeFilter);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16 space-y-10 w-full">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-xs font-bold uppercase tracking-wider text-brand-300">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>Multi-Game Collection</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl md:text-5xl text-white tracking-tight">
          All Online Party Games
        </h1>
        <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
          Select any party game below to launch pass-and-play on this screen or host a synchronized room with remote friends.
        </p>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {['all', 'party', 'couples', 'teens', 'drinking', 'icebreaker'].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all select-none ${
              activeFilter === filter
                ? 'bg-brand-500 text-white shadow-glow-brand border border-brand-400/40 scale-105'
                : 'bg-surface-elevated text-slate-400 hover:text-white border border-white/5 hover:border-white/15'
            }`}
          >
            {filter === 'all' ? 'All Games' : filter}
          </button>
        ))}
      </div>

      {/* Grid of Games or Empty State */}
      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => {
            const Icon = game.icon;
            return (
              <div
                key={game.id}
                className="p-6 rounded-3xl bg-surface-elevated/80 border border-white/10 hover:border-brand-400/50 hover:shadow-glow-brand hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between space-y-6 group backdrop-blur-sm"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${game.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-7 h-7 drop-shadow-md" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/5 border border-white/10 text-slate-300">
                      {game.tag}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-display font-extrabold text-xl text-white group-hover:text-brand-300 transition-colors">
                      {game.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{game.desc}</p>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 pt-3 border-t border-white/5">
                    <span>{game.players}</span>
                    <span>•</span>
                    <span>{game.intensity}</span>
                  </div>
                </div>

                <Link href={`/games/${game.slug}`}>
                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full justify-between group-hover:bg-brand-600 group-hover:text-white group-hover:border-brand-400/40 transition-all font-bold"
                  >
                    <span className="flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Game</span>
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No Games Found in this Category"
          description="Try selecting 'All Games' to browse our complete collection of party game engines."
          actionLabel="View All Games"
          onAction={() => setActiveFilter('all')}
        />
      )}
    </div>
  );
}

