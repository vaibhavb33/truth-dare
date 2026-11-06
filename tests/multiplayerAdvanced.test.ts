import { describe, it, expect, beforeEach } from 'vitest';
import { roomEngine } from '@/lib/multiplayer/roomEngine';

describe('Advanced Multiplayer Concurrency & Security Tests', () => {
  beforeEach(() => {
    roomEngine.resetRooms();
  });

  it('prevents non-active guest from flipping card during another player turn', () => {
    const { room, hostPlayerId } = roomEngine.createRoom({
      gameId: 'truth-or-dare',
      categoryId: 'classic-party',
      hostName: 'HostPlayer',
    });

    const guest = roomEngine.joinRoom({
      roomCode: room.roomCode,
      playerName: 'GuestPlayer',
    });

    // Start game
    roomEngine.dispatchAction({
      roomCode: room.roomCode,
      playerId: hostPlayerId,
      action: 'START_GAME',
    });

    expect(room.activePlayerId).toBe(hostPlayerId);

    // Guest tries to flip card during host's turn
    const unauthorizedFlip = roomEngine.dispatchAction({
      roomCode: room.roomCode,
      playerId: guest.playerId!,
      action: 'FLIP_CARD',
      payload: { type: 'dare' },
    });

    expect(unauthorizedFlip.success).toBe(false);
    expect(unauthorizedFlip.error).toContain('Only the active player or host can flip a card');
  });

  it('prevents duplicate FLIP_CARD actions before resolving current card', () => {
    const { room, hostPlayerId } = roomEngine.createRoom({
      gameId: 'truth-or-dare',
      categoryId: 'classic-party',
      hostName: 'HostPlayer',
    });

    roomEngine.dispatchAction({
      roomCode: room.roomCode,
      playerId: hostPlayerId,
      action: 'START_GAME',
    });

    // First flip succeeds
    const flip1 = roomEngine.dispatchAction({
      roomCode: room.roomCode,
      playerId: hostPlayerId,
      action: 'FLIP_CARD',
      payload: { type: 'truth' },
    });
    expect(flip1.success).toBe(true);
    expect(room.isCardFlipped).toBe(true);

    // Second flip without completing turn must fail
    const flip2 = roomEngine.dispatchAction({
      roomCode: room.roomCode,
      playerId: hostPlayerId,
      action: 'FLIP_CARD',
      payload: { type: 'dare' },
    });
    expect(flip2.success).toBe(false);
    expect(flip2.error).toContain('Card has already been flipped');
  });

  it('prevents score theft by non-active player calling COMPLETE_DARE', () => {
    const { room, hostPlayerId } = roomEngine.createRoom({
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
      action: 'START_GAME',
    });

    roomEngine.dispatchAction({
      roomCode: room.roomCode,
      playerId: hostPlayerId,
      action: 'FLIP_CARD',
      payload: { type: 'truth' },
    });

    // Bob tries to complete Alice's dare
    const bobAttempt = roomEngine.dispatchAction({
      roomCode: room.roomCode,
      playerId: bob.playerId!,
      action: 'COMPLETE_DARE',
    });

    expect(bobAttempt.success).toBe(false);
    expect(bobAttempt.error).toContain('Only the active player or host can resolve the turn');
  });

  it('correctly migrates active player when current active player leaves mid-turn', () => {
    const { room, hostPlayerId } = roomEngine.createRoom({
      gameId: 'truth-or-dare',
      categoryId: 'classic-party',
      hostName: 'HostAlice',
    });

    const bob = roomEngine.joinRoom({
      roomCode: room.roomCode,
      playerName: 'Bob',
    });

    roomEngine.dispatchAction({
      roomCode: room.roomCode,
      playerId: hostPlayerId,
      action: 'START_GAME',
    });

    expect(room.activePlayerId).toBe(hostPlayerId);

    // Active player Alice leaves room
    roomEngine.leaveRoom(room.roomCode, hostPlayerId);

    // Bob should now be promoted to active player and host, and room should not be deadlocked
    expect(room.players.length).toBe(1);
    expect(room.players[0].name).toBe('Bob');
    expect(room.players[0].isHost).toBe(true);
    expect(room.activePlayerId).toBe(bob.playerId);
    expect(room.isCardFlipped).toBe(false);
    expect(room.currentCard).toBeNull();
  });

  it('enforces maximum 20 players limit', () => {
    const { room } = roomEngine.createRoom({
      gameId: 'truth-or-dare',
      categoryId: 'classic-party',
      hostName: 'Host',
    });

    // Join 19 more players (total 20)
    for (let i = 1; i < 20; i++) {
      const joinResult = roomEngine.joinRoom({
        roomCode: room.roomCode,
        playerName: `Guest-${i}`,
      });
      expect(joinResult.success).toBe(true);
    }

    expect(room.players.length).toBe(20);

    // 21st player must be rejected
    const excessJoin = roomEngine.joinRoom({
      roomCode: room.roomCode,
      playerName: 'Player21',
    });

    expect(excessJoin.success).toBe(false);
    expect(excessJoin.error).toContain('Room is currently full');
  });

  it('sanitizes player names against XSS tags and length limits', () => {
    const { room } = roomEngine.createRoom({
      gameId: 'truth-or-dare',
      categoryId: 'classic-party',
      hostName: '<script>alert("hacked")</script>VipHost',
    });

    expect(room.players[0].name).not.toContain('<script>');
    expect(room.players[0].name).toContain('VipHost');

    const guest = roomEngine.joinRoom({
      roomCode: room.roomCode,
      playerName: '<b>SuperLongNameExceedingTheAllowableLimitForSafeDisplay</b>',
    });

    expect(guest.room?.players[1].name).not.toContain('<b>');
    expect(guest.room?.players[1].name.length).toBeLessThanOrEqual(25);
  });
});

