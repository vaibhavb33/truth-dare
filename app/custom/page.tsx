import React from 'react';
import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { CustomDeckClient } from '@/components/custom/CustomDeckClient';
import { getLocalizedAlternates } from '@/lib/i18n/seo';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://playtruthndare.com';

export const metadata: Metadata = {
  title: 'Custom Truth or Dare Deck Creator — Write & Play Your Own Cards | Play Truth & Dare',
  description:
    'Create and save your own custom Truth or Dare decks for free! Add personalized questions, listen with voice preview, and host multiplayer matches.',
  alternates: getLocalizedAlternates('/custom'),
  openGraph: {
    type: 'website',
    url: `${siteUrl}/custom`,
    title: 'Custom Truth or Dare Deck Creator — Write & Play Your Own Cards | Play Truth & Dare',
    description:
      'Create and save your own custom Truth or Dare decks for free! Add personalized questions, listen with voice preview, and host multiplayer matches.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Custom Truth or Dare Deck Creator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Custom Truth or Dare Deck Creator — Write & Play Your Own Cards | Play Truth & Dare',
    description:
      'Create and save your own custom Truth or Dare decks for free! Add personalized questions, listen with voice preview, and host multiplayer matches.',
    images: ['/og-image.png'],
  },
};

const customDeckBreadcrumb = {
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
      name: 'Custom Deck Studio',
      item: `${siteUrl}/custom`,
    },
  ],
};

const customDeckWebApp = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Play Truth & Dare Custom Deck Studio',
  url: `${siteUrl}/custom`,
  applicationCategory: 'DesignApplication',
  operatingSystem: 'All modern web browsers',
  browserRequirements: 'Requires JavaScript and LocalStorage enabled.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
};

export default function CustomDeckPage() {
  return (
    <>
      <JsonLd data={customDeckBreadcrumb} />
      <JsonLd data={customDeckWebApp} />
      <Breadcrumbs items={[{ label: 'Custom Deck Studio' }]} />
      <CustomDeckClient />
    </>
  );
}
