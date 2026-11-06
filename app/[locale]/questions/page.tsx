import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ALL_LOCALES, Locale, SUPPORTED_LOCALES } from '@/lib/i18n/config';
import { getTranslations } from '@/lib/i18n/translations';
import { generateLocalizedMetadata } from '@/lib/i18n/seo';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { QuestionsClient } from '@/components/questions/QuestionsClient';

interface LocalizedQuestionsProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return ALL_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocalizedQuestionsProps): Promise<Metadata> {
  const { locale } = await params;
  if (!ALL_LOCALES.includes(locale as Locale)) return {};

  const dict = getTranslations(locale as Locale);
  const langMeta = SUPPORTED_LOCALES[locale as Locale];

  return generateLocalizedMetadata({
    locale: locale as Locale,
    subpath: '/questions',
    overrideTitle: `500+ ${dict.gamesList.truthOrDare.name} ${dict.nav.questionLibrary} (${langMeta.nativeName})`,
    overrideDescription: dict.gamesList.truthOrDare.tagline,
  });
}

export default async function LocalizedQuestionsPage({ params }: LocalizedQuestionsProps) {
  const { locale } = await params;
  if (!ALL_LOCALES.includes(locale as Locale)) {
    notFound();
  }

  const dict = getTranslations(locale as Locale);

  return (
    <>
      <Breadcrumbs items={[{ label: dict.nav.questionLibrary }]} />
      <QuestionsClient />
    </>
  );
}
