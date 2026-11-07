import { Question, SupportedLanguageCode, QuestionCategory } from '@/types';
import { INITIAL_QUESTIONS } from './legacy';
import { EN_QUESTIONS } from './en';
import { HI_QUESTIONS } from './hi';
import { ES_QUESTIONS } from './es';
import { PT_QUESTIONS } from './pt';
import { FR_QUESTIONS } from './fr';
import { ID_QUESTIONS } from './id';
import { AR_QUESTIONS } from './ar';
import { DE_QUESTIONS } from './de';
import { PARTY_GAMES_QUESTIONS } from './partyGamesCatalog';

export * from './categories';
export {
  INITIAL_QUESTIONS,
  EN_QUESTIONS,
  HI_QUESTIONS,
  ES_QUESTIONS,
  PT_QUESTIONS,
  FR_QUESTIONS,
  ID_QUESTIONS,
  AR_QUESTIONS,
  DE_QUESTIONS,
  PARTY_GAMES_QUESTIONS,
};

// Map of Truth or Dare questions strictly segregated by ISO 639-1 language code
export const QUESTIONS_BY_LANGUAGE: Record<SupportedLanguageCode, Question[]> = {
  en: [...INITIAL_QUESTIONS, ...EN_QUESTIONS],
  hi: [...HI_QUESTIONS],
  es: [...ES_QUESTIONS],
  pt: [...PT_QUESTIONS],
  fr: [...FR_QUESTIONS],
  id: [...ID_QUESTIONS],
  ar: [...AR_QUESTIONS],
  de: [...DE_QUESTIONS],
};

// Map of party game questions segregated by language code
export const PARTY_QUESTIONS_BY_LANGUAGE: Record<SupportedLanguageCode, Question[]> = {
  en: PARTY_GAMES_QUESTIONS.filter((q) => q.language_code === 'en'),
  hi: PARTY_GAMES_QUESTIONS.filter((q) => q.language_code === 'hi'),
  es: PARTY_GAMES_QUESTIONS.filter((q) => q.language_code === 'es'),
  pt: PARTY_GAMES_QUESTIONS.filter((q) => q.language_code === 'pt'),
  fr: PARTY_GAMES_QUESTIONS.filter((q) => q.language_code === 'fr'),
  id: PARTY_GAMES_QUESTIONS.filter((q) => q.language_code === 'id'),
  ar: PARTY_GAMES_QUESTIONS.filter((q) => q.language_code === 'ar'),
  de: PARTY_GAMES_QUESTIONS.filter((q) => q.language_code === 'de'),
};

// Complete aggregate of all verified questions across all 8 languages + legacy
export const ALL_QUESTIONS: Question[] = [
  ...INITIAL_QUESTIONS,
  ...EN_QUESTIONS,
  ...HI_QUESTIONS,
  ...ES_QUESTIONS,
  ...PT_QUESTIONS,
  ...FR_QUESTIONS,
  ...ID_QUESTIONS,
  ...AR_QUESTIONS,
  ...DE_QUESTIONS,
  ...PARTY_GAMES_QUESTIONS,
];

// In-memory index map by Question ID for O(1) lookups
export const QUESTIONS_BY_ID: Map<string, Question> = new Map(
  ALL_QUESTIONS.map((q) => [q.id, q])
);

/**
 * Returns questions strictly matching the requested language code.
 * Adheres to rule: NO silent fallback to English if non-English language selected.
 */
export function getQuestionsByLanguage(languageCode: SupportedLanguageCode): Question[] {
  return QUESTIONS_BY_LANGUAGE[languageCode] || [];
}

/**
 * Returns all active questions in the platform
 */
export function getAllQuestions(): Question[] {
  return ALL_QUESTIONS;
}

/**
 * Returns statistical breakdown of questions per language
 */
export function getQuestionsCountByLanguage(): Record<SupportedLanguageCode, { truth: number; dare: number; total: number }> {
  const stats: Record<string, { truth: number; dare: number; total: number }> = {};
  const supportedLangs: SupportedLanguageCode[] = ['en', 'hi', 'es', 'pt', 'fr', 'id', 'ar', 'de'];

  for (const lang of supportedLangs) {
    const list = QUESTIONS_BY_LANGUAGE[lang] || [];
    const truthCount = list.filter((q) => q.question_type === 'truth' || q.type === 'truth').length;
    const dareCount = list.filter((q) => q.question_type === 'dare' || q.type === 'dare').length;
    stats[lang] = {
      truth: truthCount,
      dare: dareCount,
      total: list.length,
    };
  }

  return stats as Record<SupportedLanguageCode, { truth: number; dare: number; total: number }>;
}

/**
 * Duplicate detector utility: finds questions with identical prompt strings
 */
export function findDuplicateQuestions(languageCode?: SupportedLanguageCode): { text: string; ids: string[]; count: number }[] {
  const pool = languageCode ? getQuestionsByLanguage(languageCode) : ALL_QUESTIONS;
  const textMap = new Map<string, string[]>();

  for (const q of pool) {
    const text = (q.question_text || q.prompt || '').trim().toLowerCase();
    if (!text) continue;
    const existing = textMap.get(text) || [];
    existing.push(q.id);
    textMap.set(text, existing);
  }

  const duplicates: { text: string; ids: string[]; count: number }[] = [];
  for (const [text, ids] of textMap.entries()) {
    if (ids.length > 1) {
      duplicates.push({ text, ids, count: ids.length });
    }
  }

  return duplicates;
}

