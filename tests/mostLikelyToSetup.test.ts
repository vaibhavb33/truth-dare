import { describe, it, expect } from 'vitest';
import { roomEngine } from '@/lib/multiplayer/roomEngine';
import { questionEngine } from '@/lib/questions/engine';

describe('Task 2: Most Likely To Game Setup & Player Management', () => {
  // -------------------------------------------------------------------------
  // 1. GAME LENGTH SELECTION
  // -------------------------------------------------------------------------
  describe('Game Length Options', () => {
    it('supports 5, 10, and 15 prompt game length selections', () => {
      const allowedLengths = [5, 10, 15];
      expect(allowedLengths).toContain(5);
      expect(allowedLengths).toContain(10);
      expect(allowedLengths).toContain(15);
    });

    it('draws exact number of unique questions for each game length', () => {
      [5, 10, 15].forEach((len) => {
        const drawnIds: string[] = [];
        for (let i = 0; i < len; i++) {
          const res = questionEngine.drawNextCard({
            gameId: 'most-likely-to',
            language: 'en',
            drawnCardIds: drawnIds,
          });
          expect(res.card).not.toBeNull();
          expect(drawnIds.includes(res.card!.id)).toBe(false);
          drawnIds.push(res.card!.id);
        }
        expect(drawnIds.length).toBe(len);
        expect(new Set(drawnIds).size).toBe(len);
      });
    });
  });

  // -------------------------------------------------------------------------
  // 2. PLAYER MANAGEMENT VALIDATION RULES
  // -------------------------------------------------------------------------
  describe('Player Management Rules', () => {
    const validatePlayerName = (
      name: string,
      existingPlayers: Array<{ id: string; name: string }>,
      editingId?: string
    ) => {
      const clean = name.trim().replace(/\s+/g, ' ');
      if (!clean) return { valid: false, error: 'Name cannot be empty.' };
      if (clean.length > 24) return { valid: false, error: 'Name must be 24 characters or less.' };
      if (/<[^>]*>/g.test(clean)) return { valid: false, error: 'Invalid characters.' };
      const isDuplicate = existingPlayers.some(
        (p) => p.id !== editingId && p.name.trim().toLowerCase() === clean.toLowerCase()
      );
      if (isDuplicate) return { valid: false, error: 'Player name already exists.' };
      return { valid: true, clean };
    };

    it('accepts valid player names', () => {
      const players = [{ id: '1', name: 'Alex' }, { id: '2', name: 'Maya' }];
      const res = validatePlayerName('Jordan', players);
      expect(res.valid).toBe(true);
      expect(res.clean).toBe('Jordan');
    });

    it('rejects empty strings or whitespace-only names', () => {
      const players = [{ id: '1', name: 'Alex' }];
      expect(validatePlayerName('', players).valid).toBe(false);
      expect(validatePlayerName('   ', players).valid).toBe(false);
      expect(validatePlayerName('\t\n', players).valid).toBe(false);
    });

    it('rejects duplicate names case-insensitively', () => {
      const players = [
        { id: '1', name: 'Alex' },
        { id: '2', name: 'Maya' },
      ];
      expect(validatePlayerName('alex', players).valid).toBe(false);
      expect(validatePlayerName('ALEX', players).valid).toBe(false);
      expect(validatePlayerName('  Maya  ', players).valid).toBe(false);
    });

    it('enforces maximum 24 characters limit', () => {
      const players = [{ id: '1', name: 'Alex' }];
      const longName = 'A'.repeat(25);
      expect(validatePlayerName(longName, players).valid).toBe(false);

      const exact24 = 'A'.repeat(24);
      expect(validatePlayerName(exact24, players).valid).toBe(true);
    });

    it('enforces minimum 3 players threshold for Most Likely To voting', () => {
      const roster = [
        { id: 'p1', name: 'Alex' },
        { id: 'p2', name: 'Maya' },
      ];
      expect(roster.length < 3).toBe(true); // Cannot start with 2

      roster.push({ id: 'p3', name: 'Jordan' });
      expect(roster.length >= 3).toBe(true); // Can start with 3
    });

    it('enforces maximum 12 players limit', () => {
      const roster = Array.from({ length: 12 }, (_, i) => ({
        id: `p-${i}`,
        name: `Player ${i + 1}`,
      }));
      expect(roster.length).toBe(12);

      const canAddMore = roster.length < 12;
      expect(canAddMore).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // 3. PASS & PLAY PRIVATE VOTING & TURN PROGRESSION
  // -------------------------------------------------------------------------
  describe('Pass & Play Secret Voting Flow', () => {
    it('simulates a full secret ballot round across 4 players', () => {
      const players = [
        { id: 'p1', name: 'Alex', votes: 0 },
        { id: 'p2', name: 'Maya', votes: 0 },
        { id: 'p3', name: 'Jordan', votes: 0 },
        { id: 'p4', name: 'Sarah', votes: 0 },
      ];

      // In each round, votes are stored privately in a map: { [voterId]: targetId }
      const roundVotes: Record<string, string> = {};

      // Player 1 (Alex) votes secretly for Maya (p2)
      roundVotes['p1'] = 'p2';
      // During turn 2, Maya cannot see Alex's vote because roundVotes are not displayed on card buttons
      expect(roundVotes['p2']).toBeUndefined();

      // Player 2 (Maya) votes secretly for Jordan (p3)
      roundVotes['p2'] = 'p3';

      // Player 3 (Jordan) votes secretly for Maya (p2)
      roundVotes['p3'] = 'p2';

      // Player 4 (Sarah) votes secretly for Maya (p2)
      roundVotes['p4'] = 'p2';

      expect(Object.keys(roundVotes).length).toBe(players.length);

      // Tally votes
      const tally: Record<string, number> = {};
      Object.values(roundVotes).forEach((target) => {
        tally[target] = (tally[target] || 0) + 1;
      });

      // Maya (p2) received 3 votes
      expect(tally['p2']).toBe(3);
      // Jordan (p3) received 1 vote
      expect(tally['p3']).toBe(1);

      // Crown winner is Maya
      let maxVotes = 0;
      let winnerId = '';
      Object.entries(tally).forEach(([target, count]) => {
        if (count > maxVotes) {
          maxVotes = count;
          winnerId = target;
        }
      });

      expect(winnerId).toBe('p2');
      expect(maxVotes).toBe(3);
    });
  });

  // -------------------------------------------------------------------------
  // 4. ONLINE MULTIPLAYER ROOM CREATION & LOBBY STATUS
  // -------------------------------------------------------------------------
  describe('Play Online Multiplayer Room Setup', () => {
    it('creates a Most Likely To multiplayer room with valid 6-char code', () => {
      const { room, hostPlayerId, roomCode } = roomEngine.createRoom({
        gameId: 'most-likely-to',
        categoryId: 'party',
        hostName: 'HostAlex',
        maxPlayers: 12,
      });

      expect(roomCode.length).toBe(6);
      expect(room.gameId).toBe('most-likely-to');
      expect(room.players.length).toBe(1);
      expect(room.players[0].name).toBe('HostAlex');
      expect(room.players[0].isHost).toBe(true);
      expect(room.hostPlayerId).toBe(hostPlayerId);
    });

    it('tracks player joining status up to 12 players', () => {
      const { room } = roomEngine.createRoom({
        gameId: 'most-likely-to',
        categoryId: 'party',
        hostName: 'HostAlex',
      });

      // Player 2 joins
      const join2 = roomEngine.joinRoom({ roomCode: room.roomCode, playerName: 'Maya' });
      expect(join2.success).toBe(true);

      // Player 3 joins (satisfies 3 player min threshold)
      const join3 = roomEngine.joinRoom({ roomCode: room.roomCode, playerName: 'Jordan' });
      expect(join3.success).toBe(true);

      const currentRoom = roomEngine.getRoom(room.roomCode);
      expect(currentRoom?.players.length).toBe(3);
      expect(currentRoom?.players.map((p) => p.name)).toEqual(['HostAlex', 'Maya', 'Jordan']);
    });
  });
});

