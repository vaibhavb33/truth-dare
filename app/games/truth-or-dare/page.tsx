import React from 'react';
import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { TruthOrDareGameClient } from '@/components/games/TruthOrDareGameClient';
import { TruthOrDareHubLinks } from '@/components/games/TruthOrDareHubLinks';
import { RelatedGames } from '@/components/games/RelatedGames';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://truthordarequiz.com';

export const metadata: Metadata = {
  title: 'Truth or Dare Online — Play Free Party Game in Browser',
  description:
    'Play Truth or Dare online with friends! 3D flip cards, customizable dare timer, 5 intensity levels, and zero ads. Play instantly now.',
  alternates: {
    canonical: `${siteUrl}/games/truth-or-dare`,
  },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/games/truth-or-dare`,
    title: 'Truth or Dare Online — Play Free Party Game in Browser',
    description:
      'Play Truth or Dare online with friends! 3D flip cards, customizable dare timer, 5 intensity levels, and zero ads. Play instantly now.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Truth or Dare Online Game',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Truth or Dare Online — Play Free Party Game in Browser',
    description:
      'Play Truth or Dare online with friends! 3D flip cards, customizable dare timer, 5 intensity levels, and zero ads. Play instantly now.',
    images: ['/og-image.png'],
  },
};

const todWebAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Truth or Dare Online — Project Asteria',
  url: `${siteUrl}/games/truth-or-dare`,
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
      item: siteUrl,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Games',
      item: `${siteUrl}/games`,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Truth or Dare Online',
      item: `${siteUrl}/games/truth-or-dare`,
    },
  ],
};

export default function TruthOrDarePage() {
  return (
    <>
      <JsonLd data={todWebAppSchema} />
      <JsonLd data={todBreadcrumbSchema} />
      <Breadcrumbs
        items={[
          { label: 'All Games', href: '/games' },
          { label: 'Truth or Dare Online' },
        ]}
      />
      <TruthOrDareGameClient />
      <TruthOrDareHubLinks />
      <RelatedGames
        currentGameSlug="truth-or-dare"
        title="More Online Party Games"
        subtitle="When your group is ready for a change of pace, launch another free game instantly."
      />
    </>
  );
}
