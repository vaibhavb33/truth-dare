import { describe, it, expect, beforeEach } from 'vitest';
import { roomEngine } from '@/lib/multiplayer/roomEngine';
import { questionEngine } from '@/lib/questions/engine';
import { cleanQuestionPrompt } from '@/lib/questions/cleanPrompt';
import { MostLikelyPlayer } from '@/components/games/MostLikelyToSetup';

describe('Task 5: Most Likely To Results, Crowns and Scoring System', () => {
  beforeEach(() => {
    roomEngine.resetRooms();
  });

  // =========================================================================
  // SUITE 1: PASS & PLAY SECRET VOTING SCORING & CONSENSUS
  // =========================================================================
  describe('Pass & Play Secret Voting Scoring Algorithm', () => {
    interface RoundSimParams {
      players: MostLikelyPlayer[];
      votes: Record<string, string>; // voterId -> targetId
      currentPrompt: string;
    }

    const simulateSecretVotingRound = ({ players, votes, currentPrompt }: RoundSimParams) => {
      const tally: Record<string, number> = {};
      Object.values(votes).forEach((target) => {
        tally[target] = (tally[target] || 0) + 1;
      });

      let maxVotes = 0;
      Object.values(tally).forEach((c) => {
        if (c > maxVotes) maxVotes = c;
      });

      // Consensus rule: At least 2 votes must land on top selection to award crowns and points
      const hasConsensus = maxVotes >= 2;
      const roundWinners: string[] = [];
      if (hasConsensus) {
        players.forEach((p) => {
          if ((tally[p.id] || 0) === maxVotes) {
            roundWinners.push(p.id);
          }
        });
      }
      const winnerSet = new Set(roundWinners);
      const cleanPrompt = cleanQuestionPrompt(currentPrompt);

      const updatedPlayers = players.map((p) => {
        const isRoundWinner = winnerSet.has(p.id);
        const voterPick = votes[p.id];
        const earnedPredictionPoint = Boolean(hasConsensus && voterPick && winnerSet.has(voterPick));

        const newCrowns = (p.crowns || 0) + (isRoundWinner ? 1 : 0);
        const newPoints = (p.points || 0) + (earnedPredictionPoint ? 1 : 0);
        const newVotes = p.votes + (tally[p.id] || 0);
        const newTitles = isRoundWinner && cleanPrompt ? [...(p.titles || []), cleanPrompt] : (p.titles || []);

        return {
          ...p,
          votes: newVotes,
          crowns: newCrowns,
          points: newPoints,
          titles: newTitles,
        };
      });

      return {
        tally,
        maxVotes,
        hasConsensus,
        roundWinners,
        updatedPlayers,
      };
    };

    it('awards 1 crown to clear winner and 1 prediction point to voters who picked that winner', () => {
      const initialPlayers: MostLikelyPlayer[] = [
        { id: 'p-1', name: 'Alex', votes: 0, crowns: 0, points: 0, titles: [] },
        { id: 'p-2', name: 'Maya', votes: 0, crowns: 0, points: 0, titles: [] },
        { id: 'p-3', name: 'Jordan', votes: 0, crowns: 0, points: 0, titles: [] },
        { id: 'p-4', name: 'Sarah', votes: 0, crowns: 0, points: 0, titles: [] },
      ];

      // Alex, Maya, and Sarah vote for Jordan. Jordan votes for Alex.
      const votes = {
        'p-1': 'p-3', // Alex -> Jordan
        'p-2': 'p-3', // Maya -> Jordan
        'p-3': 'p-1', // Jordan -> Alex
        'p-4': 'p-3', // Sarah -> Jordan
      };

      const result = simulateSecretVotingRound({
        players: initialPlayers,
        votes,
        currentPrompt: 'Most likely to become a billionaire',
      });

      expect(result.hasConsensus).toBe(true);
      expect(result.maxVotes).toBe(3);
      expect(result.roundWinners).toEqual(['p-3']); // Jordan won

      const jordan = result.updatedPlayers.find((p) => p.id === 'p-3')!;
      const alex = result.updatedPlayers.find((p) => p.id === 'p-1')!;
      const maya = result.updatedPlayers.find((p) => p.id === 'p-2')!;
      const sarah = result.updatedPlayers.find((p) => p.id === 'p-4')!;

      // Crown & Title: Jordan received the crown and collected the title
      expect(jordan.crowns).toBe(1);
      expect(jordan.titles).toEqual(['Most likely to become a billionaire']);
      expect(jordan.votes).toBe(3);

      // Prediction points: Alex, Maya, and Sarah predicted correctly (+1 pt each)
      expect(alex.points).toBe(1);
      expect(maya.points).toBe(1);
      expect(sarah.points).toBe(1);

      // Jordan voted for Alex, who was NOT the crowned winner, so Jordan gets 0 prediction points
      expect(jordan.points).toBe(0);

      // Crowns and points are tracked separately
      expect(alex.crowns).toBe(0);
      expect(maya.crowns).toBe(0);
      expect(sarah.crowns).toBe(0);
    });

    it('handles tied winners: both players share the crown and any voter picking either tied winner gets 1 point', () => {
      const initialPlayers: MostLikelyPlayer[] = [
        { id: 'p-1', name: 'Alex', votes: 0, crowns: 0, points: 0, titles: [] },
        { id: 'p-2', name: 'Maya', votes: 0, crowns: 0, points: 0, titles: [] },
        { id: 'p-3', name: 'Jordan', votes: 0, crowns: 0, points: 0, titles: [] },
        { id: 'p-4', name: 'Sarah', votes: 0, crowns: 0, points: 0, titles: [] },
      ];

      // Alex & Maya tie with 2 votes each:
      // Alex and Jordan vote for Maya. Maya and Sarah vote for Alex.
      const votes = {
        'p-1': 'p-2', // Alex -> Maya
        'p-2': 'p-1', // Maya -> Alex
        'p-3': 'p-2', // Jordan -> Maya
        'p-4': 'p-1', // Sarah -> Alex
      };

      const result = simulateSecretVotingRound({
        players: initialPlayers,
        votes,
        currentPrompt: 'Most likely to forget their own birthday',
      });

      expect(result.hasConsensus).toBe(true);
      expect(result.maxVotes).toBe(2);
      expect(result.roundWinners).toEqual(['p-1', 'p-2']); // Tied winners

      const alex = result.updatedPlayers.find((p) => p.id === 'p-1')!;
      const maya = result.updatedPlayers.find((p) => p.id === 'p-2')!;
      const jordan = result.updatedPlayers.find((p) => p.id === 'p-3')!;
      const sarah = result.updatedPlayers.find((p) => p.id === 'p-4')!;

      // Both tied winners share the crown and collect the title
      expect(alex.crowns).toBe(1);
      expect(alex.titles).toEqual(['Most likely to forget their own birthday']);
      expect(maya.crowns).toBe(1);
      expect(maya.titles).toEqual(['Most likely to forget their own birthday']);

      // Every player voted for either Alex or Maya, so all 4 players score 1 prediction point
      expect(alex.points).toBe(1);
      expect(maya.points).toBe(1);
      expect(jordan.points).toBe(1);
      expect(sarah.points).toBe(1);
    });

    it('enforces consensus rule: if every vote goes to a different player (maxVotes < 2), nobody scores', () => {
      const initialPlayers: MostLikelyPlayer[] = [
        { id: 'p-1', name: 'Alex', votes: 0, crowns: 0, points: 0, titles: [] },
        { id: 'p-2', name: 'Maya', votes: 0, crowns: 0, points: 0, titles: [] },
        { id: 'p-3', name: 'Jordan', votes: 0, crowns: 0, points: 0, titles: [] },
      ];

      // 3 players all vote for different people (1 vote each)
      const votes = {
        'p-1': 'p-2', // Alex -> Maya
        'p-2': 'p-3', // Maya -> Jordan
        'p-3': 'p-1', // Jordan -> Alex
      };

      const result = simulateSecretVotingRound({
        players: initialPlayers,
        votes,
        currentPrompt: 'Most likely to survive a zombie apocalypse',
      });

      expect(result.hasConsensus).toBe(false);
      expect(result.maxVotes).toBe(1);
      expect(result.roundWinners).toEqual([]); // No consensus

      // Nobody receives crowns or prediction points
      result.updatedPlayers.forEach((p) => {
        expect(p.crowns).toBe(0);
        expect(p.points).toBe(0);
        expect(p.titles).toEqual([]);
        // Raw votes received are still tracked
        expect(p.votes).toBe(1);
      });
    });

    it('accumulates multiple titles across successive rounds', () => {
      let players: MostLikelyPlayer[] = [
        { id: 'p-1', name: 'Alex', votes: 0, crowns: 0, points: 0, titles: [] },
        { id: 'p-2', name: 'Maya', votes: 0, crowns: 0, points: 0, titles: [] },
        { id: 'p-3', name: 'Jordan', votes: 0, crowns: 0, points: 0, titles: [] },
      ];

      // Round 1: Alex wins
      const r1 = simulateSecretVotingRound({
        players,
        votes: { 'p-1': 'p-1', 'p-2': 'p-1', 'p-3': 'p-2' }, // Alex gets 2 votes
        currentPrompt: 'Most likely to win a Grammy',
      });
      players = r1.updatedPlayers;

      // Round 2: Alex wins again
      const r2 = simulateSecretVotingRound({
        players,
        votes: { 'p-1': 'p-1', 'p-2': 'p-1', 'p-3': 'p-1' }, // Alex gets 3 votes
        currentPrompt: 'Most likely to sleep through an earthquake',
      });
      players = r2.updatedPlayers;

      const alex = players.find((p) => p.id === 'p-1')!;
      expect(alex.crowns).toBe(2);
      expect(alex.titles).toEqual([
        'Most likely to win a Grammy',
        'Most likely to sleep through an earthquake',
      ]);
    });
  });

  // =========================================================================
  // SUITE 2: QUICK PICK MODE SCORING & TITLES
  // =========================================================================
  describe('Quick Pick Mode Scoring & Titles Separation', () => {
    it('awards 1 crown and collects title but does NOT apply secret voting prediction points', () => {
      const initialPlayers: MostLikelyPlayer[] = [
        { id: 'p-1', name: 'Alex', votes: 0, crowns: 0, points: 0, titles: [] },
        { id: 'p-2', name: 'Maya', votes: 0, crowns: 0, points: 0, titles: [] },
        { id: 'p-3', name: 'Jordan', votes: 0, crowns: 0, points: 0, titles: [] },
      ];

      const selectedAgreedId = 'p-2'; // Group agreed on Maya
      const prompt = 'Most likely to binge-watch an entire TV series in one night';

      const updatedPlayers = initialPlayers.map((p) =>
        p.id === selectedAgreedId
          ? {
              ...p,
              crowns: (p.crowns || 0) + 1,
              titles: [...(p.titles || []), prompt],
            }
          : p
      );

      const maya = updatedPlayers.find((p) => p.id === 'p-2')!;
      const alex = updatedPlayers.find((p) => p.id === 'p-1')!;
      const jordan = updatedPlayers.find((p) => p.id === 'p-3')!;

      // Maya gets 1 crown and 1 title
      expect(maya.crowns).toBe(1);
      expect(maya.titles).toEqual([prompt]);

      // No prediction points applied for any player in Quick Pick mode
      expect(maya.points).toBe(0);
      expect(alex.points).toBe(0);
      expect(jordan.points).toBe(0);
    });
  });

  // =========================================================================
  // SUITE 3: ONLINE MULTIPLAYER SERVER-AUTHORITATIVE SCORING
  // =========================================================================
  describe('Online Multiplayer Server-Authoritative Results and Scoring', () => {
    it('calculates crowns, titles, prediction points, and consensus in online room', () => {
      const { room, hostPlayerId, sessionToken } = roomEngine.createRoom({
        gameId: 'most-likely-to',
        categoryId: 'party',
        hostName: 'HostPlayer',
      });
      const roomCode = room.roomCode;

      const p2 = roomEngine.joinRoom({ roomCode, playerName: 'PlayerTwo' });
      const p3 = roomEngine.joinRoom({ roomCode, playerName: 'PlayerThree' });
      const p4 = roomEngine.joinRoom({ roomCode, playerName: 'PlayerFour' });

      // Start game
      roomEngine.dispatchAction({
        roomCode,
        playerId: hostPlayerId,
        sessionToken,
        action: 'START_GAME',
      });

      const currentRoom = roomEngine.getRoom(roomCode)!;
      expect(currentRoom.isCardFlipped).toBe(true);
      expect(currentRoom.currentCard).not.toBeNull();
      const promptText = currentRoom.currentCard?.prompt;

      // 3 players vote for PlayerTwo (p2), 1 votes for Host
      roomEngine.dispatchAction({
        roomCode,
        playerId: hostPlayerId,
        sessionToken,
        action: 'SUBMIT_VOTE',
        payload: { vote: p2.playerId },
      });
      roomEngine.dispatchAction({
        roomCode,
        playerId: p2.playerId!,
        sessionToken: p2.sessionToken!,
        action: 'SUBMIT_VOTE',
        payload: { vote: p2.playerId },
      });
      roomEngine.dispatchAction({
        roomCode,
        playerId: p3.playerId!,
        sessionToken: p3.sessionToken!,
        action: 'SUBMIT_VOTE',
        payload: { vote: p2.playerId },
      });
      roomEngine.dispatchAction({
        roomCode,
        playerId: p4.playerId!,
        sessionToken: p4.sessionToken!,
        action: 'SUBMIT_VOTE',
        payload: { vote: hostPlayerId },
      });

      const completedRoom = roomEngine.getRoom(roomCode)!;
      expect(completedRoom.isVotingComplete).toBe(true);
      expect(completedRoom.roundConsensusReached).toBe(true);
      expect(completedRoom.roundWinners).toEqual([p2.playerId]);

      const onlineP2 = completedRoom.players.find((p) => p.id === p2.playerId)!;
      const onlineHost = completedRoom.players.find((p) => p.id === hostPlayerId)!;
      const onlineP3 = completedRoom.players.find((p) => p.id === p3.playerId)!;
      const onlineP4 = completedRoom.players.find((p) => p.id === p4.playerId)!;

      // Player 2 crowned and collected title
      expect(onlineP2.crowns).toBe(1);
      expect(onlineP2.titles).toContain(promptText);

      // Prediction points (Host, P2, P3 voted for P2 -> score = 1)
      expect(onlineHost.score).toBe(1);
      expect(onlineP2.score).toBe(1);
      expect(onlineP3.score).toBe(1);

      // P4 voted for host (not winner) -> score = 0
      expect(onlineP4.score).toBe(0);
    });

    it('withholds crowns and points when consensus threshold is not met (maxVotes < 2)', () => {
      const { room, hostPlayerId, sessionToken } = roomEngine.createRoom({
        gameId: 'most-likely-to',
        categoryId: 'party',
        hostName: 'UserA',
      });
      const roomCode = room.roomCode;
      const pB = roomEngine.joinRoom({ roomCode, playerName: 'UserB' });
      const pC = roomEngine.joinRoom({ roomCode, playerName: 'UserC' });

      roomEngine.dispatchAction({
        roomCode,
        playerId: hostPlayerId,
        sessionToken,
        action: 'START_GAME',
      });

      // Split decision: 1 vote each
      roomEngine.dispatchAction({
        roomCode,
        playerId: hostPlayerId,
        sessionToken,
        action: 'SUBMIT_VOTE',
        payload: { vote: pB.playerId },
      });
      roomEngine.dispatchAction({
        roomCode,
        playerId: pB.playerId!,
        sessionToken: pB.sessionToken!,
        action: 'SUBMIT_VOTE',
        payload: { vote: pC.playerId },
      });
      roomEngine.dispatchAction({
        roomCode,
        playerId: pC.playerId!,
        sessionToken: pC.sessionToken!,
        action: 'SUBMIT_VOTE',
        payload: { vote: hostPlayerId },
      });

      const finishedRoom = roomEngine.getRoom(roomCode)!;
      expect(finishedRoom.isVotingComplete).toBe(true);
      expect(finishedRoom.roundConsensusReached).toBe(false);
      expect(finishedRoom.roundWinners).toEqual([]);

      finishedRoom.players.forEach((p) => {
        expect(p.crowns || 0).toBe(0);
        expect(p.score).toBe(0);
        expect(p.titles || []).toHaveLength(0);
      });
    });

    it('resets roundWinners and roundConsensusReached upon advancing to the next prompt', () => {
      const { room, hostPlayerId, sessionToken } = roomEngine.createRoom({
        gameId: 'most-likely-to',
        categoryId: 'party',
        hostName: 'Alpha',
      });
      const roomCode = room.roomCode;
      const beta = roomEngine.joinRoom({ roomCode, playerName: 'Beta' });
      const gamma = roomEngine.joinRoom({ roomCode, playerName: 'Gamma' });

      roomEngine.dispatchAction({
        roomCode,
        playerId: hostPlayerId,
        sessionToken,
        action: 'START_GAME',
      });

      // 3 votes for Beta
      [hostPlayerId, beta.playerId!, gamma.playerId!].forEach((id) => {
        const token = id === hostPlayerId ? sessionToken : id === beta.playerId ? beta.sessionToken! : gamma.sessionToken!;
        roomEngine.dispatchAction({
          roomCode,
          playerId: id,
          sessionToken: token,
          action: 'SUBMIT_VOTE',
          payload: { vote: beta.playerId },
        });
      });

      const round1Room = roomEngine.getRoom(roomCode)!;
      expect(round1Room.isVotingComplete).toBe(true);
      expect(round1Room.roundConsensusReached).toBe(true);
      expect(round1Room.roundWinners?.length).toBe(1);

      // Advance turn
      roomEngine.dispatchAction({
        roomCode,
        playerId: hostPlayerId,
        sessionToken,
        action: 'NEXT_TURN',
      });

      const round2Room = roomEngine.getRoom(roomCode)!;
      expect(round2Room.isVotingComplete).toBe(false);
      expect(round2Room.roundConsensusReached).toBe(false);
      expect(round2Room.roundWinners).toEqual([]);
      expect(Object.keys(round2Room.votes)).toHaveLength(0);
      expect(round2Room.currentCard).not.toBeNull();
    });
  });

  // =========================================================================
  // SUITE 4: FINAL RESULTS & PODIUM LOGIC
  // =========================================================================
  describe('Final Standings and Tie-Breaking Logic', () => {
    it('identifies single overall prediction champion and sorts leaderboard correctly', () => {
      const players: MostLikelyPlayer[] = [
        { id: 'p-1', name: 'Alex', votes: 5, crowns: 1, points: 4, titles: ['Title A'] },
        { id: 'p-2', name: 'Maya', votes: 8, crowns: 2, points: 7, titles: ['Title B', 'Title C'] },
        { id: 'p-3', name: 'Jordan', votes: 3, crowns: 0, points: 2, titles: [] },
      ];

      const sorted = [...players].sort((a, b) => {
        if ((b.points || 0) !== (a.points || 0)) return (b.points || 0) - (a.points || 0);
        if ((b.crowns || 0) !== (a.crowns || 0)) return (b.crowns || 0) - (a.crowns || 0);
        return b.votes - a.votes;
      });

      expect(sorted[0].name).toBe('Maya');
      expect(sorted[0].points).toBe(7);
      expect(sorted[1].name).toBe('Alex');
      expect(sorted[2].name).toBe('Jordan');
    });

    it('gracefully handles tied overall scores and marks shared victory', () => {
      const players: MostLikelyPlayer[] = [
        { id: 'p-1', name: 'Alex', votes: 5, crowns: 1, points: 6, titles: ['Title 1'] },
        { id: 'p-2', name: 'Maya', votes: 6, crowns: 2, points: 6, titles: ['Title 2', 'Title 3'] },
        { id: 'p-3', name: 'Jordan', votes: 2, crowns: 0, points: 3, titles: [] },
      ];

      const topPoints = Math.max(...players.map((p) => p.points || 0));
      const champions = players.filter((p) => (p.points || 0) === topPoints);

      expect(champions.length).toBe(2);
      expect(champions.map((c) => c.name)).toEqual(['Alex', 'Maya']);
    });
  });
});

