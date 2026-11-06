import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ALL_LOCALES, Locale, SUPPORTED_LOCALES } from '@/lib/i18n/config';
import { generateLocalizedMetadata } from '@/lib/i18n/seo';
import { HomeClientContent } from '@/components/home/HomeClientContent';

interface LocalizedHomeProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return ALL_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocalizedHomeProps): Promise<Metadata> {
  const { locale } = await params;
  if (!ALL_LOCALES.includes(locale as Locale)) {
    return {};
  }
  return generateLocalizedMetadata({
    locale: locale as Locale,
    subpath: '/',
  });
}

export default async function LocalizedHomePage({ params }: LocalizedHomeProps) {
  const { locale } = await params;
  if (!ALL_LOCALES.includes(locale as Locale)) {
    notFound();
  }

  return <HomeClientContent />;
}

