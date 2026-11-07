import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ALL_LOCALES, Locale, SUPPORTED_LOCALES } from '@/lib/i18n/config';
import { getTranslations } from '@/lib/i18n/translations';
import { generateLocalizedMetadata } from '@/lib/i18n/seo';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { ContactFormClient } from '@/components/contact/ContactFormClient';

interface LocalizedContactProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return ALL_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocalizedContactProps): Promise<Metadata> {
  const { locale } = await params;
  if (!ALL_LOCALES.includes(locale as Locale)) return {};

  const dict = getTranslations(locale as Locale);
  const langMeta = SUPPORTED_LOCALES[locale as Locale];

  return generateLocalizedMetadata({
    locale: locale as Locale,
    subpath: '/contact',
    overrideTitle: `${dict.contact.title} — Asteria (${langMeta.nativeName})`,
    overrideDescription: dict.contact.subtitle,
  });
}

export default async function LocalizedContactPage({ params }: LocalizedContactProps) {
  const { locale } = await params;
  if (!ALL_LOCALES.includes(locale as Locale)) {
    notFound();
  }

  const dict = getTranslations(locale as Locale);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:py-12 space-y-8 flex-1 w-full">
      <Breadcrumbs items={[{ label: dict.breadcrumbs.contact }]} />
      <div className="space-y-2 text-center md:text-left">
        <h1 className="font-display font-extrabold text-3xl md:text-5xl text-white">
          {dict.contact.title}
        </h1>
        <p className="text-xs md:text-sm text-slate-400">
          {dict.contact.subtitle}
        </p>
      </div>
      <ContactFormClient />
    </div>
  );
}

