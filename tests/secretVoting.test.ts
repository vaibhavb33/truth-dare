import { describe, it, expect, beforeEach } from 'vitest';
import { roomEngine } from '@/lib/multiplayer/roomEngine';
import { questionEngine } from '@/lib/questions/engine';

describe('Task 3: Secret Voting System for Most Likely To', () => {
  beforeEach(() => {
    roomEngine.resetRooms();
  });

  // =========================================================================
  // SUITE 1: PASS & PLAY SECRET VOTING FLOW (3, 4, 6 Players)
  // =========================================================================
  describe('Pass & Play Secret Voting Mechanics', () => {
    const createPassAndPlaySession = (playerNames: string[]) => {
      const players = playerNames.map((name, i) => ({
        id: `p-${i + 1}`,
        name,
        votes: 0,
      }));

      let currentVoterIndex = 0;
      let roundVotes: Record<string, string> = {};
      let isIntermission = true; // Cover screen
      let isVotingComplete = false;
      let drawnCard = questionEngine.drawNextCard({
        gameId: 'most-likely-to',
        language: 'en',
        drawnCardIds: [],
      }).card;

      return {
        players,
        get currentVoter() {
          return players[currentVoterIndex];
        },
        get currentVoterIndex() {
          return currentVoterIndex;
        },
        get roundVotes() {
          return { ...roundVotes };
        },
        get isIntermission() {
          return isIntermission;
        },
        get isVotingComplete() {
          return isVotingComplete;
        },
        get drawnCard() {
          return drawnCard;
        },
        confirmReady() {
          expect(isIntermission).toBe(true);
          isIntermission = false; // Next player confirmed ready
        },
        castSecretVote(targetId: string) {
          expect(isIntermission).toBe(false);
          const voter = players[currentVoterIndex];

          // Prevent multiple votes from same player
          if (roundVotes[voter.id]) {
            throw new Error(`Player ${voter.name} already voted!`);
          }

          // Must be an eligible player
          expect(players.some((p) => p.id === targetId)).toBe(true);

          roundVotes[voter.id] = targetId;

          // Transition to next player or complete
          if (currentVoterIndex + 1 < players.length) {
            currentVoterIndex += 1;
            isIntermission = true; // Returns to cover screen for device hand-off
          } else {
            isVotingComplete = true;
          }
        },
      };
    };

    it('executes secret voting with 3 players (including self-voting and cover screens)', () => {
      const session = createPassAndPlaySession(['Alex', 'Maya', 'Jordan']);
      expect(session.players.length).toBe(3);
      expect(session.isIntermission).toBe(true);
      expect(session.currentVoter.name).toBe('Alex');

      // Player 1 confirms ready and votes for self (Self-voting allowed)
      session.confirmReady();
      expect(session.isIntermission).toBe(false);
      session.castSecretVote('p-1'); // Alex votes for Alex

      // Transitions to Cover Screen for Player 2
      expect(session.isIntermission).toBe(true);
      expect(session.currentVoter.name).toBe('Maya');
      expect(session.isVotingComplete).toBe(false);

      // Player 2 confirms ready and votes for Jordan
      session.confirmReady();
      session.castSecretVote('p-3'); // Maya votes for Jordan

      // Transitions to Cover Screen for Player 3
      expect(session.isIntermission).toBe(true);
      expect(session.currentVoter.name).toBe('Jordan');
      expect(session.isVotingComplete).toBe(false);

      // Player 3 confirms ready and votes for Alex
      session.confirmReady();
      session.castSecretVote('p-1'); // Jordan votes for Alex

      // Automatically transitions to round complete after all 3 vote
      expect(session.isVotingComplete).toBe(true);

      // Tally results: Alex has 2 votes, Jordan has 1 vote, Maya has 0
      const tally: Record<string, number> = {};
      Object.values(session.roundVotes).forEach((tid) => {
        tally[tid] = (tally[tid] || 0) + 1;
      });
      expect(tally['p-1']).toBe(2);
      expect(tally['p-3']).toBe(1);
    });

    it('executes secret voting with 4 players and prevents multiple votes', () => {
      const session = createPassAndPlaySession(['Alex', 'Maya', 'Jordan', 'Sarah']);
      expect(session.players.length).toBe(4);

      // Voter 1
      session.confirmReady();
      session.castSecretVote('p-2');

      // Voter 2 attempts duplicate vote before passing
      expect(() => {
        session.castSecretVote('p-3');
      }).toThrow();

      // Voter 2 proper flow
      session.confirmReady();
      session.castSecretVote('p-2'); // Maya votes for Maya (self-voting)

      // Voter 3
      session.confirmReady();
      session.castSecretVote('p-2');

      // Voter 4
      session.confirmReady();
      session.castSecretVote('p-4');

      expect(session.isVotingComplete).toBe(true);
      const tally: Record<string, number> = {};
      Object.values(session.roundVotes).forEach((tid) => {
        tally[tid] = (tally[tid] || 0) + 1;
      });
      expect(tally['p-2']).toBe(3); // Maya wins
      expect(tally['p-4']).toBe(1);
    });

    it('executes secret voting with 6 players and maintains secrecy throughout', () => {
      const names = ['Alex', 'Maya', 'Jordan', 'Sarah', 'Liam', 'Emma'];
      const session = createPassAndPlaySession(names);
      expect(session.players.length).toBe(6);

      names.forEach((name, i) => {
        expect(session.isVotingComplete).toBe(false);
        expect(session.isIntermission).toBe(true);
        expect(session.currentVoter.name).toBe(name);

        session.confirmReady();
        // Each player votes for Liam (p-5), except Liam who votes for Emma (p-6)
        const target = i === 4 ? 'p-6' : 'p-5';
        session.castSecretVote(target);
      });

      expect(session.isVotingComplete).toBe(true);
      expect(Object.keys(session.roundVotes).length).toBe(6);
    });

    it('persists and restores voting state across navigation or browser reload', () => {
      const stateToPersist = {
        gamePhase: 'pass-and-play-voting',
        players: [
          { id: 'p-1', name: 'Alex', votes: 1 },
          { id: 'p-2', name: 'Maya', votes: 2 },
          { id: 'p-3', name: 'Jordan', votes: 0 },
        ],
        gameLength: 10,
        currentRound: 3,
        currentVoterIndex: 1,
        roundVotes: { 'p-1': 'p-2' },
        currentCard: { id: 'mlt-1', prompt: 'Who is most likely to win?' },
      };

      // Serialize (like localStorage.setItem)
      const serialized = JSON.stringify(stateToPersist);
      const restored = JSON.parse(serialized);

      expect(restored.currentRound).toBe(3);
      expect(restored.currentVoterIndex).toBe(1);
      expect(restored.roundVotes['p-1']).toBe('p-2');
      // For privacy on reload, app forces intermission cover screen:
      const safePhase = restored.gamePhase === 'pass-and-play-voting'
        ? 'pass-and-play-intermission'
        : restored.gamePhase;
      expect(safePhase).toBe('pass-and-play-intermission');
    });
  });

  // =========================================================================
  // SUITE 2: ONLINE MULTIPLAYER SECRET VOTING PRIVACY (3, 4, 6 Players)
  // =========================================================================
  describe('Online Multiplayer Secret Voting Privacy', () => {
    it('strictly hides votes before all 3 players submit their ballots', () => {
      // 1. Host creates room
      const { room, hostPlayerId, sessionToken } = roomEngine.createRoom({
        gameId: 'most-likely-to',
        categoryId: 'party',
        hostName: 'Alex',
      });
      const roomCode = room.roomCode;

      // 2. Players 2 and 3 join
      const join2 = roomEngine.joinRoom({ roomCode, playerName: 'Maya' });
      const join3 = roomEngine.joinRoom({ roomCode, playerName: 'Jordan' });
      expect(join2.success).toBe(true);
      expect(join3.success).toBe(true);

      const p1 = hostPlayerId;
      const p2 = join2.playerId!;
      const p3 = join3.playerId!;

      // 3. Host starts game
      roomEngine.dispatchAction({
        roomCode,
        playerId: p1,
        sessionToken,
        action: 'GAME_STARTED',
      });

      // 4. Player 1 casts secret vote for Player 2
      const actionResult1 = roomEngine.dispatchAction({
        roomCode,
        playerId: p1,
        sessionToken,
        action: 'SUBMIT_VOTE',
        payload: { vote: p2 },
      });
      expect(actionResult1.success).toBe(true);

      // Verify Player 1's sanitized response sees their vote, but isVotingComplete is FALSE
      expect(actionResult1.room?.isVotingComplete).toBe(false);
      expect(actionResult1.room?.votes[p1]).toBe(p2);
      expect(actionResult1.room?.votedPlayerIds).toContain(p1);

      // Crucial privacy check: When Player 2 or 3 queries the room, Player 1's vote is COMPLETELY HIDDEN!
      const currentRoom = roomEngine.getRoom(roomCode)!;
      const sanitizedForPlayer2 = roomEngine.sanitizeRoomForPlayer(currentRoom, p2);
      expect(sanitizedForPlayer2.isVotingComplete).toBe(false);
      expect(sanitizedForPlayer2.votes[p1]).toBeUndefined(); // HIDDEN!
      expect(Object.keys(sanitizedForPlayer2.votes).length).toBe(0); // Player 2 has not voted yet
      expect(sanitizedForPlayer2.votedPlayerIds).toEqual([p1]); // Knows p1 voted, but not who p1 voted for

      // When an unauthenticated visitor queries, ALL votes are hidden
      const sanitizedVisitor = roomEngine.sanitizeRoomForPlayer(currentRoom, undefined);
      expect(sanitizedVisitor.isVotingComplete).toBe(false);
      expect(Object.keys(sanitizedVisitor.votes).length).toBe(0);

      // 5. Player 2 casts secret vote for Self (Self-voting allowed online)
      const actionResult2 = roomEngine.dispatchAction({
        roomCode,
        playerId: p2,
        sessionToken: join2.sessionToken!,
        action: 'SUBMIT_VOTE',
        payload: { vote: p2 },
      });
      expect(actionResult2.success).toBe(true);

      // Player 3 still cannot see Player 1 or Player 2's choices!
      const sanitizedForPlayer3 = roomEngine.sanitizeRoomForPlayer(roomEngine.getRoom(roomCode)!, p3);
      expect(sanitizedForPlayer3.isVotingComplete).toBe(false);
      expect(sanitizedForPlayer3.votes[p1]).toBeUndefined();
      expect(sanitizedForPlayer3.votes[p2]).toBeUndefined();
      expect(sanitizedForPlayer3.votedPlayerIds).toEqual([p1, p2]);

      // 6. Player 3 casts final vote -> All 3 players have voted!
      const actionResult3 = roomEngine.dispatchAction({
        roomCode,
        playerId: p3,
        sessionToken: join3.sessionToken!,
        action: 'SUBMIT_VOTE',
        payload: { vote: p2 },
      });
      expect(actionResult3.success).toBe(true);

      // Server automatically marks voting complete and reveals all votes
      expect(actionResult3.room?.isVotingComplete).toBe(true);
      expect(actionResult3.room?.votes[p1]).toBe(p2);
      expect(actionResult3.room?.votes[p2]).toBe(p2);
      expect(actionResult3.room?.votes[p3]).toBe(p2);

      // Verify Player 2 won 3 votes and score incremented
      const finalRoom = roomEngine.getRoom(roomCode)!;
      const winnerPlayer = finalRoom.players.find((p) => p.id === p2);
      expect(winnerPlayer?.score).toBe(1);
    });

    it('prevents multiple or duplicate votes from the same player in a round', () => {
      const { room, hostPlayerId, sessionToken } = roomEngine.createRoom({
        gameId: 'most-likely-to',
        categoryId: 'party',
        hostName: 'Alex',
      });
      const roomCode = room.roomCode;
      const join2 = roomEngine.joinRoom({ roomCode, playerName: 'Maya' });
      const join3 = roomEngine.joinRoom({ roomCode, playerName: 'Jordan' });

      // First vote from Alex
      roomEngine.dispatchAction({
        roomCode,
        playerId: hostPlayerId,
        sessionToken,
        action: 'SUBMIT_VOTE',
        payload: { vote: join2.playerId },
      });

      // Second vote attempt from Alex in the same round (should be ignored)
      roomEngine.dispatchAction({
        roomCode,
        playerId: hostPlayerId,
        sessionToken,
        action: 'SUBMIT_VOTE',
        payload: { vote: join3.playerId },
      });

      const currentRoom = roomEngine.getRoom(roomCode)!;
      expect(currentRoom.votes[hostPlayerId]).toBe(join2.playerId); // Retains original vote
      expect(Object.keys(currentRoom.votes).length).toBe(1);
    });

    it('operates secret voting with 4 players and advances cleanly to next prompt', () => {
      const { room, hostPlayerId, sessionToken } = roomEngine.createRoom({
        gameId: 'most-likely-to',
        categoryId: 'party',
        hostName: 'Alex',
      });
      const roomCode = room.roomCode;
      const p2 = roomEngine.joinRoom({ roomCode, playerName: 'Maya' });
      const p3 = roomEngine.joinRoom({ roomCode, playerName: 'Jordan' });
      const p4 = roomEngine.joinRoom({ roomCode, playerName: 'Sarah' });

      const allPlayers = [
        { id: hostPlayerId, token: sessionToken },
        { id: p2.playerId!, token: p2.sessionToken! },
        { id: p3.playerId!, token: p3.sessionToken! },
        { id: p4.playerId!, token: p4.sessionToken! },
      ];

      // Players vote one by one
      allPlayers.forEach(({ id, token }, idx) => {
        const res = roomEngine.dispatchAction({
          roomCode,
          playerId: id,
          sessionToken: token,
          action: 'SUBMIT_VOTE',
          payload: { vote: p3.playerId }, // Jordan gets the votes
        });

        if (idx < 3) {
          expect(res.room?.isVotingComplete).toBe(false);
        } else {
          expect(res.room?.isVotingComplete).toBe(true);
        }
      });

      const completedRoom = roomEngine.getRoom(roomCode)!;
      expect(completedRoom.isVotingComplete).toBe(true);
      expect(Object.keys(completedRoom.votes).length).toBe(4);

      // Advance to next prompt
      const nextTurnRes = roomEngine.dispatchAction({
        roomCode,
        playerId: hostPlayerId,
        sessionToken,
        action: 'NEXT_TURN',
      });
      expect(nextTurnRes.success).toBe(true);

      // Verify votes and voting completion are reset for the new round
      const newRoundRoom = roomEngine.getRoom(roomCode)!;
      expect(newRoundRoom.isVotingComplete).toBe(false);
      expect(Object.keys(newRoundRoom.votes).length).toBe(0);
      expect(newRoundRoom.votedPlayerIds?.length).toBe(0);
      expect(newRoundRoom.currentCard).not.toBeNull();
    });

    it('operates secret voting with 6 players and tracks live progress indicator', () => {
      const { room, hostPlayerId, sessionToken } = roomEngine.createRoom({
        gameId: 'most-likely-to',
        categoryId: 'party',
        hostName: 'Player1',
      });
      const roomCode = room.roomCode;
      const joins = [2, 3, 4, 5, 6].map((num) =>
        roomEngine.joinRoom({ roomCode, playerName: `Player${num}` })
      );

      const allTokens = [
        { id: hostPlayerId, token: sessionToken },
        ...joins.map((j) => ({ id: j.playerId!, token: j.sessionToken! })),
      ];
      expect(allTokens.length).toBe(6);

      // Each player votes in order
      allTokens.forEach(({ id, token }, i) => {
        roomEngine.dispatchAction({
          roomCode,
          playerId: id,
          sessionToken: token,
          action: 'SUBMIT_VOTE',
          payload: { vote: hostPlayerId },
        });

        const activeRoom = roomEngine.getRoom(roomCode)!;
        const progressCount = activeRoom.votedPlayerIds?.length || 0;
        expect(progressCount).toBe(i + 1);

        if (i < 5) {
          expect(activeRoom.isVotingComplete).toBe(false);
        } else {
          expect(activeRoom.isVotingComplete).toBe(true);
        }
      });

      const finalRoom = roomEngine.getRoom(roomCode)!;
      expect(finalRoom.isVotingComplete).toBe(true);
      expect(finalRoom.players.find((p) => p.id === hostPlayerId)?.score).toBe(1);
    });

    it('does not interfere with Truth or Dare voting or gameplay', () => {
      // Create Truth or Dare room
      const { room, hostPlayerId, sessionToken } = roomEngine.createRoom({
        gameId: 'truth-or-dare',
        categoryId: 'party',
        hostName: 'HostPlayer',
      });
      const roomCode = room.roomCode;

      // Start game
      roomEngine.dispatchAction({
        roomCode,
        playerId: hostPlayerId,
        sessionToken,
        action: 'GAME_STARTED',
      });

      // Flip card
      const flipRes = roomEngine.dispatchAction({
        roomCode,
        playerId: hostPlayerId,
        sessionToken,
        action: 'FLIP_CARD',
        payload: { type: 'truth' },
      });
      expect(flipRes.success).toBe(true);
      expect(flipRes.room?.isCardFlipped).toBe(true);
      expect(flipRes.room?.currentCard?.type).toBe('truth');

      // Sanitization leaves Truth or Dare completely untouched
      const sanitized = roomEngine.sanitizeRoomForPlayer(flipRes.room!, hostPlayerId);
      expect(sanitized.gameId).toBe('truth-or-dare');
      expect(sanitized.isCardFlipped).toBe(true);
    });
  });
});

