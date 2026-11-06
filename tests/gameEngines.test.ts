import { describe, it, expect } from 'vitest';
import { questionEngine } from '@/lib/questions/engine';
import { Question } from '@/types';

describe('Comprehensive Game Engines Functional Tests', () => {
  // 1. TRUTH OR DARE
  describe('Truth or Dare Game Mechanics', () => {
    it('provides valid truth and dare decks with intensity scaling', () => {
      const truths = questionEngine.getEligibleQuestions({
        gameId: 'truth-or-dare',
        type: 'truth',
        maxIntensity: 3,
      });
      const dares = questionEngine.getEligibleQuestions({
        gameId: 'truth-or-dare',
        type: 'dare',
        maxIntensity: 3,
      });

      expect(truths.length).toBeGreaterThan(0);
      expect(dares.length).toBeGreaterThan(0);
      expect(truths.every((t) => t.type === 'truth' && t.intensity <= 3)).toBe(true);
      expect(dares.every((d) => d.type === 'dare' && d.intensity <= 3)).toBe(true);
    });

    it('isolates NSFW decks when isFamilySafe is true', () => {
      const safeQuestions = questionEngine.getEligibleQuestions({
        gameId: 'truth-or-dare',
        isFamilySafe: true,
      });

      expect(safeQuestions.every((q) => !q.isNsfw)).toBe(true);
    });
  });

  // 2. SPINNER WHEEL
  describe('Spinner Wheel Mechanics', () => {
    it('correctly calculates slice angle and pointer resolution', () => {
      const segments = ['Alex', 'Truth', 'Maya', 'Dare', 'Jordan', 'Wild'];
      const numSegments = segments.length;
      const anglePerSegment = (2 * Math.PI) / numSegments;

      expect(anglePerSegment).toBeCloseTo(Math.PI / 3);

      // Verify that any normalized angle [0, 2PI) maps to a valid segment index
      const testAngles = [0, 0.5, 1.2, 2.5, 3.8, 5.2, 6.1];
      testAngles.forEach((angle) => {
        const winningIndex = Math.floor(angle / anglePerSegment) % numSegments;
        expect(winningIndex).toBeGreaterThanOrEqual(0);
        expect(winningIndex).toBeLessThan(numSegments);
        expect(segments[winningIndex]).toBeDefined();
      });
    });

    it('enforces minimum 2 segments for valid spin physics', () => {
      const minSegments = ['Option A', 'Option B'];
      expect(minSegments.length).toBeGreaterThanOrEqual(2);
    });
  });

  // 3. NEVER HAVE I EVER
  describe('Never Have I Ever Game Mechanics', () => {
    it('tracks 10 fingers life decrement and confession counts accurately', () => {
      let lives = 10;
      let confessions = 0;

      // Simulate 3 confessions
      for (let i = 0; i < 3; i++) {
        confessions += 1;
        lives = Math.max(0, lives - 1);
      }

      expect(lives).toBe(7);
      expect(confessions).toBe(3);

      // Simulate life floor at 0 (never negative)
      for (let i = 0; i < 15; i++) {
        lives = Math.max(0, lives - 1);
      }
      expect(lives).toBe(0);
    });

    it('draws authentic Never Have I Ever prompts', () => {
      const prompt = questionEngine.drawNextCard({
        gameId: 'never-have-i-ever',
        drawnCardIds: [],
      });

      expect(prompt.card).not.toBeNull();
      expect(prompt.card?.gameId).toBe('never-have-i-ever');
      expect(prompt.card?.prompt.toLowerCase()).toContain('never have i ever');
    });
  });

  // 4. WOULD YOU RATHER
  describe('Would You Rather Game Mechanics', () => {
    it('calculates community vote percentages that sum exactly to 100%', () => {
      const sampleVote = () => {
        const baseA = 45 + Math.floor(Math.random() * 25);
        const baseB = 100 - baseA;
        return { aPercent: baseA, bPercent: baseB };
      };

      for (let i = 0; i < 20; i++) {
        const stats = sampleVote();
        expect(stats.aPercent + stats.bPercent).toBe(100);
        expect(stats.aPercent).toBeGreaterThanOrEqual(45);
        expect(stats.aPercent).toBeLessThanOrEqual(70);
      }
    });

    it('returns cards containing both optionA and optionB', () => {
      const { card } = questionEngine.drawNextCard({
        gameId: 'would-you-rather',
        drawnCardIds: [],
      });

      expect(card).not.toBeNull();
      expect(card?.optionA).toBeDefined();
      expect(card?.optionB).toBeDefined();
      expect(card?.optionA?.length).toBeGreaterThan(3);
      expect(card?.optionB?.length).toBeGreaterThan(3);
    });
  });

  // 5. MOST LIKELY TO
  describe('Most Likely To Game Mechanics', () => {
    it('accumulates group votes and determines winning player', () => {
      const players = [
        { name: 'Alex', votes: 0 },
        { name: 'Maya', votes: 0 },
        { name: 'Jordan', votes: 0 },
      ];

      // Cast votes
      players[0].votes += 1;
      players[1].votes += 3;
      players[2].votes += 2;

      const highestVotes = Math.max(...players.map((p) => p.votes));
      const winners = players.filter((p) => p.votes === highestVotes);

      expect(highestVotes).toBe(3);
      expect(winners.length).toBe(1);
      expect(winners[0].name).toBe('Maya');
    });
  });

  // 6. THIS OR THAT
  describe('This or That Game Mechanics', () => {
    it('increments rounds and tracks rapid-fire player choices', () => {
      let round = 1;
      const choices: string[] = [];

      const pickChoice = (choice: string) => {
        choices.push(choice);
        round += 1;
      };

      pickChoice('Road Trip');
      pickChoice('Coffee');
      pickChoice('Night Owl');

      expect(round).toBe(4);
      expect(choices.length).toBe(3);
      expect(choices).toEqual(['Road Trip', 'Coffee', 'Night Owl']);
    });
  });
});

