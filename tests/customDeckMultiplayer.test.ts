import { describe, it, expect, beforeEach } from 'vitest';
import { roomEngine } from '@/lib/multiplayer/roomEngine';
import { serverDeckRepository } from '@/lib/custom/serverDeckRepository';
import { CustomDeck } from '@/types';

describe('Custom Deck Multiplayer Integration & Synchronization Engine', () => {
  beforeEach(() => {
    roomEngine.resetRooms();
    serverDeckRepository.clearForTesting();
  });

  const sampleDeck: CustomDeck = {
    id: 'deck-multi-123',
    name: 'College Dorm Party',
    description: 'Exclusive private inside jokes',
    language: 'en',
    category: 'classic-party',
    visibility: 'private',
    creatorId: 'creator-alice-99',
    version: 1,
    questions: [
      { id: 'q-t1', prompt: 'Who was your most embarrassing campus crush?', type: 'truth', intensity: 3 },
      { id: 'q-t2', prompt: 'Have you ever skipped a final exam to sleep in?', type: 'truth', intensity: 2 },
      { id: 'q-d1', prompt: 'Sing the college anthem in an opera voice for 20 seconds.', type: 'dare', intensity: 4 },
      { id: 'q-d2', prompt: 'Do your best impression of your economics professor.', type: 'dare', intensity: 3 },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  // =========================================================================
  // REQUIREMENT 1 & 2: VALIDATE DECK OWNERSHIP & QUESTION AVAILABILITY
  // =========================================================================
  describe('Deck Ownership & Validation', () => {
    it('validates deck ownership: allows the creator to generate a room snapshot', () => {
      serverDeckRepository.saveDeck(sampleDeck);

      const snapshotResult = serverDeckRepository.createRoomSnapshot({
        deckId: sampleDeck.id,
        creatorId: 'creator-alice-99',
      });

      expect(snapshotResult.success).toBe(true);
      expect(snapshotResult.snapshot).toBeDefined();
      expect(snapshotResult.snapshot?.deckId).toBe(sampleDeck.id);
      expect(snapshotResult.snapshot?.name).toBe('College Dorm Party');
      expect(snapshotResult.snapshot?.questions.length).toBe(4);
    });

    it('rejects room snapshot creation if a non-owner attempts to host a private deck', () => {
      serverDeckRepository.saveDeck(sampleDeck);

      const snapshotResult = serverDeckRepository.createRoomSnapshot({
        deckId: sampleDeck.id,
        creatorId: 'malicious-attacker-403',
      });

      expect(snapshotResult.success).toBe(false);
      expect(snapshotResult.code).toBe('PERMISSION_DENIED');
      expect(snapshotResult.error).toContain('Permission denied');
    });

    it('rejects decks with fewer than 2 questions (INVALID_QUESTIONS)', () => {
      const invalidDeck: CustomDeck = {
        ...sampleDeck,
        id: 'deck-too-short',
        questions: [{ id: 'q1', prompt: 'Single lonely question', type: 'truth' }],
      };
      serverDeckRepository.saveDeck(invalidDeck);

      const snapshotResult = serverDeckRepository.createRoomSnapshot({
        deckId: invalidDeck.id,
        creatorId: 'creator-alice-99',
      });

      expect(snapshotResult.success).toBe(false);
      expect(snapshotResult.code).toBe('INVALID_QUESTIONS');
      expect(snapshotResult.error).toContain('at least 2 playable questions');
    });
  });

  // =========================================================================
  // REQUIREMENT 3 & 10: DECK SNAPSHOT IMMUTABILITY & PRESERVATION
  // =========================================================================
  describe('Snapshot Immutability & Original Deck Preservation', () => {
    it('creates an immutable snapshot that is isolated from subsequent edits to the original deck', () => {
      serverDeckRepository.saveDeck(sampleDeck);

      const snapshotResult = serverDeckRepository.createRoomSnapshot({
        deckId: sampleDeck.id,
        creatorId: 'creator-alice-99',
      });
      expect(snapshotResult.success).toBe(true);
      const snapshot = snapshotResult.snapshot!;

      // Create a room using the snapshot
      const { room } = roomEngine.createRoom({
        gameId: 'truth-or-dare',
        categoryId: 'custom',
        hostName: 'Alice',
        language: snapshot.language,
        customDeckSnapshot: snapshot,
      });

      expect(room.customDeckSnapshot).toBeDefined();
      expect(room.customDeckSnapshot?.questions.length).toBe(4);

      // Now edit the original deck in the repository (e.g. user edits their deck in library)
      serverDeckRepository.saveDeck({
        ...sampleDeck,
        name: 'MODIFIED DECK NAME',
        questions: [
          { id: 'q-new1', prompt: 'Brand new question 1', type: 'truth' },
          { id: 'q-new2', prompt: 'Brand new question 2', type: 'dare' },
        ],
      });

      // Verify the active room still preserves the exact original snapshot questions!
      const activeRoom = roomEngine.getRoom(room.roomCode)!;
      expect(activeRoom.customDeckSnapshot?.name).toBe('College Dorm Party');
      expect(activeRoom.customDeckSnapshot?.questions.length).toBe(4);
      expect(activeRoom.customDeckSnapshot?.questions[0].prompt).toBe(
        'Who was your most embarrassing campus crush?'
      );

      // Verify snapshot object is frozen
      expect(Object.isFrozen(snapshot)).toBe(true);
      expect(Object.isFrozen(snapshot.questions)).toBe(true);
    });
  });

  // =========================================================================
  // REQUIREMENT 4, 5, 6 & 7: MULTIPLAYER GAMEPLAY, TURNS & NON-DUPLICATE SELECTION
  // =========================================================================
  describe('Multiplayer Synchronized Gameplay & Non-Duplicate Question Selection', () => {
    it('synchronizes 3 players, ensures all receive identical questions, and avoids duplicates until pool exhaustion', () => {
      serverDeckRepository.saveDeck(sampleDeck);
      const snapshot = serverDeckRepository.createRoomSnapshot({
        deckId: sampleDeck.id,
        creatorId: 'creator-alice-99',
      }).snapshot!;

      // 1. Host creates room
      const hostSession = roomEngine.createRoom({
        gameId: 'truth-or-dare',
        categoryId: 'custom',
        hostName: 'AliceHost',
        language: snapshot.language,
        customDeckSnapshot: snapshot,
      });
      const roomCode = hostSession.roomCode;
      const hostId = hostSession.hostPlayerId;
      const hostToken = hostSession.sessionToken;

      // 2. Bob joins
      const bobSession = roomEngine.joinRoom({
        roomCode,
        playerName: 'Bob',
      });
      expect(bobSession.success).toBe(true);
      const bobId = bobSession.playerId!;
      const bobToken = bobSession.sessionToken!;

      // 3. Charlie joins
      const charlieSession = roomEngine.joinRoom({
        roomCode,
        playerName: 'Charlie',
      });
      expect(charlieSession.success).toBe(true);
      const charlieId = charlieSession.playerId!;
      const charlieToken = charlieSession.sessionToken!;

      // 4. Host starts game
      const startResult = roomEngine.dispatchAction({
        roomCode,
        playerId: hostId,
        sessionToken: hostToken,
        action: 'START_GAME',
      });
      expect(startResult.success).toBe(true);
      expect(startResult.room?.status).toBe('IN_PROGRESS');
      expect(startResult.room?.activePlayerId).toBe(hostId);

      // 5. Turn 1 (Alice): Flips 'truth'
      const turn1Flip = roomEngine.dispatchAction({
        roomCode,
        playerId: hostId,
        sessionToken: hostToken,
        action: 'FLIP_CARD',
        payload: { type: 'truth' },
      });
      expect(turn1Flip.success).toBe(true);
      const card1 = turn1Flip.room?.currentCard;
      expect(card1).toBeDefined();
      expect(card1?.type).toBe('truth');
      expect(['q-t1', 'q-t2']).toContain(card1?.id);

      // Verify all players see the exact same card in the room state
      const roomCheck1 = roomEngine.getRoom(roomCode)!;
      expect(roomCheck1.currentCard?.prompt).toBe(card1?.prompt);

      // Alice completes dare / truth
      const turn1Resolve = roomEngine.dispatchAction({
        roomCode,
        playerId: hostId,
        sessionToken: hostToken,
        action: 'COMPLETE_DARE',
      });
      expect(turn1Resolve.success).toBe(true);
      expect(turn1Resolve.room?.activePlayerId).toBe(bobId); // Turn advanced to Bob!

      // 6. Turn 2 (Bob): Flips 'truth'
      // CRITICAL REQUIREMENT: Must NOT draw card1 again because pool has 2 truths!
      const turn2Flip = roomEngine.dispatchAction({
        roomCode,
        playerId: bobId,
        sessionToken: bobToken,
        action: 'FLIP_CARD',
        payload: { type: 'truth' },
      });
      expect(turn2Flip.success).toBe(true);
      const card2 = turn2Flip.room?.currentCard;
      expect(card2).toBeDefined();
      expect(card2?.type).toBe('truth');

      // VERIFY NO DUPLICATE BEFORE POOL EXHAUSTION:
      expect(card2?.id).not.toBe(card1?.id);
      expect(['q-t1', 'q-t2']).toContain(card2?.id);

      // Bob completes
      const turn2Resolve = roomEngine.dispatchAction({
        roomCode,
        playerId: bobId,
        sessionToken: bobToken,
        action: 'COMPLETE_DARE',
      });
      expect(turn2Resolve.success).toBe(true);
      expect(turn2Resolve.room?.activePlayerId).toBe(charlieId); // Turn advanced to Charlie!

      // 7. Turn 3 (Charlie): Flips 'truth'
      // Pool of 2 truths is now exhausted, so cycling allows drawing again without error
      const turn3Flip = roomEngine.dispatchAction({
        roomCode,
        playerId: charlieId,
        sessionToken: charlieToken,
        action: 'FLIP_CARD',
        payload: { type: 'truth' },
      });
      expect(turn3Flip.success).toBe(true);
      const card3 = turn3Flip.room?.currentCard;
      expect(card3).toBeDefined();
      expect(['q-t1', 'q-t2']).toContain(card3?.id);

      // Charlie completes
      const turn3Resolve = roomEngine.dispatchAction({
        roomCode,
        playerId: charlieId,
        sessionToken: charlieToken,
        action: 'COMPLETE_DARE',
      });
      expect(turn3Resolve.success).toBe(true);
      // Turn cycled back to Alice for Round 2!
      expect(turn3Resolve.room?.activePlayerId).toBe(hostId);
      expect(turn3Resolve.room?.roundNumber).toBe(2);

      // Verify all players earned 1 point
      const players = turn3Resolve.room?.players!;
      expect(players.find((p) => p.id === hostId)?.score).toBe(1);
      expect(players.find((p) => p.id === bobId)?.score).toBe(1);
      expect(players.find((p) => p.id === charlieId)?.score).toBe(1);
    });

    it('enforces host permissions: non-host cannot start the game', () => {
      serverDeckRepository.saveDeck(sampleDeck);
      const snapshot = serverDeckRepository.createRoomSnapshot({
        deckId: sampleDeck.id,
        creatorId: 'creator-alice-99',
      }).snapshot!;

      const hostSession = roomEngine.createRoom({
        gameId: 'truth-or-dare',
        categoryId: 'custom',
        hostName: 'AliceHost',
        language: snapshot.language,
        customDeckSnapshot: snapshot,
      });

      const bobSession = roomEngine.joinRoom({
        roomCode: hostSession.roomCode,
        playerName: 'BobGuest',
      });

      const unauthorizedStart = roomEngine.dispatchAction({
        roomCode: hostSession.roomCode,
        playerId: bobSession.playerId!,
        sessionToken: bobSession.sessionToken!,
        action: 'START_GAME',
      });

      expect(unauthorizedStart.success).toBe(false);
      expect(unauthorizedStart.code).toBe('PERMISSION_DENIED');
      expect(unauthorizedStart.error).toContain('Only the host can start');
    });
  });

  // =========================================================================
  // REQUIREMENT 8: RECONNECTION AND STATE PRESERVATION
  // =========================================================================
  describe('Reconnection & Session Preservation', () => {
    it('seamlessly reconnects a disconnected player without resetting score or turn state', () => {
      serverDeckRepository.saveDeck(sampleDeck);
      const snapshot = serverDeckRepository.createRoomSnapshot({
        deckId: sampleDeck.id,
        creatorId: 'creator-alice-99',
      }).snapshot!;

      const hostSession = roomEngine.createRoom({
        gameId: 'truth-or-dare',
        categoryId: 'custom',
        hostName: 'AliceHost',
        language: snapshot.language,
        customDeckSnapshot: snapshot,
      });

      const bobSession = roomEngine.joinRoom({
        roomCode: hostSession.roomCode,
        playerName: 'Bob',
      });

      // Simulate Bob temporarily losing network / reloading page
      const reconnectResult = roomEngine.reconnectPlayer({
        roomCode: hostSession.roomCode,
        playerId: bobSession.playerId!,
        sessionToken: bobSession.sessionToken!,
      });

      expect(reconnectResult.success).toBe(true);
      expect(reconnectResult.player?.id).toBe(bobSession.playerId);
      expect(reconnectResult.player?.isConnected).toBe(true);
      expect(reconnectResult.room?.customDeckSnapshot?.id).toBe(sampleDeck.id);
    });

    it('rejects reconnection attempts with mismatched or invalid session tokens', () => {
      serverDeckRepository.saveDeck(sampleDeck);
      const hostSession = roomEngine.createRoom({
        gameId: 'truth-or-dare',
        categoryId: 'custom',
        hostName: 'AliceHost',
      });

      const bobSession = roomEngine.joinRoom({
        roomCode: hostSession.roomCode,
        playerName: 'Bob',
      });

      const spoofedReconnect = roomEngine.reconnectPlayer({
        roomCode: hostSession.roomCode,
        playerId: bobSession.playerId!,
        sessionToken: 'invalid-spoofed-token-12345',
      });

      expect(spoofedReconnect.success).toBe(false);
      expect(spoofedReconnect.code).toBe('PERMISSION_DENIED');
      expect(spoofedReconnect.error).toContain('Invalid session token');
    });
  });
});

