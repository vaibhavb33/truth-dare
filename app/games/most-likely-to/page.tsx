import React from 'react';
import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { MostLikelyToClient } from '@/components/games/MostLikelyToClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://truthordarequiz.com';

export const metadata: Metadata = {
  title: 'Most Likely To Online — Secret Ballot Group Party Game',
  description:
    'Play Most Likely To online with friends! Vote on who in your group fits wild prompts, track scores, and crown the winner with confetti.',
  alternates: {
    canonical: `${siteUrl}/games/most-likely-to`,
  },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/games/most-likely-to`,
    title: 'Most Likely To Online — Secret Ballot Group Party Game',
    description:
      'Play Most Likely To online with friends! Vote on who in your group fits wild prompts, track scores, and crown the winner with confetti.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Most Likely To Online Party Game',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Most Likely To Online — Secret Ballot Group Party Game',
    description:
      'Play Most Likely To online with friends! Vote on who in your group fits wild prompts, track scores, and crown the winner with confetti.',
    images: ['/og-image.png'],
  },
};

const mltWebAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Most Likely To Online — Group Superlative Voting Game',
  url: `${siteUrl}/games/most-likely-to`,
  applicationCategory: 'GameApplication',
  operatingSystem: 'All modern web browsers (iOS, Android, Windows, macOS)',
  browserRequirements: 'Requires JavaScript and Web Audio API enabled.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
};

const mltBreadcrumbSchema = {
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
      name: 'Most Likely To',
      item: `${siteUrl}/games/most-likely-to`,
    },
  ],
};

export default function MostLikelyToPage() {
  return (
    <>
      <JsonLd data={mltWebAppSchema} />
      <JsonLd data={mltBreadcrumbSchema} />
      <MostLikelyToClient />
    </>
  );
}
