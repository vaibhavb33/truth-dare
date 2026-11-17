import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { MobileDock } from '@/components/layout/MobileDock';
import { JsonLd } from '@/components/seo/JsonLd';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { getLocalizedAlternates } from '@/lib/i18n/seo';
import { PWARegistration } from '@/components/pwa/PWARegistration';
import { GTMRouteTracker } from '@/components/analytics/GTMRouteTracker';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://playtruthndare.com';
const rootAlternates = getLocalizedAlternates('/');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Truth or Dare Online | Play With Friends Free — Play Truth & Dare',
    template: '%s | Play Truth & Dare',
  },
  description:
    'Play Truth or Dare online for free! Challenge friends, create private rooms, enjoy multiplayer games and explore fun Truth and Dare questions.',
  keywords: [
    'truth or dare',
    'truth or dare online',
    'play truth or dare online',
    'truth or dare game',
    'truth or dare questions',
    'truth or dare with friends',
    'multiplayer truth or dare',
    'online party games',
    'truth or dare for couples',
    'funny truth or dare questions',
    'spin the bottle online',
    'free browser party games',
  ],
  alternates: rootAlternates,
  authors: [{ name: 'Play Truth & Dare' }],
  creator: 'Play Truth & Dare',
  publisher: 'Play Truth & Dare',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Play Truth & Dare',
    title: 'Play Truth & Dare — Truth. Dare. Laugh. Repeat.',
    description:
      'Play Truth or Dare, Spinner Wheel, Never Have I Ever, and Would You Rather with friends online or locally. Truth. Dare. Laugh. Repeat.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Play Truth & Dare — Truth. Dare. Laugh. Repeat.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Play Truth & Dare — Truth. Dare. Laugh. Repeat.',
    description:
      'The modern browser party game hub. Truth. Dare. Laugh. Repeat. Truth or Dare, Spinner Wheel, Never Have I Ever, and more.',
    images: ['/og-image.png'],
    creator: '@PlayTruthNDare',
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
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/branding/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/branding/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/branding/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PlayTruthNDare',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: {
      'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || '',
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
      name: 'Play Truth & Dare',
      url: siteUrl,
      logo: `${siteUrl}/branding/logo-horizontal-dark.svg`,
      sameAs: [
        'https://twitter.com/PlayTruthNDare',
        'https://discord.gg/playtruthndare',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'Play Truth & Dare',
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
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@500;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&family=Noto+Sans+Devanagari:wght@500;700;800&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" type="image/png" sizes="32x32" href="/branding/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/branding/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="PlayTruthNDare" />
        <JsonLd data={organizationAndWebsiteSchema} />
        {/* Google Tag Manager Container: GTM-MNXM9MQK */}
        <Script
          id="gtm-container"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{'analytics_storage':'granted','ad_storage':'denied','ad_user_data':'denied','ad_personalization':'denied','wait_for_update':500});(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-MNXM9MQK');`,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-canvas-base text-slate-100 selection:bg-brand-500 selection:text-white">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MNXM9MQK"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <GTMRouteTracker />
        <LanguageProvider>
          <AppHeader />
          <main className="flex-1 flex flex-col pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] lg:pb-0">{children}</main>
          <AppFooter />
          <MobileDock />
          <PWARegistration />
        </LanguageProvider>
      </body>
    </html>
  );
}
