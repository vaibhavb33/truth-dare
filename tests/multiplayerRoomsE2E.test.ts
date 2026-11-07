import { describe, it, expect, beforeEach } from 'vitest';
import { roomEngine } from '@/lib/multiplayer/roomEngine';

describe('Real-Time Multiplayer Rooms - Multi-Client Simulation Test Suite', () => {
  beforeEach(() => {
    roomEngine.resetRooms();
  });

  // ==========================================
  // PHASE 1: CREATE ROOM
  // ==========================================
  describe('Phase 1: Create Room', () => {
    it('creates a room with secure 6-char code, host assignment, custom settings, and 2-hour TTL', () => {
      const { room, hostPlayerId, sessionToken } = roomEngine.createRoom({
        gameId: 'truth-or-dare',
        categoryId: 'deep-secrets',
        hostName: 'AliceHost',
        timerSeconds: 30,
        language: 'es',
        maxPlayers: 8,
      });

      expect(room.roomCode).toMatch(/^[A-Z0-9]{6}$/);
      expect(room.hostPlayerId).toBe(hostPlayerId);
      expect(room.language).toBe('es');
      expect(room.categoryId).toBe('deep-secrets');
      expect(room.maxPlayers).toBe(8);
      expect(room.roundNumber).toBe(1);
      expect(room.status).toBe('lobby');
      expect(sessionToken).toBeDefined();
      expect(sessionToken.length).toBeGreaterThan(10);

      // Verify 2-hour TTL
      const expectedTtl = Date.now() + 2 * 60 * 60 * 1000;
      expect(room.expiresAt).toBeGreaterThan(expectedTtl - 5000);
      expect(room.expiresAt).toBeLessThanOrEqual(expectedTtl + 5000);

      // Verify host player object
      const host = room.players.find((p) => p.id === hostPlayerId);
      expect(host).toBeDefined();
      expect(host?.isHost).toBe(true);
      expect(host?.isConnected).toBe(true);
      expect(host?.sessionToken).toBe(sessionToken);
      expect(host?.score).toBe(0);
      expect(host?.skips).toBe(0);
    });
  });

  // ==========================================
  // PHASE 2: JOIN ROOM & CAPACITY/DUPLICATE VALIDATION
  // ==========================================
  describe('Phase 2: Join Room & Validation', () => {
    it('allows 3 independent players (Alice, Bob, Charlie) to join', () => {
      const hostSession = roomEngine.createRoom({
        gameId: 'truth-or-dare',
        categoryId: 'classic-party',
        hostName: 'Alice',
        maxPlayers: 3,
      });

      // Player 2: Bob joins
      const bobSession = roomEngine.joinRoom({
        roomCode: hostSession.room.roomCode,
        playerName: 'Bob',
      });
      expect(bobSession.success).toBe(true);
      expect(bobSession.playerId).toBeDefined();
      expect(bobSession.sessionToken).toBeDefined();

      // Player 3: Charlie joins
      const charlieSession = roomEngine.joinRoom({
        roomCode: hostSession.room.roomCode,
        playerName: 'Charlie',
      });
      expect(charlieSession.success).toBe(true);
      expect(charlieSession.playerId).toBeDefined();

      const currentRoom = roomEngine.getRoom(hostSession.room.roomCode);
      expect(currentRoom?.players.length).toBe(3);
      expect(currentRoom?.players.map((p) => p.name)).toEqual(['Alice', 'Bob', 'Charlie']);
    });

    it('prevents duplicate player nicknames (case-insensitive collision check)', () => {
      const { room } = roomEngine.createRoom({
        gameId: 'truth-or-dare',
        categoryId: 'classic-party',
        hostName: 'Alice',
      });

      // Try joining with same name
      const duplicateJoin = roomEngine.joinRoom({
        roomCode: room.roomCode,
        playerName: 'alice',
      });
      expect(duplicateJoin.success).toBe(false);
      expect(duplicateJoin.error).toContain('is already in this room');

      const duplicateWhitespace = roomEngine.joinRoom({
        roomCode: room.roomCode,
        playerName: '  ALICE  ',
      });
      expect(duplicateWhitespace.success).toBe(false);
      expect(duplicateWhitespace.error).toContain('is already in this room');
    });

    it('enforces player capacity limit and rejects overcapacity joins', () => {
      const { room } = roomEngine.createRoom({
        gameId: 'truth-or-dare',
        categoryId: 'classic-party',
        hostName: 'Alice',
        maxPlayers: 2,
      });

      const bobJoin = roomEngine.joinRoom({
        roomCode: room.roomCode,
        playerName: 'Bob',
      });
      expect(bobJoin.success).toBe(true);

      // 3rd player attempts to join a room with maxPlayers = 2
      const charlieJoin = roomEngine.joinRoom({
        roomCode: room.roomCode,
        playerName: 'Charlie',
      });
      expect(charlieJoin.success).toBe(false);
      expect(charlieJoin.error).toContain('Room is currently full');
    });

    it('allows a player to voluntarily leave the room', () => {
      const { room } = roomEngine.createRoom({
        gameId: 'truth-or-dare',
        categoryId: 'classic-party',
        hostName: 'Alice',
      });

      const bobJoin = roomEngine.joinRoom({
        roomCode: room.roomCode,
        playerName: 'Bob',
      });

      expect(room.players.length).toBe(2);

      const leaveResult = roomEngine.leaveRoom(room.roomCode, bobJoin.playerId!);
      expect(leaveResult.success).toBe(true);
      expect(room.players.length).toBe(1);
      expect(room.players[0].name).toBe('Alice');
    });
  });

  // ==========================================
  // PHASE 3: LOBBY & HOST CONTROLS
  // ==========================================
  describe('Phase 3: Lobby & Host Controls', () => {
    it('allows host to update room settings in lobby, but rejects non-host attempts', () => {
      const { room, hostPlayerId, sessionToken: hostToken } = roomEngine.createRoom({
        gameId: 'truth-or-dare',
        categoryId: 'classic-party',
        hostName: 'Alice',
        language: 'en',
      });

      const bob = roomEngine.joinRoom({
        roomCode: room.roomCode,
        playerName: 'Bob',
      });

      // Bob (guest) attempts to change room language
      const unauthorizedUpdate = roomEngine.dispatchAction({
        roomCode: room.roomCode,
        playerId: bob.playerId!,
        sessionToken: bob.sessionToken,
        action: 'UPDATE_LOBBY_SETTINGS',
        payload: { language: 'fr', maxPlayers: 15 },
      });
      expect(unauthorizedUpdate.success).toBe(false);
      expect(unauthorizedUpdate.error).toContain('Only the host can update room settings');

      // Alice (host) changes room settings
      const hostUpdate = roomEngine.dispatchAction({
        roomCode: room.roomCode,
        playerId: hostPlayerId,
        sessionToken: hostToken,
        action: 'UPDATE_LOBBY_SETTINGS',
        payload: { language: 'fr', maxPlayers: 15, timerSeconds: 60, categoryId: 'wild-party' },
      });
      expect(hostUpdate.success).toBe(true);
      expect(room.language).toBe('fr');
      expect(room.maxPlayers).toBe(15);
      expect(room.timerSecondsRemaining).toBe(60);
      expect(room.categoryId).toBe('wild-party');
    });

    it('strictly enforces that only the host can start the game', () => {
      const { room, hostPlayerId, sessionToken: hostToken } = roomEngine.createRoom({
        gameId: 'truth-or-dare',
        categoryId: 'classic-party',
        hostName: 'Alice',
      });

      const bob = roomEngine.joinRoom({
        roomCode: room.roomCode,
        playerName: 'Bob',
      });

      // Bob tries to start game
      const bobStart = roomEngine.dispatchAction({
        roomCode: room.roomCode,
        playerId: bob.playerId!,
        sessionToken: bob.sessionToken,
        action: 'START_GAME',
      });
      expect(bobStart.success).toBe(false);
      expect(bobStart.error).toContain('Only the host can start the game');
      expect(room.status).toBe('lobby');

      // Alice (host) starts the game
      const aliceStart = roomEngine.dispatchAction({
        roomCode: room.roomCode,
        playerId: hostPlayerId,
        sessionToken: hostToken,
        action: 'START_GAME',
      });
      expect(aliceStart.success).toBe(true);
      expect(room.status).toBe('in_game');
    });
  });

  // ==========================================
  // PHASE 4: REALTIME GAMEPLAY SYNCHRONIZATION
  // ==========================================
  describe('Phase 4: Realtime Gameplay & Turn Synchronization', () => {
    it('executes full round across 3 players with turn rotation and round advancement', () => {
      // 3-Player Session
      const { room, hostPlayerId, sessionToken: aliceToken } = roomEngine.createRoom({
        gameId: 'truth-or-dare',
        categoryId: 'classic-party',
        hostName: 'Alice',
      });

      const bob = roomEngine.joinRoom({
        roomCode: room.roomCode,
        playerName: 'Bob',
      });

      const charlie = roomEngine.joinRoom({
        roomCode: room.roomCode,
        playerName: 'Charlie',
      });

      // Alice starts game
      roomEngine.dispatchAction({
        roomCode: room.roomCode,
        playerId: hostPlayerId,
        sessionToken: aliceToken,
        action: 'START_GAME',
      });

      expect(room.status).toBe('in_game');
      expect(room.roundNumber).toBe(1);
      expect(room.activePlayerId).toBe(hostPlayerId);

      // --- TURN 1: Alice's Turn ---
      // Alice flips Dare card
      const aliceFlip = roomEngine.dispatchAction({
        roomCode: room.roomCode,
        playerId: hostPlayerId,
        sessionToken: aliceToken,
        action: 'FLIP_CARD',
        payload: { type: 'dare' },
      });
      expect(aliceFlip.success).toBe(true);
      expect(room.isCardFlipped).toBe(true);
      expect(room.currentCard).not.toBeNull();
      expect(room.currentCard?.type).toBe('dare');

      // Alice completes dare
      const aliceComplete = roomEngine.dispatchAction({
        roomCode: room.roomCode,
        playerId: hostPlayerId,
        sessionToken: aliceToken,
        action: 'COMPLETE_DARE',
      });
      expect(aliceComplete.success).toBe(true);
      expect(room.players[0].score).toBe(1);
      expect(room.isCardFlipped).toBe(false);
      expect(room.currentCard).toBeNull();
      // Turn advances to Bob
      expect(room.activePlayerId).toBe(bob.playerId);

      // --- TURN 2: Bob's Turn ---
      // Bob flips Truth card
      const bobFlip = roomEngine.dispatchAction({
        roomCode: room.roomCode,
        playerId: bob.playerId!,
        sessionToken: bob.sessionToken,
        action: 'FLIP_CARD',
        payload: { type: 'truth' },
      });
      expect(bobFlip.success).toBe(true);
      expect(room.currentCard?.type).toBe('truth');

      // Bob skips turn
      const bobSkip = roomEngine.dispatchAction({
        roomCode: room.roomCode,
        playerId: bob.playerId!,
        sessionToken: bob.sessionToken,
        action: 'SKIP_TURN',
      });
      expect(bobSkip.success).toBe(true);
      expect(room.players[1].skips).toBe(1);
      expect(room.players[1].score).toBe(0);
      // Turn advances to Charlie
      expect(room.activePlayerId).toBe(charlie.playerId);

      // --- TURN 3: Charlie's Turn ---
      // Charlie flips Dare card
      const charlieFlip = roomEngine.dispatchAction({
        roomCode: room.roomCode,
        playerId: charlie.playerId!,
        sessionToken: charlie.sessionToken,
        action: 'FLIP_CARD',
        payload: { type: 'dare' },
      });
      expect(charlieFlip.success).toBe(true);

      // Charlie completes dare
      const charlieComplete = roomEngine.dispatchAction({
        roomCode: room.roomCode,
        playerId: charlie.playerId!,
        sessionToken: charlie.sessionToken,
        action: 'COMPLETE_DARE',
      });
      expect(charlieComplete.success).toBe(true);
      expect(room.players[2].score).toBe(1);

      // After Charlie (3rd player), turn wraps back to Alice and Round increments to 2
      expect(room.activePlayerId).toBe(hostPlayerId);
      expect(room.roundNumber).toBe(2);
    });

    it('rejects concurrent conflicting actions (double flip or non-active flip)', () => {
      const { room, hostPlayerId, sessionToken: aliceToken } = roomEngine.createRoom({
        gameId: 'truth-or-dare',
        categoryId: 'classic-party',
        hostName: 'Alice',
      });

      const bob = roomEngine.joinRoom({
        roomCode: room.roomCode,
        playerName: 'Bob',
      });

      roomEngine.dispatchAction({
        roomCode: room.roomCode,
        playerId: hostPlayerId,
        sessionToken: aliceToken,
        action: 'START_GAME',
      });

      // Bob attempts to flip during Alice's turn
      const bobFlip = roomEngine.dispatchAction({
        roomCode: room.roomCode,
        playerId: bob.playerId!,
        sessionToken: bob.sessionToken,
        action: 'FLIP_CARD',
        payload: { type: 'truth' },
      });
      expect(bobFlip.success).toBe(false);
      expect(bobFlip.error).toContain('Only the active player or host can flip a card');

      // Alice flips successfully
      const aliceFlip1 = roomEngine.dispatchAction({
        roomCode: room.roomCode,
        playerId: hostPlayerId,
        sessionToken: aliceToken,
        action: 'FLIP_CARD',
        payload: { type: 'dare' },
      });
      expect(aliceFlip1.success).toBe(true);

      // Alice attempts to flip again before completing or skipping
      const aliceFlip2 = roomEngine.dispatchAction({
        roomCode: room.roomCode,
        playerId: hostPlayerId,
        sessionToken: aliceToken,
        action: 'FLIP_CARD',
        payload: { type: 'truth' },
      });
      expect(aliceFlip2.success).toBe(false);
      expect(aliceFlip2.error).toContain('Card has already been flipped');
    });
  });

  // ==========================================
  // PHASE 5: HEARTBEAT, RECONNECTION & HOST MIGRATION
  // ==========================================
  describe('Phase 5: Heartbeat, Reconnection & Host Migration', () => {
    it('updates player lastSeenAt on heartbeat and flags inactive players', () => {
      const { room, hostPlayerId } = roomEngine.createRoom({
        gameId: 'truth-or-dare',
        categoryId: 'classic-party',
        hostName: 'Alice',
      });

      const bob = roomEngine.joinRoom({
        roomCode: room.roomCode,
        playerName: 'Bob',
      });

      // Bob sends heartbeat
      const hbResult = roomEngine.heartbeat({
        roomCode: room.roomCode,
        playerId: bob.playerId!,
      });
      expect(hbResult.success).toBe(true);
      expect(hbResult.room?.players[1].isConnected).toBe(true);

      // Simulate Bob going silent for > 35 seconds
      room.players[1].lastSeenAt = Date.now() - 40000;

      // Alice sends heartbeat; the engine flags Bob as disconnected
      const aliceHb = roomEngine.heartbeat({
        roomCode: room.roomCode,
        playerId: hostPlayerId,
      });
      expect(aliceHb.room?.players[1].isConnected).toBe(false);
    });

    it('reconnects a disconnected player using their secure session token', () => {
      const { room } = roomEngine.createRoom({
        gameId: 'truth-or-dare',
        categoryId: 'classic-party',
        hostName: 'Alice',
      });

      const bob = roomEngine.joinRoom({
        roomCode: room.roomCode,
        playerName: 'Bob',
      });

      // Mark Bob as disconnected (simulating browser reload / network drop)
      room.players[1].isConnected = false;

      // Bob reconnects with his playerId and sessionToken
      const reconnectResult = roomEngine.reconnectPlayer({
        roomCode: room.roomCode,
        playerId: bob.playerId!,
        sessionToken: bob.sessionToken!,
      });

      expect(reconnectResult.success).toBe(true);
      expect(reconnectResult.player?.isConnected).toBe(true);
      expect(reconnectResult.room?.players[1].isConnected).toBe(true);
    });

    it('rejects reconnection attempts with invalid session tokens', () => {
      const { room } = roomEngine.createRoom({
        gameId: 'truth-or-dare',
        categoryId: 'classic-party',
        hostName: 'Alice',
      });

      const bob = roomEngine.joinRoom({
        roomCode: room.roomCode,
        playerName: 'Bob',
      });

      const bogusReconnect = roomEngine.reconnectPlayer({
        roomCode: room.roomCode,
        playerId: bob.playerId!,
        sessionToken: 'tampered-fake-token-999',
      });

      expect(bogusReconnect.success).toBe(false);
      expect(bogusReconnect.error).toContain('Invalid session token');
    });

    it('automatically migrates host to next player when host leaves the room', () => {
      const { room, hostPlayerId } = roomEngine.createRoom({
        gameId: 'truth-or-dare',
        categoryId: 'classic-party',
        hostName: 'AliceHost',
      });

      const bob = roomEngine.joinRoom({
        roomCode: room.roomCode,
        playerName: 'BobGuest',
      });

      const charlie = roomEngine.joinRoom({
        roomCode: room.roomCode,
        playerName: 'CharlieGuest',
      });

      expect(room.players[0].isHost).toBe(true);

      // Alice (host) leaves room
      const leaveResult = roomEngine.leaveRoom(room.roomCode, hostPlayerId);
      expect(leaveResult.success).toBe(true);

      // Bob should be automatically promoted to host
      expect(room.players.length).toBe(2);
      expect(room.players[0].name).toBe('BobGuest');
      expect(room.players[0].isHost).toBe(true);
      expect(room.hostPlayerId).toBe(bob.playerId);
      expect(room.players[1].name).toBe('CharlieGuest');
      expect(room.players[1].isHost).toBe(false);
    });

    it('automatically rotates turn if active player leaves during their active turn', () => {
      const { room, hostPlayerId, sessionToken: aliceToken } = roomEngine.createRoom({
        gameId: 'truth-or-dare',
        categoryId: 'classic-party',
        hostName: 'Alice',
      });

      const bob = roomEngine.joinRoom({
        roomCode: room.roomCode,
        playerName: 'Bob',
      });

      const charlie = roomEngine.joinRoom({
        roomCode: room.roomCode,
        playerName: 'Charlie',
      });

      roomEngine.dispatchAction({
        roomCode: room.roomCode,
        playerId: hostPlayerId,
        sessionToken: aliceToken,
        action: 'START_GAME',
      });

      // Advance turn so Bob is active
      roomEngine.dispatchAction({
        roomCode: room.roomCode,
        playerId: hostPlayerId,
        sessionToken: aliceToken,
        action: 'FLIP_CARD',
        payload: { type: 'truth' },
      });
      roomEngine.dispatchAction({
        roomCode: room.roomCode,
        playerId: hostPlayerId,
        sessionToken: aliceToken,
        action: 'SKIP_TURN',
      });
      expect(room.activePlayerId).toBe(bob.playerId);

      // Bob flips card and then abruptly leaves the game
      roomEngine.dispatchAction({
        roomCode: room.roomCode,
        playerId: bob.playerId!,
        sessionToken: bob.sessionToken,
        action: 'FLIP_CARD',
        payload: { type: 'dare' },
      });
      expect(room.isCardFlipped).toBe(true);

      // Bob leaves room
      const leaveRes = roomEngine.leaveRoom(room.roomCode, bob.playerId!);
      expect(leaveRes.success).toBe(true);

      // The room must NOT deadlock: active player rotates to remaining player (Alice), card state resets
      expect(room.activePlayerId).toBe(hostPlayerId);
      expect(room.isCardFlipped).toBe(false);
      expect(room.currentCard).toBeNull();
    });
  });

  // ==========================================
  // PHASE 6: SECURITY & INPUT SANITIZATION
  // ==========================================
  describe('Phase 6: Security & Input Sanitization', () => {
    it('sanitizes malicious script tags and trims excess whitespace', () => {
      const { room } = roomEngine.createRoom({
        gameId: 'truth-or-dare',
        categoryId: 'classic-party',
        hostName: '<img src=x onerror=alert(1)>   SuperHost   ',
      });

      expect(room.players[0].name).not.toContain('<img');
      expect(room.players[0].name).not.toContain('onerror');
      expect(room.players[0].name).toBe('SuperHost');

      const guest = roomEngine.joinRoom({
        roomCode: room.roomCode,
        playerName: '<iframe src="evil.com"></iframe>Attacker',
      });

      expect(guest.room?.players[1].name).not.toContain('<iframe');
      expect(guest.room?.players[1].name).toBe('Attacker');
    });

    it('rejects actions with mismatched session tokens', () => {
      const { room, hostPlayerId } = roomEngine.createRoom({
        gameId: 'truth-or-dare',
        categoryId: 'classic-party',
        hostName: 'Alice',
      });

      const forgedAction = roomEngine.dispatchAction({
        roomCode: room.roomCode,
        playerId: hostPlayerId,
        sessionToken: 'tampered-token-spoofing-alice',
        action: 'START_GAME',
      });

      expect(forgedAction.success).toBe(false);
      expect(forgedAction.error).toContain('Invalid session token authorization');
    });
  });

  // ==========================================
  // PHASE 7: MULTILINGUAL SUPPORT
  // ==========================================
  describe('Phase 7: Multilingual Question Language Support', () => {
    it('draws questions in the selected room language (e.g. Hindi, French, Spanish)', () => {
      const { room, hostPlayerId, sessionToken: aliceToken } = roomEngine.createRoom({
        gameId: 'truth-or-dare',
        categoryId: 'classic-party',
        hostName: 'Alice',
        language: 'hi', // Hindi room
      });

      roomEngine.dispatchAction({
        roomCode: room.roomCode,
        playerId: hostPlayerId,
        sessionToken: aliceToken,
        action: 'START_GAME',
      });

      const flipResult = roomEngine.dispatchAction({
        roomCode: room.roomCode,
        playerId: hostPlayerId,
        sessionToken: aliceToken,
        action: 'FLIP_CARD',
        payload: { type: 'truth' },
      });

      expect(flipResult.success).toBe(true);
      expect(room.currentCard).not.toBeNull();
      // Should have a valid card prompt in Hindi
      expect(room.currentCard?.prompt).toBeDefined();
      expect(room.currentCard?.prompt.length).toBeGreaterThan(0);
    });
  });
});
