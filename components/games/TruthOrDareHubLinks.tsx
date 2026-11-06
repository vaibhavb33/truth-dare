import React from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  Flame,
  Heart,
  Users,
  Sparkles,
  BookOpen,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export function TruthOrDareHubLinks() {
  const categories = [
    {
      id: 'classic-party',
      name: 'Classic Party',
      anchor: 'Play Classic Party Truth or Dare',
      icon: '🎉',
      desc: 'Hilarious, universal icebreakers for friend groups and house parties.',
      href: '/games/truth-or-dare?category=classic-party',
    },
    {
      id: 'couples-flirty',
      name: 'Couples & Flirty',
      anchor: 'Play Couples Truth or Dare Online',
      icon: '❤️',
      desc: 'Romantic intimacy, cute questions, and playful flirty dares for couples.',
      href: '/games/truth-or-dare?category=couples-flirty',
    },
    {
      id: 'teens-hangout',
      name: 'Teens & Sleepovers',
      anchor: 'Play Truth or Dare for Teens',
      icon: '🍕',
      desc: 'School gossip, harmless dares, and sleepover fun for teenagers.',
      href: '/games/truth-or-dare?category=teens-hangout',
    },
    {
      id: 'spicy-18',
      name: 'Spicy 18+',
      anchor: 'Play Spicy Truth or Dare (Adults Only)',
      icon: '🌶️',
      desc: 'Wild, provocative late-night questions for consenting adults with age verification.',
      href: '/games/truth-or-dare?category=spicy-18',
    },
    {
      id: 'family-kids',
      name: 'Family Clean',
      anchor: 'Play Family Clean Truth or Dare',
      icon: '🌟',
      desc: '100% wholesome, school-safe challenges for parents and kids.',
      href: '/games/truth-or-dare?category=family-kids',
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-16 space-y-12 border-t border-white/10">
      {/* Category Deep Links */}
      <section className="space-y-6">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-dare-400">
            Tailored Experiences
          </span>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-white">
            Truth or Dare Categories for Every Occasion
          </h2>
          <p className="text-xs md:text-sm text-slate-400 max-w-2xl">
            Choose a tailored deck designed for your crowd dynamics, from wholesome family game nights to late-night adult challenges.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className="p-5 rounded-2xl bg-surface-elevated/80 hover:bg-surface-highlight border border-white/10 hover:border-brand-500/40 transition-all flex flex-col justify-between space-y-3 group shadow-subtle hover:shadow-card"
            >
              <div className="space-y-2">
                <span className="text-3xl" aria-hidden="true">{cat.icon}</span>
                <h3 className="font-bold text-sm text-white group-hover:text-brand-300 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {cat.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-brand-400 group-hover:text-brand-300">
                <span>{cat.anchor}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Question Vault & Creator Cross-Links */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Question Library Links */}
        <div className="p-6 md:p-8 rounded-3xl bg-surface-elevated border border-white/10 space-y-4">
          <div className="flex items-center gap-2 text-truth-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Searchable Question Database</span>
          </div>

          <h3 className="font-display font-bold text-xl text-white">
            Need Question Inspiration?
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed">
            Browse our curated vault of over 500 questions. Filter by intensity level, copy questions with one tap, or discover questions by keyword search.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/questions"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-truth-500/20 hover:bg-truth-500/30 border border-truth-400/40 text-xs font-bold text-truth-300 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Explore Truth Questions</span>
            </Link>

            <Link
              href="/questions"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-dare-500/20 hover:bg-dare-500/30 border border-dare-400/40 text-xs font-bold text-dare-300 transition-colors"
            >
              <Flame className="w-4 h-4" />
              <span>Try Funny Dare Questions</span>
            </Link>
          </div>
        </div>

        {/* Right: Custom Deck & Rules Links */}
        <div className="p-6 md:p-8 rounded-3xl bg-surface-elevated border border-white/10 space-y-4">
          <div className="flex items-center gap-2 text-brand-400 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Rules & Customization</span>
          </div>

          <h3 className="font-display font-bold text-xl text-white">
            Custom Decks & House Rules
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed">
            Write your group’s personalized inside jokes in the Custom Deck Studio, or master turn rotations, forfeit penalties, and safety skip rules in our official guide.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/custom"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500/20 hover:bg-brand-500/30 border border-brand-400/40 text-xs font-bold text-brand-300 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Build a Custom Deck</span>
            </Link>

            <Link
              href="/blog/official-truth-or-dare-rules"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface-highlight hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Read Official Game Rules</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
