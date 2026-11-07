import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ALL_LOCALES, Locale, SUPPORTED_LOCALES } from '@/lib/i18n/config';
import { getTranslations } from '@/lib/i18n/translations';
import { generateLocalizedMetadata } from '@/lib/i18n/seo';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { ThisOrThatClient } from '@/components/games/ThisOrThatClient';
import { RelatedGames } from '@/components/games/RelatedGames';

interface LocalizedThisOrThatProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return ALL_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocalizedThisOrThatProps): Promise<Metadata> {
  const { locale } = await params;
  if (!ALL_LOCALES.includes(locale as Locale)) return {};

  const dict = getTranslations(locale as Locale);
  const langMeta = SUPPORTED_LOCALES[locale as Locale];

  return generateLocalizedMetadata({
    locale: locale as Locale,
    subpath: '/games/this-or-that',
    overrideTitle: `${dict.gamesList.thisOrThat.name} — Asteria (${langMeta.nativeName})`,
    overrideDescription: dict.gamesList.thisOrThat.tagline,
  });
}

export default async function LocalizedThisOrThatPage({ params }: LocalizedThisOrThatProps) {
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
            { label: dict.gamesList.thisOrThat.name },
          ]}
        />
      </div>
      <ThisOrThatClient />
      <RelatedGames
        currentGameSlug="this-or-that"
        title={dict.home.featuredGamesTitle}
        subtitle={dict.home.featuredGamesSubtitle}
      />
    </>
  );
}
