import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Shield, Heart, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { JsonLd } from '@/components/seo/JsonLd';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://truthordarequiz.com';

export const metadata: Metadata = {
  title: 'About Asteria — Premium Ad-Free Online Party Gaming',
  description:
    'Learn why we built Asteria: an ad-free, high-performance web party gaming platform engineered with 3D physics and real-time room synchronization.',
  alternates: {
    canonical: `${siteUrl}/about`,
  },
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
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 space-y-12 flex-1">
      <JsonLd data={aboutBreadcrumbSchema} />
      <JsonLd data={aboutPageSchema} />

      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-400">Our Mission</span>
        <h1 className="font-display font-extrabold text-4xl md:text-5xl text-white">
          Why We Built Asteria
        </h1>
        <p className="text-sm md:text-base text-slate-300 leading-relaxed">
          We believe party games should spark genuine laughter, connection, and excitement—without being ruined by loud advertisements or forced app downloads.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-surface-elevated border border-white/10 space-y-3">
          <Zap className="w-8 h-8 text-truth-400" />
          <h3 className="font-bold text-lg text-white">100% Web-First</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            No app store downloads, no mandatory registrations, and zero storage taken up on your phone. Works in any mobile or desktop browser.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-surface-elevated border border-white/10 space-y-3">
          <Shield className="w-8 h-8 text-emerald-400" />
          <h3 className="font-bold text-lg text-white">Zero Intrusive Ads</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            We never interrupt a live game turn with loud video ads, pop-ups, or banner shifts. The party flow is sacred.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-surface-elevated border border-white/10 space-y-3">
          <Heart className="w-8 h-8 text-dare-400" />
          <h3 className="font-bold text-lg text-white">Safety & Consent</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every challenge is curated for fun. We enforce unconditional skip rules and strict age gating for mature 18+ content.
          </p>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-surface-elevated border border-brand-500/30 text-center space-y-4">
        <h3 className="font-display font-bold text-2xl text-white">Ready for Game Night?</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Gather your friends in person or over video call, choose your deck, and start playing right now.
        </p>
        <Link href="/games/truth-or-dare">
          <Button variant="primary" size="lg" className="font-bold">
            Start Playing Free Now →
          </Button>
        </Link>
      </div>
    </div>
  );
}
