import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles, PlusCircle, ArrowRight } from 'lucide-react';
import { JsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { GamesDirectoryClient } from '@/components/games/GamesDirectoryClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://truthordarequiz.com';

export const metadata: Metadata = {
  title: 'Online Party Games Directory | Free Browser Games',
  description:
    'Browse all free online party games on Asteria. Play Truth or Dare, Spinner Wheel, Never Have I Ever, and Would You Rather instantly.',
  alternates: {
    canonical: `${siteUrl}/games`,
  },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/games`,
    title: 'Online Party Games Directory | Free Browser Games',
    description:
      'Browse all free online party games on Asteria. Play Truth or Dare, Spinner Wheel, Never Have I Ever, and Would You Rather instantly.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Asteria Party Game Directory',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Online Party Games Directory | Free Browser Games',
    description:
      'Browse all free online party games on Asteria. Play Truth or Dare, Spinner Wheel, Never Have I Ever, and Would You Rather instantly.',
    images: ['/og-image.png'],
  },
};

const gamesDirectoryBreadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: siteUrl,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Games Directory',
      item: `${siteUrl}/games`,
    },
  ],
};

const gamesDirectoryItemList = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Asteria Online Party Games',
  description: 'Complete collection of free, zero-download web party game engines.',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Truth or Dare Online',
      url: `${siteUrl}/games/truth-or-dare`,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Spinner Wheel (Spin the Bottle)',
      url: `${siteUrl}/games/spin-the-bottle`,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Never Have I Ever Online',
      url: `${siteUrl}/games/never-have-i-ever`,
    },
    {
      '@type': 'ListItem',
      position: 4,
      name: 'Would You Rather Online',
      url: `${siteUrl}/games/would-you-rather`,
    },
    {
      '@type': 'ListItem',
      position: 5,
      name: 'Most Likely To Online',
      url: `${siteUrl}/games/most-likely-to`,
    },
    {
      '@type': 'ListItem',
      position: 6,
      name: 'This or That Online',
      url: `${siteUrl}/games/this-or-that`,
    },
  ],
};

export default function GamesDirectoryPage() {
  return (
    <>
      <JsonLd data={gamesDirectoryBreadcrumb} />
      <JsonLd data={gamesDirectoryItemList} />
      <Breadcrumbs items={[{ label: 'Online Party Games Directory' }]} />
      <GamesDirectoryClient />

      {/* Cross-linking section to Questions & Custom Decks */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-8 py-10 border-t border-white/10 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-surface-elevated/90 border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-truth-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Prompt Vault</span>
            </div>
            <h3 className="font-display font-bold text-lg text-white">
              Explore 500+ Truth or Dare Questions
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Prefer reading through questions before playing? Browse our searchable prompt library with 5 categories and intensity ratings.
            </p>
            <Link
              href="/questions"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-truth-300 hover:text-white transition-colors pt-1"
            >
              <span>Explore Question Library</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6 rounded-3xl bg-surface-elevated/90 border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-brand-400 text-xs font-bold uppercase tracking-wider">
              <PlusCircle className="w-4 h-4" />
              <span>Creator Studio</span>
            </div>
            <h3 className="font-display font-bold text-lg text-white">
              Build Your Own Custom Deck
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Have specific inside jokes, work team prompts, or custom dares? Create, export, and launch your personalized party pack.
            </p>
            <Link
              href="/custom"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-300 hover:text-white transition-colors pt-1"
            >
              <span>Launch Custom Deck Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
