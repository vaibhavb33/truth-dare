import React from 'react';
import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { WouldYouRatherClient } from '@/components/games/WouldYouRatherClient';
import { RelatedGames } from '@/components/games/RelatedGames';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://truthordarequiz.com';

export const metadata: Metadata = {
  title: 'Would You Rather Online — Dilemma Game with Live Stats',
  description:
    'Play Would You Rather online! Vote on impossible dilemmas and see live community percentage splits summing to 100%. Free browser play.',
  alternates: {
    canonical: `${siteUrl}/games/would-you-rather`,
  },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/games/would-you-rather`,
    title: 'Would You Rather Online — Dilemma Game with Live Stats',
    description:
      'Play Would You Rather online! Vote on impossible dilemmas and see live community percentage splits summing to 100%. Free browser play.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Would You Rather Online Dilemma Game',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Would You Rather Online — Dilemma Game with Live Stats',
    description:
      'Play Would You Rather online! Vote on impossible dilemmas and see live community percentage splits summing to 100%. Free browser play.',
    images: ['/og-image.png'],
  },
};

const wyrWebAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Would You Rather Online — Live Statistics Dilemma Game',
  url: `${siteUrl}/games/would-you-rather`,
  applicationCategory: 'GameApplication',
  operatingSystem: 'All modern web browsers (iOS, Android, Windows, macOS)',
  browserRequirements: 'Requires JavaScript and Web Audio API enabled.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
};

const wyrBreadcrumbSchema = {
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
      name: 'Would You Rather',
      item: `${siteUrl}/games/would-you-rather`,
    },
  ],
};

export default function WouldYouRatherPage() {
  return (
    <>
      <JsonLd data={wyrWebAppSchema} />
      <JsonLd data={wyrBreadcrumbSchema} />
      <Breadcrumbs
        items={[
          { label: 'All Games', href: '/games' },
          { label: 'Would You Rather Online' },
        ]}
      />
      <WouldYouRatherClient />
      <RelatedGames
        currentGameSlug="would-you-rather"
        title="More Online Party Games"
        subtitle="Vote on preferences, flip 3D truth or dare cards, or play rapid-fire This or That."
      />
    </>
  );
}
