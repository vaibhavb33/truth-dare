import { describe, it, expect } from 'vitest';
import { QuestionEngine } from '@/lib/questions/engine';
import { Question } from '@/types';

describe('QuestionEngine Unit Tests', () => {
  const sampleQuestions: Question[] = [
    {
      id: 'q1',
      gameId: 'truth-or-dare',
      categoryId: 'classic-party',
      type: 'truth',
      prompt: 'Truth 1',
      intensity: 1,
      isNsfw: false,
      tags: ['test'],
    },
    {
      id: 'q2',
      gameId: 'truth-or-dare',
      categoryId: 'classic-party',
      type: 'truth',
      prompt: 'Truth 2',
      intensity: 2,
      isNsfw: false,
      tags: ['test'],
    },
    {
      id: 'q3',
      gameId: 'truth-or-dare',
      categoryId: 'classic-party',
      type: 'dare',
      prompt: 'Dare 1',
      intensity: 3,
      isNsfw: false,
      tags: ['test'],
    },
    {
      id: 'q4',
      gameId: 'truth-or-dare',
      categoryId: 'spicy-18',
      type: 'truth',
      prompt: 'Adult Truth',
      intensity: 5,
      isNsfw: true,
      tags: ['test'],
    },
  ];

  it('correctly filters eligible questions by category and type', () => {
    const engine = new QuestionEngine(sampleQuestions, true);
    const truths = engine.getEligibleQuestions({
      gameId: 'truth-or-dare',
      categoryId: 'classic-party',
      type: 'truth',
    });

    expect(truths.length).toBe(2);
    expect(truths.every((q) => q.type === 'truth')).toBe(true);
  });

  it('enforces anti-repetition session deduplication', () => {
    const engine = new QuestionEngine(sampleQuestions, true);
    const drawnIds: string[] = [];

    // First draw
    const draw1 = engine.drawNextCard({
      gameId: 'truth-or-dare',
      categoryId: 'classic-party',
      type: 'truth',
      drawnCardIds: drawnIds,
    });
    expect(draw1.card).not.toBeNull();
    expect(draw1.isExhausted).toBe(false);
    drawnIds.push(draw1.card!.id);

    // Second draw
    const draw2 = engine.drawNextCard({
      gameId: 'truth-or-dare',
      categoryId: 'classic-party',
      type: 'truth',
      drawnCardIds: drawnIds,
    });
    expect(draw2.card).not.toBeNull();
    expect(draw2.card!.id).not.toBe(draw1.card!.id);
    drawnIds.push(draw2.card!.id);

    // Third draw: Deck must be exhausted
    const draw3 = engine.drawNextCard({
      gameId: 'truth-or-dare',
      categoryId: 'classic-party',
      type: 'truth',
      drawnCardIds: drawnIds,
    });
    expect(draw3.card).toBeNull();
    expect(draw3.isExhausted).toBe(true);
  });

  it('filters out NSFW questions when family safe mode is active', () => {
    const engine = new QuestionEngine(sampleQuestions);
    const safeCards = engine.getEligibleQuestions({
      gameId: 'truth-or-dare',
      isFamilySafe: true,
    });

    expect(safeCards.every((q) => !q.isNsfw)).toBe(true);
    expect(safeCards.some((q) => q.id === 'q4')).toBe(false);
  });
});
