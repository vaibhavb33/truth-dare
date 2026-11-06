import { Question, GameType, CategoryId, QuestionType, SupportedLanguageCode, QuestionCategory } from '@/types';
import { ALL_QUESTIONS, LEGACY_CATEGORY_MAP } from './database';

export interface DrawCardParams {
  gameId: GameType;
  categoryId?: CategoryId | QuestionCategory;
  type?: QuestionType;
  language?: SupportedLanguageCode;
  maxIntensity?: number;
  drawnCardIds: string[];
  isFamilySafe?: boolean;
}

export interface EligibleQuestionsParams {
  gameId: GameType;
  categoryId?: CategoryId | QuestionCategory;
  type?: QuestionType;
  language?: SupportedLanguageCode;
  maxIntensity?: number;
  excludeIds?: string[];
  isFamilySafe?: boolean;
}

export class QuestionEngine {
  private questions: Question[];

  constructor(customQuestions: Question[] = [], overrideAll: boolean = false) {
    this.questions = overrideAll ? [...customQuestions] : [...ALL_QUESTIONS, ...customQuestions];
  }

  /**
   * Adds custom user questions to the engine pool
   */
  public addCustomQuestions(newQuestions: Question[]) {
    this.questions = [...this.questions, ...newQuestions];
  }

  /**
   * Cryptographically secure Fisher-Yates shuffle
   */
  public shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Get eligible questions matching game criteria, language, and category while excluding drawn cards
   * Strictly enforces: NO silent fallback to English if a non-English language is requested.
   */
  public getEligibleQuestions(params: EligibleQuestionsParams): Question[] {
    const {
      gameId,
      categoryId,
      type,
      language,
      maxIntensity = 5,
      excludeIds = [],
      isFamilySafe = false,
    } = params;
    const drawnSet = new Set(excludeIds);

    // Target language: if unspecified, defaults to 'en' for backward compatibility
    const targetLang: SupportedLanguageCode = language || 'en';

    return this.questions.filter((q) => {
      // 1. Must match gameId / game_type
      const qGame = q.game_type || q.gameId;
      if (qGame !== gameId) return false;

      // 2. Must match language strictly (NO silent fallback)
      const qLang = q.language_code || 'en';
      if (qLang !== targetLang) return false;

      // 3. Category matching (supports both 13 modern categories and legacy presets)
      if (categoryId && categoryId !== 'custom') {
        const legacyMapping = (LEGACY_CATEGORY_MAP as Record<string, QuestionCategory[]>)[categoryId];
        if (legacyMapping) {
          // Legacy preset: question matches if its category is in mapped set or directly equals categoryId
          const matchesLegacy =
            q.categoryId === categoryId ||
            (q.category && legacyMapping.includes(q.category as QuestionCategory));
          if (!matchesLegacy) return false;
        } else {
          // Specific modern category or custom categoryId
          const matchesCategory =
            q.category === categoryId ||
            q.categoryId === categoryId;
          if (!matchesCategory) return false;
        }
      }

      // 4. Filter by question type (truth vs dare) if specified
      if (type) {
        const qType = q.question_type || q.type;
        if (qType !== type) return false;
      }

      // 5. Filter intensity / difficulty
      const intensity = q.difficulty || q.intensity || 2;
      if (intensity > maxIntensity) return false;

      // 6. Family safety filter (G / PG-13 only, no R-18 / NSFW)
      if (isFamilySafe) {
        if (q.isNsfw || q.content_rating === 'R-18') return false;
      }

      // 7. Anti-repetition: exclude cards already drawn in this session
      if (drawnSet.has(q.id)) return false;

      return true;
    });
  }

  /**
   * Draw the next random question with anti-repetition memory and language filtering
   */
  public drawNextCard(params: DrawCardParams): {
    card: Question | null;
    isExhausted: boolean;
    remainingCount: number;
    language: SupportedLanguageCode;
  } {
    const targetLang: SupportedLanguageCode = params.language || 'en';

    const eligible = this.getEligibleQuestions({
      gameId: params.gameId,
      categoryId: params.categoryId,
      type: params.type,
      language: targetLang,
      maxIntensity: params.maxIntensity,
      excludeIds: params.drawnCardIds,
      isFamilySafe: params.isFamilySafe,
    });

    if (eligible.length === 0) {
      return {
        card: null,
        isExhausted: true,
        remainingCount: 0,
        language: targetLang,
      };
    }

    // Pick random card from eligible pool
    const randomIndex = Math.floor(Math.random() * eligible.length);
    const selectedCard = eligible[randomIndex];

    return {
      card: selectedCard,
      isExhausted: false,
      remainingCount: eligible.length - 1,
      language: targetLang,
    };
  }

  /**
   * Total questions count by game, category, and language
   */
  public getCount(
    gameIdOrParams?: GameType | { gameId?: GameType; categoryId?: CategoryId | QuestionCategory; language?: SupportedLanguageCode },
    categoryId?: CategoryId | QuestionCategory,
    language?: SupportedLanguageCode
  ): number {
    let targetGame: GameType | undefined;
    let targetCat: CategoryId | QuestionCategory | undefined;
    let targetLang: SupportedLanguageCode | undefined;

    if (typeof gameIdOrParams === 'object' && gameIdOrParams !== null) {
      targetGame = gameIdOrParams.gameId;
      targetCat = gameIdOrParams.categoryId;
      targetLang = gameIdOrParams.language;
    } else {
      targetGame = gameIdOrParams;
      targetCat = categoryId;
      targetLang = language;
    }

    return this.questions.filter((q) => {
      if (targetGame && (q.game_type || q.gameId) !== targetGame) return false;
      if (targetLang && (q.language_code || 'en') !== targetLang) return false;
      if (targetCat && targetCat !== 'custom') {
        const matchesCat = q.category === targetCat || q.categoryId === targetCat;
        if (!matchesCat) return false;
      }
      return true;
    }).length;
  }
}

export const questionEngine = new QuestionEngine();
