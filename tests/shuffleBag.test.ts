import { describe, it, expect } from 'vitest';
import { ShuffleBag } from '@/lib/questions/shuffleBag';

describe('ShuffleBag Randomization Algorithm', () => {
  const mockCards = [
    { id: 'c1', name: 'Card 1' },
    { id: 'c2', name: 'Card 2' },
    { id: 'c3', name: 'Card 3' },
    { id: 'c4', name: 'Card 4' },
    { id: 'c5', name: 'Card 5' },
  ];

  it('draws every card in the pool with zero duplicates before cycle completes', () => {
    const bag = new ShuffleBag(mockCards);
    const drawnIds: string[] = [];

    for (let i = 0; i < mockCards.length; i++) {
      const res = bag.draw();
      expect(res.item).toBeDefined();
      expect(drawnIds.includes(res.item!.id)).toBe(false);
      drawnIds.push(res.item!.id);
    }

    expect(drawnIds.length).toBe(mockCards.length);
    expect(new Set(drawnIds).size).toBe(mockCards.length);
  });

  it('triggers a new cycle upon exhaustion with anti-immediate repeat guarantee', () => {
    const bag = new ShuffleBag(mockCards);
    let lastCardOfCycle1Id: string | null = null;

    // Draw entire first cycle
    for (let i = 0; i < mockCards.length; i++) {
      const res = bag.draw();
      if (i === mockCards.length - 1) {
        lastCardOfCycle1Id = res.item!.id;
      }
    }

    expect(lastCardOfCycle1Id).toBeDefined();

    // Draw the very first card of cycle 2
    const resCycle2 = bag.draw();
    expect(resCycle2.isNewCycle).toBe(true);
    expect(resCycle2.cycleNumber).toBe(2);

    // Anti-immediate repeat: first card of cycle 2 must NOT be identical to last card of cycle 1
    expect(resCycle2.item?.id).not.toBe(lastCardOfCycle1Id);
  });

  it('supports initial drawn IDs to resume existing session or multiplayer room state', () => {
    const bag = new ShuffleBag(mockCards, ['c1', 'c2']);
    expect(bag.getRemainingCount()).toBe(3);

    const firstDraw = bag.draw();
    expect(firstDraw.item?.id).not.toBe('c1');
    expect(firstDraw.item?.id).not.toBe('c2');
  });

  it('handles 100 consecutive rounds across multiple cycles seamlessly', () => {
    const bag = new ShuffleBag(mockCards);
    let totalDrawn = 0;

    for (let round = 1; round <= 100; round++) {
      const res = bag.draw();
      expect(res.item).toBeDefined();
      totalDrawn++;
    }

    expect(totalDrawn).toBe(100);
    expect(bag.getCycleCount()).toBeGreaterThan(15);
  });
});

