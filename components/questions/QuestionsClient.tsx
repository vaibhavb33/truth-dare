'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Copy,
  Check,
  Flame,
  HelpCircle,
  ArrowRight,
  Sparkles,
  X,
  Play,
  PlusCircle,
  BookOpen,
} from 'lucide-react';
import { INITIAL_QUESTIONS } from '@/lib/questions/database';
import { sound } from '@/lib/audio/soundSynthesizer';
import { EmptyState } from '@/components/ui/States';

export function QuestionsClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { id: 'classic-party', name: 'Classic Party', icon: '🎉', href: '/games/truth-or-dare?category=classic-party' },
    { id: 'couples-flirty', name: 'Couples & Flirty', icon: '❤️', href: '/games/truth-or-dare?category=couples-flirty' },
    { id: 'teens-hangout', name: 'Teens & Sleepovers', icon: '🍕', href: '/games/truth-or-dare?category=teens-hangout' },
    { id: 'spicy-18', name: 'Spicy 18+', icon: '🌶️', href: '/games/truth-or-dare?category=spicy-18' },
    { id: 'family-kids', name: 'Family Clean', icon: '🌟', href: '/games/truth-or-dare?category=family-kids' },
  ];

  const filtered = INITIAL_QUESTIONS.filter((q) => {
    if (selectedFilter === 'truth' && q.type !== 'truth') return false;
    if (selectedFilter === 'dare' && q.type !== 'dare') return false;
    if (searchQuery.trim()) {
      return q.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const handleCopy = (id: string, text: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      sound.triggerHaptic(15);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-8 w-full flex-1">
      <div className="space-y-2 text-center md:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-xs font-bold uppercase tracking-wider text-brand-300">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>Curated Challenge Vault</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl md:text-5xl text-white tracking-tight">
          The Ultimate Truth or Dare Question Library
        </h1>
        <p className="text-xs md:text-sm text-slate-400 max-w-xl">
          Browse, copy, or launch over {INITIAL_QUESTIONS.length} handcrafted party prompts tailored for couples, friends, teens, and wild parties.
        </p>
      </div>

      {/* Category Shortcuts */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Browse by Game Category:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-elevated hover:bg-surface-highlight border border-white/10 hover:border-brand-500/40 text-xs font-medium text-slate-300 hover:text-white transition-all shadow-subtle"
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search prompts by keyword (e.g. crush, secret, sing)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-11 pr-10 rounded-xl bg-surface-elevated border border-white/10 text-xs md:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-400 transition-colors shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {['all', 'truth', 'dare'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setSelectedFilter(tab);
                sound.triggerHaptic(10);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex-1 sm:flex-none select-none ${
                selectedFilter === tab
                  ? 'bg-brand-500 text-white shadow-glow-brand border border-brand-400/40'
                  : 'bg-surface-elevated text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {tab === 'all' ? 'All Cards' : tab === 'truth' ? 'Truth Questions' : 'Dare Questions'}
            </button>
          ))}
        </div>
      </div>

      {/* Prompts Cards Grid or Empty State */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((q) => {
            const isTruth = q.type === 'truth';
            return (
              <div
                key={q.id}
                className="p-5 rounded-2xl bg-surface-elevated/90 border border-white/10 hover:border-brand-400/40 hover:shadow-glow-brand transition-all flex flex-col justify-between space-y-4 backdrop-blur-sm group hover:-translate-y-0.5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-black uppercase text-[10px] tracking-wider border ${
                        isTruth
                          ? 'bg-truth-500/15 text-truth-300 border-truth-400/30'
                          : 'bg-dare-500/15 text-dare-300 border-dare-400/30'
                      }`}
                    >
                      {isTruth ? <HelpCircle className="w-3 h-3" /> : <Flame className="w-3 h-3 fill-current" />}
                      <span>{q.type}</span>
                    </span>

                    <span className="text-[11px] text-slate-400 font-medium capitalize">
                      {q.categoryId.replace(/-/g, ' ')} • Lvl {q.intensity}
                    </span>
                  </div>

                  <p className="font-bold text-sm md:text-base text-white leading-relaxed">
                    {q.prompt}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <button
                    onClick={() => handleCopy(q.id, q.prompt)}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    {copiedId === q.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Prompt</span>
                      </>
                    )}
                  </button>

                  <Link
                    href={`/games/${q.gameId}?category=${q.categoryId}`}
                    className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Play In Game</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No Questions Match Your Search"
          description={`We couldn't find any questions matching "${searchQuery}". Try different keywords or clear your filter.`}
          actionLabel="Clear Search Filter"
          onAction={() => {
            setSearchQuery('');
            setSelectedFilter('all');
          }}
        />
      )}

      {/* Contextual Action Bar */}
      <section className="pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/games/truth-or-dare"
          className="p-5 rounded-2xl bg-surface-elevated hover:bg-surface-highlight border border-white/10 hover:border-brand-500/40 transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between text-brand-400">
            <Play className="w-5 h-5 fill-current" />
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
          <h4 className="font-bold text-sm text-white">Play Truth or Dare Online</h4>
          <p className="text-xs text-slate-400">Launch 3D flip card arena with dare timer and sound effects.</p>
        </Link>

        <Link
          href="/custom"
          className="p-5 rounded-2xl bg-surface-elevated hover:bg-surface-highlight border border-white/10 hover:border-brand-500/40 transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between text-brand-400">
            <PlusCircle className="w-5 h-5" />
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
          <h4 className="font-bold text-sm text-white">Create Custom Party Deck</h4>
          <p className="text-xs text-slate-400">Write personalized inside jokes and export JSON packs.</p>
        </Link>

        <Link
          href="/blog/official-truth-or-dare-rules"
          className="p-5 rounded-2xl bg-surface-elevated hover:bg-surface-highlight border border-white/10 hover:border-brand-500/40 transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between text-brand-400">
            <BookOpen className="w-5 h-5" />
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
          <h4 className="font-bold text-sm text-white">Official Truth or Dare Rules</h4>
          <p className="text-xs text-slate-400">Learn classic turn rotations, forfeits, and safe skip boundaries.</p>
        </Link>
      </section>
    </div>
  );
}
