import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ALL_LOCALES, Locale, SUPPORTED_LOCALES } from '@/lib/i18n/config';
import { getTranslations } from '@/lib/i18n/translations';
import { generateLocalizedMetadata } from '@/lib/i18n/seo';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { TruthOrDareGameClient } from '@/components/games/TruthOrDareGameClient';
import { TruthOrDareHubLinks } from '@/components/games/TruthOrDareHubLinks';
import { RelatedGames } from '@/components/games/RelatedGames';

interface LocalizedTruthOrDareProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return ALL_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocalizedTruthOrDareProps): Promise<Metadata> {
  const { locale } = await params;
  if (!ALL_LOCALES.includes(locale as Locale)) return {};

  const dict = getTranslations(locale as Locale);
  const langMeta = SUPPORTED_LOCALES[locale as Locale];

  return generateLocalizedMetadata({
    locale: locale as Locale,
    subpath: '/truth-or-dare',
    overrideTitle: `${dict.gamesList.truthOrDare.name} Online — Asteria (${langMeta.nativeName})`,
    overrideDescription: dict.gamesList.truthOrDare.tagline,
  });
}

export default async function LocalizedTruthOrDarePage({ params }: LocalizedTruthOrDareProps) {
  const { locale } = await params;
  if (!ALL_LOCALES.includes(locale as Locale)) {
    notFound();
  }

  const dict = getTranslations(locale as Locale);

  return (
    <>
      <Breadcrumbs
        items={[
          { label: dict.breadcrumbs.games, href: `/${locale}/games` },
          { label: dict.gamesList.truthOrDare.name },
        ]}
      />
      <TruthOrDareGameClient />
      <TruthOrDareHubLinks />
      <RelatedGames
        currentGameSlug="truth-or-dare"
        title={dict.home.featuredGamesTitle}
        subtitle={dict.home.featuredGamesSubtitle}
      />
    </>
  );
}
