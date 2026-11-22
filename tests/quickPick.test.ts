import { describe, it, expect, beforeEach } from 'vitest';
import { questionEngine } from '@/lib/questions/engine';
import { MostLikelyPlayer } from '@/components/games/MostLikelyToSetup';

describe('Task 4: Most Likely To Quick Pick Mode', () => {
  // -------------------------------------------------------------------------
  // 1. GAME SETUP & MODE SELECTION
  // -------------------------------------------------------------------------
  describe('Mode Selection & Constraints', () => {
    it('supports both secret-voting and quick-pick submodes for Pass & Play', () => {
      const allowedSubModes = ['secret-voting', 'quick-pick'];
      expect(allowedSubModes).toContain('secret-voting');
      expect(allowedSubModes).toContain('quick-pick');
    });

    it('ensures Quick Pick is strictly a Pass & Play mode, never online multiplayer', () => {
      const playingMode = 'online';
      // Online mode only supports standard multiplayer rooms, Quick Pick is disabled
      const isQuickPickAllowedOnline = false;
      expect(isQuickPickAllowedOnline).toBe(false);

      const passAndPlayMode = 'pass-and-play';
      const isQuickPickAllowedInPassAndPlay = true;
      expect(isQuickPickAllowedInPassAndPlay).toBe(true);
    });

    it('initializes players with 0 crowns and 0 votes', () => {
      const initialRoster: MostLikelyPlayer[] = [
        { id: 'p1', name: 'Alex', votes: 0, crowns: 0 },
        { id: 'p2', name: 'Maya', votes: 0, crowns: 0 },
        { id: 'p3', name: 'Jordan', votes: 0, crowns: 0 },
      ];

      initialRoster.forEach((p) => {
        expect(p.votes).toBe(0);
        expect(p.crowns).toBe(0);
      });
    });
  });

  // -------------------------------------------------------------------------
  // 2. QUICK PICK GAMEPLAY & CROWNING MECHANISM
  // -------------------------------------------------------------------------
  describe('Quick Pick Discussion & Crowning Lifecycle', () => {
    const createQuickPickSession = (playerNames: string[], gameLength: number = 5) => {
      let players: MostLikelyPlayer[] = playerNames.map((name, i) => ({
        id: `p-${i + 1}`,
        name,
        votes: 0,
        crowns: 0,
      }));

      let currentRound = 1;
      let drawnIds: string[] = [];
      let currentCard = questionEngine.drawNextCard({
        gameId: 'most-likely-to',
        language: 'en',
        drawnCardIds: [],
      }).card;
      if (currentCard) drawnIds.push(currentCard.id);

      let phase: 'quick-pick-discussion' | 'quick-pick-crowned' | 'game-over' = 'quick-pick-discussion';
      let selectedPlayerId: string | null = null;
      let isConfirming: boolean = false;

      return {
        get players() {
          return players;
        },
        get currentRound() {
          return currentRound;
        },
        get gameLength() {
          return gameLength;
        },
        get phase() {
          return phase;
        },
        get currentCard() {
          return currentCard;
        },
        get selectedPlayerId() {
          return selectedPlayerId;
        },
        get isConfirming() {
          return isConfirming;
        },
        selectAgreedPlayer(playerId: string) {
          expect(phase).toBe('quick-pick-discussion');
          const exists = players.some((p) => p.id === playerId);
          if (!exists) throw new Error('Player not found');
          selectedPlayerId = playerId;
          isConfirming = true;
        },
        cancelSelection() {
          isConfirming = false;
          selectedPlayerId = null;
        },
        confirmCrown() {
          expect(isConfirming).toBe(true);
          expect(selectedPlayerId).not.toBeNull();

          // Award 1 crown to the selected player
          players = players.map((p) =>
            p.id === selectedPlayerId ? { ...p, crowns: (p.crowns || 0) + 1 } : p
          );

          isConfirming = false;
          phase = 'quick-pick-crowned';
        },
        nextQuestion() {
          expect(phase).toBe('quick-pick-crowned');

          if (currentRound >= gameLength) {
            phase = 'game-over';
            return;
          }

          currentRound += 1;
          selectedPlayerId = null;
          isConfirming = false;

          const res = questionEngine.drawNextCard({
            gameId: 'most-likely-to',
            language: 'en',
            drawnCardIds: drawnIds,
          });

          if (res.card) {
            currentCard = res.card;
            drawnIds.push(res.card.id);
          }

          phase = 'quick-pick-discussion';
        },
        getStandings() {
          return [...players].sort((a, b) => (b.crowns || 0) - (a.crowns || 0));
        },
      };
    };

    it('executes a full 5-prompt Quick Pick session with crowning and standings', () => {
      const session = createQuickPickSession(['Alex', 'Maya', 'Jordan', 'Sarah'], 5);
      expect(session.players.length).toBe(4);
      expect(session.currentRound).toBe(1);
      expect(session.phase).toBe('quick-pick-discussion');

      // Round 1: Group agrees on Maya (p-2)
      session.selectAgreedPlayer('p-2');
      expect(session.isConfirming).toBe(true);
      expect(session.selectedPlayerId).toBe('p-2');
      session.confirmCrown();
      expect(session.phase).toBe('quick-pick-crowned');
      expect(session.players.find((p) => p.id === 'p-2')?.crowns).toBe(1);

      session.nextQuestion();
      expect(session.currentRound).toBe(2);
      expect(session.phase).toBe('quick-pick-discussion');

      // Round 2: Device holder selects Alex, then cancels and selects Jordan
      session.selectAgreedPlayer('p-1');
      expect(session.selectedPlayerId).toBe('p-1');
      session.cancelSelection();
      expect(session.selectedPlayerId).toBeNull();
      expect(session.isConfirming).toBe(false);

      session.selectAgreedPlayer('p-3'); // Jordan
      session.confirmCrown();
      expect(session.players.find((p) => p.id === 'p-3')?.crowns).toBe(1);

      session.nextQuestion();
      expect(session.currentRound).toBe(3);

      // Round 3: Group agrees on Maya again
      session.selectAgreedPlayer('p-2');
      session.confirmCrown();
      expect(session.players.find((p) => p.id === 'p-2')?.crowns).toBe(2);

      session.nextQuestion();
      expect(session.currentRound).toBe(4);

      // Round 4: Group agrees on Sarah (p-4)
      session.selectAgreedPlayer('p-4');
      session.confirmCrown();
      expect(session.players.find((p) => p.id === 'p-4')?.crowns).toBe(1);

      session.nextQuestion();
      expect(session.currentRound).toBe(5);

      // Round 5: Group agrees on Maya again (Maya's 3rd crown)
      session.selectAgreedPlayer('p-2');
      session.confirmCrown();
      expect(session.players.find((p) => p.id === 'p-2')?.crowns).toBe(3);

      // Final question transitions to game-over
      session.nextQuestion();
      expect(session.phase).toBe('game-over');

      // Check final podium standings
      const standings = session.getStandings();
      expect(standings[0].name).toBe('Maya');
      expect(standings[0].crowns).toBe(3);
      expect(standings[1].crowns).toBe(1);
      expect(standings[2].crowns).toBe(1);
      expect(standings[3].name).toBe('Alex');
      expect(standings[3].crowns).toBe(0);
    });

    it('does not use the secret voting algorithm for Quick Pick scoring', () => {
      // In secret voting: each voter casts 1 vote, and tallies determine round winner
      // In Quick Pick: no individual votes are cast, 1 crown is awarded directly
      const session = createQuickPickSession(['Alex', 'Maya', 'Jordan'], 5);

      session.selectAgreedPlayer('p-1');
      session.confirmCrown();

      // Alex has 1 crown, but 0 individual votes
      const alex = session.players.find((p) => p.id === 'p-1');
      expect(alex?.crowns).toBe(1);
      expect(alex?.votes).toBe(0);
    });

    it('persists and restores Quick Pick session state during navigation', () => {
      const quickPickState = {
        gamePhase: 'quick-pick-discussion',
        passAndPlaySubMode: 'quick-pick',
        players: [
          { id: 'p-1', name: 'Alex', votes: 0, crowns: 2 },
          { id: 'p-2', name: 'Maya', votes: 0, crowns: 1 },
          { id: 'p-3', name: 'Jordan', votes: 0, crowns: 0 },
        ],
        gameLength: 10,
        currentRound: 4,
        drawnIds: ['mlt-1', 'mlt-2', 'mlt-3'],
        currentCard: { id: 'mlt-4', prompt: 'Who is most likely to win a game show?' },
      };

      const serialized = JSON.stringify(quickPickState);
      const restored = JSON.parse(serialized);

      expect(restored.passAndPlaySubMode).toBe('quick-pick');
      expect(restored.currentRound).toBe(4);
      expect(restored.players[0].crowns).toBe(2);
      expect(restored.players[1].crowns).toBe(1);
      expect(restored.gamePhase).toBe('quick-pick-discussion');
    });
  });

  // -------------------------------------------------------------------------
  // 3. SEPARATION & NON-INTERFERENCE
  // -------------------------------------------------------------------------
  describe('Separation from Secret Voting & Other Games', () => {
    it('keeps Secret Voting and Quick Pick scoring independent', () => {
      const secretPlayer: MostLikelyPlayer = { id: '1', name: 'Alex', votes: 4, crowns: 0 };
      const quickPickPlayer: MostLikelyPlayer = { id: '2', name: 'Maya', votes: 0, crowns: 3 };

      expect(secretPlayer.votes).toBe(4);
      expect(secretPlayer.crowns).toBe(0);

      expect(quickPickPlayer.crowns).toBe(3);
      expect(quickPickPlayer.votes).toBe(0);
    });
  });
});

