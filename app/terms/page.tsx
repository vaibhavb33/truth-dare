import React from 'react';
import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://truthordarequiz.com';

export const metadata: Metadata = {
  title: 'Terms of Service | Asteria Online Party Gaming',
  description:
    'Review the Asteria Terms of Service. Guidelines for user-generated custom decks, age verification requirements, and community conduct.',
  alternates: {
    canonical: `${siteUrl}/terms`,
  },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/terms`,
    title: 'Terms of Service | Asteria Online Party Gaming',
    description:
      'Review the Asteria Terms of Service. Guidelines for user-generated custom decks, age verification requirements, and community conduct.',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary',
    title: 'Terms of Service | Asteria Online Party Gaming',
    description:
      'Review the Asteria Terms of Service. Guidelines for user-generated custom decks, age verification requirements, and community conduct.',
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
    'Legal agreement, community safety requirements, age restrictions, and user conduct guidelines.',
  url: `${siteUrl}/terms`,
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-20 space-y-6 flex-1 text-slate-300 text-sm leading-relaxed">
      <JsonLd data={termsBreadcrumbSchema} />
      <JsonLd data={termsPageSchema} />

      <h1 className="font-display font-extrabold text-3xl md:text-4xl text-white">
        Terms of Service
      </h1>
      <p className="text-xs text-slate-400">Last updated: November 2026</p>

      <div className="space-y-6">
        <section className="space-y-2">
          <h2 className="font-bold text-lg text-white">1. Voluntary Participation & Consent</h2>
          <p>
            Participation in any party game hosted on Project Asteria is entirely voluntary. Every player holds absolute authority to veto or skip any question or dare for any reason, with no forced penalties, humiliation, or coercion.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-lg text-white">2. Prohibited Conduct</h2>
          <p>
            Users must never perform, encourage, or input custom dares that involve physical danger, illegal acts, operating motor vehicles, harassment, property damage, or non-consensual behavior. Asteria accepts no liability for actions taken by individuals while playing party games.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-lg text-white">3. Mature Content & Age Verification (18+)</h2>
          <p>
            Certain decks (e.g. Spicy 18+) contain explicit adult conversation topics and sensual dares designed solely for consenting adults. Users must honestly confirm they are 18 years of age or older before activating mature mode decks.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-lg text-white">4. User-Generated Decks</h2>
          <p>
            When utilizing the Custom Deck Creator, you agree not to submit hate speech, defamation, copyrighted content, or non-consensual personal information. Custom decks are stored locally in your browser and broadcast only to room guests you explicitly invite.
          </p>
        </section>
      </div>
    </div>
  );
}
