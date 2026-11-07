import React from 'react';
import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { BlogClient } from '@/components/pages/BlogClient';
import { getLocalizedAlternates } from '@/lib/i18n/seo';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://truthordarequiz.com';

export const metadata: Metadata = {
  title: 'Party Game Rules & Guides | Project Asteria Blog',
  description:
    'Discover official party game rules, creative variations, icebreakers for video calls, and tips for hosting unforgettable game nights.',
  alternates: getLocalizedAlternates('/blog', 'en'),
  openGraph: {
    type: 'website',
    url: `${siteUrl}/blog`,
    title: 'Party Game Rules & Guides | Project Asteria Blog',
    description:
      'Discover official party game rules, creative variations, icebreakers for video calls, and tips for hosting unforgettable game nights.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Asteria Party Game Guides & Rules',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Party Game Rules & Guides | Project Asteria Blog',
    description:
      'Discover official party game rules, creative variations, icebreakers for video calls, and tips for hosting unforgettable game nights.',
    images: ['/og-image.png'],
  },
};

const blogBreadcrumbSchema = {
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
      name: 'Guides & Rules',
      item: `${siteUrl}/blog`,
    },
  ],
};

const blogCollectionSchema = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'Asteria Party Game Guides & Rules',
  description:
    'Official rules breakdowns, icebreakers, and party game hosting guides for browser games.',
  url: `${siteUrl}/blog`,
  publisher: {
    '@type': 'Organization',
    name: 'Asteria Party Gaming',
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/icon.svg`,
    },
  },
};

export default function BlogListingPage() {
  return (
    <>
      <JsonLd data={blogBreadcrumbSchema} />
      <JsonLd data={blogCollectionSchema} />
      <div className="max-w-4xl mx-auto px-4 pt-4 w-full">
        <Breadcrumbs items={[{ label: 'Party Game Guides & Official Rules' }]} />
      </div>
      <BlogClient />
    </>
  );
}
