import React from 'react';
import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
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
      <GamesDirectoryClient />
    </>
  );
}
