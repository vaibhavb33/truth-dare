import { describe, it, expect } from 'vitest';
import { roomEngine } from '@/lib/multiplayer/roomEngine';

describe('Most Likely To Online Multiplayer', () => {
  it('creates an online room with custom game length (5, 10, or 15 prompts)', () => {
    const { room, hostPlayerId, sessionToken } = roomEngine.createRoom({
      gameId: 'most-likely-to',
      hostName: 'Alice',
      gameLength: 5,
    });

    expect(room.roomCode.length).toBe(6);
    expect(room.gameId).toBe('most-likely-to');
    expect(room.gameLength).toBe(5);
    expect(room.players.length).toBe(1);
    expect(room.players[0].name).toBe('Alice');
    expect(room.players[0].isHost).toBe(true);
    expect(room.hostPlayerId).toBe(hostPlayerId);

    // Host can update game length in lobby settings
    const updateResult = roomEngine.dispatchAction({
      roomCode: room.roomCode,
      playerId: hostPlayerId,
      sessionToken,
      action: 'UPDATE_LOBBY_SETTINGS',
      payload: { gameLength: 15 },
    });

    expect(updateResult.success).toBe(true);
    expect(updateResult.room?.gameLength).toBe(15);
  });

  it('enforces minimum 3 players to start a Most Likely To game', () => {
    const { room, hostPlayerId, sessionToken } = roomEngine.createRoom({
      gameId: 'most-likely-to',
      hostName: 'HostPlayer',
    });

    // 1 player: attempt to start game -> fails
    const startFail1 = roomEngine.dispatchAction({
      roomCode: room.roomCode,
      playerId: hostPlayerId,
      sessionToken,
      action: 'START_GAME',
    });
    expect(startFail1.success).toBe(false);
    expect(startFail1.error).toContain('At least 3 players are required');

    // 2 players: attempt to start game -> fails
    const join2 = roomEngine.joinRoom({
      roomCode: room.roomCode,
      playerName: 'PlayerTwo',
    });
    expect(join2.success).toBe(true);

    const startFail2 = roomEngine.dispatchAction({
      roomCode: room.roomCode,
      playerId: hostPlayerId,
      sessionToken,
      action: 'START_GAME',
    });
    expect(startFail2.success).toBe(false);
    expect(startFail2.error).toContain('At least 3 players are required');

    // 3 players: attempt to start game -> succeeds
    const join3 = roomEngine.joinRoom({
      roomCode: room.roomCode,
      playerName: 'PlayerThree',
    });
    expect(join3.success).toBe(true);

    const startSuccess = roomEngine.dispatchAction({
      roomCode: room.roomCode,
      playerId: hostPlayerId,
      sessionToken,
      action: 'START_GAME',
    });
    expect(startSuccess.success).toBe(true);
    expect(startSuccess.room?.status).toBe('IN_PROGRESS');
    expect(startSuccess.room?.currentCard).toBeDefined();
    expect(startSuccess.room?.isCardFlipped).toBe(true);
  });

  it('allows host to kick/remove players in lobby before starting', () => {
    const { room, hostPlayerId, sessionToken } = roomEngine.createRoom({
      gameId: 'most-likely-to',
      hostName: 'HostPlayer',
    });

    const join2 = roomEngine.joinRoom({
      roomCode: room.roomCode,
      playerName: 'UnwantedGuest',
    });
    expect(join2.success).toBe(true);
    const guestId = join2.playerId!;

    // Non-host tries to kick -> fails
    const kickFail = roomEngine.dispatchAction({
      roomCode: room.roomCode,
      playerId: guestId,
      sessionToken: join2.sessionToken!,
      action: 'KICK_PLAYER',
      payload: { targetPlayerId: hostPlayerId },
    });
    expect(kickFail.success).toBe(false);
    expect(kickFail.error).toContain('Only the host');

    // Host kicks unwanted guest -> succeeds
    const kickSuccess = roomEngine.dispatchAction({
      roomCode: room.roomCode,
      playerId: hostPlayerId,
      sessionToken,
      action: 'KICK_PLAYER',
      payload: { targetPlayerId: guestId },
    });
    expect(kickSuccess.success).toBe(true);
    expect(kickSuccess.room?.players.some((p) => p.id === guestId)).toBe(false);
    expect(kickSuccess.room?.players.length).toBe(1);
  });

  it('maintains secret voting and masks uncompleted votes in API sanitization', () => {
    const { room, hostPlayerId, sessionToken: hostToken } = roomEngine.createRoom({
      gameId: 'most-likely-to',
      hostName: 'Alice',
      gameLength: 5,
    });

    const bob = roomEngine.joinRoom({ roomCode: room.roomCode, playerName: 'Bob' });
    const charlie = roomEngine.joinRoom({ roomCode: room.roomCode, playerName: 'Charlie' });

    roomEngine.dispatchAction({
      roomCode: room.roomCode,
      playerId: hostPlayerId,
      sessionToken: hostToken,
      action: 'START_GAME',
    });

    // 1. Alice votes for Bob
    const vote1 = roomEngine.dispatchAction({
      roomCode: room.roomCode,
      playerId: hostPlayerId,
      sessionToken: hostToken,
      action: 'SUBMIT_VOTE',
      payload: { vote: bob.playerId },
    });
    expect(vote1.success).toBe(true);
    expect(vote1.room?.isVotingComplete).toBe(false);

    // Verify sanitization for Bob: Alice's vote should NOT be visible to Bob yet!
    const sanitizedForBob = roomEngine.sanitizeRoomForPlayer(roomEngine.getRoom(room.roomCode)!, bob.playerId!);
    expect(sanitizedForBob.isVotingComplete).toBe(false);
    // Bob should not see Alice's selection
    expect(sanitizedForBob.votes?.[hostPlayerId]).toBeUndefined();
    // But votedPlayerIds should contain Alice so UI can show she voted
    expect(sanitizedForBob.votedPlayerIds).toContain(hostPlayerId);

    // 2. Bob votes for Bob
    const vote2 = roomEngine.dispatchAction({
      roomCode: room.roomCode,
      playerId: bob.playerId!,
      sessionToken: bob.sessionToken!,
      action: 'SUBMIT_VOTE',
      payload: { vote: bob.playerId },
    });
    expect(vote2.success).toBe(true);
    expect(vote2.room?.isVotingComplete).toBe(false);

    // 3. Charlie (last vote) votes for Bob -> triggers voting complete and scoring!
    const vote3 = roomEngine.dispatchAction({
      roomCode: room.roomCode,
      playerId: charlie.playerId!,
      sessionToken: charlie.sessionToken!,
      action: 'SUBMIT_VOTE',
      payload: { vote: bob.playerId },
    });
    expect(vote3.success).toBe(true);
    expect(vote3.room?.isVotingComplete).toBe(true);
    expect(vote3.room?.roundConsensusReached).toBe(true);

    // Bob won the crown (all 3 votes)
    expect(vote3.room?.roundWinners).toContain(bob.playerId);
    const updatedBob = vote3.room?.players.find((p) => p.id === bob.playerId);
    expect(updatedBob?.crowns).toBe(1);
    expect(updatedBob?.titles?.length).toBe(1);

    // All 3 players voted for Bob, so each gets 1 prediction point!
    expect(vote3.room?.players.find((p) => p.id === hostPlayerId)?.score).toBe(1);
    expect(vote3.room?.players.find((p) => p.id === bob.playerId)?.score).toBe(1);
    expect(vote3.room?.players.find((p) => p.id === charlie.playerId)?.score).toBe(1);

    // Now votes ARE visible in sanitized output
    const sanitizedComplete = roomEngine.sanitizeRoomForPlayer(roomEngine.getRoom(room.roomCode)!, bob.playerId!);
    expect(sanitizedComplete.isVotingComplete).toBe(true);
    expect(sanitizedComplete.votes?.[hostPlayerId]).toBe(bob.playerId);
    expect(sanitizedComplete.votes?.[bob.playerId!]).toBe(bob.playerId);
    expect(sanitizedComplete.votes?.[charlie.playerId!]).toBe(bob.playerId);
  });

  it('awards no prediction points or crowns on split decision (every vote distinct)', () => {
    const { room, hostPlayerId, sessionToken: hostToken } = roomEngine.createRoom({
      gameId: 'most-likely-to',
      hostName: 'Alice',
      gameLength: 5,
    });

    const bob = roomEngine.joinRoom({ roomCode: room.roomCode, playerName: 'Bob' });
    const charlie = roomEngine.joinRoom({ roomCode: room.roomCode, playerName: 'Charlie' });

    roomEngine.dispatchAction({
      roomCode: room.roomCode,
      playerId: hostPlayerId,
      sessionToken: hostToken,
      action: 'START_GAME',
    });

    // Alice votes for Bob
    roomEngine.dispatchAction({
      roomCode: room.roomCode,
      playerId: hostPlayerId,
      sessionToken: hostToken,
      action: 'SUBMIT_VOTE',
      payload: { vote: bob.playerId },
    });

    // Bob votes for Charlie
    roomEngine.dispatchAction({
      roomCode: room.roomCode,
      playerId: bob.playerId!,
      sessionToken: bob.sessionToken!,
      action: 'SUBMIT_VOTE',
      payload: { vote: charlie.playerId },
    });

    // Charlie votes for Alice (1 vote each -> max is 1, less than 2 consensus requirement)
    const res = roomEngine.dispatchAction({
      roomCode: room.roomCode,
      playerId: charlie.playerId!,
      sessionToken: charlie.sessionToken!,
      action: 'SUBMIT_VOTE',
      payload: { vote: hostPlayerId },
    });

    expect(res.success).toBe(true);
    expect(res.room?.isVotingComplete).toBe(true);
    expect(res.room?.roundConsensusReached).toBe(false);
    expect(res.room?.roundWinners?.length).toBe(0);

    // No crowns or prediction points awarded
    expect(res.room?.players.every((p) => p.score === 0 && (p.crowns || 0) === 0)).toBe(true);
  });

  it('supports player reconnection with preserved state and tokens', () => {
    const { room, hostPlayerId, sessionToken } = roomEngine.createRoom({
      gameId: 'most-likely-to',
      hostName: 'Alex',
    });

    // Reconnecting with matching session token
    const reconnectRes = roomEngine.reconnectPlayer({
      roomCode: room.roomCode,
      playerId: hostPlayerId,
      sessionToken,
    });

    expect(reconnectRes.success).toBe(true);
    expect(reconnectRes.player?.name).toBe('Alex');
    expect(reconnectRes.player?.isConnected).toBe(true);
  });

  it('advances prompts through gameLength and transitions to finished standings', () => {
    const { room, hostPlayerId, sessionToken: hostToken } = roomEngine.createRoom({
      gameId: 'most-likely-to',
      hostName: 'Alice',
      gameLength: 5,
    });

    const bob = roomEngine.joinRoom({ roomCode: room.roomCode, playerName: 'Bob' });
    const charlie = roomEngine.joinRoom({ roomCode: room.roomCode, playerName: 'Charlie' });

    roomEngine.dispatchAction({
      roomCode: room.roomCode,
      playerId: hostPlayerId,
      sessionToken: hostToken,
      action: 'START_GAME',
    });

    expect(roomEngine.getRoom(room.roomCode)?.roundNumber).toBe(1);

    // Simulate rounds 1 through 4
    for (let round = 1; round < 5; round++) {
      // Cast votes
      roomEngine.dispatchAction({
        roomCode: room.roomCode,
        playerId: hostPlayerId,
        sessionToken: hostToken,
        action: 'SUBMIT_VOTE',
        payload: { vote: bob.playerId },
      });
      roomEngine.dispatchAction({
        roomCode: room.roomCode,
        playerId: bob.playerId!,
        sessionToken: bob.sessionToken!,
        action: 'SUBMIT_VOTE',
        payload: { vote: bob.playerId },
      });
      roomEngine.dispatchAction({
        roomCode: room.roomCode,
        playerId: charlie.playerId!,
        sessionToken: charlie.sessionToken!,
        action: 'SUBMIT_VOTE',
        payload: { vote: bob.playerId },
      });

      // Advance prompt
      const nextRes = roomEngine.dispatchAction({
        roomCode: room.roomCode,
        playerId: hostPlayerId,
        sessionToken: hostToken,
        action: 'NEXT_TURN',
      });
      expect(nextRes.success).toBe(true);
      expect(nextRes.room?.roundNumber).toBe(round + 1);
      expect(nextRes.room?.status).toBe('IN_PROGRESS');
    }

    // Now on round 5 (the last prompt)
    expect(roomEngine.getRoom(room.roomCode)?.roundNumber).toBe(5);

    // Final round voting
    roomEngine.dispatchAction({
      roomCode: room.roomCode,
      playerId: hostPlayerId,
      sessionToken: hostToken,
      action: 'SUBMIT_VOTE',
      payload: { vote: aliceIdVote(hostPlayerId) },
    });
    function aliceIdVote(id: string) { return id; }

    roomEngine.dispatchAction({
      roomCode: room.roomCode,
      playerId: bob.playerId!,
      sessionToken: bob.sessionToken!,
      action: 'SUBMIT_VOTE',
      payload: { vote: hostPlayerId },
    });
    roomEngine.dispatchAction({
      roomCode: room.roomCode,
      playerId: charlie.playerId!,
      sessionToken: charlie.sessionToken!,
      action: 'SUBMIT_VOTE',
      payload: { vote: hostPlayerId },
    });

    // Advance turn past max round (5) -> auto-finishes game!
    const finishRes = roomEngine.dispatchAction({
      roomCode: room.roomCode,
      playerId: hostPlayerId,
      sessionToken: hostToken,
      action: 'NEXT_TURN',
    });

    expect(finishRes.success).toBe(true);
    expect(finishRes.room?.status).toBe('finished');

    // Host can restart the match via RESTART_GAME
    const restartRes = roomEngine.dispatchAction({
      roomCode: room.roomCode,
      playerId: hostPlayerId,
      sessionToken: hostToken,
      action: 'RESTART_GAME',
    });

    expect(restartRes.success).toBe(true);
    expect(restartRes.room?.status).toBe('IN_PROGRESS');
    expect(restartRes.room?.roundNumber).toBe(1);
    expect(restartRes.room?.players.every((p) => p.score === 0 && (p.crowns || 0) === 0)).toBe(true);
  });
});

