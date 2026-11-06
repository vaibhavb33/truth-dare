import React from 'react';
import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { ThisOrThatClient } from '@/components/games/ThisOrThatClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://truthordarequiz.com';

export const metadata: Metadata = {
  title: 'This or That Online — Rapid Fire Preference Party Game',
  description:
    'Play This or That online! Rapid-fire 60-second preference gauntlet for dating couples, parties, and team icebreakers. Free to play.',
  alternates: {
    canonical: `${siteUrl}/games/this-or-that`,
  },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/games/this-or-that`,
    title: 'This or That Online — Rapid Fire Preference Party Game',
    description:
      'Play This or That online! Rapid-fire 60-second preference gauntlet for dating couples, parties, and team icebreakers. Free to play.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'This or That Rapid Fire Online',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'This or That Online — Rapid Fire Preference Party Game',
    description:
      'Play This or That online! Rapid-fire 60-second preference gauntlet for dating couples, parties, and team icebreakers. Free to play.',
    images: ['/og-image.png'],
  },
};

const totWebAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'This or That Online — Rapid Fire Preference Party Game',
  url: `${siteUrl}/games/this-or-that`,
  applicationCategory: 'GameApplication',
  operatingSystem: 'All modern web browsers (iOS, Android, Windows, macOS)',
  browserRequirements: 'Requires JavaScript and Web Audio API enabled.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
};

const totBreadcrumbSchema = {
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
      name: 'This or That',
      item: `${siteUrl}/games/this-or-that`,
    },
  ],
};

export default function ThisOrThatPage() {
  return (
    <>
      <JsonLd data={totWebAppSchema} />
      <JsonLd data={totBreadcrumbSchema} />
      <ThisOrThatClient />
    </>
  );
}
