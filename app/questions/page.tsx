import React from 'react';
import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { QuestionsClient } from '@/components/questions/QuestionsClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://truthordarequiz.com';

export const metadata: Metadata = {
  title: '500+ Best Truth or Dare Questions | Searchable Library',
  description:
    'Explore 500+ curated Truth or Dare questions! Filter by category, intensity level (1-5), and copy favorite challenges with 1 click.',
  alternates: {
    canonical: `${siteUrl}/questions`,
  },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/questions`,
    title: '500+ Best Truth or Dare Questions | Searchable Library',
    description:
      'Explore 500+ curated Truth or Dare questions! Filter by category, intensity level (1-5), and copy favorite challenges with 1 click.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Truth or Dare Question Library',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '500+ Best Truth or Dare Questions | Searchable Library',
    description:
      'Explore 500+ curated Truth or Dare questions! Filter by category, intensity level (1-5), and copy favorite challenges with 1 click.',
    images: ['/og-image.png'],
  },
};

const questionsBreadcrumbSchema = {
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
      name: 'Question Library',
      item: `${siteUrl}/questions`,
    },
  ],
};

const questionsCollectionSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Curated Truth or Dare Question Library',
  description:
    'Searchable directory of 500+ truth or dare prompts, couples questions, and party challenges.',
  url: `${siteUrl}/questions`,
};

export default function QuestionsPage() {
  return (
    <>
      <JsonLd data={questionsBreadcrumbSchema} />
      <JsonLd data={questionsCollectionSchema} />
      <Breadcrumbs items={[{ label: '500+ Truth or Dare Question Library' }]} />
      <QuestionsClient />
    </>
  );
}
