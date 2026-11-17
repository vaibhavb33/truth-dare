import { Metadata } from 'next';
import { Locale, SUPPORTED_LOCALES, DEFAULT_LOCALE, ALL_LOCALES } from './config';
import { getTranslations } from './translations';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://playtruthndare.com';

export function getLocalizedAlternates(subpath: string, currentLocale: Locale = DEFAULT_LOCALE) {
  // Normalize subpath to start with / and have no trailing slash
  const cleanPath = subpath === '/' ? '' : subpath.startsWith('/') ? subpath : `/${subpath}`;

  // Reciprocal hreflang for all 8 supported languages
  const languageAlternates: Record<string, string> = {};
  ALL_LOCALES.forEach((loc) => {
    languageAlternates[loc] = `${SITE_URL}/${loc}${cleanPath}`;
  });
  languageAlternates['x-default'] = `${SITE_URL}${cleanPath || '/'}`;

  // Self-referencing canonical (English default maps to canonical root path)
  const canonicalUrl =
    currentLocale === DEFAULT_LOCALE
      ? `${SITE_URL}${cleanPath}` || SITE_URL
      : `${SITE_URL}/${currentLocale}${cleanPath}`;

  return {
    canonical: canonicalUrl,
    languages: languageAlternates,
  };
}

export function generateLocalizedMetadata({
  locale,
  subpath,
  titleKey,
  descriptionKey,
  overrideTitle,
  overrideDescription,
}: {
  locale: Locale;
  subpath: string;
  titleKey?: string;
  descriptionKey?: string;
  overrideTitle?: string;
  overrideDescription?: string;
}): Metadata {
  const dict = getTranslations(locale);
  const langMeta = SUPPORTED_LOCALES[locale] || SUPPORTED_LOCALES.en;

  const defaultHomeTitle =
    locale === 'en'
      ? 'Truth or Dare Online | Play With Friends Free — Play Truth & Dare'
      : `${dict.home.heroTitle} Online | Play Truth & Dare (${langMeta.nativeName})`;
  const defaultHomeDesc =
    locale === 'en'
      ? 'Play Truth or Dare online for free! Challenge friends, create private rooms, enjoy multiplayer games and explore fun Truth and Dare questions.'
      : dict.home.heroSubtitle;

  const title =
    overrideTitle ||
    (subpath === '/'
      ? defaultHomeTitle
      : `${dict.home.heroTitle} — ${dict.home.heroBadge} | Play Truth & Dare (${langMeta.nativeName})`);
  const description =
    overrideDescription || (subpath === '/' ? defaultHomeDesc : dict.home.heroSubtitle);

  const alternates = getLocalizedAlternates(subpath, locale);

  return {
    title,
    description,
    alternates,
    openGraph: {
      type: 'website',
      locale: langMeta.region,
      url: alternates.canonical,
      siteName: 'Play Truth & Dare',
      title,
      description,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: `Play Truth & Dare — ${dict.home.heroTitle} (${langMeta.nativeName})`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
      creator: '@PlayTruthNDare',
    },
  };
}

