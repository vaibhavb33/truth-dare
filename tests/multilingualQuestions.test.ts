import { describe, it, expect } from 'vitest';
import {
  ALL_QUESTIONS,
  QUESTIONS_BY_LANGUAGE,
  getQuestionsByLanguage,
  getQuestionsCountByLanguage,
  findDuplicateQuestions,
  QUESTION_CATEGORIES,
} from '@/lib/questions/database';
import { questionEngine, QuestionEngine } from '@/lib/questions/engine';
import { SupportedLanguageCode, QuestionCategory } from '@/types';

describe('Multilingual Question Database & Engine Verification', () => {
  const supportedLanguages: SupportedLanguageCode[] = ['en', 'hi', 'es', 'pt', 'fr', 'id', 'ar', 'de'];

  it('contains minimum required target counts for all 8 supported languages', () => {
    const counts = getQuestionsCountByLanguage();

    // Target specifications:
    // en: 300 T + 300 D = 600 (plus 52 legacy)
    expect(counts.en.total).toBeGreaterThanOrEqual(600);
    expect(counts.en.truth).toBeGreaterThanOrEqual(300);
    expect(counts.en.dare).toBeGreaterThanOrEqual(300);

    // hi: 300 T + 300 D = 600
    expect(counts.hi.total).toBe(600);
    expect(counts.hi.truth).toBe(300);
    expect(counts.hi.dare).toBe(300);

    // es: 150 T + 150 D = 300
    expect(counts.es.total).toBe(300);
    expect(counts.es.truth).toBe(150);
    expect(counts.es.dare).toBe(150);

    // pt: 150 T + 150 D = 300
    expect(counts.pt.total).toBe(300);
    expect(counts.pt.truth).toBe(150);
    expect(counts.pt.dare).toBe(150);

    // fr: 100 T + 100 D = 200
    expect(counts.fr.total).toBe(200);
    expect(counts.fr.truth).toBe(100);
    expect(counts.fr.dare).toBe(100);

    // id: 100 T + 100 D = 200
    expect(counts.id.total).toBe(200);
    expect(counts.id.truth).toBe(100);
    expect(counts.id.dare).toBe(100);

    // ar: 100 T + 100 D = 200
    expect(counts.ar.total).toBe(200);
    expect(counts.ar.truth).toBe(100);
    expect(counts.ar.dare).toBe(100);

    // de: 100 T + 100 D = 200
    expect(counts.de.total).toBe(200);
    expect(counts.de.truth).toBe(100);
    expect(counts.de.dare).toBe(100);

    // Total database size exceeds 2,600 verified items
    expect(ALL_QUESTIONS.length).toBeGreaterThanOrEqual(2600);
  });

  it('guarantees unique IDs across the entire global database', () => {
    const idSet = new Set<string>();
    const duplicateIds: string[] = [];

    for (const q of ALL_QUESTIONS) {
      if (idSet.has(q.id)) {
        duplicateIds.push(q.id);
      }
      idSet.add(q.id);
    }

    expect(duplicateIds).toEqual([]);
    expect(idSet.size).toBe(ALL_QUESTIONS.length);
  });

  it('verifies 0 duplicate prompt strings within each language pool', () => {
    for (const lang of supportedLanguages) {
      const duplicates = findDuplicateQuestions(lang);
      expect(duplicates).toEqual([]);
    }
  });

  it('verifies cultural and linguistic authenticity (Hindi in Devanagari, Arabic in Arabic script)', () => {
    // Hindi check: Contains Devanagari Unicode range (\u0900-\u097F)
    const hindiQuestions = getQuestionsByLanguage('hi');
    const devanagariRegex = /[\u0900-\u097F]/;
    const hindiHasDevanagari = hindiQuestions.every((q) =>
      devanagariRegex.test(q.question_text || q.prompt || '')
    );
    expect(hindiHasDevanagari).toBe(true);

    // Arabic check: Contains Arabic Unicode range (\u0600-\u06FF)
    const arabicQuestions = getQuestionsByLanguage('ar');
    const arabicRegex = /[\u0600-\u06FF]/;
    const arabicHasScript = arabicQuestions.every((q) =>
      arabicRegex.test(q.question_text || q.prompt || '')
    );
    expect(arabicHasScript).toBe(true);
  });

  it('strictly filters by language with NO silent fallback to English', () => {
    const engine = new QuestionEngine();

    // When 'hi' is requested, all drawn cards must be Hindi
    for (let i = 0; i < 5; i++) {
      const { card } = engine.drawNextCard({
        gameId: 'truth-or-dare',
        language: 'hi',
        type: 'truth',
        drawnCardIds: [],
      });
      expect(card).not.toBeNull();
      expect(card?.language_code).toBe('hi');
      expect(/[\u0900-\u097F]/.test(card?.question_text || '')).toBe(true);
    }

    // When an invalid language or empty category is queried, it returns exhausted, NOT English
    const emptyResult = engine.drawNextCard({
      gameId: 'truth-or-dare',
      language: 'id',
      categoryId: 'non-existent-category' as any,
      drawnCardIds: [],
    });
    expect(emptyResult.card).toBeNull();
    expect(emptyResult.isExhausted).toBe(true);
  });

  it('covers all 13 standard categories across the questions', () => {
    const requiredCategories: QuestionCategory[] = [
      'funny-truth',
      'funny-dare',
      'friendship',
      'couples',
      'romantic',
      'awkward',
      'embarrassing',
      'personal',
      'family-friendly',
      'party',
      'teen-friendly',
      'icebreaker',
      'creative-challenges',
    ];

    for (const cat of requiredCategories) {
      expect(QUESTION_CATEGORIES[cat]).toBeDefined();
      const matching = ALL_QUESTIONS.filter((q) => q.category === cat);
      expect(matching.length).toBeGreaterThan(0);
    }
  });

  it('enforces anti-repetition memory per session', () => {
    const engine = new QuestionEngine();
    const drawnIds: string[] = [];

    // Draw 10 consecutive Hindi dare cards
    for (let i = 0; i < 10; i++) {
      const { card, isExhausted } = engine.drawNextCard({
        gameId: 'truth-or-dare',
        language: 'hi',
        type: 'dare',
        drawnCardIds: drawnIds,
      });

      expect(card).not.toBeNull();
      expect(isExhausted).toBe(false);
      expect(drawnIds.includes(card!.id)).toBe(false);
      drawnIds.push(card!.id);
    }

    expect(drawnIds.length).toBe(10);
    expect(new Set(drawnIds).size).toBe(10);
  });

  it('validates all mandatory fields for each question', () => {
    for (const q of ALL_QUESTIONS) {
      expect(q.id).toBeDefined();
      expect(q.game_type || q.gameId).toBeDefined();
      expect(q.question_type || q.type).toBeDefined();
      expect(q.language_code).toBeDefined();
      expect(q.category || q.categoryId).toBeDefined();
      expect(q.difficulty || q.intensity).toBeGreaterThanOrEqual(1);
      expect(q.difficulty || q.intensity).toBeLessThanOrEqual(5);
      expect(q.question_text || q.prompt).toBeDefined();
      expect(q.content_rating).toMatch(/^(G|PG-13|R-18)$/);
      expect(q.age_group).toMatch(/^(kids|teens|adults|all-ages)$/);
      expect(q.is_active).toBe(true);
      expect(q.safety_reviewed).toBe(true);
      expect(q.created_at).toBeDefined();
    }
  }, 20000);
});

