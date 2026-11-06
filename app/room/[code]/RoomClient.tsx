'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import {
  Users,
  Copy,
  QrCode,
  SkipForward,
  CheckCircle,
  Crown,
  ArrowLeft,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card3D } from '@/components/game/Card3D';
import { triggerConfetti } from '@/components/game/ConfettiCelebration';
import { sound } from '@/lib/audio/soundSynthesizer';
import { MultiplayerRoom } from '@/types';

interface RoomClientProps {
  roomCode: string;
}

export function RoomClient({ roomCode }: RoomClientProps) {
  const [room, setRoom] = useState<MultiplayerRoom | null>(null);
  const [playerId, setPlayerId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [isJoined, setIsJoined] = useState(false);
  const [joinInputName, setJoinInputName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Poll room state every 1.5 seconds for synchronized multi-device replication
  useEffect(() => {
    let isSubscribed = true;

    const fetchRoom = async () => {
      try {
        const res = await fetch(`/api/rooms/${roomCode}`);
        const data = await res.json();
        if (isSubscribed && data.success && data.room) {
          setRoom(data.room);
        } else if (isSubscribed && !data.success) {
          setErrorMsg(data.error || 'Room not found.');
        }
      } catch {
        // Network polling error
      }
    };

    fetchRoom();
    const interval = setInterval(fetchRoom, 1500);
    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [roomCode]);

  // Generate QR Code on Mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const joinUrl = `${window.location.origin}/room/${roomCode}`;
      QRCode.toDataURL(joinUrl, { width: 256, margin: 1, color: { dark: '#0A0A16', light: '#FFFFFF' } })
        .then((url) => setQrDataUrl(url))
        .catch(() => {});
    }
  }, [roomCode]);

  // Handle Joining Room
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinInputName.trim()) return;

    sound.triggerHaptic(15);
    try {
      const res = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode,
          playerName: joinInputName.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPlayerId(data.playerId);
        setPlayerName(joinInputName.trim());
        setIsJoined(true);
        setRoom(data.room);
        sound.playChime();
      } else {
        setErrorMsg(data.error);
      }
    } catch {
      setErrorMsg('Failed to connect to room server.');
    }
  };

  // Dispatch Action
  const dispatch = async (action: string, payload?: Record<string, unknown>) => {
    sound.triggerHaptic(15);
    try {
      const res = await fetch('/api/rooms/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode,
          playerId,
          action,
          payload,
        }),
      });
      const data = await res.json();
      if (data.success && data.room) {
        setRoom(data.room);
      }
    } catch {
      // Dispatch error
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(`${window.location.origin}/room/${roomCode}`);
      setCopiedLink(true);
      sound.triggerHaptic(15);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const isHost = room?.hostPlayerId === playerId;
  const activePlayer = room?.players.find((p) => p.id === room.activePlayerId);
  const isMyTurn = room?.activePlayerId === playerId;

  if (errorMsg && !room) {
    return (
      <div className="w-full max-w-md mx-auto p-8 my-auto text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-2xl">
          ✕
        </div>
        <h2 className="font-display font-bold text-2xl text-white">Room Error</h2>
        <p className="text-xs text-slate-400">{errorMsg}</p>
        <Link href="/">
          <Button variant="primary" size="md" className="mt-4">
            Return to Homepage
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 flex-1 flex flex-col justify-between">
      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas-deep/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xs p-5 sm:p-6 rounded-3xl bg-surface-elevated border border-white/10 text-center space-y-4 relative">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
              aria-label="Close QR Modal"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-display font-bold text-base sm:text-lg text-white">Scan to Join Room</h3>
            <p className="text-xs text-slate-400">Point phone camera to join instantly</p>
            {qrDataUrl && (
              <img
                src={qrDataUrl}
                alt="Room QR Code"
                className="w-48 h-48 sm:w-56 sm:h-56 mx-auto rounded-2xl border border-white/10"
              />
            )}
            <p className="font-mono font-bold text-lg sm:text-xl text-brand-400 tracking-widest">{roomCode}</p>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="w-full flex items-center justify-between gap-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1 sm:gap-1.5 text-xs font-semibold text-slate-400 hover:text-white shrink-0"
        >
          <ArrowLeft className="w-4 h-4" /> Exit Room
        </Link>

        {/* Room Code Badge */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={() => setShowQrModal(true)}
            aria-label="Show QR Code"
            className="p-2 rounded-xl bg-surface-elevated hover:bg-surface-highlight border border-white/10 text-slate-300 min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <QrCode className="w-4 h-4" />
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-surface-elevated hover:bg-surface-highlight border border-brand-500/30 text-xs font-bold text-brand-300 font-mono min-h-[36px]"
          >
            <span>ROOM: {roomCode}</span>
            <Copy className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>
      </div>

      {/* VIEW A: NAME PROMPT (If not joined yet) */}
      {!isJoined ? (
        <div className="w-full max-w-md mx-auto my-auto p-5 sm:p-8 rounded-3xl bg-surface-elevated border border-white/10 space-y-5 sm:space-y-6 text-center">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-400">
              Multiplayer Room
            </span>
            <h2 className="font-display font-extrabold text-2xl md:text-3xl text-white">
              Join Party #{roomCode}
            </h2>
            <p className="text-xs text-slate-400">
              Connected Players: {room?.players.length || 1}/20
            </p>
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            <input
              type="text"
              placeholder="Enter your nickname..."
              value={joinInputName}
              onChange={(e) => setJoinInputName(e.target.value)}
              maxLength={20}
              required
              className="w-full h-11 sm:h-12 px-4 rounded-xl bg-canvas-base border border-white/10 text-center font-bold text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-400"
            />
            <Button type="submit" variant="primary" size="lg" className="w-full font-bold min-h-[48px]">
              Join Party Room →
            </Button>
          </form>
        </div>
      ) : (
        /* VIEW B: ACTIVE MULTIPLAYER ROOM (Lobby or Game) */
        <div className="w-full flex-1 flex flex-col justify-between space-y-4 sm:space-y-6">
          {/* Room Players Presence Bar */}
          <div className="w-full p-2.5 sm:p-3 rounded-2xl bg-surface-elevated/80 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold px-1 text-slate-400">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-brand-400" />
                Players ({room?.players.length})
              </span>
              <span className="text-[11px]">{isHost ? '👑 You are Room Host' : 'Guest Player'}</span>
            </div>

            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {room?.players.map((p) => {
                const isActive = p.id === room?.activePlayerId;
                return (
                  <div
                    key={p.id}
                    className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold border transition-all max-w-full ${
                      isActive
                        ? 'bg-brand-500/20 border-brand-400 text-white shadow-glow-brand'
                        : 'bg-surface-highlight border-white/5 text-slate-300'
                    }`}
                  >
                    {p.isHost && <Crown className="w-3 h-3 text-amber-400 shrink-0" />}
                    <span className="max-w-[100px] sm:max-w-[140px] truncate">{p.name}</span>
                    <span className="text-[10px] text-brand-400 font-mono shrink-0">({p.score}pts)</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* LOBBY VIEW (Waiting for Host to Start) */}
          {room?.status === 'lobby' ? (
            <div className="w-full max-w-md mx-auto my-auto p-5 sm:p-8 rounded-3xl bg-surface-elevated border border-white/10 text-center space-y-5 sm:space-y-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-brand-500/10 border border-brand-400/30 flex items-center justify-center text-brand-400 font-bold text-2xl">
                ⏳
              </div>

              <div className="space-y-1">
                <h3 className="font-display font-bold text-xl sm:text-2xl text-white">Party Lobby</h3>
                <p className="text-xs text-slate-400">
                  {isHost
                    ? 'Wait for friends to join, then tap Start Game below!'
                    : 'Waiting for room host to start the game...'}
                </p>
              </div>

              {isHost ? (
                <Button
                  variant="primary"
                  size="xl"
                  onClick={() => dispatch('START_GAME')}
                  className="w-full font-bold min-h-[48px]"
                >
                  Start Game for Everyone →
                </Button>
              ) : (
                <div className="p-3 rounded-xl bg-canvas-base border border-white/5 text-xs text-slate-400 animate-pulse">
                  Ready & waiting for host...
                </div>
              )}
            </div>
          ) : (
            /* ACTIVE IN-GAME ARENA */
            <div className="w-full flex-1 flex flex-col items-center justify-between space-y-4 sm:space-y-6">
              {/* Turn Pill */}
              <div className="px-3 sm:px-4 py-1.5 rounded-full bg-brand-500/20 border border-brand-400/30 text-xs font-bold text-brand-300 shadow-glow-brand flex items-center gap-1.5 sm:gap-2 max-w-full">
                <span className="truncate">Current Turn: {activePlayer?.name}</span>
                {isMyTurn && <span className="text-emerald-400 shrink-0">(Your Turn!)</span>}
              </div>

              {/* Synchronized 3D Card */}
              <div className="w-full flex flex-col items-center justify-center my-auto">
                <Card3D
                  question={room?.currentCard || null}
                  isFlipped={room?.isCardFlipped || false}
                  onChooseType={(type) => {
                    if (isHost || isMyTurn) {
                      dispatch('FLIP_CARD', { type });
                    }
                  }}
                />
              </div>

              {/* Host & Active Player Controls */}
              <div className="w-full max-w-md space-y-2.5 sm:space-y-3">
                {room?.isCardFlipped && (isHost || isMyTurn) ? (
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <Button
                      variant="skip"
                      size="lg"
                      onClick={() => dispatch('SKIP_TURN')}
                      className="w-full gap-1 sm:gap-1.5 px-2 sm:px-4 text-xs sm:text-sm font-bold min-h-[48px]"
                    >
                      <SkipForward className="w-4 h-4 shrink-0" />
                      <span className="truncate">Skip / Veto</span>
                    </Button>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => {
                        triggerConfetti();
                        sound.playVictory();
                        dispatch('COMPLETE_DARE');
                      }}
                      className="w-full gap-1 sm:gap-1.5 px-2 sm:px-4 text-xs sm:text-sm font-bold min-h-[48px]"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-300 shrink-0" />
                      <span className="truncate">Completed (+1)</span>
                    </Button>
                  </div>
                ) : (
                  <p className="text-center text-xs text-slate-500">
                    {isMyTurn
                      ? 'Select TRUTH or DARE on the card above!'
                      : `Waiting for ${activePlayer?.name} to choose...`}
                  </p>
                )}

                {/* Floating Emoji Reactions Stream */}
                <div className="flex items-center justify-center gap-1.5 sm:gap-3 pt-1">
                  {['🔥', '😂', '😱', '👏', '❤️'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        sound.triggerHaptic(15);
                        dispatch('SEND_EMOJI', { emoji });
                      }}
                      className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-surface-elevated hover:bg-surface-highlight border border-white/10 flex items-center justify-center text-lg sm:text-xl hover:scale-110 active:scale-95 transition-all shadow-elevation-1"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                {/* Recent Emojis Overlay */}
                {room?.recentEmojis && room.recentEmojis.length > 0 && (
                  <div className="flex items-center justify-center gap-2 overflow-hidden h-8 text-xs text-slate-400">
                    {room.recentEmojis.slice(0, 5).map((e) => (
                      <span key={e.id} className="animate-bounce">
                        {e.playerName}: {e.emoji}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

