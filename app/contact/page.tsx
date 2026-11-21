import React from 'react';
import type { Metadata } from 'next';
import { Mail, Sparkles, MessageSquare, ShieldCheck } from 'lucide-react';
import { JsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { ContactFormClient } from '@/components/contact/ContactFormClient';
import { getLocalizedAlternates } from '@/lib/i18n/seo';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://playtruthndare.com';

export const metadata: Metadata = {
  title: 'Contact Play Truth & Dare | Support, Suggestions & Submissions',
  description:
    'Have a game idea, question pack suggestion, or bug report? Contact the Play Truth & Dare team at borkarvaibhav98@gmail.com. We review community prompt submissions daily.',
  alternates: getLocalizedAlternates('/contact', 'en'),
  openGraph: {
    type: 'website',
    url: `${siteUrl}/contact`,
    title: 'Contact Play Truth & Dare | Support, Suggestions & Submissions',
    description:
      'Have a game idea, question pack suggestion, or bug report? Contact the Play Truth & Dare team at borkarvaibhav98@gmail.com. We review community prompt submissions daily.',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary',
    title: 'Contact Play Truth & Dare | Support, Suggestions & Submissions',
    description:
      'Have a game idea, question pack suggestion, or bug report? Contact the Play Truth & Dare team at borkarvaibhav98@gmail.com. We review community prompt submissions daily.',
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
  name: 'Contact Play Truth & Dare Studio',
  description:
    'Feedback pipeline, prompt ideas submission, bug reports, and partnership inquiries.',
  url: `${siteUrl}/contact`,
  mainEntity: {
    '@type': 'Organization',
    name: 'Play Truth & Dare',
    url: siteUrl,
    email: 'borkarvaibhav98@gmail.com',
  },
};

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:py-16 space-y-8 flex-1 w-full">
      <JsonLd data={contactBreadcrumbSchema} />
      <JsonLd data={contactPageSchema} />
      <Breadcrumbs items={[{ label: 'Contact Play Truth & Dare' }]} />

      {/* Header */}
      <div className="space-y-3 text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-400">Get In Touch</span>
        <h1 className="font-display font-extrabold text-3xl md:text-5xl text-white">Contact &amp; Feedback</h1>
        <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          Have an idea for a wild dare, feedback on multiplayer rooms, or a business partnership inquiry?
          Reach out directly or use the submission form below.
        </p>
      </div>

      {/* Contact Channels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-2xl bg-surface-elevated border border-white/10 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
            <Mail className="w-4 h-4" />
          </div>
          <h2 className="font-bold text-sm text-white">Direct Email</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Drop us a direct line anytime for inquiries or support.
          </p>
          <a
            href="mailto:borkarvaibhav98@gmail.com"
            className="inline-flex items-center gap-1.5 text-xs text-brand-300 hover:text-white font-semibold transition-colors break-all pt-1"
          >
            <span>borkarvaibhav98@gmail.com</span>
            <span>&rarr;</span>
          </a>
        </div>

        <div className="p-4 rounded-2xl bg-surface-elevated border border-white/10 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-truth-500/20 text-truth-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="font-bold text-sm text-white">Question Ideas</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Suggest hilarious truths or daring challenges for our weekly curated decks.
          </p>
          <span className="text-[11px] font-medium text-truth-300 block pt-1">Reviewed Daily</span>
        </div>

        <div className="p-4 rounded-2xl bg-surface-elevated border border-white/10 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-dare-500/20 text-dare-400 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h2 className="font-bold text-sm text-white">Fast Response</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Our team reviews and replies to all inquiries within 24–48 hours.
          </p>
          <span className="text-[11px] font-medium text-dare-300 block pt-1">&lt; 24h Response</span>
        </div>
      </div>

      {/* Main Interactive Form with Direct Mailto */}
      <ContactFormClient />

      {/* Additional Support Callout */}
      <div className="p-4 rounded-2xl bg-canvas-deep border border-white/5 text-center text-xs text-slate-400 space-y-1">
        <p>
          Need urgent assistance with a multiplayer party room? Email{' '}
          <a
            href="mailto:borkarvaibhav98@gmail.com"
            className="text-brand-300 font-semibold hover:underline inline-flex items-center gap-1"
          >
            <Mail className="w-3 h-3 inline shrink-0" />
            <span>borkarvaibhav98@gmail.com</span>
          </a>{' '}
          with your 6-character room code.
        </p>
      </div>
    </div>
  );
}
