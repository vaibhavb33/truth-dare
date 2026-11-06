import React from 'react';
import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { NeverHaveIEverClient } from '@/components/games/NeverHaveIEverClient';
import { RelatedGames } from '@/components/games/RelatedGames';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://truthordarequiz.com';

export const metadata: Metadata = {
  title: 'Never Have I Ever Online — 10 Fingers Down Game',
  description:
    'Play Never Have I Ever online! Interactive 10-life counter, hundreds of confessions, and pass-and-play party modes with friends.',
  alternates: {
    canonical: `${siteUrl}/games/never-have-i-ever`,
  },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/games/never-have-i-ever`,
    title: 'Never Have I Ever Online — 10 Fingers Down Game',
    description:
      'Play Never Have I Ever online! Interactive 10-life counter, hundreds of confessions, and pass-and-play party modes with friends.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Never Have I Ever Online',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Never Have I Ever Online — 10 Fingers Down Game',
    description:
      'Play Never Have I Ever online! Interactive 10-life counter, hundreds of confessions, and pass-and-play party modes with friends.',
    images: ['/og-image.png'],
  },
};

const nhieWebAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Never Have I Ever Online — 10 Fingers Down Game',
  url: `${siteUrl}/games/never-have-i-ever`,
  applicationCategory: 'GameApplication',
  operatingSystem: 'All modern web browsers (iOS, Android, Windows, macOS)',
  browserRequirements: 'Requires JavaScript and Web Audio API enabled.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
};

const nhieBreadcrumbSchema = {
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
      name: 'Never Have I Ever',
      item: `${siteUrl}/games/never-have-i-ever`,
    },
  ],
};

export default function NeverHaveIEverPage() {
  return (
    <>
      <JsonLd data={nhieWebAppSchema} />
      <JsonLd data={nhieBreadcrumbSchema} />
      <Breadcrumbs
        items={[
          { label: 'All Games', href: '/games' },
          { label: 'Never Have I Ever Online' },
        ]}
      />
      <NeverHaveIEverClient />
      <RelatedGames
        currentGameSlug="never-have-i-ever"
        title="More Online Party Games"
        subtitle="Enjoyed Never Have I Ever? Test your friends with Truth or Dare, Spinner Wheel, or Most Likely To."
      />
    </>
  );
}
