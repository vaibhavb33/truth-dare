/**
 * Asteria Production Multiplayer Room Engine
 * Server-authoritative state transitions, real-time lobby, synchronized turns,
 * concurrency locks, duplicate prevention, host migration, and session restoration.
 */

import { MultiplayerRoom, Player, GameType, CategoryId, QuestionType, SupportedLanguageCode, Question } from '@/types';
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

export class RoomEngine {
  private rooms: Map<string, MultiplayerRoom> = new Map();
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor() {
    // Periodic garbage collection for expired rooms every 10 minutes
    if (typeof setInterval !== 'undefined') {
      this.cleanupTimer = setInterval(() => this.pruneExpiredRooms(), 10 * 60 * 1000);
      if (this.cleanupTimer.unref) {
        this.cleanupTimer.unref();
      }
    }
  }

  /**
   * Create a new multiplayer room with host assignment and secure session token
   */
  public createRoom(params: {
    gameId: GameType;
    categoryId: CategoryId;
    hostName: string;
    timerSeconds?: 0 | 15 | 30 | 60;
    language?: SupportedLanguageCode;
    maxPlayers?: number;
    customDeckSnapshot?: MultiplayerRoom['customDeckSnapshot'];
  }): { room: MultiplayerRoom; hostPlayerId: string; sessionToken: string } {
    const roomCode = generateRoomCode();
    const hostPlayerId = 'p-' + Math.random().toString(36).substring(2, 9);
    const sessionToken = generateSessionToken();
    const cleanHostName = sanitizeName(params.hostName) || 'Host';
    const maxPlayers = Math.max(2, Math.min(20, params.maxPlayers ?? 20));
    const language = params.customDeckSnapshot?.language || params.language || 'en';
    const customDeckSnapshot = params.customDeckSnapshot
      ? {
          id: params.customDeckSnapshot.id,
          name: params.customDeckSnapshot.name,
          language: params.customDeckSnapshot.language,
          questions: params.customDeckSnapshot.questions.map((q) => ({ ...q })),
        }
      : null;

    const hostPlayer: Player = {
      id: hostPlayerId,
      name: cleanHostName,
      score: 0,
      skips: 0,
      isHost: true,
      isConnected: true,
      lastSeenAt: Date.now(),
      sessionToken,
      avatarColor: '#8B5CF6',
    };

    const room: MultiplayerRoom = {
      roomCode,
      gameId: params.gameId,
      categoryId: params.categoryId,
      hostPlayerId,
      status: 'lobby',
      players: [hostPlayer],
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
      createdAt: Date.now(),
      expiresAt: Date.now() + 2 * 60 * 60 * 1000, // 2-hour TTL
    };

    this.rooms.set(roomCode, room);
    return { room, hostPlayerId, sessionToken };
  }

  /**
   * Join an existing room with duplicate nickname protection and full room limits
   */
  public joinRoom(params: {
    roomCode: string;
    playerName: string;
    playerId?: string;
    sessionToken?: string;
  }): { success: boolean; room?: MultiplayerRoom; playerId?: string; sessionToken?: string; error?: string } {
    const code = params.roomCode.toUpperCase().trim();

    if (!/^[A-Z0-9]{6}$/.test(code)) {
      return { success: false, error: 'Invalid room code format. Room code must be 6 alphanumeric characters.' };
    }

    const room = this.rooms.get(code);

    if (!room) {
      return { success: false, error: 'Room not found. Please verify the 6-character room code.' };
    }

    if (room.status === 'finished' || Date.now() > room.expiresAt) {
      return { success: false, error: 'This party room has expired.' };
    }

    const cleanPlayerName = sanitizeName(params.playerName) || `Player ${room.players.length + 1}`;

    // 1. Reconnection Check: Does this player match an existing ID and token?
    if (params.playerId && params.sessionToken) {
      const existingPlayer = room.players.find((p) => p.id === params.playerId);
      if (existingPlayer && existingPlayer.sessionToken === params.sessionToken) {
        existingPlayer.isConnected = true;
        existingPlayer.lastSeenAt = Date.now();
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
        return {
          success: true,
          room,
          playerId: nameCollision.id,
          sessionToken: nameCollision.sessionToken,
        };
      }
      return {
        success: false,
        error: `A player named "${cleanPlayerName}" is already in this room. Please choose another nickname.`,
      };
    }

    // 3. Prevent Joining Full Rooms
    if (room.players.length >= room.maxPlayers) {
      return { success: false, error: `Room is currently full (maximum ${room.maxPlayers} players).` };
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
    return { success: true, room, playerId: newPlayerId, sessionToken: newSessionToken };
  }

  /**
   * Reconnect player using persisted session credentials
   */
  public reconnectPlayer(params: {
    roomCode: string;
    playerId: string;
    sessionToken: string;
  }): { success: boolean; room?: MultiplayerRoom; player?: Player; error?: string } {
    const room = this.getRoom(params.roomCode);
    if (!room) {
      return { success: false, error: 'Room not found or expired.' };
    }

    const player = room.players.find((p) => p.id === params.playerId);
    if (!player) {
      return { success: false, error: 'Player session not found in this room.' };
    }

    if (player.sessionToken !== params.sessionToken) {
      return { success: false, error: 'Invalid session token. Authorization denied.' };
    }

    player.isConnected = true;
    player.lastSeenAt = Date.now();
    return { success: true, room, player };
  }

  /**
   * Heartbeat ping to maintain connection and prune stale clients
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

    return { success: true, room };
  }

  /**
   * Get an active room by code (with automatic TTL check)
   */
  public getRoom(roomCode: string): MultiplayerRoom | null {
    const code = roomCode.toUpperCase().trim();
    const room = this.rooms.get(code);
    if (!room) return null;
    if (Date.now() > room.expiresAt) {
      this.rooms.delete(code);
      return null;
    }
    return room;
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
  }): { success: boolean; room?: MultiplayerRoom; error?: string } {
    const room = this.getRoom(params.roomCode);
    if (!room) return { success: false, error: 'Room not found.' };

    const player = room.players.find((p) => p.id === params.playerId);
    if (!player) return { success: false, error: 'Player not in room.' };

    // Validate session token if provided
    if (params.sessionToken && player.sessionToken && params.sessionToken !== player.sessionToken) {
      return { success: false, error: 'Invalid session token authorization.' };
    }

    const isCurrentActive = room.activePlayerId === player.id;
    const isHost = player.isHost || room.hostPlayerId === player.id;

    switch (params.action) {
      case 'START_GAME': {
        if (!isHost) {
          return { success: false, error: 'Only the host can start the game.' };
        }
        if (room.status === 'in_game') {
          return { success: false, error: 'Game is already in progress.' };
        }
        room.status = 'in_game';
        room.roundNumber = 1;
        room.activePlayerId = room.players[0]?.id || player.id;
        break;
      }

      case 'UPDATE_LOBBY_SETTINGS': {
        if (!isHost) {
          return { success: false, error: 'Only the host can update room settings.' };
        }
        if (room.status !== 'lobby') {
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
                name: snapshot.name,
                language: snapshot.language,
                questions: snapshot.questions.map((q) => ({ ...q })),
              }
            : null;
          if (snapshot?.language) {
            room.language = snapshot.language;
          }
        }
        break;
      }

      case 'FLIP_CARD': {
        if (!isCurrentActive && !isHost) {
          return { success: false, error: 'Only the active player or host can flip a card.' };
        }
        if (room.isCardFlipped) {
          return { success: false, error: 'Card has already been flipped for this turn.' };
        }

        const type = (params.payload?.type as QuestionType) || 'truth';
        let card: Question | null = null;

        // Custom Deck Snapshot Support (Phase 5)
        if (room.customDeckSnapshot && room.customDeckSnapshot.questions && room.customDeckSnapshot.questions.length > 0) {
          const matching = room.customDeckSnapshot.questions.filter((q) => q.type === type);
          const pool = matching.length > 0 ? matching : room.customDeckSnapshot.questions;
          const chosen = pool[Math.floor(Math.random() * pool.length)];

          card = {
            id: chosen.id,
            game_type: 'truth-or-dare',
            question_type: chosen.type,
            language_code: room.language || 'en',
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
          const result = questionEngine.drawNextCard({
            gameId: room.gameId,
            categoryId: room.categoryId,
            type,
            language: room.language || 'en',
            drawnCardIds: [],
          });
          card = result.card;
        }

        room.currentCard = card;
        room.isCardFlipped = true;
        room.votes = {}; // Reset votes for new card
        break;
      }

      case 'NEXT_TURN':
      case 'COMPLETE_DARE': {
        if (!isCurrentActive && !isHost) {
          return { success: false, error: 'Only the active player or host can resolve the turn.' };
        }
        if (!room.isCardFlipped && params.action === 'COMPLETE_DARE') {
          return { success: false, error: 'Cannot complete dare before drawing a card.' };
        }

        if (params.action === 'COMPLETE_DARE') {
          const activePlayer = room.players.find((p) => p.id === room.activePlayerId);
          if (activePlayer) {
            activePlayer.score += 1;
          }
        }

        // Rotate to next connected player
        this.advanceTurn(room);
        break;
      }

      case 'SKIP_TURN': {
        if (!isCurrentActive && !isHost) {
          return { success: false, error: 'Only the active player or host can skip the turn.' };
        }

        const activePlayer = room.players.find((p) => p.id === room.activePlayerId);
        if (activePlayer) {
          activePlayer.skips += 1;
        }

        this.advanceTurn(room);
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
        break;
      }

      case 'SUBMIT_VOTE': {
        const vote = (params.payload?.vote as string) || 'pass';
        room.votes[player.id] = vote;
        break;
      }

      case 'KICK_PLAYER': {
        if (!isHost) {
          return { success: false, error: 'Only the host can kick players.' };
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

    // Host Migration: If host left, promote the next player
    if (room.hostPlayerId === playerId && room.players.length > 0) {
      room.players[0].isHost = true;
      room.hostPlayerId = room.players[0].id;
    }

    // Active Turn Protection: If active player left, rotate turn to prevent frozen room
    if (room.activePlayerId === playerId && room.players.length > 0) {
      room.activePlayerId = room.players[0].id;
      room.isCardFlipped = false;
      room.currentCard = null;
      room.votes = {};
    }

    // If room is empty, purge it
    if (room.players.length === 0) {
      this.rooms.delete(room.roomCode);
      return { success: true };
    }

    return { success: true, room };
  }

  /**
   * Prune expired rooms
   */
  public pruneExpiredRooms(): number {
    const now = Date.now();
    let pruned = 0;
    for (const [code, room] of this.rooms.entries()) {
      if (now > room.expiresAt) {
        this.rooms.delete(code);
        pruned++;
      }
    }
    return pruned;
  }

  /**
   * Test helper to clear rooms
   */
  public resetRooms() {
    this.rooms.clear();
  }
}

// Global singleton instance
export const roomEngine = new RoomEngine();
