import React from 'react';
import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { ContactFormClient } from '@/components/contact/ContactFormClient';
import { getLocalizedAlternates } from '@/lib/i18n/seo';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://truthordarequiz.com';

export const metadata: Metadata = {
  title: 'Contact Asteria | Support, Suggestions & Submissions',
  description:
    'Have a game idea, question pack suggestion, or bug report? Contact the Asteria team. We review community prompt submissions daily.',
  alternates: getLocalizedAlternates('/contact', 'en'),
  openGraph: {
    type: 'website',
    url: `${siteUrl}/contact`,
    title: 'Contact Asteria | Support, Suggestions & Submissions',
    description:
      'Have a game idea, question pack suggestion, or bug report? Contact the Asteria team. We review community prompt submissions daily.',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary',
    title: 'Contact Asteria | Support, Suggestions & Submissions',
    description:
      'Have a game idea, question pack suggestion, or bug report? Contact the Asteria team. We review community prompt submissions daily.',
  },
};

const contactBreadcrumbSchema = {
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
      name: 'Contact & Feedback',
      item: `${siteUrl}/contact`,
    },
  ],
};

const contactPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact Asteria Studio',
  description:
    'Feedback pipeline, prompt ideas submission, bug reports, and partnership inquiries.',
  url: `${siteUrl}/contact`,
};

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-16 space-y-8 flex-1 w-full">
      <JsonLd data={contactBreadcrumbSchema} />
      <JsonLd data={contactPageSchema} />
      <Breadcrumbs items={[{ label: 'Contact Asteria' }]} />

      <div className="space-y-2 text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-400">Get In Touch</span>
        <h1 className="font-display font-extrabold text-3xl md:text-5xl text-white">Contact & Feedback</h1>
        <p className="text-xs text-slate-400">
          Have an idea for a wild dare, a bug to report, or a business partnership inquiry?
        </p>
      </div>

      <ContactFormClient />
    </div>
  );
}
