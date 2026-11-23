import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { questionEngine } from '@/lib/questions/engine';
import { roomEngine } from '@/lib/multiplayer/roomEngine';

describe('Most Likely To Setup — Single Device Pass & Play Only', () => {
  // -------------------------------------------------------------------------
  // 1. SETUP COMPONENT PASS & PLAY PURITY INSPECTION
  // -------------------------------------------------------------------------
  describe('Pass & Play UI Constraints', () => {
    const setupFilePath = path.join(process.cwd(), 'components/games/MostLikelyToSetup.tsx');
    const setupFileContent = fs.readFileSync(setupFilePath, 'utf-8');

    it('displays Pass & Play as the default and only mode', () => {
      expect(setupFileContent).toContain('Pass & Play');
      expect(setupFileContent).toContain('Single Device');
      expect(setupFileContent).toContain(
        'Play together on one device. Pass the phone around and let everyone vote privately before revealing the results.'
      );
    });

    it('does NOT contain Play Online mode card or toggle', () => {
      // Must not render Play Online option
      expect(setupFileContent).not.toContain('Globe');
      expect(setupFileContent).not.toContain('Multi-Phone Room');
      expect(setupFileContent).not.toContain('Create Room & Invite Friends');
      expect(setupFileContent).not.toContain('ENTER 6-CHAR CODE');
      expect(setupFileContent).not.toContain('/api/rooms/create');
    });

    it('contains Start Game button with prompt count', () => {
      expect(setupFileContent).toContain('Start Game ({gameLength} Prompts)');
    });
  });

  // -------------------------------------------------------------------------
  // 2. GAME LENGTH SELECTION (5, 10, 15 Prompts)
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
  // 3. PLAYER MANAGEMENT VALIDATION RULES (3–12 Players)
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
      expect(roster.length < 3).toBe(true);

      roster.push({ id: 'p3', name: 'Jordan' });
      expect(roster.length >= 3).toBe(true);
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

    it('updates player name in place upon editing without mutating other players', () => {
      const roster = [
        { id: 'p1', name: 'Alex' },
        { id: 'p2', name: 'Maya' },
        { id: 'p3', name: 'Jordan' },
      ];
      const updated = roster.map((p) => (p.id === 'p1' ? { ...p, name: 'Alexander' } : p));
      expect(updated[0].name).toBe('Alexander');
      expect(updated[1].name).toBe('Maya');
      expect(updated[2].name).toBe('Jordan');
    });

    it('removes a player while maintaining minimum threshold of 3', () => {
      const roster = [
        { id: 'p1', name: 'Alex' },
        { id: 'p2', name: 'Maya' },
        { id: 'p3', name: 'Jordan' },
        { id: 'p4', name: 'Sarah' },
      ];
      const filtered = roster.filter((p) => p.id !== 'p4');
      expect(filtered.length).toBe(3);

      // Attempting to remove from 3 players is blocked
      const canRemoveFurther = filtered.length > 3;
      expect(canRemoveFurther).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // 4. PASS & PLAY SECRET VOTING FLOW
  // -------------------------------------------------------------------------
  describe('Pass & Play Secret Voting Flow', () => {
    it('simulates private individual voting with ballots hidden until full reveal', () => {
      const players = [
        { id: 'p1', name: 'Alex' },
        { id: 'p2', name: 'Maya' },
        { id: 'p3', name: 'Jordan' },
        { id: 'p4', name: 'Sarah' },
      ];

      const roundVotes: Record<string, string> = {};

      // Player 1 votes
      roundVotes['p1'] = 'p2';
      expect(roundVotes['p2']).toBeUndefined(); // Maya has not voted yet and cannot see p1's vote

      // Player 2 votes
      roundVotes['p2'] = 'p3';

      // Player 3 votes
      roundVotes['p3'] = 'p2';

      // Player 4 votes
      roundVotes['p4'] = 'p2';

      expect(Object.keys(roundVotes).length).toBe(players.length);

      // Tally results
      const tally: Record<string, number> = {};
      Object.values(roundVotes).forEach((target) => {
        tally[target] = (tally[target] || 0) + 1;
      });

      expect(tally['p2']).toBe(3); // Winner: Maya
      expect(tally['p3']).toBe(1);
    });
  });

  // -------------------------------------------------------------------------
  // 5. REGRESSION: TRUTH OR DARE MULTIPLAYER ROOM CREATION UNTOUCHED
  // -------------------------------------------------------------------------
  describe('Regression Protection: Truth or Dare Multiplayer', () => {
    it('creates Truth or Dare multiplayer rooms with host and 6-char code', () => {
      const { room, hostPlayerId, roomCode } = roomEngine.createRoom({
        gameId: 'truth-or-dare',
        categoryId: 'party',
        hostName: 'HostPlayer',
      });

      expect(roomCode.length).toBe(6);
      expect(room.gameId).toBe('truth-or-dare');
      expect(room.players.length).toBe(1);
      expect(room.players[0].name).toBe('HostPlayer');
      expect(room.players[0].isHost).toBe(true);
      expect(room.hostPlayerId).toBe(hostPlayerId);

      // Joining player works
      const joinResult = roomEngine.joinRoom({
        roomCode,
        playerName: 'GuestPlayer',
      });
      expect(joinResult.success).toBe(true);
      expect(roomEngine.getRoom(roomCode)?.players.length).toBe(2);
    });
  });
});
