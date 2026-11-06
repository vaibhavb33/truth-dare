import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { MobileDock } from '@/components/layout/MobileDock';
import { JsonLd } from '@/components/seo/JsonLd';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://truthordarequiz.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Asteria — Premium Online Party Gaming Platform',
    template: '%s | Asteria Party Games',
  },
  description:
    'Play Truth or Dare, Spinner Wheel, Never Have I Ever, Would You Rather, and more with friends online or locally. Zero ads, instant room codes, 100% free.',
  keywords: [
    'truth or dare online',
    'party games online',
    'truth or dare for couples',
    'spin the bottle game',
    'never have i ever online',
    'would you rather game',
    'most likely to game',
    'free browser party games',
  ],
  authors: [{ name: 'Asteria Gaming Studio' }],
  creator: 'Asteria Studio',
  publisher: 'Asteria Games',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Asteria Party Gaming',
    title: 'Asteria — Premium Online Party Gaming Platform',
    description:
      'Play Truth or Dare, Spinner Wheel, Never Have I Ever, and Would You Rather with friends online or locally.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Asteria — Play Free Online Party Games',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Asteria — Premium Online Party Gaming Platform',
    description:
      'The modern browser party game hub. Truth or Dare, Spinner Wheel, Never Have I Ever, and more.',
    images: ['/og-image.png'],
    creator: '@AsteriaGames',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0A0A16',
};

const organizationAndWebsiteSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'Asteria Party Gaming',
      url: siteUrl,
      logo: `${siteUrl}/icon.svg`,
      sameAs: [
        'https://twitter.com/AsteriaGames',
        'https://discord.gg/asteria',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'Asteria',
      publisher: {
        '@id': `${siteUrl}/#organization`,
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteUrl}/questions?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
        <JsonLd data={organizationAndWebsiteSchema} />
      </head>
      <body className="min-h-screen flex flex-col bg-canvas-base text-slate-100 selection:bg-brand-500 selection:text-white">
        <AppHeader />
        <main className="flex-1 flex flex-col pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] lg:pb-0">{children}</main>
        <AppFooter />
        <MobileDock />
      </body>
    </html>
  );
}
