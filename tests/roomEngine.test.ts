import { describe, it, expect } from 'vitest';
import { roomEngine } from '@/lib/multiplayer/roomEngine';

describe('Multiplayer RoomEngine Unit Tests', () => {
  it('creates a room with a 6-character room code and assigns host', () => {
    const { room, hostPlayerId } = roomEngine.createRoom({
      gameId: 'truth-or-dare',
      categoryId: 'classic-party',
      hostName: 'HostPlayer',
    });

    expect(room.roomCode.length).toBe(6);
    expect(room.players.length).toBe(1);
    expect(room.players[0].isHost).toBe(true);
    expect(room.hostPlayerId).toBe(hostPlayerId);
  });

  it('allows a second player to join the room', () => {
    const { room } = roomEngine.createRoom({
      gameId: 'truth-or-dare',
      categoryId: 'classic-party',
      hostName: 'Alex',
    });

    const joinResult = roomEngine.joinRoom({
      roomCode: room.roomCode,
      playerName: 'Jordan',
    });

    expect(joinResult.success).toBe(true);
    expect(joinResult.room?.players.length).toBe(2);
    expect(joinResult.room?.players[1].name).toBe('Jordan');
  });

  it('dispatches actions and rotates player turns', () => {
    const { room, hostPlayerId } = roomEngine.createRoom({
      gameId: 'truth-or-dare',
      categoryId: 'classic-party',
      hostName: 'Player1',
    });

    const joinResult = roomEngine.joinRoom({
      roomCode: room.roomCode,
      playerName: 'Player2',
    });

    // Start game
    roomEngine.dispatchAction({
      roomCode: room.roomCode,
      playerId: hostPlayerId,
      action: 'START_GAME',
    });

    // Flip card
    const flipResult = roomEngine.dispatchAction({
      roomCode: room.roomCode,
      playerId: hostPlayerId,
      action: 'FLIP_CARD',
      payload: { type: 'dare' },
    });

    expect(flipResult.room?.isCardFlipped).toBe(true);
    expect(flipResult.room?.currentCard).not.toBeNull();

    // Complete dare (increments score and rotates to next player)
    const completeResult = roomEngine.dispatchAction({
      roomCode: room.roomCode,
      playerId: hostPlayerId,
      action: 'COMPLETE_DARE',
    });

    expect(completeResult.room?.players[0].score).toBe(1);
    expect(completeResult.room?.activePlayerId).toBe(joinResult.playerId);
    expect(completeResult.room?.isCardFlipped).toBe(false);
  });

  it('rejects joining an invalid room code format', () => {
    const result = roomEngine.joinRoom({
      roomCode: 'INVALID-LENGTH',
      playerName: 'Ghost',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid room code format');
  });

  it('rejects joining a non-existent 6-character room code', () => {
    const result = roomEngine.joinRoom({
      roomCode: 'NON999',
      playerName: 'Ghost',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Room not found');
  });
});

