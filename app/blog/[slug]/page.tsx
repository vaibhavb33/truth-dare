'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar, Share2, Flame, Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { JsonLd } from '@/components/seo/JsonLd';

export default function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'The Official Rules of Truth or Dare: How to Play & House Variations',
    description:
      'Learn the official party rules, turn rotation, and house variations of Truth or Dare. Free browser-based party game launcher included.',
    author: {
      '@type': 'Organization',
      name: 'Asteria Game Studio',
      url: 'https://truthordarequiz.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Asteria Party Gaming',
      logo: {
        '@type': 'ImageObject',
        url: 'https://truthordarequiz.com/icon.svg',
      },
    },
    datePublished: '2026-11-01T00:00:00Z',
    dateModified: '2026-11-05T00:00:00Z',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://truthordarequiz.com/blog/${slug}`,
    },
  };

  const breadcrumbSchema = {
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
        name: 'Guides',
        item: 'https://truthordarequiz.com/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Rules of Truth or Dare',
        item: `https://truthordarequiz.com/blog/${slug}`,
      },
    ],
  };

  return (
    <article className="max-w-3xl mx-auto px-4 py-10 md:py-16 space-y-8 w-full flex-1">
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Guides
      </Link>

      <div className="space-y-4 border-b border-white/10 pb-8">
        <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 font-bold uppercase tracking-wider text-xs">
          Official Guide
        </span>

        <h1 className="font-display font-extrabold text-3xl md:text-5xl text-white leading-tight">
          The Official Rules of Truth or Dare: How to Play & House Variations
        </h1>

        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 4 min read</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> November 2026</span>
          <span>•</span>
          <span>By Asteria Game Studio</span>
        </div>
      </div>

      {/* Embedded Playable Widget */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-surface-elevated to-surface-highlight border border-brand-500/30 shadow-glow-brand flex flex-col sm:flex-row items-center justify-between gap-6 my-8">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-dare-400">
            <Flame className="w-4 h-4" /> Ready to Play?
          </div>
          <h3 className="font-display font-bold text-xl text-white">
            Play Truth or Dare Right in Your Browser
          </h3>
          <p className="text-xs text-slate-400">No app download required. Instant 3D card flips with friends.</p>
        </div>

        <Link href="/games/truth-or-dare">
          <Button variant="primary" size="lg" className="gap-2 shrink-0 font-bold">
            <Play className="w-4 h-4 fill-white" /> Launch Game
          </Button>
        </Link>
      </div>

      {/* Article Content */}
      <div className="prose prose-invert max-w-none text-slate-300 space-y-6 text-sm md:text-base leading-relaxed">
        <p>
          Truth or Dare is one of the most enduring social party games in the world. Whether played in college dorms, living room circles, or over video calls with long-distance partners, the core thrill lies in uncovering secrets and conquering silly, daring challenges.
        </p>

        <h2 className="font-display font-bold text-2xl text-white pt-4">Core Official Rules</h2>
        <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-300">
          <li><strong>The Choice:</strong> When it is your turn, you must declare "Truth" or "Dare" before seeing the prompt.</li>
          <li><strong>The Truth Rule:</strong> Once chosen, you must answer honestly without evading the core question.</li>
          <li><strong>The Dare Rule:</strong> You must attempt to perform the challenge within the designated time limit (typically 30–60 seconds).</li>
          <li><strong>The Safe Skip / Veto:</strong> Personal safety, legal boundaries, and emotional comfort always take priority. Any player may veto a prompt without penalty.</li>
        </ol>

        <h2 className="font-display font-bold text-2xl text-white pt-4">Popular House Variations</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm text-slate-300">
          <li><strong>No Repeats:</strong> A player cannot select "Truth" or "Dare" more than twice consecutively.</li>
          <li><strong>Drink Forfeit:</strong> If playing adult drinking rules, skipping a prompt requires taking 2 sips of your beverage.</li>
          <li><strong>Consensus Voting:</strong> The room takes a vote ("Passed" or "Chickened Out") to decide if a physical dare was successfully completed.</li>
        </ul>
      </div>
    </article>
  );
}

