import React from 'react';
import Link from 'next/link';
import { BookOpen, Clock, Calendar, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Party Game Guides & Rules — Asteria',
  description: 'Official rules, variation guides, couples questions, and tips for hosting legendary party game nights.',
};

export default function BlogListingPage() {
  const articles = [
    {
      slug: 'official-truth-or-dare-rules',
      title: 'The Official Rules of Truth or Dare: How to Play & House Variations',
      excerpt: 'Learn standard turns, pass limits, drinking penalties, and how to keep party games exciting without awkward boundaries.',
      readTime: '4 min read',
      date: 'Nov 2026',
      tag: 'Rules & Guides',
    },
    {
      slug: '50-best-dares-over-facetime',
      title: '50 Best Dares Over FaceTime for Long-Distance Relationships',
      excerpt: 'Keep the romantic spark and laughter alive across different time zones with camera-friendly dare challenges.',
      readTime: '6 min read',
      date: 'Nov 2026',
      tag: 'Couples & Romance',
    },
    {
      slug: 'clean-icebreakers-for-work',
      title: '100+ Clean Icebreaker Questions for Remote Teams & Discord',
      excerpt: 'Ditch the awkward silence on Zoom calls with engaging, school and workplace safe conversation starters.',
      readTime: '5 min read',
      date: 'Nov 2026',
      tag: 'Team Building',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-16 space-y-10 w-full flex-1">
      <div className="space-y-2 text-center md:text-left">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-400">
          Editorial & Guides
        </span>
        <h1 className="font-display font-extrabold text-3xl md:text-5xl text-white">
          Party Game Guides
        </h1>
        <p className="text-sm text-slate-400">
          Rules breakdowns, conversation starters, and tips for hosting unforgettable game nights.
        </p>
      </div>

      <div className="space-y-6">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/blog/${article.slug}`}
            className="block p-6 md:p-8 rounded-3xl bg-surface-elevated border border-white/10 hover:border-brand-500/40 transition-all group space-y-4"
          >
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="px-2.5 py-0.5 rounded-md bg-brand-500/20 text-brand-300 font-bold uppercase tracking-wider text-[10px]">
                {article.tag}
              </span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {article.readTime}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {article.date}</span>
            </div>

            <div className="space-y-2">
              <h2 className="font-display font-bold text-xl md:text-2xl text-white group-hover:text-brand-300 transition-colors">
                {article.title}
              </h2>
              <p className="text-xs md:text-sm text-slate-400 leading-relaxed">{article.excerpt}</p>
            </div>

            <div className="text-xs font-semibold text-brand-400 flex items-center gap-1 pt-2">
              <span>Read Full Guide</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

