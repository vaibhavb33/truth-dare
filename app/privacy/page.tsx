import React from 'react';
import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { PrivacyClient } from '@/components/pages/PrivacyClient';
import { getLocalizedAlternates } from '@/lib/i18n/seo';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://truthordarequiz.com';

export const metadata: Metadata = {
  title: 'Privacy Policy | Asteria Online Party Gaming',
  description:
    'Read the Asteria Privacy Policy. Learn how we safeguard your data, respect local storage privacy, and never sell personal information.',
  alternates: getLocalizedAlternates('/privacy', 'en'),
  openGraph: {
    type: 'website',
    url: `${siteUrl}/privacy`,
    title: 'Privacy Policy | Asteria Online Party Gaming',
    description:
      'Read the Asteria Privacy Policy. Learn how we safeguard your data, respect local storage privacy, and never sell personal information.',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary',
    title: 'Privacy Policy | Asteria Online Party Gaming',
    description:
      'Read the Asteria Privacy Policy. Learn how we safeguard your data, respect local storage privacy, and never sell personal information.',
  },
};

const privacyBreadcrumbSchema = {
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
      name: 'Privacy Policy',
      item: `${siteUrl}/privacy`,
    },
  ],
};

const privacyPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Asteria Privacy Policy',
  description:
    'Information regarding ephemeral room storage, cookies, local storage, and user privacy safeguards.',
  url: `${siteUrl}/privacy`,
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <JsonLd data={privacyBreadcrumbSchema} />
      <JsonLd data={privacyPageSchema} />
      <div className="max-w-4xl mx-auto px-4 pt-4 w-full">
        <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />
      </div>
      <PrivacyClient />
    </>
  );
}
