import { Locale } from '../config';
import { TranslationDictionary } from './types';
import { en } from './en';
import { hi } from './hi';
import { es } from './es';
import { pt } from './pt';
import { fr } from './fr';
import { id } from './id';
import { ar } from './ar';
import { de } from './de';

export const dictionaries: Record<Locale, TranslationDictionary> = {
  en,
  hi,
  es,
  pt,
  fr,
  id,
  ar,
  de,
};

export function getTranslations(locale: Locale): TranslationDictionary {
  return dictionaries[locale] || dictionaries.en;
}

export * from './types';
