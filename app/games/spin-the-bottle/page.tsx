import React from 'react';
import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { SpinnerWheelClient } from '@/components/games/SpinnerWheelClient';
import { RelatedGames } from '@/components/games/RelatedGames';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://truthordarequiz.com';

export const metadata: Metadata = {
  title: 'Spin the Bottle Online — Interactive 3D Spinner Wheel',
  description:
    'Spin the bottle online! 60 FPS deceleration physics wheel, custom slices, and instant turn picker for house parties and game nights.',
  alternates: {
    canonical: `${siteUrl}/games/spin-the-bottle`,
  },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/games/spin-the-bottle`,
    title: 'Spin the Bottle Online — Interactive 3D Spinner Wheel',
    description:
      'Spin the bottle online! 60 FPS deceleration physics wheel, custom slices, and instant turn picker for house parties and game nights.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Spin the Bottle Online Wheel',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Spin the Bottle Online — Interactive 3D Spinner Wheel',
    description:
      'Spin the bottle online! 60 FPS deceleration physics wheel, custom slices, and instant turn picker for house parties and game nights.',
    images: ['/og-image.png'],
  },
};

const spinnerWebAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Spin the Bottle Online — Interactive Spinner Wheel',
  url: `${siteUrl}/games/spin-the-bottle`,
  applicationCategory: 'GameApplication',
  operatingSystem: 'All modern web browsers (iOS, Android, Windows, macOS)',
  browserRequirements: 'Requires JavaScript and HTML5 Canvas.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
};

const spinnerBreadcrumbSchema = {
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
      name: 'Spin the Bottle',
      item: `${siteUrl}/games/spin-the-bottle`,
    },
  ],
};

export default function SpinnerWheelPage() {
  return (
    <>
      <JsonLd data={spinnerWebAppSchema} />
      <JsonLd data={spinnerBreadcrumbSchema} />
      <Breadcrumbs
        items={[
          { label: 'All Games', href: '/games' },
          { label: 'Spin the Bottle Wheel' },
        ]}
      />
      <SpinnerWheelClient />
      <RelatedGames
        currentGameSlug="spin-the-bottle"
        title="More Online Party Games"
        subtitle="Keep the party rolling with Truth or Dare, Never Have I Ever, and Would You Rather."
      />
    </>
  );
}
