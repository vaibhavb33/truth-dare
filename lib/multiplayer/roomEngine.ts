import { MultiplayerRoom, Player, GameType, CategoryId, QuestionType, SupportedLanguageCode } from '@/types';
import { generateRoomCode } from '@/lib/utils';
import { questionEngine } from '@/lib/questions/engine';

function sanitizeName(rawName: string): string {
  return rawName
    .replace(/<[^>]*>?/gm, '')
    .trim()
    .substring(0, 25);
}

class RoomEngine {
  private rooms: Map<string, MultiplayerRoom> = new Map();

  /**
   * Create a new multiplayer room
   */
  public createRoom(params: {
    gameId: GameType;
    categoryId: CategoryId;
    hostName: string;
    timerSeconds?: 0 | 15 | 30 | 60;
    language?: SupportedLanguageCode;
  }): { room: MultiplayerRoom; hostPlayerId: string } {
    const roomCode = generateRoomCode();
    const hostPlayerId = 'p-' + Math.random().toString(36).substring(2, 9);
    const cleanHostName = sanitizeName(params.hostName) || 'Host';

    const hostPlayer: Player = {
      id: hostPlayerId,
      name: cleanHostName,
      score: 0,
      skips: 0,
      isHost: true,
      isConnected: true,
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
      votes: {},
      recentEmojis: [],
      language: params.language || 'en',
      createdAt: Date.now(),
      expiresAt: Date.now() + 2 * 60 * 60 * 1000, // 2 hours TTL
    };

    this.rooms.set(roomCode, room);
    return { room, hostPlayerId };
  }

  /**
   * Join an existing room via 6-digit code
   */
  public joinRoom(params: {
    roomCode: string;
    playerName: string;
  }): { success: boolean; room?: MultiplayerRoom; playerId?: string; error?: string } {
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

    if (room.players.length >= 20) {
      return { success: false, error: 'Room is currently full (maximum 20 players).' };
    }

    const playerId = 'p-' + Math.random().toString(36).substring(2, 9);
    const colors = ['#06B6D4', '#FF5C77', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];
    const assignedColor = colors[room.players.length % colors.length];
    const cleanPlayerName = sanitizeName(params.playerName) || `Player ${room.players.length + 1}`;

    const newPlayer: Player = {
      id: playerId,
      name: cleanPlayerName,
      score: 0,
      skips: 0,
      isHost: false,
      isConnected: true,
      avatarColor: assignedColor,
    };

    room.players.push(newPlayer);
    return { success: true, room, playerId };
  }

  /**
   * Get an active room by code
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
    payload?: Record<string, unknown>;
  }): { success: boolean; room?: MultiplayerRoom; error?: string } {
    const room = this.getRoom(params.roomCode);
    if (!room) return { success: false, error: 'Room not found.' };

    const player = room.players.find((p) => p.id === params.playerId);
    if (!player) return { success: false, error: 'Player not in room.' };

    const isCurrentActive = room.activePlayerId === player.id;
    const isHost = player.isHost;

    switch (params.action) {
      case 'START_GAME': {
        if (!isHost) return { success: false, error: 'Only the host can start the game.' };
        room.status = 'in_game';
        room.activePlayerId = room.players[0]?.id || player.id;
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
        const { card } = questionEngine.drawNextCard({
          gameId: room.gameId,
          categoryId: room.categoryId,
          type,
          language: room.language || 'en',
          drawnCardIds: [],
        });
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

        // Rotate to next player
        const currentIndex = room.players.findIndex((p) => p.id === room.activePlayerId);
        const nextIndex = (currentIndex + 1) % room.players.length;
        room.activePlayerId = room.players[nextIndex].id;
        room.isCardFlipped = false;
        room.currentCard = null;
        room.votes = {};
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

        const currentIndex = room.players.findIndex((p) => p.id === room.activePlayerId);
        const nextIndex = (currentIndex + 1) % room.players.length;
        room.activePlayerId = room.players[nextIndex].id;
        room.isCardFlipped = false;
        room.currentCard = null;
        room.votes = {};
        break;
      }

      case 'SEND_EMOJI': {
        const emoji = (params.payload?.emoji as string) || '🔥';
        const newEmoji = {
          id: Math.random().toString(36).substring(2, 9),
          emoji,
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

      default:
        return { success: false, error: `Unknown action: ${params.action}` };
    }

    return { success: true, room };
  }

  /**
   * Leave room with orphan active-player protection and host migration
   */
  public leaveRoom(roomCode: string, playerId: string) {
    const room = this.getRoom(roomCode);
    if (!room) return;

    room.players = room.players.filter((p) => p.id !== playerId);

    // If host left, promote next player
    if (room.hostPlayerId === playerId && room.players.length > 0) {
      room.players[0].isHost = true;
      room.hostPlayerId = room.players[0].id;
    }

    // If active player left, rotate active player to prevent deadlocked room
    if (room.activePlayerId === playerId && room.players.length > 0) {
      room.activePlayerId = room.players[0].id;
      room.isCardFlipped = false;
      room.currentCard = null;
    }

    // If room is empty, remove it
    if (room.players.length === 0) {
      this.rooms.delete(room.roomCode);
    }
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
