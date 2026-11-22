'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Users,
  Trophy,
  ArrowRight,
  Edit3,
  Check,
  X,
  Plus,
  Trash2,
  Sparkles,
  RotateCcw,
  Eye,
  Lock,
  Award,
  Crown,
  Play,
  Settings,
  Zap,
  Target,
  AlertCircle,
  Medal,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { sound } from '@/lib/audio/soundSynthesizer';
import { triggerConfetti } from '@/components/game/ConfettiCelebration';
import { questionEngine } from '@/lib/questions/engine';
import { Question } from '@/types';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { cleanQuestionPrompt } from '@/lib/questions/cleanPrompt';
import {
  MostLikelyToSetup,
  MostLikelyPlayer,
  GameLengthOption,
  PassAndPlaySubMode,
} from './MostLikelyToSetup';

const DEFAULT_PLAYERS: MostLikelyPlayer[] = [
  { id: 'player-1', name: 'Alex', votes: 0, crowns: 0, points: 0, titles: [] },
  { id: 'player-2', name: 'Maya', votes: 0, crowns: 0, points: 0, titles: [] },
  { id: 'player-3', name: 'Jordan', votes: 0, crowns: 0, points: 0, titles: [] },
  { id: 'player-4', name: 'Sarah', votes: 0, crowns: 0, points: 0, titles: [] },
];

const STORAGE_KEY = 'playtruthndare_most_likely_to_players';
const ACTIVE_GAME_KEY = 'playtruthndare_most_likely_to_active_game';

type GamePhase =
  | 'setup'
  | 'pass-and-play-intermission'
  | 'pass-and-play-voting'
  | 'round-reveal'
  | 'quick-pick-discussion'
  | 'quick-pick-crowned'
  | 'game-over';

export function MostLikelyToClient() {
  const router = useRouter();
  const { dict, locale } = useTranslation();

  // Master Game Phase State
  const [gamePhase, setGamePhase] = useState<GamePhase>('setup');
  const [passAndPlaySubMode, setPassAndPlaySubMode] = useState<PassAndPlaySubMode>('secret-voting');

  // Players State
  const [players, setPlayers] = useState<MostLikelyPlayer[]>(DEFAULT_PLAYERS);
  const [gameLength, setGameLength] = useState<GameLengthOption>(10);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [drawnIds, setDrawnIds] = useState<string[]>([]);

  // Pass & Play Round State (Secret Voting)
  const [currentVoterIndex, setCurrentVoterIndex] = useState<number>(0);
  const [roundVotes, setRoundVotes] = useState<Record<string, string>>({}); // { voterId: targetPlayerId }
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);

  // Quick Pick Round State
  const [selectedQuickPickPlayerId, setSelectedQuickPickPlayerId] = useState<string | null>(null);
  const [isConfirmingQuickPick, setIsConfirmingQuickPick] = useState<boolean>(false);

  // Modal State for in-game "Manage Players"
  const [isManagePlayersOpen, setIsManagePlayersOpen] = useState(false);
  const [draftPlayers, setDraftPlayers] = useState<MostLikelyPlayer[]>([]);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editingRowName, setEditingRowName] = useState<string>('');
  const [modalError, setModalError] = useState<string>('');
  const [modalSuccess, setModalSuccess] = useState<string>('');
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');

  // Track saved active match for optional resume from Setup screen
  const [activeGameInfo, setActiveGameInfo] = useState<{
    round: number;
    gameLength: GameLengthOption;
    mode: PassAndPlaySubMode;
    savedPhase: GamePhase;
  } | null>(null);

  // 1. Persistence on Client Mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      // Check for active game state to allow resuming from setup screen
      const activeSaved = localStorage.getItem(ACTIVE_GAME_KEY);
      if (activeSaved) {
        const parsedActive = JSON.parse(activeSaved);
        if (parsedActive && Array.isArray(parsedActive.players) && parsedActive.players.length >= 3) {
          setPlayers(parsedActive.players);
          if (parsedActive.gameLength) setGameLength(parsedActive.gameLength);
          if (parsedActive.currentRound) setCurrentRound(parsedActive.currentRound);
          if (Array.isArray(parsedActive.drawnIds)) setDrawnIds(parsedActive.drawnIds);
          if (typeof parsedActive.currentVoterIndex === 'number') setCurrentVoterIndex(parsedActive.currentVoterIndex);
          if (parsedActive.roundVotes) setRoundVotes(parsedActive.roundVotes);
          if (parsedActive.currentCard) setCurrentCard(parsedActive.currentCard);
          if (parsedActive.passAndPlaySubMode) setPassAndPlaySubMode(parsedActive.passAndPlaySubMode);
          if (parsedActive.selectedQuickPickPlayerId) setSelectedQuickPickPlayerId(parsedActive.selectedQuickPickPlayerId);

          const targetPhase: GamePhase = parsedActive.gamePhase === 'pass-and-play-voting'
            ? 'pass-and-play-intermission'
            : (parsedActive.gamePhase || 'setup');

          // If the URL specifically has ?resume=true, resume directly, else stay on setup screen with a resume banner
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get('resume') === 'true' && targetPhase !== 'setup') {
            setGamePhase(targetPhase);
          } else if (targetPhase !== 'setup' && targetPhase !== 'game-over') {
            setActiveGameInfo({
              round: parsedActive.currentRound || 1,
              gameLength: parsedActive.gameLength || 10,
              mode: parsedActive.passAndPlaySubMode || 'secret-voting',
              savedPhase: targetPhase,
            });
          }
          return;
        }
      }

      // Fallback: restore saved player roster
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 3) {
          setPlayers(parsed);
        }
      }
    } catch {}
  }, []);

  const savePlayersToStorage = (updated: MostLikelyPlayer[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Card draw state
  const [currentCard, setCurrentCard] = useState<Question | null>(() => {
    const result = questionEngine.drawNextCard({
      gameId: 'most-likely-to',
      language: locale,
      drawnCardIds: [],
    });
    return result.card;
  });

  // Re-draw if locale changes
  useEffect(() => {
    const result = questionEngine.drawNextCard({
      gameId: 'most-likely-to',
      language: locale,
      drawnCardIds: [],
    });
    if (result.card) {
      setCurrentCard(result.card);
      setDrawnIds([]);
    }
  }, [locale]);

  // Sync active game state to localStorage on every round/voter update for navigation preservation
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (gamePhase === 'setup' || gamePhase === 'game-over') {
        localStorage.removeItem(ACTIVE_GAME_KEY);
      } else {
        const activeState = {
          gamePhase,
          passAndPlaySubMode,
          players,
          gameLength,
          currentRound,
          drawnIds,
          currentVoterIndex,
          roundVotes,
          currentCard,
          selectedQuickPickPlayerId,
        };
        localStorage.setItem(ACTIVE_GAME_KEY, JSON.stringify(activeState));
      }
    } catch {}
  }, [
    gamePhase,
    passAndPlaySubMode,
    players,
    gameLength,
    currentRound,
    drawnIds,
    currentVoterIndex,
    roundVotes,
    currentCard,
    selectedQuickPickPlayerId,
  ]);

  // -------------------------------------------------------------
  // START PASS & PLAY GAME
  // -------------------------------------------------------------
  const handleStartPassAndPlay = (config: {
    players: MostLikelyPlayer[];
    gameLength: GameLengthOption;
    subMode?: PassAndPlaySubMode;
  }) => {
    const mode = config.subMode || 'secret-voting';
    setPassAndPlaySubMode(mode);

    // Reset all votes, crowns, points, and titles to 0 for a fresh game
    const freshPlayers = config.players.map((p) => ({
      ...p,
      votes: 0,
      crowns: 0,
      points: 0,
      titles: [],
    }));
    setPlayers(freshPlayers);
    savePlayersToStorage(freshPlayers);
    setGameLength(config.gameLength);
    setCurrentRound(1);
    setCurrentVoterIndex(0);
    setRoundVotes({});
    setSelectedTargetId(null);
    setSelectedQuickPickPlayerId(null);
    setIsConfirmingQuickPick(false);

    // Draw first fresh card
    const firstDraw = questionEngine.drawNextCard({
      gameId: 'most-likely-to',
      language: locale,
      drawnCardIds: [],
    });
    if (firstDraw.card) {
      setCurrentCard(firstDraw.card);
      setDrawnIds([firstDraw.card.id]);
    }

    if (mode === 'quick-pick') {
      setGamePhase('quick-pick-discussion');
    } else {
      setGamePhase('pass-and-play-intermission');
    }
  };

  // -------------------------------------------------------------
  // PASS & PLAY VOTING FLOW
  // -------------------------------------------------------------
  const currentVoter = players[currentVoterIndex] || players[0];

  const handleStartPrivateVote = () => {
    sound.triggerHaptic(10);
    setSelectedTargetId(null);
    setGamePhase('pass-and-play-voting');
  };

  const handleCastSecretVote = (targetId: string) => {
    if (selectedTargetId !== null) return;
    setSelectedTargetId(targetId);
    sound.playChime();
    sound.triggerHaptic([15, 25]);

    const updatedVotes = { ...roundVotes, [currentVoter.id]: targetId };
    setRoundVotes(updatedVotes);

    setTimeout(() => {
      // Check if there are more players to vote in this round
      if (currentVoterIndex + 1 < players.length) {
        setCurrentVoterIndex((prev) => prev + 1);
        setSelectedTargetId(null);
        setGamePhase('pass-and-play-intermission');
      } else {
        // All players have voted for this prompt! Calculate winners & scoring
        const voteCounts: Record<string, number> = {};
        Object.values(updatedVotes).forEach((target) => {
          voteCounts[target] = (voteCounts[target] || 0) + 1;
        });

        let maxVotes = 0;
        Object.values(voteCounts).forEach((c) => {
          if (c > maxVotes) maxVotes = c;
        });

        // TASK 5 Consensus check: At least 2 votes must land on the top selection
        const hasConsensus = maxVotes >= 2;
        const roundWinnerIds: string[] = [];
        if (hasConsensus) {
          players.forEach((p) => {
            if ((voteCounts[p.id] || 0) === maxVotes) {
              roundWinnerIds.push(p.id);
            }
          });
        }
        const winnerSet = new Set(roundWinnerIds);

        const promptTitle = cleanQuestionPrompt(
          currentCard?.prompt || currentCard?.question_text || ''
        );

        // Add round votes, crowns, prediction points, and collected titles
        setPlayers((prev) => {
          const updated = prev.map((p) => {
            const isRoundWinner = winnerSet.has(p.id);
            const myPick = updatedVotes[p.id];
            const earnedPredictionPoint = Boolean(hasConsensus && myPick && winnerSet.has(myPick));

            const newCrowns = (p.crowns || 0) + (isRoundWinner ? 1 : 0);
            const newPoints = (p.points || 0) + (earnedPredictionPoint ? 1 : 0);
            const newVotes = p.votes + (voteCounts[p.id] || 0);
            const newTitles = isRoundWinner && promptTitle ? [...(p.titles || []), promptTitle] : (p.titles || []);

            return {
              ...p,
              votes: newVotes,
              crowns: newCrowns,
              points: newPoints,
              titles: newTitles,
            };
          });
          savePlayersToStorage(updated);
          return updated;
        });

        sound.playVictory();
        triggerConfetti();
        setGamePhase('round-reveal');
      }
    }, 600);
  };

  const handleNextPrompt = () => {
    sound.playWhoosh();
    sound.triggerHaptic(15);

    if (currentRound >= gameLength) {
      // Finished all prompts in the game length!
      sound.playVictory();
      triggerConfetti();
      setGamePhase('game-over');
      return;
    }

    // Advance round
    setCurrentRound((prev) => prev + 1);
    setCurrentVoterIndex(0);
    setRoundVotes({});
    setSelectedTargetId(null);

    const nextIds = currentCard ? [...drawnIds, currentCard.id] : drawnIds;
    setDrawnIds(nextIds);

    const result = questionEngine.drawNextCard({
      gameId: 'most-likely-to',
      language: locale,
      drawnCardIds: nextIds,
    });

    if (result.card) {
      setCurrentCard(result.card);
    } else {
      setDrawnIds([]);
      const restart = questionEngine.drawNextCard({
        gameId: 'most-likely-to',
        language: locale,
        drawnCardIds: [],
      });
      setCurrentCard(restart.card);
    }

    setGamePhase('pass-and-play-intermission');
  };

  // -------------------------------------------------------------
  // QUICK PICK MODE HANDLERS (Group Discussion & Instant Crowning)
  // -------------------------------------------------------------
  const handleSelectQuickPickPlayer = (playerId: string) => {
    sound.triggerHaptic(10);
    setSelectedQuickPickPlayerId(playerId);
    setIsConfirmingQuickPick(true);
  };

  const handleCancelQuickPickSelection = () => {
    sound.triggerHaptic(10);
    setIsConfirmingQuickPick(false);
    setSelectedQuickPickPlayerId(null);
  };

  const handleConfirmQuickPickCrown = () => {
    if (!selectedQuickPickPlayerId) return;
    sound.playVictory();
    sound.triggerHaptic([20, 40]);
    triggerConfetti();

    const promptTitle = cleanQuestionPrompt(
      currentCard?.prompt || currentCard?.question_text || ''
    );

    // Award 1 crown to the agreed player (Quick Pick tracks crowns directly and collects titles)
    setPlayers((prev) => {
      const updated = prev.map((p) =>
        p.id === selectedQuickPickPlayerId
          ? {
              ...p,
              crowns: (p.crowns || 0) + 1,
              titles: promptTitle ? [...(p.titles || []), promptTitle] : (p.titles || []),
            }
          : p
      );
      savePlayersToStorage(updated);
      return updated;
    });

    setIsConfirmingQuickPick(false);
    setGamePhase('quick-pick-crowned');
  };

  const handleQuickPickNextQuestion = () => {
    sound.playWhoosh();
    sound.triggerHaptic(15);

    if (currentRound >= gameLength) {
      sound.playVictory();
      triggerConfetti();
      setGamePhase('game-over');
      return;
    }

    setCurrentRound((prev) => prev + 1);
    setSelectedQuickPickPlayerId(null);
    setIsConfirmingQuickPick(false);

    const nextIds = currentCard ? [...drawnIds, currentCard.id] : drawnIds;
    setDrawnIds(nextIds);

    const result = questionEngine.drawNextCard({
      gameId: 'most-likely-to',
      language: locale,
      drawnCardIds: nextIds,
    });

    if (result.card) {
      setCurrentCard(result.card);
    } else {
      setDrawnIds([]);
      const restart = questionEngine.drawNextCard({
        gameId: 'most-likely-to',
        language: locale,
        drawnCardIds: [],
      });
      setCurrentCard(restart.card);
    }

    setGamePhase('quick-pick-discussion');
  };

  const handlePlayAgain = () => {
    sound.playVictory();
    triggerConfetti();
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(ACTIVE_GAME_KEY);
      } catch {}
    }
    handleStartPassAndPlay({
      players,
      gameLength,
      subMode: passAndPlaySubMode,
    });
  };

  const handleReturnToSetup = () => {
    sound.triggerHaptic(10);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(ACTIVE_GAME_KEY);
      } catch {}
    }
    setGamePhase('setup');
  };

  // -------------------------------------------------------------
  // IN-GAME MANAGE PLAYERS MODAL
  // -------------------------------------------------------------
  const openManagePlayersModal = () => {
    sound.triggerHaptic(10);
    setDraftPlayers(players.map((p) => ({ ...p })));
    setEditingRowId(null);
    setEditingRowName('');
    setModalError('');
    setModalSuccess('');
    setIsAddingPlayer(false);
    setNewPlayerName('');
    setIsManagePlayersOpen(true);
  };

  const startEditingRow = (player: MostLikelyPlayer) => {
    sound.triggerHaptic(10);
    setEditingRowId(player.id);
    setEditingRowName(player.name);
    setModalError('');
    setModalSuccess('');
  };

  const saveIndividualRow = (playerId: string) => {
    const clean = editingRowName.trim().replace(/\s+/g, ' ');
    if (!clean) {
      setModalError('Player name cannot be empty.');
      sound.triggerHaptic(20);
      return;
    }
    if (clean.length > 24) {
      setModalError('Player name must be 24 characters or less.');
      sound.triggerHaptic(20);
      return;
    }
    const isDuplicate = draftPlayers.some(
      (p) => p.id !== playerId && p.name.trim().toLowerCase() === clean.toLowerCase()
    );
    if (isDuplicate) {
      setModalError('A player with this name already exists.');
      sound.triggerHaptic(20);
      return;
    }

    setDraftPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, name: clean } : p))
    );
    setEditingRowId(null);
    setEditingRowName('');
    setModalSuccess('Name updated!');
    sound.playChime();
  };

  const cancelIndividualRow = () => {
    setEditingRowId(null);
    setEditingRowName('');
    setModalError('');
  };

  const handleAddNewPlayer = () => {
    const clean = newPlayerName.trim().replace(/\s+/g, ' ');
    if (!clean) {
      setModalError('Player name cannot be empty.');
      return;
    }
    if (clean.length > 24) {
      setModalError('Player name must be 24 characters or less.');
      return;
    }
    if (draftPlayers.some((p) => p.name.trim().toLowerCase() === clean.toLowerCase())) {
      setModalError('A player with this name already exists.');
      return;
    }
    if (draftPlayers.length >= 12) {
      setModalError('Maximum 12 players allowed.');
      return;
    }

    const newPlayer: MostLikelyPlayer = {
      id: `player-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: clean,
      votes: 0,
    };

    setDraftPlayers((prev) => [...prev, newPlayer]);
    setNewPlayerName('');
    setIsAddingPlayer(false);
    setModalSuccess(`Added player "${clean}"!`);
    sound.playChime();
  };

  const handleRemovePlayer = (playerId: string) => {
    if (draftPlayers.length <= 3) {
      setModalError('At least 3 players are required.');
      return;
    }
    setDraftPlayers((prev) => prev.filter((p) => p.id !== playerId));
    setModalError('');
  };

  const handleResetToDefaults = () => {
    setDraftPlayers(DEFAULT_PLAYERS.map((p) => ({ ...p })));
    setEditingRowId(null);
    setModalSuccess('Reset roster to default 4 players.');
    sound.triggerHaptic(15);
  };

  const handleSaveAllChanges = () => {
    let currentDraft = [...draftPlayers];
    if (editingRowId) {
      const clean = editingRowName.trim().replace(/\s+/g, ' ');
      if (!clean || clean.length > 24) {
        setModalError('Please enter a valid player name (1–24 characters).');
        return;
      }
      currentDraft = currentDraft.map((p) =>
        p.id === editingRowId ? { ...p, name: clean } : p
      );
    }

    sound.playVictory();
    setPlayers(currentDraft);
    savePlayersToStorage(currentDraft);
    setIsManagePlayersOpen(false);
  };

  const currentPromptText = cleanQuestionPrompt(
    currentCard?.question_text || currentCard?.prompt || dict.mostLikelyTo.whoIsMostLikely
  );

  // -------------------------------------------------------------
  // RENDER: PHASE 1 — GAME SETUP SCREEN
  // -------------------------------------------------------------
  if (gamePhase === 'setup') {
    return (
      <MostLikelyToSetup
        initialPlayers={players}
        initialGameLength={gameLength}
        initialSubMode={passAndPlaySubMode}
        activeGameResume={
          activeGameInfo
            ? {
                round: activeGameInfo.round,
                gameLength: activeGameInfo.gameLength,
                mode: activeGameInfo.mode,
              }
            : null
        }
        onResumeActiveGame={() => {
          if (activeGameInfo?.savedPhase) {
            setGamePhase(activeGameInfo.savedPhase);
            setActiveGameInfo(null);
            sound.playChime();
          }
        }}
        onDiscardActiveGame={() => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem(ACTIVE_GAME_KEY);
          }
          setActiveGameInfo(null);
          sound.triggerHaptic(10);
        }}
        onStartPassAndPlay={handleStartPassAndPlay}
      />
    );
  }

  // -------------------------------------------------------------
  // RENDER: PHASE 2A — PASS & PLAY INTERMISSION (Device Hand-off)
  // -------------------------------------------------------------
  if (gamePhase === 'pass-and-play-intermission') {
    const percentComplete = Math.round((currentVoterIndex / players.length) * 100);

    return (
      <div className="w-full max-w-lg mx-auto px-4 py-8 space-y-6 flex-1 flex flex-col justify-center items-center text-center animate-fade-in">
        {/* Round Progress Tracker */}
        <div className="w-full flex items-center justify-between text-xs text-slate-400 font-mono pb-2 border-b border-white/5">
          <span className="text-purple-400 font-bold uppercase tracking-wider">
            Prompt {currentRound} of {gameLength}
          </span>
          <span className="text-slate-300">
            Votes Cast: {currentVoterIndex} of {players.length} ({percentComplete}%)
          </span>
        </div>

        {/* Visual Progress Pills */}
        <div className="w-full flex flex-wrap items-center justify-center gap-1.5 py-1">
          {players.map((p, idx) => {
            const hasVoted = idx < currentVoterIndex;
            const isCurrent = idx === currentVoterIndex;
            return (
              <div
                key={p.id}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                  hasVoted
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                    : isCurrent
                    ? 'bg-purple-600/30 border border-purple-400 text-purple-200 shadow-sm scale-105'
                    : 'bg-white/5 border border-white/10 text-slate-500'
                }`}
                title={p.name}
              >
                {hasVoted ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : isCurrent ? (
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping inline-block" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-600 inline-block" />
                )}
                <span className="truncate max-w-[80px]">{p.name}</span>
              </div>
            );
          })}
        </div>

        {/* Hand-off Graphic & Instructions */}
        <div className="w-full p-8 rounded-3xl bg-surface-elevated border border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.2)] space-y-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-purple-900/50">
            <Lock className="w-9 h-9 text-white animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400">
              Pass The Phone (Cover Screen)
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Hand device to <span className="text-purple-300 underline decoration-purple-500/50">{currentVoter?.name}</span>
            </h2>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Previous selections are confidential and hidden. Keep the screen private from other players!
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handleStartPrivateVote}
            className="w-full bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 text-white font-extrabold text-base min-h-[50px] shadow-lg shadow-purple-900/40"
          >
            <Eye className="w-5 h-5 mr-1" />
            <span>I am {currentVoter?.name} — Ready to Vote</span>
          </Button>
        </div>

        <button
          type="button"
          onClick={handleReturnToSetup}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          ← Exit to Game Setup
        </button>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: PHASE 2B — SECRET VOTING (Current Voter Casts Vote)
  // -------------------------------------------------------------
  if (gamePhase === 'pass-and-play-voting') {
    const votingPercent = Math.round((currentVoterIndex / players.length) * 100);

    return (
      <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-6 flex-1 flex flex-col justify-between items-center animate-fade-in">
        {/* Top Bar with Secret Banner */}
        <div className="w-full flex items-center justify-between">
          <span className="text-xs font-bold font-mono text-purple-400">
            Prompt {currentRound} of {gameLength}
          </span>
          <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <Lock className="w-3 h-3 text-purple-400" />
            <span>Secret Ballot: {currentVoter?.name}</span>
          </span>
        </div>

        {/* Voting Progress Indicator */}
        <div className="w-full space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Voter {currentVoterIndex + 1} of {players.length}</span>
            <span>{votingPercent}% Complete</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-surface-highlight overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${Math.max(votingPercent, 8)}%` }}
            />
          </div>
        </div>

        {/* Prompt Card */}
        <div className="w-full p-5 sm:p-8 rounded-3xl bg-surface-elevated border border-purple-400/40 shadow-[0_0_35px_rgba(168,85,247,0.22)] text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 text-xs font-bold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" /> Most Likely To...
          </span>
          <p className="font-display font-bold text-xl sm:text-2xl md:text-3xl text-white leading-relaxed break-words">
            {currentPromptText}
          </p>
        </div>

        {/* Vote Submitted Confirmation Notice */}
        {selectedTargetId !== null && (
          <div className="w-full p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-center font-bold text-sm animate-fade-in flex items-center justify-center gap-2 shadow-lg">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Vote Submitted! Keeping your choice strictly private...</span>
          </div>
        )}

        {/* Voting Grid (Previous Votes Strictly Hidden!) */}
        <div className="w-full space-y-3">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {currentVoter?.name}, tap who fits best (you can vote for yourself!):
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {players.map((p) => {
              const isSelected = selectedTargetId === p.id;
              const isSelf = p.id === currentVoter?.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleCastSecretVote(p.id)}
                  disabled={selectedTargetId !== null}
                  className={`p-3 sm:p-4 rounded-2xl border flex items-center justify-between gap-2 transition-all ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/40 scale-[1.03]'
                      : selectedTargetId !== null
                      ? 'bg-surface-elevated/50 border-white/5 text-slate-500 opacity-60 cursor-not-allowed'
                      : 'bg-surface-elevated hover:bg-surface-highlight border-white/10 text-slate-200 active:scale-95'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-white text-purple-700'
                          : 'bg-purple-600 text-white'
                      }`}
                    >
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-bold text-xs sm:text-sm truncate">
                        {p.name}
                      </span>
                      {isSelf && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-medium">
                          You
                        </span>
                      )}
                    </div>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-white shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="w-full flex flex-col items-center gap-1.5 text-center">
          <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3 text-slate-500" />
            <span>Your selection is hidden from everyone until the round ends.</span>
          </div>
          <button
            type="button"
            onClick={handleReturnToSetup}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors pt-1"
          >
            ← Exit to Game Setup
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: PHASE 3 — ROUND REVEAL & SUPERLATIVE CROWNING
  // -------------------------------------------------------------
  if (gamePhase === 'round-reveal') {
    // Tally votes cast in this round
    const roundTally: Record<string, number> = {};
    Object.values(roundVotes).forEach((target) => {
      roundTally[target] = (roundTally[target] || 0) + 1;
    });

    // Find the highest-voted player(s)
    let maxVotes = 0;
    Object.values(roundTally).forEach((cnt) => {
      if (cnt > maxVotes) maxVotes = cnt;
    });

    // TASK 5 Consensus Rule: At least 2 votes must land on top selection
    const hasConsensus = maxVotes >= 2;
    const winners = hasConsensus
      ? players.filter((p) => (roundTally[p.id] || 0) === maxVotes)
      : [];
    const winnerSet = new Set(winners.map((w) => w.id));

    // Voters who earned prediction points (+1 point for voting for any crowned winner)
    const votersWithPoints = hasConsensus
      ? players.filter((p) => roundVotes[p.id] && winnerSet.has(roundVotes[p.id]))
      : [];

    // Live Standings Leaderboard: sorted primarily by Points, then Crowns, then Votes
    const sortedLeaderboard = [...players].sort((a, b) => {
      if ((b.points || 0) !== (a.points || 0)) return (b.points || 0) - (a.points || 0);
      if ((b.crowns || 0) !== (a.crowns || 0)) return (b.crowns || 0) - (a.crowns || 0);
      return b.votes - a.votes;
    });

    return (
      <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-6 flex-1 flex flex-col justify-between items-center animate-fade-in">
        {/* Top Bar */}
        <div className="w-full flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-purple-400">
            Prompt {currentRound} of {gameLength}
          </span>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            Round Reveal
          </span>
        </div>

        {/* Crown / Winner Banner or Split Decision Notice */}
        {hasConsensus && winners.length > 0 ? (
          <div className="w-full p-6 sm:p-8 rounded-3xl bg-surface-elevated border border-purple-500/40 shadow-[0_0_40px_rgba(168,85,247,0.25)] text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-purple-500/20 border border-purple-400/40 flex items-center justify-center mx-auto text-amber-400">
              <Crown className="w-8 h-8 animate-bounce text-amber-400 fill-current" />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                {winners.length > 1 ? '👑 Tied Winners — Shared Crown!' : 'The Group Has Spoken!'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {winners.map((w) => w.name).join(' & ')}
              </h2>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
                <Crown className="w-3.5 h-3.5 fill-current" />
                <span>+1 Crown Awarded</span>
              </div>
              <div className="p-3 mt-2 rounded-xl bg-purple-950/40 border border-purple-500/20 text-xs text-purple-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-0.5">
                  👑 New Collected Title:
                </span>
                <p className="font-semibold italic">"{currentPromptText}"</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full p-6 sm:p-8 rounded-3xl bg-surface-elevated border border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.15)] text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mx-auto text-amber-400">
              <AlertCircle className="w-8 h-8 text-amber-400" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Split Decision — No Consensus
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                No Crowns or Points Awarded
              </h2>
              <p className="text-xs text-slate-300 max-w-md mx-auto pt-1">
                Every vote went to a different player. At least 2 votes must land on the top selection to award crowns and prediction points.
              </p>
              <p className="text-xs text-slate-400 italic pt-1">"{currentPromptText}"</p>
            </div>
          </div>
        )}

        {/* Prediction Points Earned This Round */}
        <div className="w-full p-4 rounded-2xl bg-canvas-base/80 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-purple-400" />
              <span>Prediction Points This Round</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">+1 pt for voting for a winner</span>
          </div>
          {votersWithPoints.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {votersWithPoints.map((voter) => (
                <span
                  key={voter.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{voter.name}</span>
                  <span className="text-[10px] text-emerald-400 font-mono">(+1 pt)</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              {hasConsensus
                ? 'Nobody predicted the crowned winner this round.'
                : 'No prediction points awarded due to split decision.'}
            </p>
          )}
        </div>

        {/* Animated Vote Breakdown Bar Graph */}
        <div className="w-full space-y-2.5 bg-canvas-base/80 p-4 sm:p-5 rounded-2xl border border-white/10">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Vote Distribution:
          </h4>

          {players.map((p) => {
            const votesForP = roundTally[p.id] || 0;
            const percentage = players.length > 0 ? Math.round((votesForP / players.length) * 100) : 0;
            const isRoundWinner = winners.some((w) => w.id === p.id);

            return (
              <div key={p.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-bold flex items-center gap-1.5 ${isRoundWinner ? 'text-amber-300' : 'text-slate-200'}`}>
                    {p.name} {isRoundWinner && <Crown className="w-3.5 h-3.5 text-amber-400 fill-current" />}
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">
                    {votesForP} {votesForP === 1 ? 'vote' : 'votes'} ({percentage}%)
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-surface-highlight overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${
                      isRoundWinner
                        ? 'bg-gradient-to-r from-amber-400 to-purple-500'
                        : 'bg-purple-600/70'
                    }`}
                    style={{ width: `${Math.max(percentage, 5)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Standings Leaderboard */}
        <div className="w-full space-y-2.5 bg-canvas-base/80 p-4 sm:p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Current Standings</span>
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">
              Prompt {currentRound} of {gameLength}
            </span>
          </div>

          <div className="space-y-1.5">
            {sortedLeaderboard.map((p, idx) => (
              <div
                key={p.id}
                className="p-2 sm:p-2.5 rounded-xl bg-surface-elevated/70 border border-white/5 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    idx === 0 ? 'bg-amber-400 text-slate-950 font-black' : 'bg-surface-highlight text-slate-400'
                  }`}>
                    #{idx + 1}
                  </span>
                  <span className="font-bold text-white">{p.name}</span>
                </div>
                <div className="flex items-center gap-2.5 font-mono text-[11px]">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    {p.points || 0} pts
                  </span>
                  <span className="text-amber-400 font-bold flex items-center gap-0.5">
                    <Crown className="w-3 h-3 fill-current" />
                    {p.crowns || 0}
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    ({p.votes} votes)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Prompt CTA & Exit to Setup */}
        <div className="w-full pt-2 flex flex-col items-center gap-2">
          <Button
            variant="primary"
            size="lg"
            onClick={handleNextPrompt}
            className="w-full bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 text-white font-extrabold text-base min-h-[50px] shadow-lg shadow-purple-900/40"
          >
            <span>
              {currentRound >= gameLength
                ? 'View Final Results 🏆'
                : `Next Prompt (${currentRound + 1}/${gameLength}) →`}
            </span>
          </Button>

          <button
            type="button"
            onClick={handleReturnToSetup}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors pt-1"
          >
            ← Exit to Game Setup
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: PHASE 2C — QUICK PICK DISCUSSION (Group Discussion)
  // -------------------------------------------------------------
  if (gamePhase === 'quick-pick-discussion') {
    const selectedPlayer = players.find((p) => p.id === selectedQuickPickPlayerId);

    return (
      <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-6 flex-1 flex flex-col justify-between items-center animate-fade-in">
        {/* Top Bar with Quick Pick Badge */}
        <div className="w-full flex items-center justify-between">
          <span className="text-xs font-bold font-mono text-purple-400">
            Prompt {currentRound} of {gameLength}
          </span>
          <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Quick Pick: Group Discussion</span>
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Question {currentRound} of {gameLength}</span>
            <span>{Math.round(((currentRound - 1) / gameLength) * 100)}% Complete</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-surface-highlight overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-purple-500 transition-all duration-300"
              style={{ width: `${Math.max(Math.round(((currentRound - 1) / gameLength) * 100), 6)}%` }}
            />
          </div>
        </div>

        {/* Prompt Card */}
        <div className="w-full p-5 sm:p-8 rounded-3xl bg-surface-elevated border border-amber-400/40 shadow-[0_0_35px_rgba(245,158,11,0.22)] text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" /> Most Likely To...
          </span>
          <p className="font-display font-bold text-xl sm:text-2xl md:text-3xl text-white leading-relaxed break-words">
            {currentPromptText}
          </p>
          <p className="text-xs text-amber-200/80 font-medium">
            🗣️ Discuss with the group and agree who best fits this prompt!
          </p>
        </div>

        {/* Inline Confirmation Card (When a player is selected) */}
        {isConfirmingQuickPick && selectedPlayer && (
          <div className="w-full p-5 rounded-2xl bg-amber-950/40 border-2 border-amber-400 text-center space-y-3 animate-scale-in shadow-2xl shadow-amber-950/50">
            <div className="flex items-center justify-center gap-2 text-amber-300 font-extrabold text-base sm:text-lg">
              <Crown className="w-5 h-5 text-amber-400 animate-bounce fill-current" />
              <span>Crown {selectedPlayer.name}?</span>
            </div>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              Did the group agree that <span className="font-bold text-white underline decoration-amber-400">{selectedPlayer.name}</span> is most likely?
            </p>
            <div className="flex items-center justify-center gap-3 pt-1">
              <Button
                variant="primary"
                size="md"
                onClick={handleConfirmQuickPickCrown}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-600/40 px-6 min-h-[44px]"
              >
                <Crown className="w-4 h-4 mr-1.5 fill-current" />
                <span>Confirm Crown 👑</span>
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={handleCancelQuickPickSelection}
                className="text-slate-300 hover:text-white px-4 min-h-[44px]"
              >
                <span>Change Player</span>
              </Button>
            </div>
          </div>
        )}

        {/* Player Roster Grid */}
        <div className="w-full space-y-3">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {isConfirmingQuickPick
                ? 'Selected player shown above. Tap another player to change:'
                : 'Device holder: tap the agreed player to award them the crown:'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {players.map((p) => {
              const isSelected = selectedQuickPickPlayerId === p.id;
              const crownCount = p.crowns || 0;

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectQuickPickPlayer(p.id)}
                  className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between gap-2 transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-300 ring-2 ring-amber-400 shadow-xl shadow-amber-500/30 scale-[1.03]'
                      : 'bg-surface-elevated hover:bg-surface-highlight border-white/10 text-slate-200 active:scale-95'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-slate-950 text-amber-300'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 text-left">
                      <span className={`font-bold text-xs sm:text-sm block truncate ${isSelected ? 'text-slate-950' : 'text-white'}`}>
                        {p.name}
                      </span>
                      <span className={`text-[10px] font-mono flex items-center gap-1 ${isSelected ? 'text-slate-800 font-bold' : 'text-amber-400'}`}>
                        <Crown className="w-3 h-3 fill-current" />
                        {crownCount} {crownCount === 1 ? 'Crown' : 'Crowns'}
                      </span>
                    </div>
                  </div>

                  {isSelected && <Crown className="w-4 h-4 text-slate-950 fill-current shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={handleReturnToSetup}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          ← Exit to Game Setup
        </button>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: PHASE 2D — QUICK PICK CROWNED (Awarded Crown & Live Standings)
  // -------------------------------------------------------------
  if (gamePhase === 'quick-pick-crowned') {
    const crownedPlayer = players.find((p) => p.id === selectedQuickPickPlayerId);
    // Sort players by total crowns
    const sortedByCrowns = [...players].sort((a, b) => (b.crowns || 0) - (a.crowns || 0));

    return (
      <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-6 flex-1 flex flex-col justify-between items-center animate-fade-in">
        {/* Top Bar */}
        <div className="w-full flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-purple-400">
            Prompt {currentRound} of {gameLength}
          </span>
          <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
            <Crown className="w-3.5 h-3.5 text-amber-400 fill-current" />
            Crown Awarded
          </span>
        </div>

        {/* Crown Announcement Banner */}
        <div className="w-full p-6 sm:p-8 rounded-3xl bg-surface-elevated border border-amber-400/40 shadow-[0_0_40px_rgba(245,158,11,0.25)] text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mx-auto text-amber-400">
            <Crown className="w-9 h-9 animate-bounce text-amber-400 fill-current" />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Crowned by Group Agreement!
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              {crownedPlayer?.name}
            </h2>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
              <span>+1 Crown Awarded</span>
              <span>• Total: {crownedPlayer?.crowns || 0} 👑</span>
            </div>
            <div className="p-3 mt-2 rounded-xl bg-amber-950/40 border border-amber-500/20 text-xs text-amber-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-0.5">
                👑 New Collected Title:
              </span>
              <p className="font-semibold italic">"{currentPromptText}"</p>
            </div>
          </div>
        </div>

        {/* Live Crowns Leaderboard */}
        <div className="w-full space-y-2.5 bg-canvas-base/80 p-4 sm:p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Current Crown Leaderboard:</span>
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">
              Prompt {currentRound} of {gameLength}
            </span>
          </div>

          {sortedByCrowns.map((p, idx) => {
            const isWinnerThisRound = p.id === crownedPlayer?.id;
            return (
              <div
                key={p.id}
                className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-between transition-all ${
                  isWinnerThisRound
                    ? 'bg-amber-500/10 border-amber-500/40'
                    : 'bg-surface-elevated/60 border-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    idx === 0 ? 'bg-amber-400 text-slate-950' : 'bg-surface-highlight text-slate-300'
                  }`}>
                    #{idx + 1}
                  </span>
                  <span className="font-bold text-sm text-white flex items-center gap-1.5">
                    {p.name}
                    {isWinnerThisRound && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black uppercase">
                        +1 Crown
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1 font-mono text-xs font-bold text-amber-400">
                  <Crown className="w-3.5 h-3.5 fill-current" />
                  <span>{p.crowns || 0} {p.crowns === 1 ? 'Crown' : 'Crowns'}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Next Question CTA */}
        <div className="w-full pt-2">
          <Button
            variant="primary"
            size="lg"
            onClick={handleQuickPickNextQuestion}
            className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-purple-600 text-slate-950 font-black text-base min-h-[50px] shadow-lg shadow-amber-900/40"
          >
            <span>
              {currentRound >= gameLength
                ? 'View Final Results 🏆'
                : `Next Question (${currentRound + 1}/${gameLength}) →`}
            </span>
          </Button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: PHASE 4 — FINAL GAME OVER & PODIUM
  // -------------------------------------------------------------
  if (gamePhase === 'game-over') {
    const isQuickPick = passAndPlaySubMode === 'quick-pick';

    // Sort players: by crowns for Quick Pick; by Points (primary), then Crowns, then Votes for Secret Voting
    const sortedPlayers = [...players].sort((a, b) => {
      if (isQuickPick) {
        return (b.crowns || 0) - (a.crowns || 0);
      }
      if ((b.points || 0) !== (a.points || 0)) {
        return (b.points || 0) - (a.points || 0);
      }
      if ((b.crowns || 0) !== (a.crowns || 0)) {
        return (b.crowns || 0) - (a.crowns || 0);
      }
      return b.votes - a.votes;
    });

    const topScore = isQuickPick
      ? sortedPlayers[0]?.crowns || 0
      : sortedPlayers[0]?.points || 0;

    const champions = sortedPlayers.filter((p) =>
      isQuickPick ? (p.crowns || 0) === topScore : (p.points || 0) === topScore
    );
    const isTie = champions.length > 1;

    // For Secret Voting: also determine the Most Crowned Player(s)
    const maxCrowns = Math.max(...players.map((p) => p.crowns || 0));
    const crownedLeaders = players.filter((p) => (p.crowns || 0) === maxCrowns && maxCrowns > 0);

    return (
      <div className="w-full max-w-xl mx-auto px-4 py-8 space-y-6 flex-1 flex flex-col justify-center items-center text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-purple-600 flex items-center justify-center mx-auto shadow-2xl shadow-purple-900/60">
          <Crown className="w-10 h-10 text-white animate-bounce fill-current" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-purple-400">
            Game Completed ({gameLength} Prompts)
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Final Standings
          </h1>
          <p className="text-xs text-slate-400">
            {isQuickPick
              ? 'Final crown champions of Quick Pick Most Likely To!'
              : 'Final scores and collected superlative crowns!'}
          </p>
        </div>

        {/* Podium Display */}
        <div className="w-full p-6 rounded-3xl bg-surface-elevated border border-purple-500/40 shadow-[0_0_40px_rgba(168,85,247,0.25)] space-y-4">
          <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-400/40 space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center justify-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>
                {isTie
                  ? '🤝 Shared Victory! Tied Champions'
                  : isQuickPick
                  ? '🥇 Quick Pick Crown Champion'
                  : '🥇 Overall Prediction Champion'}
              </span>
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              {champions.map((c) => c.name).join(' & ')}
            </h3>
            <span className="text-xs font-mono text-purple-300 font-bold block">
              {isQuickPick
                ? `${topScore} ${topScore === 1 ? 'Crown' : 'Crowns'}`
                : `${topScore} ${topScore === 1 ? 'Prediction Point' : 'Prediction Points'}`}
            </span>

            {/* Most Crowned Player highlight in Secret Voting */}
            {!isQuickPick && crownedLeaders.length > 0 && (
              <div className="pt-2 mt-2 border-t border-purple-400/20 text-xs text-amber-300 flex items-center justify-center gap-1.5">
                <Crown className="w-3.5 h-3.5 fill-current text-amber-400" />
                <span>
                  Most Crowned: <strong className="text-white">{crownedLeaders.map((c) => c.name).join(' & ')}</strong> ({maxCrowns} 👑)
                </span>
              </div>
            )}
          </div>

          {/* Full Roster Leaderboard with Collected Titles */}
          <div className="space-y-3 text-left pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Final Leaderboard & Collected Titles:
            </span>
            {sortedPlayers.map((p, idx) => {
              const isChamp = champions.some((c) => c.id === p.id);
              const playerTitles = p.titles || [];

              return (
                <div
                  key={p.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isChamp
                      ? 'bg-purple-950/30 border-purple-500/50 shadow-md shadow-purple-950/40'
                      : 'bg-canvas-base/80 border-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                          idx === 0
                            ? 'bg-amber-400 text-slate-950 font-black'
                            : 'bg-surface-highlight text-slate-300'
                        }`}
                      >
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-sm text-white flex items-center gap-1.5">
                        {p.name}
                        {isChamp && <Trophy className="w-3.5 h-3.5 text-amber-400" />}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 font-mono text-xs font-bold">
                      {!isQuickPick && (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Target className="w-3.5 h-3.5" />
                          <span>{p.points || 0} pts</span>
                        </span>
                      )}
                      <span className="text-amber-400 flex items-center gap-1">
                        <Crown className="w-3.5 h-3.5 fill-current" />
                        <span>{p.crowns || 0} 👑</span>
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        ({p.votes} votes)
                      </span>
                    </div>
                  </div>

                  {/* Collected Titles for this player */}
                  <div className="mt-2.5 pt-2 border-t border-white/5 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Crown className="w-3 h-3 text-amber-400 fill-current" />
                      <span>Collected Titles ({playerTitles.length}):</span>
                    </span>
                    {playerTitles.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {playerTitles.map((title, tIdx) => (
                          <span
                            key={tIdx}
                            className="inline-block px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-200 text-[11px] italic font-medium max-w-full truncate"
                            title={title}
                          >
                            "{title}"
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-500 italic">No crowns earned yet</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action CTAs */}
        <div className="w-full space-y-2.5 pt-2">
          <Button
            variant="primary"
            size="lg"
            onClick={handlePlayAgain}
            className="w-full bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 text-white font-extrabold text-base min-h-[50px] shadow-lg shadow-purple-900/40"
          >
            <RotateCcw className="w-5 h-5 mr-1" />
            <span>Play Again (Same Players)</span>
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={handleReturnToSetup}
            className="w-full text-slate-300 hover:text-white"
          >
            <Settings className="w-4 h-4 mr-1.5 text-purple-400" />
            <span>Change Game Setup</span>
          </Button>

          <Link href={`/${locale}/games`} className="w-full block">
            <Button
              variant="secondary"
              size="md"
              className="w-full text-slate-400 hover:text-slate-200 border-dashed border-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Back to Games</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
