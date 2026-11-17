import React from 'react';
import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { HomeClientContent } from '@/components/home/HomeClientContent';
import { getLocalizedAlternates } from '@/lib/i18n/seo';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://playtruthndare.com';

export const metadata: Metadata = {
  title: 'Truth or Dare Online | Play With Friends Free — Play Truth & Dare',
  description:
    'Play Truth or Dare online for free! Challenge friends, create private rooms, enjoy multiplayer games and explore fun Truth and Dare questions.',
  alternates: getLocalizedAlternates('/'),
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: 'Truth or Dare Online | Play With Friends Free — Play Truth & Dare',
    description:
      'Play Truth or Dare online for free! Challenge friends, create private rooms, enjoy multiplayer games and explore fun Truth and Dare questions.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Truth or Dare Online — Play With Friends Free',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Truth or Dare Online | Play With Friends Free — Play Truth & Dare',
    description:
      'Play Truth or Dare online for free! Challenge friends, create private rooms, enjoy multiplayer games and explore fun Truth and Dare questions.',
    images: ['/og-image.png'],
  },
};

const homeFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is Play Truth & Dare completely free to play?',
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
  name: 'Play Truth & Dare Platform',
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
