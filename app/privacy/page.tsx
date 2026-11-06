import React from 'react';
import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://truthordarequiz.com';

export const metadata: Metadata = {
  title: 'Privacy Policy | Asteria Online Party Gaming',
  description:
    'Read the Asteria Privacy Policy. Learn how we safeguard your data, respect local storage privacy, and never sell personal information.',
  alternates: {
    canonical: `${siteUrl}/privacy`,
  },
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
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-20 space-y-6 flex-1 text-slate-300 text-sm leading-relaxed">
      <JsonLd data={privacyBreadcrumbSchema} />
      <JsonLd data={privacyPageSchema} />

      <h1 className="font-display font-extrabold text-3xl md:text-4xl text-white">
        Asteria Privacy Policy
      </h1>
      <p className="text-xs text-slate-400">Last updated: November 2026</p>

      <div className="space-y-6">
        <section className="space-y-2">
          <h2 className="font-bold text-lg text-white">1. Zero Mandatory Personal Data Collection</h2>
          <p>
            Project Asteria is engineered with privacy as a foundational constraint. We do not require accounts, phone numbers, or email addresses to play our party games. You can play every game completely anonymously.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-lg text-white">2. Browser Local Storage</h2>
          <p>
            We use modern browser <code className="text-brand-300 bg-white/5 px-1 py-0.5 rounded">localStorage</code> and <code className="text-brand-300 bg-white/5 px-1 py-0.5 rounded">sessionStorage</code> strictly to remember your preferences (such as audio mute state, affirmative 18+ age verification, and custom user-authored decks) directly on your device. This data never leaves your browser unless you explicitly choose to export or broadcast a deck.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-lg text-white">3. Multiplayer Room Data</h2>
          <p>
            Multiplayer room codes and temporary nicknames are retained only for the active duration of the game session (maximum 2 hours of inactivity), after which they are permanently expunged from memory. We do not maintain logs or tracking profiles on party participants.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-lg text-white">4. Analytics and External Trackers</h2>
          <p>
            We do not sell personal data to advertisers or third-party data brokers. Any diagnostic telemetry is strictly aggregated, privacy-preserving, and utilized solely to monitor server health, latency, and uptime.
          </p>
        </section>
      </div>
    </div>
  );
}
