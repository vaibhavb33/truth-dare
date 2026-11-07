import { describe, it, expect, beforeEach } from 'vitest';
import { deckStorage, getCreatorId } from '@/lib/custom/deckStorage';
import { validateCustomQuestion, validateQuestionSafety } from '@/lib/custom/safetyFilter';
import { roomEngine } from '@/lib/multiplayer/roomEngine';
import { CustomDeck, CustomQuestion } from '@/types';

describe('Custom Deck System - Comprehensive Unit & Integration Tests', () => {
  beforeEach(() => {
    roomEngine.resetRooms();
    deckStorage.clear();
  });

  // ==========================================
  // PHASE 1: CREATE DECK
  // ==========================================
  describe('Phase 1: Deck Creation & Configuration', () => {
    it('creates a custom deck with name, description, language, category, and visibility', () => {
      const creatorId = getCreatorId();
      const saveResult = deckStorage.saveDeck({
        name: 'College Dorm Secrets',
        description: 'Wild truths and hilarious dares from freshmen year.',
        language: 'es',
        category: 'deep-secrets',
        visibility: 'private',
        questions: [
          { id: 'q1', type: 'truth', prompt: '¿Cuál es tu mayor secreto de la universidad?' },
          { id: 'q2', type: 'dare', prompt: 'Imita a tu profesor favorito durante 30 segundos.' },
        ],
      });

      expect(saveResult.success).toBe(true);
      expect(saveResult.deck).toBeDefined();
      expect(saveResult.deck?.id).toMatch(/^deck-/);
      expect(saveResult.deck?.name).toBe('College Dorm Secrets');
      expect(saveResult.deck?.description).toBe('Wild truths and hilarious dares from freshmen year.');
      expect(saveResult.deck?.language).toBe('es');
      expect(saveResult.deck?.category).toBe('deep-secrets');
      expect(saveResult.deck?.visibility).toBe('private');
      expect(saveResult.deck?.creatorId).toBe(creatorId);
      expect(saveResult.deck?.createdAt).toBeGreaterThan(0);
      expect(saveResult.deck?.updatedAt).toBeGreaterThan(0);
    });

    it('rejects saving a deck with an empty or whitespace name', () => {
      const result = deckStorage.saveDeck({
        name: '   ',
        questions: [{ id: 'q1', type: 'truth', prompt: 'Sample question' }],
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Deck name cannot be empty');
    });

    it('rejects saving a deck with 0 questions', () => {
      const result = deckStorage.saveDeck({
        name: 'Empty Deck',
        questions: [],
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Deck must contain at least one question');
    });
  });

  // ==========================================
  // PHASE 2 & 7: QUESTION VALIDATION & CONTENT SAFETY
  // ==========================================
  describe('Phase 2 & 7: Question Management, Validation & Content Safety', () => {
    it('validates and accepts safe custom questions', () => {
      const validTruth = validateCustomQuestion('What is the funniest thing you believed as a child?');
      expect(validTruth.isValid).toBe(true);

      const validDare = validateCustomQuestion('Sing the chorus of your favorite pop song in an opera voice.');
      expect(validDare.isValid).toBe(true);
    });

    it('rejects empty or whitespace-only questions', () => {
      const emptyCheck = validateCustomQuestion('');
      expect(emptyCheck.isValid).toBe(false);
      expect(emptyCheck.error).toContain('cannot be empty');

      const spaceCheck = validateCustomQuestion('    ');
      expect(spaceCheck.isValid).toBe(false);
      expect(spaceCheck.error).toContain('cannot be empty');
    });

    it('rejects duplicate questions within the same deck (case-insensitive & trimmed)', () => {
      const existing = ['What is your biggest fear?', 'Do 10 pushups right now.'];

      const duplicateExact = validateCustomQuestion('What is your biggest fear?', existing);
      expect(duplicateExact.isValid).toBe(false);
      expect(duplicateExact.error).toContain('already exists in this deck');

      const duplicateCase = validateCustomQuestion('  WHAT IS YOUR BIGGEST FEAR?  ', existing);
      expect(duplicateCase.isValid).toBe(false);
      expect(duplicateCase.error).toContain('already exists in this deck');
    });

    it('rejects questions exceeding 250 characters limit', () => {
      const longPrompt = 'A'.repeat(251);
      const longCheck = validateCustomQuestion(longPrompt, [], 250);
      expect(longCheck.isValid).toBe(false);
      expect(longCheck.error).toContain('exceeds the maximum length of 250');
    });

    it('detects and blocks dangerous physical stunts (self-harm, fire, poisons)', () => {
      const bleachCheck = validateQuestionSafety('Drink bleach and tell us how it tastes.');
      expect(bleachCheck.isValid).toBe(false);
      expect(bleachCheck.category).toBe('dangerous_physical');

      const fireCheck = validateQuestionSafety('Set your hair on fire for 5 seconds.');
      expect(fireCheck.isValid).toBe(false);
      expect(fireCheck.category).toBe('dangerous_physical');

      const selfHarmCheck = validateQuestionSafety('Cut yourself with a sharp object.');
      expect(selfHarmCheck.isValid).toBe(false);
      expect(selfHarmCheck.category).toBe('violence_harm');
    });

    it('detects and blocks illegal criminal activities', () => {
      const drunkDriveCheck = validateQuestionSafety('Drive drunk around the block as fast as possible.');
      expect(drunkDriveCheck.isValid).toBe(false);
      expect(drunkDriveCheck.category).toBe('illegal_activity');

      const theftCheck = validateQuestionSafety('Steal from the store next door without getting caught.');
      expect(theftCheck.isValid).toBe(false);
      expect(theftCheck.category).toBe('illegal_activity');
    });

    it('detects and blocks non-consensual acts and harassment', () => {
      const nonConsensualCheck = validateQuestionSafety('Touch someone without permission in this room.');
      expect(nonConsensualCheck.isValid).toBe(false);
      expect(nonConsensualCheck.category).toBe('non_consensual');

      const privatePhotoCheck = validateQuestionSafety('Share private photos of your ex without consent.');
      expect(privatePhotoCheck.isValid).toBe(false);
      expect(privatePhotoCheck.category).toBe('non_consensual');
    });
  });

  // ==========================================
  // PHASE 3: DECK LIBRARY & OWNERSHIP
  // ==========================================
  describe('Phase 3: Deck Library & Ownership Controls', () => {
    it('persists and retrieves custom decks in local library', () => {
      deckStorage.saveDeck({
        name: 'Road Trip 2026',
        questions: [
          { id: '1', type: 'truth', prompt: 'Who is the worst driver in this car?' },
          { id: '2', type: 'dare', prompt: 'Sing along to the radio in high pitch.' },
        ],
      });

      const library = deckStorage.getDecks();
      expect(library.length).toBeGreaterThanOrEqual(1);
      const roadTrip = library.find((d) => d.name === 'Road Trip 2026');
      expect(roadTrip).toBeDefined();
      expect(roadTrip?.questions.length).toBe(2);
    });

    it('enforces creator ownership: blocks editing another creator deck', () => {
      // Create deck under creator 1
      const deck = deckStorage.saveDeck({
        name: 'Alice Private Deck',
        questions: [{ id: 'q1', type: 'truth', prompt: 'Alice secret question' }],
      }).deck!;

      // Simulate a different visitor browsing
      deckStorage.setCreatorIdForTesting('usr_mallory_imposter');

      // Mallory attempts to overwrite Alice's deck
      const unauthorizedEdit = deckStorage.saveDeck({
        id: deck.id,
        name: 'Mallory Hijacked Deck',
        questions: [{ id: 'q1', type: 'dare', prompt: 'Hacked prompt' }],
      });

      expect(unauthorizedEdit.success).toBe(false);
      expect(unauthorizedEdit.error).toContain('you can only edit your own decks');
    });

    it('enforces creator ownership: blocks deleting another creator deck', () => {
      const deck = deckStorage.saveDeck({
        name: 'Bob Deck',
        questions: [{ id: 'q1', type: 'truth', prompt: 'Bob secret' }],
      }).deck!;

      deckStorage.setCreatorIdForTesting('usr_mallory_imposter');

      const unauthorizedDelete = deckStorage.deleteDeck(deck.id);
      expect(unauthorizedDelete.success).toBe(false);
      expect(unauthorizedDelete.error).toContain('you can only delete your own decks');
    });

    it('migrates legacy asteria_custom_deck storage into modern library seamlessly', () => {
      deckStorage.clear();

      // Set legacy single deck
      const legacyData = {
        name: 'Legacy Inside Jokes',
        prompts: [
          { id: 'leg-1', type: 'truth', prompt: 'Legacy truth prompt' },
          { id: 'leg-2', type: 'dare', prompt: 'Legacy dare prompt' },
        ],
      };
      deckStorage.setLegacyDeckForTesting(legacyData);

      const decks = deckStorage.getDecks();
      const migrated = decks.find((d) => d.name === 'Legacy Inside Jokes');
      expect(migrated).toBeDefined();
      expect(migrated?.questions.length).toBe(2);
      expect(migrated?.questions[0].prompt).toBe('Legacy truth prompt');

      // Verify legacy key was cleaned up
      expect(deckStorage.getLegacyDeckForTesting()).toBeNull();
    });
  });

  // ==========================================
  // PHASE 5: MULTIPLAYER INTEGRATION WITH IMMUTABLE SNAPSHOT
  // ==========================================
  describe('Phase 5: Multiplayer Room Integration with Immutable Deck Snapshot', () => {
    it('creates multiplayer room with immutable custom deck snapshot and synchronizes cards', () => {
      const customQuestions: CustomQuestion[] = [
        { id: 'cq-1', type: 'truth', prompt: 'What is the biggest lie you told your parents?' },
        { id: 'cq-2', type: 'dare', prompt: 'Speak in an accent chosen by the group for 2 rounds.' },
        { id: 'cq-3', type: 'truth', prompt: 'What is your most embarrassing social media post?' },
      ];

      // Host creates room with custom deck snapshot
      const { room, hostPlayerId, sessionToken: hostToken } = roomEngine.createRoom({
        gameId: 'truth-or-dare',
        categoryId: 'deep-secrets',
        hostName: 'HostAlice',
        language: 'en',
        customDeckSnapshot: {
          id: 'deck-snapshot-123',
          name: 'Secret Party Pack',
          language: 'en',
          questions: customQuestions,
        },
      });

      expect(room.customDeckSnapshot).not.toBeNull();
      expect(room.customDeckSnapshot?.name).toBe('Secret Party Pack');
      expect(room.customDeckSnapshot?.questions.length).toBe(3);

      // Guest Bob joins
      const bob = roomEngine.joinRoom({
        roomCode: room.roomCode,
        playerName: 'GuestBob',
      });
      expect(bob.success).toBe(true);

      // Host starts game
      roomEngine.dispatchAction({
        roomCode: room.roomCode,
        playerId: hostPlayerId,
        sessionToken: hostToken,
        action: 'START_GAME',
      });
      expect(room.status).toBe('in_game');

      // Alice flips a card
      const flipResult = roomEngine.dispatchAction({
        roomCode: room.roomCode,
        playerId: hostPlayerId,
        sessionToken: hostToken,
        action: 'FLIP_CARD',
        payload: { type: 'truth' },
      });

      expect(flipResult.success).toBe(true);
      expect(room.currentCard).not.toBeNull();
      expect(room.currentCard?.category).toBe('custom');
      // Must be one of the custom truths from the snapshot
      const promptMatches = customQuestions.some((cq) => cq.prompt === room.currentCard?.prompt);
      expect(promptMatches).toBe(true);

      // Complete dare
      const completeRes = roomEngine.dispatchAction({
        roomCode: room.roomCode,
        playerId: hostPlayerId,
        sessionToken: hostToken,
        action: 'COMPLETE_DARE',
      });
      expect(completeRes.success).toBe(true);
      expect(room.players[0].score).toBe(1);
      // Turn advances to Bob
      expect(room.activePlayerId).toBe(bob.playerId);
    });

    it('guarantees original deck mutation does not alter active room snapshot (immutable snapshot)', () => {
      const originalQuestions: CustomQuestion[] = [
        { id: 'cq-1', type: 'truth', prompt: 'Original question 1' },
        { id: 'cq-2', type: 'dare', prompt: 'Original question 2' },
      ];

      // Host creates room with snapshot
      const { room } = roomEngine.createRoom({
        gameId: 'truth-or-dare',
        categoryId: 'classic-party',
        hostName: 'Alice',
        customDeckSnapshot: {
          id: 'deck-version-1',
          name: 'Original Pack',
          language: 'en',
          questions: [...originalQuestions],
        },
      });

      // Creator edits or mutates original deck outside the room
      originalQuestions.push({ id: 'cq-3', type: 'truth', prompt: 'New question added later' });
      originalQuestions[0].prompt = 'Mutated prompt';

      // The room snapshot must remain untouched
      expect(room.customDeckSnapshot?.questions.length).toBe(2);
      expect(room.customDeckSnapshot?.questions[0].prompt).toBe('Original question 1');
      expect(room.customDeckSnapshot?.questions[0].prompt).not.toBe('Mutated prompt');
    });
  });

  // ==========================================
  // PHASE 6: LANGUAGE & VOICE SUPPORT
  // ==========================================
  describe('Phase 6: Language & Voice Support', () => {
    it('sets deck question language and draws card in specified language', () => {
      const hindiQuestions: CustomQuestion[] = [
        { id: 'hi-1', type: 'truth', prompt: 'आपकी सबसे बड़ी गुप्त इच्छा क्या है?' },
        { id: 'hi-2', type: 'dare', prompt: 'कमरे में मौजूद किसी एक व्यक्ति की नकल करें।' },
      ];

      const { room, hostPlayerId, sessionToken } = roomEngine.createRoom({
        gameId: 'truth-or-dare',
        categoryId: 'classic-party',
        hostName: 'HostDev',
        language: 'hi',
        customDeckSnapshot: {
          id: 'hindi-pack-01',
          name: 'हिंदी पार्टी डेक',
          language: 'hi',
          questions: hindiQuestions,
        },
      });

      expect(room.language).toBe('hi');

      roomEngine.dispatchAction({
        roomCode: room.roomCode,
        playerId: hostPlayerId,
        sessionToken,
        action: 'START_GAME',
      });

      const flip = roomEngine.dispatchAction({
        roomCode: room.roomCode,
        playerId: hostPlayerId,
        sessionToken,
        action: 'FLIP_CARD',
        payload: { type: 'truth' },
      });

      expect(flip.success).toBe(true);
      expect(room.currentCard?.language_code).toBe('hi');
      expect(room.currentCard?.prompt).toBe('आपकी सबसे बड़ी गुप्त इच्छा क्या है?');
    });
  });
});
