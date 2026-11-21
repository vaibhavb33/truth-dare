import { describe, it, expect } from 'vitest';
import { roomEngine } from '@/lib/multiplayer/roomEngine';
import { cleanQuestionPrompt, cleanQuestion } from '@/lib/questions/cleanPrompt';
import { Question } from '@/types';

describe('Play Truth & Dare — Game UI and Functionality Improvements', () => {
  describe('1. Challenge & Question Number Stripping', () => {
    it('removes parenthetical challenge numbers like (Challenge #117)', () => {
      const input = 'Do a silent movie pantomime of someone sneaking in. (Challenge #117)';
      expect(cleanQuestionPrompt(input)).toBe('Do a silent movie pantomime of someone sneaking in.');
    });

    it('removes parenthetical truth and dare numbers like (Truth #45) and (Dare #89)', () => {
      expect(cleanQuestionPrompt('What is your biggest secret? (Truth #45)')).toBe('What is your biggest secret?');
      expect(cleanQuestionPrompt('Do 20 jumping jacks right now! (Dare #89)')).toBe('Do 20 jumping jacks right now!');
    });

    it('removes standalone and leading challenge formats like Challenge #25', () => {
      expect(cleanQuestionPrompt('Challenge #25: Sing a song in opera style')).toBe('Sing a song in opera style');
      expect(cleanQuestionPrompt('Dance like a robot - Challenge #25')).toBe('Dance like a robot');
      expect(cleanQuestionPrompt('Truth #12: Who was your first crush?')).toBe('Who was your first crush?');
      expect(cleanQuestionPrompt('Dare #99 - Speak in an accent')).toBe('Speak in an accent');
    });

    it('removes multilingual challenge formats like (Rodada #34) and (Desafío #135)', () => {
      expect(
        cleanQuestionPrompt('¿Cuál es la mentira más ridícula que has dicho? (Rodada #34)')
      ).toBe('¿Cuál es la mentira más ridícula que has dicho?');

      expect(
        cleanQuestionPrompt('Tente lamber o próprio cotovelo. (Desafío #135)')
      ).toBe('Tente lamber o próprio cotovelo.');
    });

    it('removes generic numbers like (#117)', () => {
      expect(cleanQuestionPrompt('Tell an embarrassing story (#117)')).toBe('Tell an embarrassing story');
    });

    it('preserves genuine question text containing # and parentheses', () => {
      const genuine = 'Who in this room is #1?! (Rank: 1-10, prize & trophy)';
      expect(cleanQuestionPrompt(genuine)).toBe('Who in this room is #1?! (Rank: 1-10, prize & trophy)');
    });

    it('sanitizes a full Question object while preserving id and metadata', () => {
      const q: Question = {
        id: 'cl-117',
        gameId: 'truth-or-dare',
        categoryId: 'classic-party',
        type: 'dare',
        prompt: 'Act like a monkey for 30 seconds. (Challenge #117)',
        question_text: 'Act like a monkey for 30 seconds. (Challenge #117)',
        intensity: 2,
        isNsfw: false,
        tags: ['classic', 'party'],
      };

      const cleaned = cleanQuestion(q);
      expect(cleaned.id).toBe('cl-117');
      expect(cleaned.prompt).toBe('Act like a monkey for 30 seconds.');
      expect(cleaned.question_text).toBe('Act like a monkey for 30 seconds.');
      expect(cleaned.type).toBe('dare');
      expect(cleaned.categoryId).toBe('classic-party');
      expect(cleaned.intensity).toBe(2);
    });
  });

  describe('2. Multiplayer Player Name Editing (RoomEngine)', () => {
    it('allows the room host to edit any player name', () => {
      const { room, hostPlayerId, sessionToken: hostToken } = roomEngine.createRoom({
        gameId: 'truth-or-dare',
        categoryId: 'classic-party',
        hostName: 'OriginalHost',
      });

      const guestJoin = roomEngine.joinRoom({
        roomCode: room.roomCode,
        playerName: 'GuestOne',
      });
      expect(guestJoin.success).toBe(true);
      const guestId = guestJoin.playerId!;

      // Host edits GuestOne -> 'SuperGuest'
      const updateResult = roomEngine.dispatchAction({
        roomCode: room.roomCode,
        playerId: hostPlayerId,
        sessionToken: hostToken,
        action: 'UPDATE_PLAYER_NAME',
        payload: {
          targetPlayerId: guestId,
          newName: 'SuperGuest',
        },
      });

      expect(updateResult.success).toBe(true);
      const updatedGuest = updateResult.room?.players.find((p) => p.id === guestId);
      expect(updatedGuest?.name).toBe('SuperGuest');
      // Verifies ID, session token, and scores are strictly preserved
      expect(updatedGuest?.id).toBe(guestId);
      expect(updatedGuest?.sessionToken).toBe(guestJoin.sessionToken);
      expect(updatedGuest?.score).toBe(0);
    });

    it('allows an individual player to edit their own name', () => {
      const { room, hostPlayerId, sessionToken: hostToken } = roomEngine.createRoom({
        gameId: 'truth-or-dare',
        categoryId: 'classic-party',
        hostName: 'HostAlex',
      });

      const guestJoin = roomEngine.joinRoom({
        roomCode: room.roomCode,
        playerName: 'GuestSam',
      });
      const guestId = guestJoin.playerId!;
      const guestToken = guestJoin.sessionToken!;

      // GuestSam edits own name -> 'Samwise'
      const updateResult = roomEngine.dispatchAction({
        roomCode: room.roomCode,
        playerId: guestId,
        sessionToken: guestToken,
        action: 'UPDATE_PLAYER_NAME',
        payload: {
          targetPlayerId: guestId,
          newName: 'Samwise',
        },
      });

      expect(updateResult.success).toBe(true);
      const updatedPlayer = updateResult.room?.players.find((p) => p.id === guestId);
      expect(updatedPlayer?.name).toBe('Samwise');
      expect(updatedPlayer?.id).toBe(guestId);
    });

    it('forbids non-host players from editing other players names', () => {
      const { room, hostPlayerId } = roomEngine.createRoom({
        gameId: 'truth-or-dare',
        categoryId: 'classic-party',
        hostName: 'HostKing',
      });

      const guestJoin = roomEngine.joinRoom({
        roomCode: room.roomCode,
        playerName: 'GuestRebel',
      });
      const guestId = guestJoin.playerId!;
      const guestToken = guestJoin.sessionToken!;

      // Guest attempts to edit the Host's name
      const failResult = roomEngine.dispatchAction({
        roomCode: room.roomCode,
        playerId: guestId,
        sessionToken: guestToken,
        action: 'UPDATE_PLAYER_NAME',
        payload: {
          targetPlayerId: hostPlayerId,
          newName: 'ImposterHost',
        },
      });

      expect(failResult.success).toBe(false);
      expect(failResult.code).toBe('PERMISSION_DENIED');
      expect(failResult.error).toContain('Only the room host can edit other players');
    });

    it('rejects empty or whitespace-only names', () => {
      const { room, hostPlayerId, sessionToken } = roomEngine.createRoom({
        gameId: 'truth-or-dare',
        categoryId: 'classic-party',
        hostName: 'HostUser',
      });

      const result = roomEngine.dispatchAction({
        roomCode: room.roomCode,
        playerId: hostPlayerId,
        sessionToken,
        action: 'UPDATE_PLAYER_NAME',
        payload: {
          targetPlayerId: hostPlayerId,
          newName: '    ',
        },
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('cannot be empty');
    });

    it('rejects names exceeding 24 characters', () => {
      const { room, hostPlayerId, sessionToken } = roomEngine.createRoom({
        gameId: 'truth-or-dare',
        categoryId: 'classic-party',
        hostName: 'HostUser',
      });

      const result = roomEngine.dispatchAction({
        roomCode: room.roomCode,
        playerId: hostPlayerId,
        sessionToken,
        action: 'UPDATE_PLAYER_NAME',
        payload: {
          targetPlayerId: hostPlayerId,
          newName: 'ThisIsAVeryLongNameThatExceedsLimit',
        },
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('24 characters or less');
    });

    it('rejects duplicate player names within the same room (case-insensitive)', () => {
      const { room, hostPlayerId, sessionToken: hostToken } = roomEngine.createRoom({
        gameId: 'truth-or-dare',
        categoryId: 'classic-party',
        hostName: 'Charlie',
      });

      const guestJoin = roomEngine.joinRoom({
        roomCode: room.roomCode,
        playerName: 'Dana',
      });
      const guestId = guestJoin.playerId!;
      const guestToken = guestJoin.sessionToken!;

      // Dana attempts to rename herself to 'charlie'
      const dupeResult = roomEngine.dispatchAction({
        roomCode: room.roomCode,
        playerId: guestId,
        sessionToken: guestToken,
        action: 'UPDATE_PLAYER_NAME',
        payload: {
          targetPlayerId: guestId,
          newName: 'charlie',
        },
      });

      expect(dupeResult.success).toBe(false);
      expect(dupeResult.error).toContain('already exists in the room');
    });

    it('preserves scores, skips, and connection state across name updates', () => {
      const { room, hostPlayerId, sessionToken: hostToken } = roomEngine.createRoom({
        gameId: 'truth-or-dare',
        categoryId: 'classic-party',
        hostName: 'PlayerA',
      });

      const joinB = roomEngine.joinRoom({
        roomCode: room.roomCode,
        playerName: 'PlayerB',
      });

      // Start game & complete a dare for host
      roomEngine.dispatchAction({
        roomCode: room.roomCode,
        playerId: hostPlayerId,
        sessionToken: hostToken,
        action: 'START_GAME',
      });

      roomEngine.dispatchAction({
        roomCode: room.roomCode,
        playerId: hostPlayerId,
        sessionToken: hostToken,
        action: 'FLIP_CARD',
        payload: { type: 'dare' },
      });

      roomEngine.dispatchAction({
        roomCode: room.roomCode,
        playerId: hostPlayerId,
        sessionToken: hostToken,
        action: 'COMPLETE_DARE',
      });

      const hostBefore = roomEngine.getRoom(room.roomCode)?.players.find((p) => p.id === hostPlayerId);
      expect(hostBefore?.score).toBe(1);

      // Now rename host
      const renameRes = roomEngine.dispatchAction({
        roomCode: room.roomCode,
        playerId: hostPlayerId,
        sessionToken: hostToken,
        action: 'UPDATE_PLAYER_NAME',
        payload: {
          targetPlayerId: hostPlayerId,
          newName: 'ChampionHost',
        },
      });

      expect(renameRes.success).toBe(true);
      const hostAfter = renameRes.room?.players.find((p) => p.id === hostPlayerId);
      expect(hostAfter?.name).toBe('ChampionHost');
      expect(hostAfter?.score).toBe(1);
      expect(hostAfter?.isHost).toBe(true);
    });
  });

  describe('3. Most Likely To — Player Name Editing & Multiplayer Synchronization', () => {
    it('manages local player roster, changes Alex to Vaibhav, and preserves original IDs and vote counts', () => {
      interface MostLikelyPlayer {
        id: string;
        name: string;
        votes: number;
      }

      const initialRoster: MostLikelyPlayer[] = [
        { id: 'player-1', name: 'Alex', votes: 2 },
        { id: 'player-2', name: 'Maya', votes: 1 },
        { id: 'player-3', name: 'Jordan', votes: 0 },
        { id: 'player-4', name: 'Sarah', votes: 0 },
      ];

      // Step 1: Simulate user editing Alex -> Vaibhav
      const updated = initialRoster.map((p) =>
        p.id === 'player-1' ? { ...p, name: 'Vaibhav' } : p
      );

      // Step 2: Verify Vaibhav appears in voting roster
      expect(updated.find((p) => p.id === 'player-1')?.name).toBe('Vaibhav');
      // Step 3: Verify original player ID is preserved
      expect(updated[0].id).toBe('player-1');
      // Step 4: Verify votes are preserved
      expect(updated[0].votes).toBe(2);

      // Step 5: Test persistence serialization (localStorage format)
      const serialized = JSON.stringify(updated);
      const restored: MostLikelyPlayer[] = JSON.parse(serialized);
      expect(restored[0].name).toBe('Vaibhav');
      expect(restored[0].id).toBe('player-1');
      expect(restored[0].votes).toBe(2);
    });

    it('synchronizes Most Likely To multiplayer room votes, draws questions, and updates player names across clients', () => {
      // 1. Create a multiplayer room for Most Likely To
      const hostRes = roomEngine.createRoom({
        gameId: 'most-likely-to',
        categoryId: 'party',
        hostName: 'Alex',
      });
      expect(hostRes.room).toBeDefined();
      const roomCode = hostRes.roomCode;
      const hostPlayerId = hostRes.hostPlayerId;
      const hostToken = hostRes.sessionToken;

      // 2. Guest joins the room
      const guestRes = roomEngine.joinRoom({
        roomCode,
        playerName: 'Maya',
      });
      expect(guestRes.success).toBe(true);
      const guestPlayerId = guestRes.playerId!;
      const guestToken = guestRes.sessionToken!;

      // 3. Host starts the game
      const startRes = roomEngine.dispatchAction({
        roomCode,
        playerId: hostPlayerId,
        sessionToken: hostToken,
        action: 'START_GAME',
      });
      expect(startRes.success).toBe(true);
      expect(startRes.room?.status).toBe('IN_PROGRESS');
      expect(startRes.room?.currentCard).toBeDefined();
      expect(startRes.room?.isCardFlipped).toBe(true);

      // 4. Guest casts a vote for Alex (host)
      const voteRes = roomEngine.dispatchAction({
        roomCode,
        playerId: guestPlayerId,
        sessionToken: guestToken,
        action: 'SUBMIT_VOTE',
        payload: { vote: hostPlayerId },
      });
      expect(voteRes.success).toBe(true);
      expect(voteRes.room?.votes[guestPlayerId]).toBe(hostPlayerId);

      // 5. Host renames Alex -> Vaibhav
      const renameRes = roomEngine.dispatchAction({
        roomCode,
        playerId: hostPlayerId,
        sessionToken: hostToken,
        action: 'UPDATE_PLAYER_NAME',
        payload: {
          targetPlayerId: hostPlayerId,
          newName: 'Vaibhav',
        },
      });
      expect(renameRes.success).toBe(true);

      // 6. Verify Vaibhav is updated in room state for both players
      const latestRoom = roomEngine.getRoom(roomCode);
      const hostAfter = latestRoom?.players.find((p) => p.id === hostPlayerId);
      expect(hostAfter?.name).toBe('Vaibhav');

      // 7. Verify player original ID, session token, and guest's vote remain completely intact
      expect(hostAfter?.id).toBe(hostPlayerId);
      expect(hostAfter?.sessionToken).toBe(hostToken);
      expect(latestRoom?.votes[guestPlayerId]).toBe(hostPlayerId);

      // 8. Reconnect session verification: name persists
      const reconnectRes = roomEngine.reconnectPlayer({
        roomCode,
        playerId: hostPlayerId,
        sessionToken: hostToken,
      });
      expect(reconnectRes.success).toBe(true);
      expect(reconnectRes.player?.name).toBe('Vaibhav');
    });
  });
});

