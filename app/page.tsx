import React from 'react';
import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { HomeClientContent } from '@/components/home/HomeClientContent';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://truthordarequiz.com';

export const metadata: Metadata = {
  title: {
    absolute: 'Asteria — Free Online Party Games | Play in Browser',
  },
  description:
    'Play Truth or Dare, Never Have I Ever, and Would You Rather with friends. 100% free, zero ads, no app download required.',
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: 'Asteria — Free Online Party Games | Play in Browser',
    description:
      'Play Truth or Dare, Never Have I Ever, and Would You Rather with friends. 100% free, zero ads, no app download required.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Asteria — Free Online Party Games',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Asteria — Free Online Party Games | Play in Browser',
    description:
      'Play Truth or Dare, Never Have I Ever, and Would You Rather with friends. 100% free, zero ads, no app download required.',
    images: ['/og-image.png'],
  },
};

const homeFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is Project Asteria completely free to play?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, 100% free! You can play all core party games, access hundreds of curated cards, and host online multiplayer rooms without paywalls or forced subscriptions.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do my friends need to download an app or create an account to join?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No app download is required. Guests simply scan your room QR code with their smartphone camera or enter your 6-character room code in any web browser.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does the anti-repetition question engine work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Our game engine uses a Fisher-Yates cryptographically random shuffle coupled with an in-memory session history set. A prompt will never appear twice in the same session until the entire deck is exhausted.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I create and play custom Truth or Dare questions with my friends?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! Our Custom Deck Creator allows you to write, save, and play personalized decks stored safely in your browser, or share them directly into multiplayer rooms.',
      },
    },
    {
      '@type': 'Question',
      name: 'What if someone is uncomfortable with a specific dare?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Player safety and comfort are paramount. Every card includes an unconditional Skip / Veto button that allows any player to pass without penalty or humiliation.',
      },
    },
  ],
};

const homeWebAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Asteria Party Gaming Platform',
  url: siteUrl,
  applicationCategory: 'GameApplication',
  operatingSystem: 'All modern web browsers (iOS, Android, Windows, macOS, Linux)',
  browserRequirements: 'Requires JavaScript. HTML5 Canvas & Web Audio API enabled.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={homeFaqSchema} />
      <JsonLd data={homeWebAppSchema} />
      <HomeClientContent />
    </>
  );
}
