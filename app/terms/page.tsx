import React from 'react';
import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { TermsClient } from '@/components/pages/TermsClient';
import { getLocalizedAlternates } from '@/lib/i18n/seo';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://truthordarequiz.com';

export const metadata: Metadata = {
  title: 'Terms of Service | Asteria Online Party Gaming',
  description:
    'Read the Asteria Terms of Service. Review guidelines on player safety, consent, dispute disclaimers, and mature content.',
  alternates: getLocalizedAlternates('/terms', 'en'),
  openGraph: {
    type: 'website',
    url: `${siteUrl}/terms`,
    title: 'Terms of Service | Asteria Online Party Gaming',
    description:
      'Read the Asteria Terms of Service. Review guidelines on player safety, consent, dispute disclaimers, and mature content.',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary',
    title: 'Terms of Service | Asteria Online Party Gaming',
    description:
      'Read the Asteria Terms of Service. Review guidelines on player safety, consent, dispute disclaimers, and mature content.',
  },
};

const termsBreadcrumbSchema = {
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
      name: 'Terms of Service',
      item: `${siteUrl}/terms`,
    },
  ],
};

const termsPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Asteria Terms of Service',
  description:
    'Legal agreement, consent rules, liability disclaimers, and terms for playing party games on Asteria.',
  url: `${siteUrl}/terms`,
};

export default function TermsPage() {
  return (
    <>
      <JsonLd data={termsBreadcrumbSchema} />
      <JsonLd data={termsPageSchema} />
      <div className="max-w-4xl mx-auto px-4 pt-4 w-full">
        <Breadcrumbs items={[{ label: 'Terms of Service' }]} />
      </div>
      <TermsClient />
    </>
  );
}
