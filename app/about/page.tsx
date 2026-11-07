import React from 'react';
import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { AboutClient } from '@/components/pages/AboutClient';
import { getLocalizedAlternates } from '@/lib/i18n/seo';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://truthordarequiz.com';

export const metadata: Metadata = {
  title: 'About Asteria — Premium Ad-Free Online Party Gaming',
  description:
    'Learn why we built Asteria: an ad-free, high-performance web party gaming platform engineered with 3D physics and real-time room synchronization.',
  alternates: getLocalizedAlternates('/about', 'en'),
  openGraph: {
    type: 'website',
    url: `${siteUrl}/about`,
    title: 'About Asteria — Premium Ad-Free Online Party Gaming',
    description:
      'Learn why we built Asteria: an ad-free, high-performance web party gaming platform engineered with 3D physics and real-time room synchronization.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'About Project Asteria',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Asteria — Premium Ad-Free Online Party Gaming',
    description:
      'Learn why we built Asteria: an ad-free, high-performance web party gaming platform engineered with 3D physics and real-time room synchronization.',
    images: ['/og-image.png'],
  },
};

const aboutBreadcrumbSchema = {
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
      name: 'About Asteria',
      item: `${siteUrl}/about`,
    },
  ],
};

const aboutPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About Asteria Gaming Studio',
  description:
    'Mission, engineering architecture, and principles behind Asteria ad-free web party games.',
  url: `${siteUrl}/about`,
  mainEntity: {
    '@type': 'Organization',
    name: 'Asteria Party Gaming',
    url: siteUrl,
    logo: `${siteUrl}/icon.svg`,
  },
};

export default function AboutPage() {
  return (
    <>
      <JsonLd data={aboutBreadcrumbSchema} />
      <JsonLd data={aboutPageSchema} />
      <div className="max-w-4xl mx-auto px-4 pt-4 w-full">
        <Breadcrumbs items={[{ label: 'About Project Asteria' }]} />
      </div>
      <AboutClient />
    </>
  );
}
