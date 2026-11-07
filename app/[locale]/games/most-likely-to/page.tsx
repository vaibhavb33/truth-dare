import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ALL_LOCALES, Locale, SUPPORTED_LOCALES } from '@/lib/i18n/config';
import { getTranslations } from '@/lib/i18n/translations';
import { generateLocalizedMetadata } from '@/lib/i18n/seo';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { MostLikelyToClient } from '@/components/games/MostLikelyToClient';
import { RelatedGames } from '@/components/games/RelatedGames';

interface LocalizedMostLikelyProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return ALL_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocalizedMostLikelyProps): Promise<Metadata> {
  const { locale } = await params;
  if (!ALL_LOCALES.includes(locale as Locale)) return {};

  const dict = getTranslations(locale as Locale);
  const langMeta = SUPPORTED_LOCALES[locale as Locale];

  return generateLocalizedMetadata({
    locale: locale as Locale,
    subpath: '/games/most-likely-to',
    overrideTitle: `${dict.gamesList.mostLikelyTo.name} — Asteria (${langMeta.nativeName})`,
    overrideDescription: dict.gamesList.mostLikelyTo.tagline,
  });
}

export default async function LocalizedMostLikelyPage({ params }: LocalizedMostLikelyProps) {
  const { locale } = await params;
  if (!ALL_LOCALES.includes(locale as Locale)) {
    notFound();
  }

  const dict = getTranslations(locale as Locale);

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 pt-4 w-full">
        <Breadcrumbs
          items={[
            { label: dict.breadcrumbs.games, href: `/${locale}/games` },
            { label: dict.gamesList.mostLikelyTo.name },
          ]}
        />
      </div>
      <MostLikelyToClient />
      <RelatedGames
        currentGameSlug="most-likely-to"
        title={dict.home.featuredGamesTitle}
        subtitle={dict.home.featuredGamesSubtitle}
      />
    </>
  );
}
