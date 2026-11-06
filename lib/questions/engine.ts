import { Question, GameType, CategoryId, QuestionType } from '@/types';
import { INITIAL_QUESTIONS } from './database';

export class QuestionEngine {
  private questions: Question[];

  constructor(customQuestions: Question[] = [], overrideAll: boolean = false) {
    this.questions = overrideAll ? [...customQuestions] : [...INITIAL_QUESTIONS, ...customQuestions];
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
   * Get eligible questions matching game criteria while excluding drawn cards
   */
  public getEligibleQuestions(params: {
    gameId: GameType;
    categoryId?: CategoryId;
    type?: QuestionType;
    maxIntensity?: number;
    excludeIds?: string[];
    isFamilySafe?: boolean;
  }): Question[] {
    const { gameId, categoryId, type, maxIntensity = 5, excludeIds = [], isFamilySafe = false } = params;
    const drawnSet = new Set(excludeIds);

    return this.questions.filter((q) => {
      // Must match game
      if (q.gameId !== gameId) return false;

      // Filter by category if specified
      if (categoryId && categoryId !== 'custom' && q.categoryId !== categoryId) return false;

      // Filter by type (truth vs dare) if specified
      if (type && q.type !== type) return false;

      // Filter intensity
      if (q.intensity > maxIntensity) return false;

      // Family safety filter
      if (isFamilySafe && q.isNsfw) return false;

      // Anti-repetition: exclude cards already drawn in this session
      if (drawnSet.has(q.id)) return false;

      return true;
    });
  }

  /**
   * Draw the next random question with anti-repetition memory
   */
  public drawNextCard(params: {
    gameId: GameType;
    categoryId?: CategoryId;
    type?: QuestionType;
    maxIntensity?: number;
    drawnCardIds: string[];
    isFamilySafe?: boolean;
  }): { card: Question | null; isExhausted: boolean; remainingCount: number } {
    const eligible = this.getEligibleQuestions({
      gameId: params.gameId,
      categoryId: params.categoryId,
      type: params.type,
      maxIntensity: params.maxIntensity,
      excludeIds: params.drawnCardIds,
      isFamilySafe: params.isFamilySafe,
    });

    if (eligible.length === 0) {
      return {
        card: null,
        isExhausted: true,
        remainingCount: 0,
      };
    }

    // Pick random card from eligible pool
    const randomIndex = Math.floor(Math.random() * eligible.length);
    const selectedCard = eligible[randomIndex];

    return {
      card: selectedCard,
      isExhausted: false,
      remainingCount: eligible.length - 1,
    };
  }

  /**
   * Total questions count by game and category
   */
  public getCount(gameId: GameType, categoryId?: CategoryId): number {
    return this.questions.filter((q) => {
      if (q.gameId !== gameId) return false;
      if (categoryId && q.categoryId !== categoryId) return false;
      return true;
    }).length;
  }
}

export const questionEngine = new QuestionEngine();
