export type Locale = 'en' | 'hi' | 'es' | 'pt' | 'fr' | 'id' | 'ar' | 'de';

export interface LanguageMeta {
  code: Locale;
  name: string;        // English name
  nativeName: string;  // Native language name
  dir: 'ltr' | 'rtl';
  flag: string;
  region: string;
}

export const SUPPORTED_LOCALES: Record<Locale, LanguageMeta> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    dir: 'ltr',
    flag: '🇬🇧',
    region: 'en-US',
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    dir: 'ltr',
    flag: '🇮🇳',
    region: 'hi-IN',
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    dir: 'ltr',
    flag: '🇪🇸',
    region: 'es-ES',
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    dir: 'ltr',
    flag: '🇧🇷',
    region: 'pt-BR',
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    dir: 'ltr',
    flag: '🇫🇷',
    region: 'fr-FR',
  },
  id: {
    code: 'id',
    name: 'Indonesian',
    nativeName: 'Bahasa Indonesia',
    dir: 'ltr',
    flag: '🇮🇩',
    region: 'id-ID',
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    dir: 'rtl',
    flag: '🇸🇦',
    region: 'ar-SA',
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    dir: 'ltr',
    flag: '🇩🇪',
    region: 'de-DE',
  },
};

export const ALL_LOCALES = Object.keys(SUPPORTED_LOCALES) as Locale[];
export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_COOKIE_NAME = 'asteria_locale';
