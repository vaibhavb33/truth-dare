import { describe, it, expect } from 'vitest';
import { ALL_QUESTIONS } from '@/lib/questions/database';
import { QuestionEngine } from '@/lib/questions/engine';
import { ShuffleBag } from '@/lib/questions/shuffleBag';
import { roomEngine } from '@/lib/multiplayer/roomEngine';
import { runQuestionAudit } from '@/scripts/validateQuestionDatabase';

describe('Phase 9: Comprehensive 5-Suite Expansion Verification', () => {
  // =========================================================================
  // TEST SUITE 1: QUESTION VARIETY & TARGET COUNTS
  // =========================================================================
  describe('Suite 1: Question Variety & Target Counts', () => {
    const audit = runQuestionAudit();

    it('satisfies Total Question Benchmark (> 6,000 total questions)', () => {
      expect(audit.total).toBeGreaterThanOrEqual(6000);
      console.log(`[Suite 1] Total Question Pool: ${audit.total}`);
    });

    it('satisfies Truth Questions Target (1,000+)', () => {
      expect(audit.byType['truth']).toBeGreaterThanOrEqual(1000);
      console.log(`[Suite 1] Truth Questions: ${audit.byType['truth']}`);
    });

    it('satisfies Dare Challenges Target (1,000+)', () => {
      expect(audit.byType['dare']).toBeGreaterThanOrEqual(1000);
      console.log(`[Suite 1] Dare Challenges: ${audit.byType['dare']}`);
    });

    it('satisfies Never Have I Ever Target (500+)', () => {
      expect(audit.byType['never_have_i_ever']).toBeGreaterThanOrEqual(500);
      console.log(`[Suite 1] Never Have I Ever: ${audit.byType['never_have_i_ever']}`);
    });

    it('satisfies Would You Rather Target (500+)', () => {
      expect(audit.byType['would_you_rather']).toBeGreaterThanOrEqual(500);
      console.log(`[Suite 1] Would You Rather: ${audit.byType['would_you_rather']}`);
    });

    it('satisfies Most Likely To Target (500+)', () => {
      expect(audit.byType['most_likely_to']).toBeGreaterThanOrEqual(500);
      console.log(`[Suite 1] Most Likely To: ${audit.byType['most_likely_to']}`);
    });

    it('satisfies This or That Target (500+)', () => {
      expect(audit.byType['this_or_that']).toBeGreaterThanOrEqual(500);
      console.log(`[Suite 1] This or That: ${audit.byType['this_or_that']}`);
    });

    it('satisfies Couples & Romantic Target (300+)', () => {
      const romanticTotal = (audit.byCategory['romantic'] || 0) + (audit.byCategory['couples'] || 0);
      expect(romanticTotal).toBeGreaterThanOrEqual(300);
      console.log(`[Suite 1] Couples / Romantic: ${romanticTotal}`);
    });

    it('satisfies Friendship Target (300+)', () => {
      expect(audit.byCategory['friendship']).toBeGreaterThanOrEqual(300);
      console.log(`[Suite 1] Friendship: ${audit.byCategory['friendship']}`);
    });

    it('satisfies Icebreaker Target (300+)', () => {
      expect(audit.byCategory['icebreaker']).toBeGreaterThanOrEqual(300);
      console.log(`[Suite 1] Icebreaker: ${audit.byCategory['icebreaker']}`);
    });
  });

  // =========================================================================
  // TEST SUITE 2: RANDOMIZATION & NO-REPEAT CYCLE ENGINE
  // =========================================================================
  describe('Suite 2: Randomization & No-Repeat Verification', () => {
    it('simulates 100 consecutive gameplay rounds with zero repeats before pool exhaustion', () => {
      const engine = new QuestionEngine();
      const drawnIds: string[] = [];

      for (let round = 1; round <= 100; round++) {
        const result = engine.drawNextCard({
          gameId: 'truth-or-dare',
          type: 'truth',
          language: 'en',
          drawnCardIds: drawnIds,
          allowCycleRestart: false,
        });

        expect(result.card).not.toBeNull();
        expect(drawnIds.includes(result.card!.id)).toBe(false);
        drawnIds.push(result.card!.id);
      }

      // Verify all 100 drawn IDs are strictly unique
      const uniqueSet = new Set(drawnIds);
      expect(uniqueSet.size).toBe(100);
    });

    it('handles small pool exhaustion gracefully with ShuffleBag cycle restart', () => {
      const miniPool = [
        { id: 'c1', prompt: 'Card 1', gameId: 'truth-or-dare' as const, type: 'truth' as const, categoryId: 'funny-truth' as const, intensity: 1 as const, isNsfw: false },
        { id: 'c2', prompt: 'Card 2', gameId: 'truth-or-dare' as const, type: 'truth' as const, categoryId: 'funny-truth' as const, intensity: 1 as const, isNsfw: false },
        { id: 'c3', prompt: 'Card 3', gameId: 'truth-or-dare' as const, type: 'truth' as const, categoryId: 'funny-truth' as const, intensity: 1 as const, isNsfw: false },
      ];

      const bag = new ShuffleBag(miniPool);
      const drawnCycle1 = [bag.draw().item!.id, bag.draw().item!.id, bag.draw().item!.id];
      expect(new Set(drawnCycle1).size).toBe(3);
      expect(bag.isCurrentCycleExhausted()).toBe(true);

      // Next draw automatically begins cycle 2 with anti-immediate repeat
      const cycle2Result = bag.draw();
      expect(cycle2Result.item).not.toBeNull();
      expect(cycle2Result.isNewCycle).toBe(true);
      expect(cycle2Result.item!.id).not.toBe(drawnCycle1[drawnCycle1.length - 1]);
    });
  });

  // =========================================================================
  // TEST SUITE 3: MULTIPLAYER QUESTION SYNCHRONIZATION
  // =========================================================================
  describe('Suite 3: Multiplayer Sync Verification', () => {
    it('synchronizes identical questions across all players in the room', () => {
      const { room, hostPlayerId, sessionToken } = roomEngine.createRoom({
        gameId: 'truth-or-dare',
        categoryId: 'classic-party',
        hostName: 'PlayerA',
      });

      const joinResult = roomEngine.joinRoom({
        roomCode: room.roomCode,
        playerName: 'PlayerB',
      });
      expect(joinResult.success).toBe(true);

      // Start game
      roomEngine.dispatchAction({
        roomCode: room.roomCode,
        playerId: hostPlayerId,
        sessionToken,
        action: 'START_GAME',
      });

      // Player A flips card to reveal a Truth
      const flipResult = roomEngine.dispatchAction({
        roomCode: room.roomCode,
        playerId: hostPlayerId,
        sessionToken,
        action: 'FLIP_CARD',
        payload: { type: 'truth' },
      });

      expect(flipResult.room).not.toBeNull();
      const currentCard = flipResult.room?.currentCard;
      expect(currentCard).toBeDefined();
      expect(currentCard?.type).toBe('truth');

      // Both players retrieve the same room snapshot and observe the identical question
      const playerASnapshot = roomEngine.getRoom(room.roomCode);
      const playerBSnapshot = roomEngine.getRoom(room.roomCode);

      expect(playerASnapshot?.currentCard?.id).toBe(currentCard?.id);
      expect(playerBSnapshot?.currentCard?.id).toBe(currentCard?.id);
      expect(playerASnapshot?.currentCard?.prompt).toBe(currentCard?.prompt);
      expect(playerBSnapshot?.currentCard?.prompt).toBe(currentCard?.prompt);
    });
  });

  // =========================================================================
  // TEST SUITE 4: DATABASE INTEGRITY & DEDUPLICATION CHECK
  // =========================================================================
  describe('Suite 4: Database Integrity & Duplication Check', () => {
    const audit = runQuestionAudit();

    it('has zero exact duplicate prompts across the entire catalog', () => {
      expect(audit.exactDuplicates.length).toBe(0);
    });

    it('has zero structurally invalid questions (missing ID, empty prompt, invalid type)', () => {
      expect(audit.invalidQuestions.length).toBe(0);
    });

    it('every question has valid game, type, category, and language fields', () => {
      for (const q of ALL_QUESTIONS) {
        expect(q.id).toBeDefined();
        expect(typeof q.id).toBe('string');
        expect(q.id.length).toBeGreaterThan(0);

        const prompt = q.prompt || q.question_text;
        expect(prompt).toBeDefined();
        expect(typeof prompt).toBe('string');
        expect(prompt!.trim().length).toBeGreaterThan(3);

        const type = q.question_type || q.type;
        expect(['truth', 'dare', 'most_likely_to', 'never_have_i_ever', 'would_you_rather', 'this_or_that']).toContain(type);
      }
    });
  });

  // =========================================================================
  // TEST SUITE 5: REGRESSION & PERFORMANCE LATENCY TESTING
  // =========================================================================
  describe('Suite 5: Regression & Performance Latency Testing', () => {
    it('executes question filtering queries in less than 50ms', () => {
      const engine = new QuestionEngine();
      const start = performance.now();

      for (let i = 0; i < 20; i++) {
        engine.getEligibleQuestions({
          gameId: 'truth-or-dare',
          categoryId: 'romantic',
          type: 'truth',
          language: 'en',
          maxIntensity: 3,
        });
      }

      const elapsed = performance.now() - start;
      const averageTime = elapsed / 20;
      console.log(`[Suite 5] Average query time: ${averageTime.toFixed(3)}ms`);
      expect(averageTime).toBeLessThan(50);
    });

    it('retains backwards compatibility with legacy questions and categories', () => {
      const engine = new QuestionEngine();
      const legacyParty = engine.getEligibleQuestions({
        gameId: 'truth-or-dare',
        categoryId: 'classic-party',
        language: 'en',
      });
      expect(legacyParty.length).toBeGreaterThan(0);
    });
  });
});
