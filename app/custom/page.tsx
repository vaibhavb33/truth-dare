import React from 'react';
import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { CustomDeckClient } from '@/components/custom/CustomDeckClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://truthordarequiz.com';

export const metadata: Metadata = {
  title: 'Custom Deck Studio — Build Your Own Party Game Pack',
  description:
    'Create your own custom Truth or Dare card pack! Add custom truths, dares, timers, and export or share decks with your party circle.',
  alternates: {
    canonical: `${siteUrl}/custom`,
  },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/custom`,
    title: 'Custom Deck Studio — Build Your Own Party Game Pack',
    description:
      'Create your own custom Truth or Dare card pack! Add custom truths, dares, timers, and export or share decks with your party circle.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Custom Deck Studio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Custom Deck Studio — Build Your Own Party Game Pack',
    description:
      'Create your own custom Truth or Dare card pack! Add custom truths, dares, timers, and export or share decks with your party circle.',
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
  name: 'Asteria Custom Deck Studio',
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
