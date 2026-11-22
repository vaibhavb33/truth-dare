'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Smartphone,
  Globe,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Play,
  RotateCcw,
  Sparkles,
  Copy,
  Share2,
  ArrowLeft,
  Clock,
  ShieldCheck,
  AlertCircle,
  Lock,
  Zap,
  Crown,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { sound } from '@/lib/audio/soundSynthesizer';
import { triggerConfetti } from '@/components/game/ConfettiCelebration';
import { useTranslation } from '@/lib/i18n/LanguageContext';

export interface MostLikelyPlayer {
  id: string;
  name: string;
  votes: number;
  crowns?: number;
  points?: number;
  titles?: string[];
}

export type GameLengthOption = 5 | 10 | 15;
export type PlayingMode = 'pass-and-play' | 'online';
export type PassAndPlaySubMode = 'secret-voting' | 'quick-pick';

interface MostLikelyToSetupProps {
  initialPlayers: MostLikelyPlayer[];
  initialGameLength?: GameLengthOption;
  initialSubMode?: PassAndPlaySubMode;
  onStartPassAndPlay: (config: {
    players: MostLikelyPlayer[];
    gameLength: GameLengthOption;
    subMode?: PassAndPlaySubMode;
  }) => void;
}

const DEFAULT_PLAYERS: MostLikelyPlayer[] = [
  { id: 'player-1', name: 'Alex', votes: 0 },
  { id: 'player-2', name: 'Maya', votes: 0 },
  { id: 'player-3', name: 'Jordan', votes: 0 },
  { id: 'player-4', name: 'Sarah', votes: 0 },
];

export function MostLikelyToSetup({
  initialPlayers,
  initialGameLength = 10,
  initialSubMode = 'secret-voting',
  onStartPassAndPlay,
}: MostLikelyToSetupProps) {
  const router = useRouter();
  const { dict, locale } = useTranslation();

  // Playing Mode
  const [playingMode, setPlayingMode] = useState<PlayingMode>('pass-and-play');

  // Pass & Play SubMode (Secret Voting vs Quick Pick)
  const [subMode, setSubMode] = useState<PassAndPlaySubMode>(initialSubMode);

  // Game Length
  const [gameLength, setGameLength] = useState<GameLengthOption>(initialGameLength);

  // Player Management (Pass & Play)
  const [players, setPlayers] = useState<MostLikelyPlayer[]>(
    initialPlayers && initialPlayers.length >= 3 ? initialPlayers : DEFAULT_PLAYERS
  );
  const [newPlayerName, setNewPlayerName] = useState('');
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editingPlayerName, setEditingPlayerName] = useState('');
  const [playerError, setPlayerError] = useState<string>('');
  const [playerSuccess, setPlayerSuccess] = useState<string>('');

  // Online Multiplayer State
  const [hostName, setHostName] = useState<string>(players[0]?.name || 'Alex');
  const [hostPlayerId, setHostPlayerId] = useState<string>('');
  const [hostSessionToken, setHostSessionToken] = useState<string>('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null);
  const [onlinePlayers, setOnlinePlayers] = useState<Array<{ id: string; name: string; isHost?: boolean }>>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [joinInputCode, setJoinInputCode] = useState('');
  const [joinError, setJoinError] = useState('');

  // Auto-clear success/error message
  useEffect(() => {
    if (playerSuccess) {
      const timer = setTimeout(() => setPlayerSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [playerSuccess]);

  // Keep host name in sync if first player changes
  useEffect(() => {
    if (players.length > 0 && !createdRoomCode) {
      setHostName(players[0].name);
    }
  }, [players, createdRoomCode]);

  // -------------------------------------------------------------
  // PLAYER MANAGEMENT HANDLERS (Pass & Play)
  // -------------------------------------------------------------
  const handleAddPlayer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPlayerError('');
    const clean = newPlayerName.trim().replace(/\s+/g, ' ');

    if (!clean) {
      setPlayerError('Please enter a player name.');
      sound.triggerHaptic(20);
      return;
    }

    if (clean.length > 24) {
      setPlayerError('Name must be 24 characters or less.');
      sound.triggerHaptic(20);
      return;
    }

    if (players.some((p) => p.name.trim().toLowerCase() === clean.toLowerCase())) {
      setPlayerError(`"${clean}" is already in the player list.`);
      sound.triggerHaptic(20);
      return;
    }

    if (players.length >= 12) {
      setPlayerError('Maximum 12 players allowed.');
      sound.triggerHaptic(20);
      return;
    }

    const newPlayer: MostLikelyPlayer = {
      id: `player-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: clean,
      votes: 0,
    };

    setPlayers((prev) => [...prev, newPlayer]);
    setNewPlayerName('');
    setPlayerSuccess(`Added ${clean} to the game!`);
    sound.playChime();
    sound.triggerHaptic(10);
  };

  const handleStartEdit = (player: MostLikelyPlayer) => {
    setPlayerError('');
    setEditingPlayerId(player.id);
    setEditingPlayerName(player.name);
    sound.triggerHaptic(10);
  };

  const handleSaveEdit = (playerId: string) => {
    const clean = editingPlayerName.trim().replace(/\s+/g, ' ');

    if (!clean) {
      setPlayerError('Player name cannot be empty.');
      sound.triggerHaptic(20);
      return;
    }

    if (clean.length > 24) {
      setPlayerError('Name must be 24 characters or less.');
      sound.triggerHaptic(20);
      return;
    }

    const isDuplicate = players.some(
      (p) => p.id !== playerId && p.name.trim().toLowerCase() === clean.toLowerCase()
    );
    if (isDuplicate) {
      setPlayerError(`A player named "${clean}" already exists.`);
      sound.triggerHaptic(20);
      return;
    }

    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, name: clean } : p))
    );
    setEditingPlayerId(null);
    setEditingPlayerName('');
    setPlayerSuccess(`Updated name to ${clean}!`);
    sound.playChime();
  };

  const handleCancelEdit = () => {
    setEditingPlayerId(null);
    setEditingPlayerName('');
    setPlayerError('');
  };

  const handleRemovePlayer = (playerId: string) => {
    if (players.length <= 3) {
      setPlayerError('Most Likely To requires at least 3 players.');
      sound.triggerHaptic(20);
      return;
    }
    setPlayers((prev) => prev.filter((p) => p.id !== playerId));
    setPlayerError('');
    sound.triggerHaptic(15);
  };

  const handleResetDefaults = () => {
    setPlayers(DEFAULT_PLAYERS.map((p) => ({ ...p })));
    setEditingPlayerId(null);
    setPlayerError('');
    setPlayerSuccess('Reset roster to default 4 players.');
    sound.triggerHaptic(15);
  };

  const handleStartPassAndPlay = () => {
    if (players.length < 3) {
      setPlayerError('Please add at least 3 players to start.');
      sound.triggerHaptic(25);
      return;
    }
    sound.playVictory();
    sound.triggerHaptic([20, 40]);
    onStartPassAndPlay({
      players,
      gameLength,
      subMode,
    });
  };

  // -------------------------------------------------------------
  // ONLINE MULTIPLAYER HANDLERS
  // -------------------------------------------------------------
  const handleCreateRoom = async () => {
    const cleanHost = hostName.trim() || 'Host';
    setIsCreatingRoom(true);
    setJoinError('');
    sound.triggerHaptic(15);

    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: 'most-likely-to',
          categoryId: 'party',
          hostName: cleanHost,
          language: locale,
          maxPlayers: 12,
          gameLength,
        }),
      });

      const data = await res.json();
      if (data.success && data.roomCode) {
        setCreatedRoomCode(data.roomCode);
        setHostPlayerId(data.hostPlayerId);
        setHostSessionToken(data.sessionToken);
        setOnlinePlayers(data.room?.players || [{ id: data.hostPlayerId, name: cleanHost, isHost: true }]);

        if (typeof window !== 'undefined') {
          const sessionPayload = JSON.stringify({
            roomId: data.roomId,
            roomCode: data.roomCode,
            playerId: data.hostPlayerId,
            sessionToken: data.sessionToken,
            playerName: cleanHost,
          });
          localStorage.setItem(`playtruthndare_multiplayer_session_${data.roomCode}`, sessionPayload);
        }

        sound.playChime();
        triggerConfetti();
      } else {
        setJoinError(data.error || 'Failed to create room.');
      }
    } catch {
      setJoinError('Network error creating room. Please try again.');
    } finally {
      setIsCreatingRoom(false);
    }
  };

  // Poll room for joining players
  useEffect(() => {
    if (!createdRoomCode) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/rooms/${createdRoomCode}`);
        const data = await res.json();
        if (data.success && data.room?.players) {
          setOnlinePlayers(data.room.players);
        }
      } catch {
        // silent polling error
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [createdRoomCode]);

  const invitationUrl = typeof window !== 'undefined' && createdRoomCode
    ? `${window.location.origin}/room/${createdRoomCode}`
    : `https://playtruthndare.com/room/${createdRoomCode || ''}`;

  const handleCopyLink = () => {
    if (!createdRoomCode) return;
    navigator.clipboard.writeText(invitationUrl);
    setCopiedLink(true);
    sound.playChime();
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = () => {
    if (!createdRoomCode) return;
    navigator.clipboard.writeText(createdRoomCode);
    setCopiedCode(true);
    sound.playChime();
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleShareInvite = async () => {
    if (!createdRoomCode) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Most Likely To on Play Truth & Dare!',
          text: `Join my Most Likely To party room with code ${createdRoomCode}!`,
          url: invitationUrl,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleKickOnlinePlayer = async (targetPlayerId: string) => {
    sound.triggerHaptic(15);
    if (!createdRoomCode || !hostPlayerId || !hostSessionToken) return;
    try {
      const res = await fetch('/api/rooms/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: createdRoomCode,
          playerId: hostPlayerId,
          sessionToken: hostSessionToken,
          action: 'KICK_PLAYER',
          payload: { targetPlayerId },
        }),
      });
      const data = await res.json();
      if (data.success && data.room?.players) {
        setOnlinePlayers(data.room.players);
      }
    } catch {}
  };

  const handleStartOnlineGame = async () => {
    if (!createdRoomCode) return;
    if (onlinePlayers.length < 3) {
      setJoinError('At least 3 players must join the room before starting.');
      sound.triggerHaptic(20);
      return;
    }
    sound.playVictory();

    // Start game on server
    if (hostPlayerId && hostSessionToken) {
      try {
        await fetch('/api/rooms/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomCode: createdRoomCode,
            playerId: hostPlayerId,
            sessionToken: hostSessionToken,
            action: 'START_GAME',
          }),
        });
      } catch {}
    }

    router.push(`/room/${createdRoomCode}`);
  };

  const handleJoinExistingRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = joinInputCode.trim().toUpperCase();
    if (cleanCode.length !== 6) {
      setJoinError('Room codes are exactly 6 letters/numbers.');
      return;
    }
    sound.playWhoosh();
    router.push(`/room/${cleanCode}`);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-6 sm:space-y-8 flex-1 flex flex-col justify-between items-center animate-fade-in">
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between">
        <Link
          href={`/${locale}/games`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {dict.nav.allGames}
        </Link>
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold uppercase tracking-wider shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Game Setup
        </span>
      </div>

      {/* Header Titles */}
      <div className="text-center space-y-2 px-2">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl md:text-5xl text-white tracking-tight">
          Most Likely To
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Vote on who in your group fits wild prompts. Choose your play mode, roster, and round length to begin.
        </p>
      </div>

      {/* Main Setup Card Container with Purple Accents */}
      <div className="w-full p-5 sm:p-7 rounded-3xl bg-surface-elevated border border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.18)] space-y-6">
        {/* =========================================================
            SECTION 1: PLAYING OPTION SELECTOR (Pass & Play vs Online)
           ========================================================= */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
            <span>1. Choose Playing Mode</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* OPTION 1: PASS & PLAY */}
            <button
              type="button"
              onClick={() => {
                setPlayingMode('pass-and-play');
                sound.triggerHaptic(10);
              }}
              className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                playingMode === 'pass-and-play'
                  ? 'bg-purple-950/30 border-purple-400 ring-2 ring-purple-500/40 shadow-[0_0_25px_rgba(168,85,247,0.25)]'
                  : 'bg-canvas-base/80 hover:bg-canvas-base border-white/10 text-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      playingMode === 'pass-and-play'
                        ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30'
                        : 'bg-surface-highlight text-slate-400 group-hover:text-purple-300'
                    }`}
                  >
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm sm:text-base text-white">
                      Pass & Play
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                      Single Device
                    </span>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    playingMode === 'pass-and-play'
                      ? 'border-purple-400 bg-purple-500 text-white'
                      : 'border-slate-600 bg-transparent'
                  }`}
                >
                  {playingMode === 'pass-and-play' && <Check className="w-3.5 h-3.5" />}
                </div>
              </div>

              <p className="mt-2.5 text-xs text-slate-400 leading-relaxed">
                One phone is passed around the group. Each friend votes privately on their turn, keeping votes secret until the reveal.
              </p>
            </button>

            {/* OPTION 2: PLAY ONLINE */}
            <button
              type="button"
              onClick={() => {
                setPlayingMode('online');
                sound.triggerHaptic(10);
              }}
              className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                playingMode === 'online'
                  ? 'bg-purple-950/30 border-purple-400 ring-2 ring-purple-500/40 shadow-[0_0_25px_rgba(168,85,247,0.25)]'
                  : 'bg-canvas-base/80 hover:bg-canvas-base border-white/10 text-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      playingMode === 'online'
                        ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30'
                        : 'bg-surface-highlight text-slate-400 group-hover:text-purple-300'
                    }`}
                  >
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm sm:text-base text-white">
                      Play Online
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                      Multi-Phone Room
                    </span>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    playingMode === 'online'
                      ? 'border-purple-400 bg-purple-500 text-white'
                      : 'border-slate-600 bg-transparent'
                  }`}
                >
                  {playingMode === 'online' && <Check className="w-3.5 h-3.5" />}
                </div>
              </div>

              <p className="mt-2.5 text-xs text-slate-400 leading-relaxed">
                Create an online room and share your link or code. Friends join on their own phones (3–12 players supported).
              </p>
            </button>
          </div>
        </div>

        {/* =========================================================
            SECTION 1B: PASS & PLAY SUB-MODE (Secret Voting vs Quick Pick)
           ========================================================= */}
        {playingMode === 'pass-and-play' && (
          <div className="space-y-3 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Pass & Play Game Mode</span>
              </label>
              <span className="text-[11px] font-medium text-slate-400">
                {subMode === 'secret-voting' ? 'Private Turns' : 'Group Agreement'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* OPTION A: SECRET VOTING */}
              <button
                type="button"
                onClick={() => {
                  setSubMode('secret-voting');
                  sound.triggerHaptic(10);
                }}
                className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                  subMode === 'secret-voting'
                    ? 'bg-purple-950/40 border-purple-400 ring-2 ring-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                    : 'bg-canvas-base/80 hover:bg-canvas-base border-white/10 text-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                        subMode === 'secret-voting'
                          ? 'bg-purple-500 text-white shadow-sm'
                          : 'bg-surface-highlight text-slate-400 group-hover:text-purple-300'
                      }`}
                    >
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-white">
                        Secret Voting
                      </h4>
                      <span className="text-[10px] text-purple-400 font-semibold block">
                        Individual Ballots
                      </span>
                    </div>
                  </div>

                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      subMode === 'secret-voting'
                        ? 'border-purple-400 bg-purple-500 text-white'
                        : 'border-slate-600 bg-transparent'
                    }`}
                  >
                    {subMode === 'secret-voting' && <Check className="w-3 h-3" />}
                  </div>
                </div>

                <p className="mt-2 text-[11px] text-slate-400 leading-relaxed">
                  Pass the phone around. Friends vote privately on their turn. Hidden until reveal!
                </p>
              </button>

              {/* OPTION B: QUICK PICK */}
              <button
                type="button"
                onClick={() => {
                  setSubMode('quick-pick');
                  sound.triggerHaptic(10);
                }}
                className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                  subMode === 'quick-pick'
                    ? 'bg-purple-950/40 border-amber-400 ring-2 ring-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                    : 'bg-canvas-base/80 hover:bg-canvas-base border-white/10 text-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                        subMode === 'quick-pick'
                          ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                          : 'bg-surface-highlight text-slate-400 group-hover:text-amber-400'
                      }`}
                    >
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                        <span>Quick Pick</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-extrabold uppercase">
                          New
                        </span>
                      </h4>
                      <span className="text-[10px] text-amber-400 font-semibold block">
                        Group Discussion
                      </span>
                    </div>
                  </div>

                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      subMode === 'quick-pick'
                        ? 'border-amber-400 bg-amber-500 text-slate-950'
                        : 'border-slate-600 bg-transparent'
                    }`}
                  >
                    {subMode === 'quick-pick' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                <p className="mt-2 text-[11px] text-slate-400 leading-relaxed">
                  No passing phone needed! Discuss out loud, agree on who fits best, and award them a Crown 👑.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================
            SECTION 2: GAME LENGTH SELECTION (5, 10, 15 Prompts)
           ========================================================= */}
        <div className="space-y-3 pt-2 border-t border-white/5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>2. Game Length</span>
            </label>
            <span className="text-[11px] font-mono text-slate-400">
              {gameLength} Prompts Selected
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {[
              { length: 5 as GameLengthOption, label: '5 Prompts', time: '~5 mins', tag: 'Quick' },
              { length: 10 as GameLengthOption, label: '10 Prompts', time: '~10 mins', tag: 'Standard' },
              { length: 15 as GameLengthOption, label: '15 Prompts', time: '~15 mins', tag: 'Party' },
            ].map((opt) => {
              const isSelected = gameLength === opt.length;
              return (
                <button
                  key={opt.length}
                  type="button"
                  onClick={() => {
                    setGameLength(opt.length);
                    sound.triggerHaptic(10);
                  }}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/30 scale-[1.02]'
                      : 'bg-canvas-base/80 hover:bg-canvas-base border-white/10 text-slate-300'
                  }`}
                >
                  <span className="block font-display font-extrabold text-sm sm:text-base">
                    {opt.label}
                  </span>
                  <span
                    className={`block text-[10px] mt-0.5 font-mono ${
                      isSelected ? 'text-purple-100' : 'text-slate-400'
                    }`}
                  >
                    {opt.time} • {opt.tag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================
            SECTION 3A: PASS & PLAY PLAYER MANAGEMENT
           ========================================================= */}
        {playingMode === 'pass-and-play' && (
          <div className="space-y-4 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>3. Manage Players</span>
                </label>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Add friends who are in the room playing on this phone.
                </p>
              </div>

              <div className="text-right">
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${
                    players.length >= 3 && players.length <= 12
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}
                >
                  <ShieldCheck className="w-3 h-3" />
                  {players.length} / 12 Players
                </span>
              </div>
            </div>

            {/* Error / Success Alerts */}
            {playerError && (
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-between animate-fade-in">
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{playerError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPlayerError('')}
                  className="p-0.5 text-rose-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {playerSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fade-in">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>{playerSuccess}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPlayerSuccess('')}
                  className="p-0.5 text-emerald-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Add Player Input Form */}
            {players.length < 12 && (
              <form onSubmit={handleAddPlayer} className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={24}
                  value={newPlayerName}
                  onChange={(e) => {
                    setNewPlayerName(e.target.value);
                    if (playerError) setPlayerError('');
                  }}
                  placeholder="Enter friend's name (e.g. Taylor)..."
                  className="flex-1 h-10 px-3.5 rounded-xl bg-canvas-base border border-white/10 text-white font-semibold text-xs sm:text-sm focus:outline-none focus:border-purple-400 transition-colors"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shrink-0 h-10 px-4"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Player
                </Button>
              </form>
            )}

            {/* Players List Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {players.map((p, idx) => {
                const isEditing = editingPlayerId === p.id;
                return (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-xl bg-canvas-base/80 border border-white/5 hover:border-purple-500/30 flex items-center justify-between gap-2 transition-colors"
                  >
                    {isEditing ? (
                      /* Inline Name Edit Input */
                      <div className="flex items-center gap-1.5 w-full">
                        <input
                          type="text"
                          autoFocus
                          maxLength={24}
                          value={editingPlayerName}
                          onChange={(e) => setEditingPlayerName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveEdit(p.id);
                            } else if (e.key === 'Escape') {
                              handleCancelEdit();
                            }
                          }}
                          className="flex-1 h-8 px-2 rounded-lg bg-surface-highlight border border-purple-400 text-white font-semibold text-xs focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(p.id)}
                          className="h-8 px-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center"
                          title="Save name"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="h-8 px-2 rounded-lg bg-surface-highlight text-slate-300 hover:text-white text-xs font-semibold"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      /* Player Row View */
                      <>
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-full bg-purple-600/80 flex items-center justify-center font-bold text-[11px] text-white shrink-0">
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-xs sm:text-sm text-slate-200 truncate">
                            {p.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(p)}
                            className="p-1 rounded-lg text-slate-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors"
                            title={`Edit ${p.name}`}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {players.length > 3 && (
                            <button
                              type="button"
                              onClick={() => handleRemovePlayer(p.id)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title={`Remove ${p.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Reset to Defaults Roster */}
            <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
              <span>Min 3 players required for voting (Max 12).</span>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="hover:text-purple-300 transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to 4 defaults</span>
              </button>
            </div>

            {/* START GAME CTA (Pass & Play) */}
            <div className="pt-3">
              <Button
                variant="primary"
                size="lg"
                onClick={handleStartPassAndPlay}
                disabled={players.length < 3}
                className="w-full bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 text-white font-extrabold text-base min-h-[50px] shadow-lg shadow-purple-900/40 hover:shadow-purple-700/60 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Start Game ({gameLength} Prompts)</span>
              </Button>
            </div>
          </div>
        )}

        {/* =========================================================
            SECTION 3B: PLAY ONLINE MULTIPLAYER SETUP & LOBBY
           ========================================================= */}
        {playingMode === 'online' && (
          <div className="space-y-4 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  <span>3. Online Multiplayer Room</span>
                </label>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Friends join using your room code or link from any phone.
                </p>
              </div>

              {createdRoomCode && (
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
                  {onlinePlayers.length} / 12 Joined
                </span>
              )}
            </div>

            {joinError && (
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-between">
                <span>{joinError}</span>
                <button type="button" onClick={() => setJoinError('')}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {!createdRoomCode ? (
              /* Pre-creation form */
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Your Name (Host)
                  </label>
                  <input
                    type="text"
                    maxLength={24}
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    placeholder="Enter your name as Host..."
                    className="w-full h-10 px-3.5 rounded-xl bg-canvas-base border border-white/10 text-white font-semibold text-xs sm:text-sm focus:outline-none focus:border-purple-400"
                  />
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleCreateRoom}
                  disabled={isCreatingRoom}
                  className="w-full bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 text-white font-extrabold text-base min-h-[50px] shadow-lg shadow-purple-900/40"
                >
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>{isCreatingRoom ? 'Creating Room...' : 'Create Room & Invite Friends'}</span>
                </Button>

                {/* Or Join Room with Code */}
                <div className="pt-2 border-t border-white/5">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-2">
                    Have a room code from a friend?
                  </span>
                  <form onSubmit={handleJoinExistingRoom} className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={joinInputCode}
                      onChange={(e) => setJoinInputCode(e.target.value.toUpperCase())}
                      placeholder="ENTER 6-CHAR CODE"
                      className="flex-1 h-10 px-3 rounded-xl bg-canvas-base font-mono uppercase text-center font-bold text-sm tracking-widest text-white border border-white/10 focus:border-purple-400 focus:outline-none"
                    />
                    <Button
                      type="submit"
                      variant="secondary"
                      size="md"
                      className="font-bold text-xs shrink-0"
                    >
                      Join Room
                    </Button>
                  </form>
                </div>
              </div>
            ) : (
              /* Live Room Lobby */
              <div className="space-y-4 animate-fade-in">
                {/* Room Code & Invitation Box */}
                <div className="p-4 rounded-2xl bg-canvas-base border border-purple-500/30 text-center space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
                    Share this code with your friends
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-mono font-extrabold text-3xl sm:text-4xl tracking-widest text-white bg-surface-elevated px-4 py-1.5 rounded-xl border border-purple-400/40 shadow-inner">
                      {createdRoomCode}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="p-2.5 rounded-xl bg-surface-highlight hover:bg-purple-500/20 text-slate-200 hover:text-white border border-white/10 transition-colors"
                      title="Copy Code"
                    >
                      {copiedCode ? (
                        <Check className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 pt-1 justify-center">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleCopyLink}
                      className="text-xs font-semibold gap-1.5"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Link Copied!' : 'Copy Invite Link'}</span>
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleShareInvite}
                      className="text-xs font-semibold gap-1.5"
                    >
                      <Share2 className="w-3.5 h-3.5 text-purple-400" />
                      <span>Share</span>
                    </Button>
                  </div>
                </div>

                {/* Connected Players Status */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">
                      Players in Lobby ({onlinePlayers.length}/12):
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {onlinePlayers.length >= 3 ? (
                        <span className="text-emerald-400 font-semibold">✓ Ready to start</span>
                      ) : (
                        <span className="text-amber-400 font-semibold">
                          Need {3 - onlinePlayers.length} more player{3 - onlinePlayers.length === 1 ? '' : 's'}
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {onlinePlayers.map((op) => (
                      <div
                        key={op.id}
                        className="p-2 rounded-xl bg-canvas-base border border-white/5 flex items-center gap-2"
                      >
                        <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center font-bold text-xs text-white shrink-0">
                          {op.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-bold text-white truncate">{op.name}</span>
                        {op.isHost ? (
                          <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 uppercase shrink-0">
                            Host
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleKickOnlinePlayer(op.id)}
                            className="ml-auto text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-rose-500/10 transition-colors shrink-0"
                            title={`Remove ${op.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Host Start Online Game Button */}
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleStartOnlineGame}
                    disabled={onlinePlayers.length < 3}
                    className="w-full bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 text-white font-extrabold text-base min-h-[50px] shadow-lg shadow-purple-900/40"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>
                      {onlinePlayers.length < 3
                        ? `Waiting for Players (${onlinePlayers.length}/3 Min)...`
                        : 'Start Online Game →'}
                    </span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

