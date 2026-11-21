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
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { sound } from '@/lib/audio/soundSynthesizer';
import { triggerConfetti } from '@/components/game/ConfettiCelebration';
import { questionEngine } from '@/lib/questions/engine';
import { Question } from '@/types';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { cleanQuestionPrompt } from '@/lib/questions/cleanPrompt';

export interface MostLikelyPlayer {
  id: string;
  name: string;
  votes: number;
}

const DEFAULT_PLAYERS: MostLikelyPlayer[] = [
  { id: 'player-1', name: 'Alex', votes: 0 },
  { id: 'player-2', name: 'Maya', votes: 0 },
  { id: 'player-3', name: 'Jordan', votes: 0 },
  { id: 'player-4', name: 'Sarah', votes: 0 },
];

const STORAGE_KEY = 'playtruthndare_most_likely_to_players';

export function MostLikelyToClient() {
  const router = useRouter();
  const { t, dict, locale } = useTranslation();

  // Players State
  const [players, setPlayers] = useState<MostLikelyPlayer[]>(DEFAULT_PLAYERS);
  const [votedPlayerId, setVotedPlayerId] = useState<string | null>(null);
  const [drawnIds, setDrawnIds] = useState<string[]>([]);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  // Modal State for "Manage Players"
  const [isManagePlayersOpen, setIsManagePlayersOpen] = useState(false);
  const [draftPlayers, setDraftPlayers] = useState<MostLikelyPlayer[]>([]);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editingRowName, setEditingRowName] = useState<string>('');
  const [modalError, setModalError] = useState<string>('');
  const [modalSuccess, setModalSuccess] = useState<string>('');
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');

  // 1. Persistence on Client Mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 2) {
          setPlayers(parsed);
        }
      }
    } catch { }
  }, []);

  // Save helper to persist changes
  const savePlayersToStorage = (updated: MostLikelyPlayer[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch { }
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

  // Re-draw if locale changes to keep language purely in sync
  useEffect(() => {
    const result = questionEngine.drawNextCard({
      gameId: 'most-likely-to',
      language: locale,
      drawnCardIds: [],
    });
    if (result.card) {
      setCurrentCard(result.card);
      setVotedPlayerId(null);
      setDrawnIds([]);
    }
  }, [locale]);

  // Handle Player Vote
  const handleVotePlayer = (playerId: string) => {
    if (votedPlayerId !== null) return;

    sound.playVictory();
    sound.triggerHaptic([25, 40, 25]);
    triggerConfetti();
    setVotedPlayerId(playerId);

    setPlayers((prev) => {
      const updated = prev.map((p) => (p.id === playerId ? { ...p, votes: p.votes + 1 } : p));
      savePlayersToStorage(updated);
      return updated;
    });
  };

  // Handle Next Prompt
  const handleNextPrompt = () => {
    sound.playWhoosh();
    sound.triggerHaptic(15);
    setVotedPlayerId(null);

    const nextIds = currentCard ? [...drawnIds, currentCard.id] : drawnIds;
    setDrawnIds(nextIds);

    const result = questionEngine.drawNextCard({
      gameId: 'most-likely-to',
      language: locale,
      drawnCardIds: nextIds,
    });

    if (result.card) {
      setCurrentCard(result.card);
      sound.playChime();
    } else {
      setDrawnIds([]);
      const restart = questionEngine.drawNextCard({
        gameId: 'most-likely-to',
        language: locale,
        drawnCardIds: [],
      });
      setCurrentCard(restart.card);
    }
  };

  // Open "Manage Players" Modal
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

  // Start editing a specific row
  const startEditingRow = (player: MostLikelyPlayer) => {
    sound.triggerHaptic(10);
    setEditingRowId(player.id);
    setEditingRowName(player.name);
    setModalError('');
    setModalSuccess('');
  };

  // Save individual row change
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

    if (/<[^>]*>/g.test(clean)) {
      setModalError('Player name contains invalid characters.');
      sound.triggerHaptic(20);
      return;
    }

    // Duplicate check among draft players
    const isDuplicate = draftPlayers.some(
      (p) => p.id !== playerId && p.name.trim().toLowerCase() === clean.toLowerCase()
    );
    if (isDuplicate) {
      setModalError('A player with this name already exists.');
      sound.triggerHaptic(20);
      return;
    }

    const oldPlayer = draftPlayers.find((p) => p.id === playerId);
    setDraftPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, name: clean } : p))
    );
    setEditingRowId(null);
    setEditingRowName('');
    setModalError('');
    setModalSuccess(oldPlayer ? `Updated "${oldPlayer.name}" to "${clean}"` : 'Name saved!');
    sound.playChime();
  };

  // Cancel individual row edit
  const cancelIndividualRow = () => {
    setEditingRowId(null);
    setEditingRowName('');
    setModalError('');
  };

  // Add a new player in draft
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
    setModalError('');
    setModalSuccess(`Added player "${clean}"!`);
    sound.playChime();
  };

  // Remove a player in draft
  const handleRemovePlayer = (playerId: string) => {
    if (draftPlayers.length <= 2) {
      setModalError('At least 2 players are required.');
      return;
    }
    setDraftPlayers((prev) => prev.filter((p) => p.id !== playerId));
    setModalError('');
  };

  // Reset to default Alex, Maya, Jordan, Sarah
  const handleResetToDefaults = () => {
    setDraftPlayers(DEFAULT_PLAYERS.map((p) => ({ ...p })));
    setEditingRowId(null);
    setEditingRowName('');
    setModalError('');
    setModalSuccess('Reset roster to default players (Alex, Maya, Jordan, Sarah).');
    sound.triggerHaptic(15);
  };

  // Save all changes and close modal
  const handleSaveAllChanges = () => {
    // If a row is currently in an unsubmitted input, validate and commit it
    let currentDraft = [...draftPlayers];
    if (editingRowId) {
      const clean = editingRowName.trim().replace(/\s+/g, ' ');
      if (!clean) {
        setModalError('Player name cannot be empty.');
        return;
      }
      if (clean.length > 24) {
        setModalError('Player name must be 24 characters or less.');
        return;
      }
      if (
        currentDraft.some(
          (p) => p.id !== editingRowId && p.name.trim().toLowerCase() === clean.toLowerCase()
        )
      ) {
        setModalError('Player names must be unique.');
        return;
      }
      currentDraft = currentDraft.map((p) =>
        p.id === editingRowId ? { ...p, name: clean } : p
      );
    }

    // Validate that every player has a valid name and no duplicates
    for (let i = 0; i < currentDraft.length; i++) {
      const p = currentDraft[i];
      if (!p.name.trim()) {
        setModalError('All players must have a name.');
        return;
      }
      for (let j = i + 1; j < currentDraft.length; j++) {
        if (p.name.trim().toLowerCase() === currentDraft[j].name.trim().toLowerCase()) {
          setModalError(`Duplicate player name found: "${p.name}".`);
          return;
        }
      }
    }

    sound.playVictory();
    sound.triggerHaptic([20, 40]);
    setPlayers(currentDraft);
    savePlayersToStorage(currentDraft);
    setIsManagePlayersOpen(false);
  };

  // Create Multiplayer Room handler
  const handleCreateMultiplayerRoom = async () => {
    setIsCreatingRoom(true);
    sound.triggerHaptic(15);
    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: 'most-likely-to',
          categoryId: 'party',
          hostName: players[0]?.name || 'Host',
          language: locale,
        }),
      });
      const data = await res.json();
      if (data.success && data.roomCode) {
        if (typeof window !== 'undefined') {
          const sessionPayload = JSON.stringify({
            roomId: data.roomId,
            roomCode: data.roomCode,
            playerId: data.hostPlayerId,
            sessionToken: data.sessionToken,
            playerName: players[0]?.name || 'Host',
          });
          localStorage.setItem(`playtruthndare_multiplayer_session_${data.roomCode}`, sessionPayload);
        }
        sound.playChime();
        router.push(`/room/${data.roomCode}`);
      } else {
        setIsCreatingRoom(false);
      }
    } catch {
      setIsCreatingRoom(false);
    }
  };

  const currentPromptText = cleanQuestionPrompt(
    currentCard?.question_text || currentCard?.prompt || dict.mostLikelyTo.whoIsMostLikely
  );

  return (
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-6 sm:space-y-8 flex-1 flex flex-col justify-between items-center">
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between">
        <Link
          href={`/${locale}/games`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> {dict.nav.allGames}
        </Link>
        <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
          {dict.mostLikelyTo.badge}
        </span>
      </div>

      {/* Header Titles */}
      <div className="text-center space-y-2 px-2">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl md:text-5xl text-white">
          {dict.mostLikelyTo.title}
        </h1>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          {dict.mostLikelyTo.subtitle}
        </p>
      </div>

      {/* Main Question Card with Edit Players button next to GROUP VOTING badge */}
      <div className="w-full p-5 sm:p-8 md:p-10 rounded-3xl bg-surface-elevated border border-amber-400/30 shadow-[0_0_35px_rgba(245,158,11,0.25)] text-center space-y-4">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {dict.mostLikelyTo.badge}
          </span>

          {/* Button Placement 1: Near top next to GROUP VOTING badge */}
          <button
            type="button"
            onClick={openManagePlayersModal}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-highlight hover:bg-brand-500/20 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition-all active:scale-95 shadow-sm"
            title="Edit player names"
          >
            <Edit3 className="w-3.5 h-3.5 text-brand-400 shrink-0" />
            <span>Edit Players</span>
          </button>
        </div>

        <p className="font-display font-bold text-xl sm:text-2xl md:text-3xl text-white leading-relaxed break-words">
          {currentPromptText}
        </p>
      </div>

      {/* Player Voting Roster Grid */}
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {dict.mostLikelyTo.castVote}:
          </p>

          <span className="text-[11px] font-mono text-slate-400">
            {players.length} Players • {players.reduce((sum, p) => sum + p.votes, 0)} Votes
          </span>
        </div>

        {/* Voting Buttons */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {players.map((p) => {
            const isWinner = votedPlayerId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleVotePlayer(p.id)}
                disabled={votedPlayerId !== null}
                className={`p-2.5 sm:p-4 rounded-2xl border flex items-center justify-between gap-1.5 min-w-0 transition-all ${isWinner
                  ? 'bg-amber-500/20 border-amber-400 text-white shadow-glow-brand scale-[1.02]'
                  : 'bg-surface-elevated hover:bg-surface-highlight border-white/10 text-slate-200'
                  }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand-600 flex items-center justify-center font-bold text-xs text-white shrink-0">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <span className="font-bold text-xs sm:text-sm truncate">{p.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {p.votes} {p.votes === 1 ? 'vote' : 'votes'}
                    </span>
                  </div>
                </div>
                {isWinner && (
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 animate-bounce shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Action Controls directly below the voting roster */}
        <div className="flex items-center justify-between pt-1 px-0.5 gap-2 flex-wrap">
          {/* Button Placement 2: Below player voting section */}
          <button
            type="button"
            onClick={openManagePlayersModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-elevated hover:bg-surface-highlight border border-white/10 text-xs font-bold text-slate-200 hover:text-white transition-all active:scale-95 shadow-sm"
            title="Edit player names and roster"
          >
            <Edit3 className="w-3.5 h-3.5 text-brand-400" />
            <span>Edit Players</span>
          </button>

          <button
            type="button"
            onClick={handleCreateMultiplayerRoom}
            disabled={isCreatingRoom}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500/15 hover:bg-brand-500/25 border border-brand-400/30 text-xs font-bold text-brand-300 hover:text-white transition-all active:scale-95 shadow-sm"
            title="Host an online room and invite friends"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isCreatingRoom ? 'Creating Room...' : 'Play Online With Friends'}</span>
          </button>
        </div>
      </div>

      {/* Next Prompt */}
      <div className="w-full max-w-md pt-2">
        {votedPlayerId !== null ? (
          <Button
            variant="primary"
            size="xl"
            onClick={handleNextPrompt}
            className="w-full text-base font-bold gap-2 min-h-[48px]"
          >
            <span>{dict.mostLikelyTo.nextPrompt}</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
        ) : (
          <p className="text-center text-xs text-slate-500">
            {dict.mostLikelyTo.subtitle}
          </p>
        )}
      </div>

      {/* ========================================================
          MANAGE PLAYERS MODAL
         ======================================================== */}
      {isManagePlayersOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="manage-players-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-canvas-base/80 backdrop-blur-md animate-fade-in"
        >
          <div className="w-full max-w-md p-4 sm:p-6 rounded-3xl bg-surface-elevated border border-brand-500/30 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-500/15 border border-brand-400/30 flex items-center justify-center text-brand-400">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 id="manage-players-title" className="font-display font-bold text-base sm:text-lg text-white">
                    Manage Players
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Change names or customize the voting group
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsManagePlayersOpen(false)}
                className="p-1.5 rounded-xl bg-surface-highlight hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error / Success Feedback */}
            {modalError && (
              <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-300 text-xs font-semibold flex items-center justify-between animate-fade-in">
                <span>{modalError}</span>
                <button
                  type="button"
                  onClick={() => setModalError('')}
                  className="p-0.5 text-rose-300 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {modalSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fade-in">
                <span>{modalSuccess}</span>
                <button
                  type="button"
                  onClick={() => setModalSuccess('')}
                  className="p-0.5 text-emerald-300 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Players List with Individual Edit Rows */}
            <div className="space-y-2">
              {draftPlayers.map((p, idx) => {
                const isEditing = editingRowId === p.id;
                return (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-2xl bg-canvas-base/80 border border-white/5 hover:border-white/10 transition-colors"
                  >
                    {isEditing ? (
                      /* Active Inline Edit Input Form */
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>Editing Player #{idx + 1}</span>
                          <span className="font-mono text-[10px]">{editingRowName.length}/24</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            autoFocus
                            maxLength={24}
                            value={editingRowName}
                            onChange={(e) => {
                              setEditingRowName(e.target.value);
                              if (modalError) setModalError('');
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                saveIndividualRow(p.id);
                              } else if (e.key === 'Escape') {
                                cancelIndividualRow();
                              }
                            }}
                            placeholder="Enter player name..."
                            className="flex-1 h-9 px-3 rounded-xl bg-surface-highlight border border-brand-400/40 text-white font-semibold text-xs focus:outline-none focus:border-brand-300"
                          />
                          <button
                            type="button"
                            onClick={() => saveIndividualRow(p.id)}
                            className="h-9 px-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95"
                            title="Save name"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Save</span>
                          </button>
                          <button
                            type="button"
                            onClick={cancelIndividualRow}
                            className="h-9 px-2.5 rounded-xl bg-surface-highlight hover:bg-white/10 text-slate-300 text-xs font-semibold"
                            title="Cancel edit"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Normal Display Row with [Edit] Button */
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-brand-600/80 flex items-center justify-center font-bold text-xs text-white shrink-0">
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-white truncate">
                              {p.name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              {p.votes} votes logged
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => startEditingRow(p)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-highlight hover:bg-brand-500/20 hover:text-brand-300 text-slate-200 text-xs font-semibold border border-white/5 transition-all"
                            title={`Change name for ${p.name}`}
                          >
                            <Edit3 className="w-3 h-3 text-brand-400" />
                            <span>Edit</span>
                          </button>

                          {draftPlayers.length > 2 && (
                            <button
                              type="button"
                              onClick={() => handleRemovePlayer(p.id)}
                              className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title={`Remove ${p.name}`}
                              aria-label={`Remove ${p.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add Player Control */}
            {isAddingPlayer ? (
              <div className="p-3 rounded-2xl bg-canvas-base border border-brand-400/30 space-y-2">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Add New Player
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    autoFocus
                    maxLength={24}
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddNewPlayer();
                      } else if (e.key === 'Escape') {
                        setIsAddingPlayer(false);
                      }
                    }}
                    placeholder="Enter new player name..."
                    className="flex-1 h-9 px-3 rounded-xl bg-surface-highlight border border-white/10 text-white font-semibold text-xs focus:outline-none focus:border-brand-400"
                  />
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleAddNewPlayer}
                    className="font-bold text-xs"
                  >
                    Add
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setIsAddingPlayer(false);
                      setNewPlayerName('');
                    }}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              draftPlayers.length < 12 && (
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingPlayer(true);
                    setModalError('');
                  }}
                  className="w-full py-2 rounded-xl border border-dashed border-white/15 hover:border-brand-400/50 hover:bg-white/5 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-brand-400" />
                  <span>Add Another Player</span>
                </button>
              )
            )}

            {/* Modal Bottom Actions */}
            <div className="pt-2 space-y-2">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setIsManagePlayersOpen(false)}
                  className="flex-1 font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleSaveAllChanges}
                  className="flex-1 font-bold shadow-glow-brand"
                >
                  Save Changes
                </Button>
              </div>

              <button
                type="button"
                onClick={handleResetToDefaults}
                className="w-full text-center text-[11px] text-slate-500 hover:text-slate-300 py-1 transition-colors flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to default players (Alex, Maya, Jordan, Sarah)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
