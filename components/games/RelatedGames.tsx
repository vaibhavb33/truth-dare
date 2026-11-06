import React from 'react';
import Link from 'next/link';
import { Flame, Disc, HelpCircle, Sparkles, Users, Zap, ArrowRight, Play, Compass } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface RelatedGamesProps {
  currentGameSlug: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

const ALL_GAMES = [
  {
    title: 'Truth or Dare Online',
    slug: 'truth-or-dare',
    ctaText: 'Play Truth or Dare Online',
    icon: Flame,
    color: 'from-dare-500 to-rose-600',
    badge: '3D Flip Cards',
    desc: 'Classic party challenges, dare countdown timer, and 5 intensity levels for groups.',
  },
  {
    title: 'Spin the Bottle Wheel',
    slug: 'spin-the-bottle',
    ctaText: 'Spin the Bottle Wheel',
    icon: Disc,
    color: 'from-brand-500 to-indigo-600',
    badge: 'Physics Wheel',
    desc: 'Realistic bottle spinning and prize wheel to randomly assign turns and forfeits.',
  },
  {
    title: 'Never Have I Ever Online',
    slug: 'never-have-i-ever',
    ctaText: 'Play Never Have I Ever',
    icon: HelpCircle,
    color: 'from-truth-500 to-cyan-600',
    badge: '10 Fingers Down',
    desc: 'Digital life counter confession game with group stats and zero setup needed.',
  },
  {
    title: 'Would You Rather Online',
    slug: 'would-you-rather',
    ctaText: 'Play Would You Rather',
    icon: Sparkles,
    color: 'from-emerald-500 to-teal-600',
    badge: 'Live % Stats',
    desc: 'Compelling dilemmas with real-time community vote percentages after every choice.',
  },
  {
    title: 'Most Likely To Online',
    slug: 'most-likely-to',
    ctaText: 'Play Most Likely To Online',
    icon: Users,
    color: 'from-amber-500 to-orange-600',
    badge: 'Secret Ballot',
    desc: 'Group voting where room friends crown the person who fits the wild prompt.',
  },
  {
    title: 'This or That Gauntlet',
    slug: 'this-or-that',
    ctaText: 'Play This or That Gauntlet',
    icon: Zap,
    color: 'from-pink-500 to-rose-600',
    badge: '60s Gauntlet',
    desc: 'Fast-paced mobile preference duel for dating couples, parties, and icebreakers.',
  },
];

export function RelatedGames({
  currentGameSlug,
  title = 'Keep the Party Going: Related Games',
  subtitle = 'Switch seamlessly between games without losing your party flow.',
  className = '',
}: RelatedGamesProps) {
  const related = ALL_GAMES.filter((g) => g.slug !== currentGameSlug).slice(0, 3);

  return (
    <section className={`w-full max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-16 border-t border-white/10 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-400">
            Discover More Games
          </span>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-white">
            {title}
          </h2>
          <p className="text-xs md:text-sm text-slate-400 max-w-xl">
            {subtitle}
          </p>
        </div>

        <Link
          href="/games"
          className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors shrink-0"
        >
          <Compass className="w-4 h-4" />
          <span>View All 6 Party Games</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {related.map((game) => {
          const Icon = game.icon;
          return (
            <div
              key={game.slug}
              className="p-6 rounded-3xl bg-surface-elevated/80 border border-white/10 hover:border-brand-500/40 transition-all flex flex-col justify-between space-y-5 group shadow-elevation-1 hover:shadow-elevation-2"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${game.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-slate-300">
                    {game.badge}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-display font-bold text-lg text-white group-hover:text-brand-300 transition-colors">
                    {game.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {game.desc}
                  </p>
                </div>
              </div>

              <Link href={`/games/${game.slug}`}>
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full justify-between group-hover:bg-brand-600 group-hover:text-white transition-all font-semibold text-xs"
                >
                  <span className="flex items-center gap-1.5">
                    <Play className="w-3 h-3 fill-current" />
                    <span>{game.ctaText}</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
