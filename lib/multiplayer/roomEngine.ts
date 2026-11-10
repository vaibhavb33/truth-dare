/**
 * Asteria Production Multiplayer Room Engine
 * Server-authoritative state transitions, real-time lobby, synchronized turns,
 * concurrency locks, duplicate prevention, host migration, and session restoration.
 */

import {
  MultiplayerRoom,
  Player,
  GameType,
  CategoryId,
  QuestionType,
  SupportedLanguageCode,
  Question,
  RoomLifecycleStatus,
  RoomErrorCode,
} from '@/types';
import { generateRoomCode } from '@/lib/utils';
import { questionEngine } from '@/lib/questions/engine';

function sanitizeName(rawName: string): string {
  return rawName
    .replace(/<[^>]*>?/gm, '')
    .trim()
    .substring(0, 25);
}

function generateSessionToken(): string {
  return 'tok-' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
}

function generateCanonicalRoomId(): string {
  return 'rm-' + Math.random().toString(36).substring(2, 10) + '-' + Date.now().toString(36);
}

export interface RoomEvent {
  roomCode: string;
  type: string;
  payload: unknown;
  timestamp: number;
}

export class RoomEngine {
  private roomsByCode: Map<string, MultiplayerRoom> = new Map();
  private roomsById: Map<string, MultiplayerRoom> = new Map();
  private idempotencyCache: Map<string, { room: MultiplayerRoom; hostPlayerId: string; sessionToken: string; timestamp: number }> = new Map();
  private eventListeners: Map<string, Set<(event: RoomEvent) => void>> = new Map();
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor() {
    // Periodic garbage collection for expired rooms every 5 minutes
    if (typeof setInterval !== 'undefined') {
      this.cleanupTimer = setInterval(() => this.pruneExpiredRooms(), 5 * 60 * 1000);
      if (this.cleanupTimer.unref) {
        this.cleanupTimer.unref();
      }
    }
  }

  /**
   * Helper to verify if room timestamp has expired
   */
  public isExpired(room: MultiplayerRoom): boolean {
    if (!room) return true;
    if (room.status === 'EXPIRED') return true;
    const now = Date.now();
    let expireMs = room.expiresAt;
    if (typeof expireMs === 'number' && expireMs < 10000000000) {
      expireMs = expireMs * 1000;
    }
    return now > expireMs;
  }

  /**
   * Create a new multiplayer room with host assignment and secure session token
   * Lifecycle State: Transitions from CREATING directly into WAITING
   */
  public createRoom(params: {
    gameId: GameType;
    categoryId: CategoryId;
    hostName: string;
    timerSeconds?: 0 | 15 | 30 | 60;
    language?: SupportedLanguageCode;
    maxPlayers?: number;
    customDeckSnapshot?: MultiplayerRoom['customDeckSnapshot'];
    clientRequestId?: string;
  }): { room: MultiplayerRoom; hostPlayerId: string; sessionToken: string; roomId: string; roomCode: string } {
    // Idempotency check: prevent duplicate room creation on fast double-clicks or retries
    if (params.clientRequestId) {
      const cached = this.idempotencyCache.get(params.clientRequestId);
      if (cached && Date.now() - cached.timestamp < 15000) {
        return {
          room: cached.room,
          hostPlayerId: cached.hostPlayerId,
          sessionToken: cached.sessionToken,
          roomId: cached.room.id,
          roomCode: cached.room.roomCode,
        };
      }
    }

    // Generate unique 6-character room code without collision
    let roomCode = generateRoomCode();
    let attempts = 0;
    while (this.roomsByCode.has(roomCode) && attempts < 10) {
      roomCode = generateRoomCode();
      attempts++;
    }

    const roomId = generateCanonicalRoomId();
    const hostPlayerId = 'p-' + Math.random().toString(36).substring(2, 9);
    const sessionToken = generateSessionToken();
    const cleanHostName = sanitizeName(params.hostName) || 'Host';
    const maxPlayers = Math.max(2, Math.min(20, params.maxPlayers ?? 20));
    const language = params.customDeckSnapshot?.language || params.language || 'en';
    const customDeckSnapshot = params.customDeckSnapshot
      ? {
          id: params.customDeckSnapshot.id,
          deckId: params.customDeckSnapshot.deckId || params.customDeckSnapshot.id,
          roomId,
          version: params.customDeckSnapshot.version || 1,
          name: params.customDeckSnapshot.name,
          language: params.customDeckSnapshot.language,
          questions: params.customDeckSnapshot.questions.map((q) => ({ ...q })),
          truthQuestions: (params.customDeckSnapshot.truthQuestions || params.customDeckSnapshot.questions.filter((q) => q.type === 'truth')).map((q) => ({ ...q })),
          dareQuestions: (params.customDeckSnapshot.dareQuestions || params.customDeckSnapshot.questions.filter((q) => q.type === 'dare')).map((q) => ({ ...q })),
          snapshotCreatedAt: params.customDeckSnapshot.snapshotCreatedAt || Date.now(),
        }
      : null;

    const nowUtc = Date.now();
    const ttlMs = 2 * 60 * 60 * 1000; // 2-hour TTL

    const hostPlayer: Player = {
      id: hostPlayerId,
      name: cleanHostName,
      score: 0,
      skips: 0,
      isHost: true,
      isConnected: true,
      lastSeenAt: nowUtc,
      sessionToken,
      avatarColor: '#8B5CF6',
    };

    const room: MultiplayerRoom = {
      id: roomId,
      roomCode,
      gameId: params.gameId,
      categoryId: params.categoryId,
      hostPlayerId,
      status: 'WAITING', // Canonical lifecycle: newly created room enters WAITING
      players: [hostPlayer],
      playerCount: 1,
      activePlayerId: hostPlayerId,
      currentCard: null,
      isCardFlipped: false,
      timerSecondsRemaining: params.timerSeconds ?? 30,
      isTimerRunning: false,
      roundNumber: 1,
      maxPlayers,
      votes: {},
      recentEmojis: [],
      language,
      customDeckSnapshot,
      questionHistory: [],
      createdAt: nowUtc,
      updatedAt: nowUtc,
      expiresAt: nowUtc + ttlMs,
      createdAtIso: new Date(nowUtc).toISOString(),
      expiresAtIso: new Date(nowUtc + ttlMs).toISOString(),
    };

    this.roomsByCode.set(roomCode, room);
    this.roomsById.set(roomId, room);

    if (params.clientRequestId) {
      this.idempotencyCache.set(params.clientRequestId, {
        room,
        hostPlayerId,
        sessionToken,
        timestamp: Date.now(),
      });
    }

    this.emitEvent(roomCode, 'ROOM_CREATED', { roomId, roomCode, hostPlayerId });
    return { room, hostPlayerId, sessionToken, roomId, roomCode };
  }

  /**
   * Join an existing room with duplicate nickname protection and capacity checks
   */
  public joinRoom(params: {
    roomCode: string;
    playerName: string;
    playerId?: string;
    sessionToken?: string;
  }): {
    success: boolean;
    room?: MultiplayerRoom;
    playerId?: string;
    sessionToken?: string;
    code?: RoomErrorCode;
    error?: string;
  } {
    const raw = (params.roomCode || '').trim();
    if (!raw) {
      return {
        success: false,
        code: 'INVALID_ROOM_CODE',
        error: 'Room code is required.',
      };
    }

    const upper = raw.toUpperCase();
    if (!/^[A-Z0-9]{4,10}$/.test(upper) && !raw.startsWith('rm-')) {
      return {
        success: false,
        code: 'INVALID_ROOM_CODE',
        error: 'Invalid room code format. Room code must be 6 alphanumeric characters.',
      };
    }

    const roomLookup = this.getRoomWithStatus(raw);
    if (!roomLookup.room) {
      return {
        success: false,
        code: roomLookup.code || 'ROOM_NOT_FOUND',
        error: roomLookup.error || 'Room not found. Please verify the 6-character room code.',
      };
    }

    const room = roomLookup.room;

    // Check lifecycle status
    if (room.status === 'EXPIRED' || this.isExpired(room)) {
      room.status = 'EXPIRED';
      return { success: false, code: 'ROOM_EXPIRED', error: 'This party room has expired.' };
    }

    if (room.status === 'CANCELLED' || room.status === 'COMPLETED' || room.status === 'finished') {
      return { success: false, code: 'ROOM_CLOSED', error: 'This party room is closed.' };
    }

    const cleanPlayerName = sanitizeName(params.playerName) || `Player ${room.players.length + 1}`;

    // 1. Reconnection Check: Does this player match an existing ID and token?
    if (params.playerId && params.sessionToken) {
      const existingPlayer = room.players.find((p) => p.id === params.playerId);
      if (existingPlayer && existingPlayer.sessionToken === params.sessionToken) {
        existingPlayer.isConnected = true;
        existingPlayer.lastSeenAt = Date.now();
        room.updatedAt = Date.now();
        this.emitEvent(room.roomCode, 'PLAYER_RECONNECTED', { player: existingPlayer });
        return {
          success: true,
          room,
          playerId: existingPlayer.id,
          sessionToken: existingPlayer.sessionToken,
        };
      }
    }

    // 2. Prevent Duplicate Player Names in the same room
    const nameCollision = room.players.find(
      (p) => p.name.trim().toLowerCase() === cleanPlayerName.trim().toLowerCase()
    );
    if (nameCollision) {
      // If the duplicate player is disconnected and matching reconnect credentials are provided, reconnect them
      if (!nameCollision.isConnected && params.sessionToken === nameCollision.sessionToken) {
        nameCollision.isConnected = true;
        nameCollision.lastSeenAt = Date.now();
        room.updatedAt = Date.now();
        this.emitEvent(room.roomCode, 'PLAYER_RECONNECTED', { player: nameCollision });
        return {
          success: true,
          room,
          playerId: nameCollision.id,
          sessionToken: nameCollision.sessionToken,
        };
      }
      return {
        success: false,
        code: 'PERMISSION_DENIED',
        error: `A player named "${cleanPlayerName}" is already in this room. Please choose another nickname.`,
      };
    }

    // 3. Prevent Joining Full Rooms
    if (room.players.length >= room.maxPlayers) {
      return {
        success: false,
        code: 'ROOM_FULL',
        error: `Room is currently full (maximum ${room.maxPlayers} players).`,
      };
    }

    const newPlayerId = 'p-' + Math.random().toString(36).substring(2, 9);
    const newSessionToken = generateSessionToken();
    const colors = ['#06B6D4', '#FF5C77', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#3B82F6', '#14B8A6'];
    const assignedColor = colors[room.players.length % colors.length];

    const newPlayer: Player = {
      id: newPlayerId,
      name: cleanPlayerName,
      score: 0,
      skips: 0,
      isHost: false,
      isConnected: true,
      lastSeenAt: Date.now(),
      sessionToken: newSessionToken,
      avatarColor: assignedColor,
    };

    room.players.push(newPlayer);
    room.playerCount = room.players.length;
    room.updatedAt = Date.now();

    this.emitEvent(room.roomCode, 'PLAYER_JOINED', { player: newPlayer });
    return { success: true, room, playerId: newPlayerId, sessionToken: newSessionToken };
  }

  /**
   * Reconnect player using persisted session credentials
   */
  public reconnectPlayer(params: {
    roomCode: string;
    playerId: string;
    sessionToken: string;
  }): { success: boolean; room?: MultiplayerRoom; player?: Player; code?: RoomErrorCode; error?: string } {
    const roomLookup = this.getRoomWithStatus(params.roomCode);
    if (!roomLookup.room) {
      return {
        success: false,
        code: roomLookup.code || 'ROOM_NOT_FOUND',
        error: roomLookup.error || 'Room not found or expired.',
      };
    }

    const room = roomLookup.room;
    const player = room.players.find((p) => p.id === params.playerId);
    if (!player) {
      return {
        success: false,
        code: 'PERMISSION_DENIED',
        error: 'Player session not found in this room.',
      };
    }

    if (player.sessionToken !== params.sessionToken) {
      return {
        success: false,
        code: 'PERMISSION_DENIED',
        error: 'Invalid session token. Authorization denied.',
      };
    }

    player.isConnected = true;
    player.lastSeenAt = Date.now();
    room.updatedAt = Date.now();
    this.emitEvent(room.roomCode, 'PLAYER_RECONNECTED', { player });
    return { success: true, room, player };
  }

  /**
   * Heartbeat ping to maintain connection and detect disconnected clients
   */
  public heartbeat(params: {
    roomCode: string;
    playerId: string;
  }): { success: boolean; room?: MultiplayerRoom; error?: string } {
    const room = this.getRoom(params.roomCode);
    if (!room) return { success: false, error: 'Room not found.' };

    const player = room.players.find((p) => p.id === params.playerId);
    if (player) {
      player.lastSeenAt = Date.now();
      player.isConnected = true;
    }

    // Flag disconnected players who haven't pinged in > 35 seconds
    const now = Date.now();
    room.players.forEach((p) => {
      if (p.lastSeenAt && now - p.lastSeenAt > 35000) {
        p.isConnected = false;
      }
    });

    room.updatedAt = Date.now();
    return { success: true, room };
  }

  /**
   * Look up room by code or ID with precise lifecycle status
   */
  public getRoomWithStatus(identifier: string): {
    room: MultiplayerRoom | null;
    code?: RoomErrorCode;
    error?: string;
  } {
    if (!identifier) {
      return { room: null, code: 'INVALID_ROOM_CODE', error: 'Invalid room code.' };
    }

    const clean = identifier.trim();
    const upper = clean.toUpperCase();

    // Check code map first, then ID map
    let room = this.roomsByCode.get(upper) || this.roomsById.get(clean);

    if (!room) {
      // Scan values if case-sensitivity variation
      for (const r of this.roomsById.values()) {
        if (r.roomCode.toUpperCase() === upper || r.id === clean) {
          room = r;
          break;
        }
      }
    }

    if (!room) {
      return {
        room: null,
        code: 'ROOM_NOT_FOUND',
        error: 'Room not found. Please verify the 6-character room code.',
      };
    }

    if (this.isExpired(room)) {
      room.status = 'EXPIRED';
      return {
        room: null,
        code: 'ROOM_EXPIRED',
        error: 'This party room has expired.',
      };
    }

    if (room.status === 'CANCELLED') {
      return {
        room: null,
        code: 'ROOM_CLOSED',
        error: 'This room has been cancelled.',
      };
    }

    // Sync live playerCount property
    room.playerCount = room.players.length;
    return { room };
  }

  /**
   * Get an active room by code or ID (returns null if expired or missing)
   */
  public getRoom(roomCodeOrId: string): MultiplayerRoom | null {
    const result = this.getRoomWithStatus(roomCodeOrId);
    return result.room;
  }

  /**
   * Dispatch action to room state with strict role and active turn authorization
   */
  public dispatchAction(params: {
    roomCode: string;
    playerId: string;
    action: string;
    sessionToken?: string;
    payload?: Record<string, unknown>;
  }): { success: boolean; room?: MultiplayerRoom; code?: RoomErrorCode; error?: string } {
    const room = this.getRoom(params.roomCode);
    if (!room) {
      return { success: false, code: 'ROOM_NOT_FOUND', error: 'Room not found or expired.' };
    }

    const player = room.players.find((p) => p.id === params.playerId);
    if (!player) {
      return { success: false, code: 'PERMISSION_DENIED', error: 'Player not found in this room.' };
    }

    // Validate session token if provided
    if (params.sessionToken && player.sessionToken && params.sessionToken !== player.sessionToken) {
      return { success: false, code: 'PERMISSION_DENIED', error: 'Invalid session token authorization.' };
    }

    const isCurrentActive = room.activePlayerId === player.id;
    const isHost = player.isHost || room.hostPlayerId === player.id;

    switch (params.action) {
      case 'START_GAME': {
        if (!isHost) {
          return { success: false, code: 'PERMISSION_DENIED', error: 'Only the host can start the game.' };
        }
        if (room.status === 'IN_PROGRESS' || room.status === 'in_game') {
          return { success: false, error: 'Game is already in progress.' };
        }
        if (room.players.length < 2) {
          return {
            success: false,
            error: 'At least 2 players are required to start the game. Invite a friend using your room code!',
          };
        }

        room.status = 'IN_PROGRESS';
        room.roundNumber = 1;
        room.activePlayerId = room.players[0]?.id || player.id;
        room.updatedAt = Date.now();
        this.emitEvent(room.roomCode, 'GAME_STARTED', { roundNumber: room.roundNumber });
        break;
      }

      case 'UPDATE_LOBBY_SETTINGS': {
        if (!isHost) {
          return { success: false, code: 'PERMISSION_DENIED', error: 'Only the host can update room settings.' };
        }
        if (room.status !== 'WAITING' && room.status !== 'lobby') {
          return { success: false, error: 'Settings can only be adjusted while in the lobby.' };
        }
        if (params.payload?.language) {
          room.language = params.payload.language as SupportedLanguageCode;
        }
        if (params.payload?.categoryId) {
          room.categoryId = params.payload.categoryId as CategoryId;
        }
        if (params.payload?.timerSeconds !== undefined) {
          room.timerSecondsRemaining = Number(params.payload.timerSeconds);
        }
        if (params.payload?.maxPlayers !== undefined) {
          room.maxPlayers = Math.max(2, Math.min(20, Number(params.payload.maxPlayers)));
        }
        if (params.payload?.customDeckSnapshot !== undefined) {
          const snapshot = params.payload.customDeckSnapshot as MultiplayerRoom['customDeckSnapshot'];
          room.customDeckSnapshot = snapshot
            ? {
                id: snapshot.id,
                deckId: snapshot.deckId || snapshot.id,
                roomId: room.id,
                version: snapshot.version || 1,
                name: snapshot.name,
                language: snapshot.language,
                questions: snapshot.questions.map((q) => ({ ...q })),
                truthQuestions: (snapshot.truthQuestions || snapshot.questions.filter((q) => q.type === 'truth')).map((q) => ({ ...q })),
                dareQuestions: (snapshot.dareQuestions || snapshot.questions.filter((q) => q.type === 'dare')).map((q) => ({ ...q })),
                snapshotCreatedAt: snapshot.snapshotCreatedAt || Date.now(),
              }
            : null;
          if (snapshot?.language) {
            room.language = snapshot.language;
          }
        }
        room.updatedAt = Date.now();
        this.emitEvent(room.roomCode, 'SETTINGS_UPDATED', { settings: params.payload });
        break;
      }

      case 'FLIP_CARD': {
        if (!isCurrentActive && !isHost) {
          return { success: false, code: 'PERMISSION_DENIED', error: 'Only the active player or host can flip a card.' };
        }
        if (room.isCardFlipped) {
          return { success: false, error: 'Card has already been flipped for this turn.' };
        }

        const type = (params.payload?.type as QuestionType) || 'truth';
        let card: Question | null = null;

        // Custom Deck Snapshot Support
        if (room.customDeckSnapshot && room.customDeckSnapshot.questions && room.customDeckSnapshot.questions.length > 0) {
          const matching = room.customDeckSnapshot.questions.filter((q) => q.type === type);
          const pool = matching.length > 0 ? matching : room.customDeckSnapshot.questions;

          // Duplicate Prevention: Track draw counts in history to prevent duplicates until pool is exhausted
          const drawCounts = new Map<string, number>();
          for (const q of pool) {
            drawCounts.set(q.id, 0);
          }
          for (const h of room.questionHistory || []) {
            if (drawCounts.has(h.questionId)) {
              drawCounts.set(h.questionId, (drawCounts.get(h.questionId) || 0) + 1);
            }
          }
          const minCount = Math.min(...Array.from(drawCounts.values()));
          const eligible = pool.filter((q) => (drawCounts.get(q.id) || 0) === minCount);
          const chosen = eligible[Math.floor(Math.random() * eligible.length)];

          card = {
            id: chosen.id,
            game_type: 'truth-or-dare',
            question_type: chosen.type,
            language_code: room.language || room.customDeckSnapshot.language || 'en',
            category: 'custom',
            difficulty: (Math.max(1, Math.min(5, chosen.intensity || 3)) as 1 | 2 | 3 | 4 | 5),
            question_text: chosen.prompt,
            content_rating: 'PG-13',
            age_group: 'all-ages',
            is_active: true,
            safety_reviewed: true,
            created_at: new Date().toISOString(),
            tags: ['custom'],
            gameId: 'truth-or-dare',
            categoryId: 'custom',
            type: chosen.type,
            prompt: chosen.prompt,
            intensity: (Math.max(1, Math.min(5, chosen.intensity || 3)) as 1 | 2 | 3 | 4 | 5),
            isNsfw: false,
          };
        } else {
          const drawnIds = (room.questionHistory || []).map((h) => h.questionId);
          const result = questionEngine.drawNextCard({
            gameId: room.gameId,
            categoryId: room.categoryId,
            type,
            language: room.language || 'en',
            drawnCardIds: drawnIds,
          });
          card = result.card;
        }

        room.currentCard = card;
        room.isCardFlipped = true;
        room.votes = {}; // Reset votes for new card

        // Append to synchronized question history
        if (card) {
          if (!room.questionHistory) {
            room.questionHistory = [];
          }
          room.questionHistory.push({
            id: 'hist-' + Math.random().toString(36).substring(2, 9),
            questionId: card.id,
            type: card.type,
            prompt: card.prompt,
            playerId: player.id,
            playerName: player.name,
            action: 'flipped',
            timestamp: Date.now(),
          });
        }

        room.updatedAt = Date.now();
        this.emitEvent(room.roomCode, 'CARD_FLIPPED', { card, type: card?.type || type });
        break;
      }

      case 'NEXT_TURN':
      case 'COMPLETE_DARE': {
        if (!isCurrentActive && !isHost) {
          return { success: false, code: 'PERMISSION_DENIED', error: 'Only the active player or host can resolve the turn.' };
        }
        if (!room.isCardFlipped && params.action === 'COMPLETE_DARE') {
          return { success: false, error: 'Cannot complete dare before drawing a card.' };
        }

        if (params.action === 'COMPLETE_DARE') {
          const activePlayer = room.players.find((p) => p.id === room.activePlayerId);
          if (activePlayer) {
            activePlayer.score += 1;
          }
          if (room.questionHistory && room.questionHistory.length > 0) {
            const last = room.questionHistory[room.questionHistory.length - 1];
            if (last && last.action === 'flipped') {
              last.action = 'completed';
            }
          }
        }

        this.advanceTurn(room);
        room.updatedAt = Date.now();
        this.emitEvent(room.roomCode, 'TURN_ADVANCED', { activePlayerId: room.activePlayerId });
        break;
      }

      case 'SKIP_TURN': {
        if (!isCurrentActive && !isHost) {
          return { success: false, code: 'PERMISSION_DENIED', error: 'Only the active player or host can skip the turn.' };
        }

        const activePlayer = room.players.find((p) => p.id === room.activePlayerId);
        if (activePlayer) {
          activePlayer.skips += 1;
        }
        if (room.questionHistory && room.questionHistory.length > 0) {
          const last = room.questionHistory[room.questionHistory.length - 1];
          if (last && last.action === 'flipped') {
            last.action = 'skipped';
          }
        }

        this.advanceTurn(room);
        room.updatedAt = Date.now();
        this.emitEvent(room.roomCode, 'TURN_SKIPPED', { activePlayerId: room.activePlayerId });
        break;
      }

      case 'SEND_EMOJI': {
        const emoji = (params.payload?.emoji as string) || '🔥';
        const cleanEmoji = emoji.slice(0, 4);
        const newEmoji = {
          id: Math.random().toString(36).substring(2, 9),
          emoji: cleanEmoji,
          timestamp: Date.now(),
          playerName: player.name,
        };
        room.recentEmojis = [newEmoji, ...room.recentEmojis.slice(0, 15)];
        room.updatedAt = Date.now();
        this.emitEvent(room.roomCode, 'EMOJI_SENT', { emoji: newEmoji });
        break;
      }

      case 'SUBMIT_VOTE': {
        const vote = (params.payload?.vote as string) || 'pass';
        room.votes[player.id] = vote;
        room.updatedAt = Date.now();
        this.emitEvent(room.roomCode, 'VOTE_SUBMITTED', { playerId: player.id, vote });
        break;
      }

      case 'KICK_PLAYER': {
        if (!isHost) {
          return { success: false, code: 'PERMISSION_DENIED', error: 'Only the host can kick players.' };
        }
        const targetId = params.payload?.targetPlayerId as string;
        if (!targetId || targetId === player.id) {
          return { success: false, error: 'Invalid kick target.' };
        }
        this.leaveRoom(room.roomCode, targetId);
        break;
      }

      case 'LEAVE_ROOM': {
        this.leaveRoom(room.roomCode, player.id);
        break;
      }

      default:
        return { success: false, error: `Unknown action: ${params.action}` };
    }

    return { success: true, room };
  }

  /**
   * Server-authoritative turn advancement with round counting
   */
  private advanceTurn(room: MultiplayerRoom) {
    if (room.players.length === 0) return;

    const currentIndex = room.players.findIndex((p) => p.id === room.activePlayerId);
    const nextIndex = (currentIndex + 1) % room.players.length;

    // Increment round number if turn has cycled back to the first player
    if (nextIndex === 0) {
      room.roundNumber += 1;
    }

    room.activePlayerId = room.players[nextIndex].id;
    room.isCardFlipped = false;
    room.currentCard = null;
    room.votes = {};
  }

  /**
   * Leave room with orphan active-player protection and automatic host migration
   */
  public leaveRoom(roomCode: string, playerId: string): { success: boolean; room?: MultiplayerRoom } {
    const room = this.getRoom(roomCode);
    if (!room) return { success: false };

    room.players = room.players.filter((p) => p.id !== playerId);
    room.playerCount = room.players.length;

    // Host Migration: If host left, promote the next player
    if (room.hostPlayerId === playerId && room.players.length > 0) {
      room.players[0].isHost = true;
      room.hostPlayerId = room.players[0].id;
      this.emitEvent(room.roomCode, 'HOST_MIGRATED', { newHostId: room.hostPlayerId });
    }

    // Active Turn Protection: If active player left, rotate turn to prevent frozen room
    if (room.activePlayerId === playerId && room.players.length > 0) {
      room.activePlayerId = room.players[0].id;
      room.isCardFlipped = false;
      room.currentCard = null;
      room.votes = {};
    }

    room.updatedAt = Date.now();

    // If room is empty, purge it
    if (room.players.length === 0) {
      this.roomsByCode.delete(room.roomCode.toUpperCase());
      this.roomsById.delete(room.id);
      this.emitEvent(room.roomCode, 'ROOM_CLOSED', {});
      return { success: true };
    }

    this.emitEvent(room.roomCode, 'PLAYER_LEFT', { playerId });
    return { success: true, room };
  }

  /**
   * Realtime event listener subscription
   */
  public subscribe(roomCode: string, listener: (event: RoomEvent) => void): () => void {
    const code = roomCode.toUpperCase().trim();
    if (!this.eventListeners.has(code)) {
      this.eventListeners.set(code, new Set());
    }
    this.eventListeners.get(code)!.add(listener);

    return () => {
      const set = this.eventListeners.get(code);
      if (set) {
        set.delete(listener);
        if (set.size === 0) {
          this.eventListeners.delete(code);
        }
      }
    };
  }

  /**
   * Emit event to room subscribers
   */
  private emitEvent(roomCode: string, type: string, payload: unknown) {
    const code = roomCode.toUpperCase().trim();
    const listeners = this.eventListeners.get(code);
    if (listeners && listeners.size > 0) {
      const event: RoomEvent = {
        roomCode: code,
        type,
        payload,
        timestamp: Date.now(),
      };
      listeners.forEach((fn) => {
        try {
          fn(event);
        } catch {
          // Ignore listener errors
        }
      });
    }
  }

  /**
   * Prune expired rooms
   */
  public pruneExpiredRooms(): number {
    const now = Date.now();
    let pruned = 0;
    for (const [code, room] of this.roomsByCode.entries()) {
      if (now > room.expiresAt) {
        room.status = 'EXPIRED';
        this.roomsByCode.delete(code);
        this.roomsById.delete(room.id);
        pruned++;
      }
    }
    return pruned;
  }

  /**
   * Test helper to clear rooms
   */
  public resetRooms() {
    this.roomsByCode.clear();
    this.roomsById.clear();
    this.idempotencyCache.clear();
    this.eventListeners.clear();
  }
}

// Global singleton instance bound to globalThis for Next.js consistency across module reloads
const globalForRoomEngine = globalThis as unknown as {
  __asteria_room_engine__?: RoomEngine;
};

export const roomEngine = globalForRoomEngine.__asteria_room_engine__ ?? new RoomEngine();
globalForRoomEngine.__asteria_room_engine__ = roomEngine;
