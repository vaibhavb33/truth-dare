import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ALL_LOCALES, Locale, SUPPORTED_LOCALES } from '@/lib/i18n/config';
import { getTranslations } from '@/lib/i18n/translations';
import { generateLocalizedMetadata } from '@/lib/i18n/seo';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { AboutClient } from '@/components/pages/AboutClient';

interface LocalizedAboutProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return ALL_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocalizedAboutProps): Promise<Metadata> {
  const { locale } = await params;
  if (!ALL_LOCALES.includes(locale as Locale)) return {};

  const dict = getTranslations(locale as Locale);
  const langMeta = SUPPORTED_LOCALES[locale as Locale];

  return generateLocalizedMetadata({
    locale: locale as Locale,
    subpath: '/about',
    overrideTitle: `${dict.about.title} — Asteria (${langMeta.nativeName})`,
    overrideDescription: dict.about.subtitle,
  });
}

export default async function LocalizedAboutPage({ params }: LocalizedAboutProps) {
  const { locale } = await params;
  if (!ALL_LOCALES.includes(locale as Locale)) {
    notFound();
  }

  const dict = getTranslations(locale as Locale);

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 pt-4 w-full">
        <Breadcrumbs items={[{ label: dict.breadcrumbs.about }]} />
      </div>
      <AboutClient />
    </>
  );
}
