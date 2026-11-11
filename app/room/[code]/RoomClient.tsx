'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Globe,
  Share2,
  Settings,
  LogOut,
  RefreshCw,
  Clock,
  Sparkles,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card3D } from '@/components/game/Card3D';
import { triggerConfetti } from '@/components/game/ConfettiCelebration';
import { sound } from '@/lib/audio/soundSynthesizer';
import { speechService } from '@/lib/voice/speechService';
import { MultiplayerRoom, Player, SupportedLanguageCode, CategoryId } from '@/types';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { SUPPORTED_LOCALES, ALL_LOCALES, Locale } from '@/lib/i18n/config';

interface RoomClientProps {
  roomCode: string;
}

export function RoomClient({ roomCode }: RoomClientProps) {
  const router = useRouter();
  const { t, dict, locale } = useTranslation();
  const [room, setRoom] = useState<MultiplayerRoom | null>(null);
  const [playerId, setPlayerId] = useState<string>('');
  const [sessionToken, setSessionToken] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [isJoined, setIsJoined] = useState(false);
  const [joinInputName, setJoinInputName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const storageKey = `asteria_multiplayer_session_${roomCode}`;

  const isJoinedRef = React.useRef(isJoined);
  isJoinedRef.current = isJoined;
  const roomRef = React.useRef(room);
  roomRef.current = room;

  // 1. Session Restoration on Mount (Phase 5 Reconnection)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedSession = localStorage.getItem(storageKey);
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed.playerId && parsed.sessionToken) {
          setIsReconnecting(true);
          fetch('/api/rooms/reconnect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              roomCode,
              playerId: parsed.playerId,
              sessionToken: parsed.sessionToken,
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              setIsReconnecting(false);
              if (data.success && data.player && data.room) {
                setPlayerId(data.player.id);
                setSessionToken(data.player.sessionToken || parsed.sessionToken);
                setPlayerName(data.player.name);
                setIsJoined(true);
                setRoom(data.room);
                setErrorMsg(''); // Clean stale errors on successful session restoration
                sound.playChime();
              }
            })
            .catch(() => setIsReconnecting(false));
        }
      } catch {
        setIsReconnecting(false);
      }
    }
  }, [roomCode, storageKey]);

  // 2. Poll room state every 1.5 seconds for synchronized state replication
  useEffect(() => {
    let isSubscribed = true;

    const fetchRoom = async () => {
      try {
        const res = await fetch(`/api/rooms/${roomCode}`);
        const data = await res.json();
        if (isSubscribed && data.success && data.room) {
          setRoom(data.room);
          // Clear stale errors whenever a valid room is retrieved
          setErrorMsg('');
        } else if (isSubscribed && !data.success) {
          if (data.code === 'ROOM_EXPIRED') {
            setErrorMsg(data.error || 'This party room has expired.');
            setRoom((prev) => (prev ? { ...prev, status: 'EXPIRED' } : null));
          } else if (data.code === 'ROOM_CLOSED') {
            setErrorMsg(data.error || 'This party room is closed.');
            setRoom((prev) => (prev ? { ...prev, status: 'CANCELLED' } : null));
          } else if (!roomRef.current && !isJoinedRef.current) {
            setErrorMsg(data.error || 'Room not found.');
          }
        }
      } catch {
        // Network polling error - keep existing state active
      }
    };

    fetchRoom();
    const interval = setInterval(fetchRoom, 1500);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
      speechService.stop();
    };
  }, [roomCode]);

  // 3. Heartbeat Keep-Alive Loop (Every 10 seconds)
  useEffect(() => {
    if (!isJoined || !playerId) return;

    const interval = setInterval(() => {
      fetch('/api/rooms/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode, playerId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.room) {
            setRoom(data.room);
          }
        })
        .catch(() => {});
    }, 10000);

    return () => clearInterval(interval);
  }, [isJoined, playerId, roomCode]);

  // 4. Generate QR Code on Mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const joinUrl = `${window.location.origin}/room/${roomCode}`;
      QRCode.toDataURL(joinUrl, { width: 256, margin: 1, color: { dark: '#0A0A16', light: '#FFFFFF' } })
        .then((url) => setQrDataUrl(url))
        .catch(() => {});
    }
  }, [roomCode]);

  // 5. Handle Joining Room (Phase 2)
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = joinInputName.trim();
    if (!cleanName) return;

    sound.triggerHaptic(15);
    setErrorMsg('');

    try {
      const res = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode,
          playerName: cleanName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPlayerId(data.playerId);
        setSessionToken(data.sessionToken);
        setPlayerName(cleanName);
        setIsJoined(true);
        setRoom(data.room);

        // Persist session token for automatic reconnection
        if (typeof window !== 'undefined') {
          localStorage.setItem(
            storageKey,
            JSON.stringify({
              roomCode,
              playerId: data.playerId,
              sessionToken: data.sessionToken,
              playerName: cleanName,
            })
          );
        }

        sound.playChime();
      } else {
        setErrorMsg(data.error);
      }
    } catch {
      setErrorMsg('Failed to connect to room server.');
    }
  };

  // 6. Dispatch Server-Authoritative Actions (Phase 4)
  const dispatch = async (action: string, payload?: Record<string, unknown>) => {
    sound.triggerHaptic(15);
    if (action === 'SKIP_TURN' || action === 'COMPLETE_DARE') {
      speechService.stop();
    }

    try {
      const res = await fetch('/api/rooms/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode,
          playerId,
          sessionToken,
          action,
          payload,
        }),
      });
      const data = await res.json();
      if (data.success && data.room) {
        setRoom(data.room);
      } else if (!data.success && data.error) {
        // Surface action error temporarily
        setErrorMsg(data.error);
        setTimeout(() => setErrorMsg(''), 4000);
      }
    } catch {
      // Dispatch error
    }
  };

  // 7. Handle Leaving Room
  const handleLeaveRoom = () => {
    sound.triggerHaptic(15);
    speechService.stop();
    dispatch('LEAVE_ROOM');

    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
    }

    router.push(`/${locale}`);
  };

  // 8. Share Room Invitation (Web Share API + Clipboard)
  const handleShare = async () => {
    sound.triggerHaptic(15);
    if (typeof window === 'undefined') return;

    const shareUrl = `${window.location.origin}/room/${roomCode}`;
    const shareData = {
      title: 'Asteria Truth or Dare Room',
      text: `Join my Truth or Dare room (${roomCode}) on Asteria!`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled or unsupported
      }
    }

    // Clipboard fallback
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Direct Copy Room Link to Clipboard
  const handleCopyLink = () => {
    sound.triggerHaptic(15);
    if (typeof window === 'undefined') return;
    const shareUrl = `${window.location.origin}/room/${roomCode}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const isHost = room?.hostPlayerId === playerId;
  const activePlayer = room?.players.find((p) => p.id === room.activePlayerId);
  const isMyTurn = room?.activePlayerId === playerId;
  const roomQuestionLang = room?.language || 'en';
  const roomLangMeta = SUPPORTED_LOCALES[roomQuestionLang as Locale] || SUPPORTED_LOCALES.en;

  // Lifecycle state helpers
  const isLobby = room?.status === 'WAITING' || room?.status === 'lobby';
  const isInGame = room?.status === 'IN_PROGRESS' || room?.status === 'in_game';
  const isExpired = room?.status === 'EXPIRED';
  const isCancelled = room?.status === 'CANCELLED';

  // Categories list for host settings
  const categoriesList = [
    { id: 'classic-party', name: t('categories.classicParty.name'), icon: '🎉' },
    { id: 'couples-flirty', name: t('categories.couplesFlirty.name'), icon: '❤️' },
    { id: 'teens-hangout', name: t('categories.teensHangout.name'), icon: '🍕' },
    { id: 'spicy-18', name: t('categories.spicy18.name'), icon: '🌶️' },
    { id: 'family-kids', name: t('categories.familyKids.name'), icon: '🌟' },
  ];

  if (isExpired) {
    return (
      <div className="w-full max-w-md mx-auto p-8 my-auto text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-2xl">
          ⏳
        </div>
        <h2 className="font-display font-bold text-2xl text-white">Party Room Expired</h2>
        <p className="text-xs text-slate-400">
          This party room has expired after reaching its maximum 2-hour lifespan. Start a new party room to continue playing with friends!
        </p>
        <Link href={`/${locale}`}>
          <Button variant="primary" size="md" className="mt-4">
            {dict.breadcrumbs.home}
          </Button>
        </Link>
      </div>
    );
  }

  if (isCancelled) {
    return (
      <div className="w-full max-w-md mx-auto p-8 my-auto text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-500/10 text-slate-400 flex items-center justify-center font-bold text-2xl">
          🚪
        </div>
        <h2 className="font-display font-bold text-2xl text-white">Party Room Closed</h2>
        <p className="text-xs text-slate-400">
          This room has been closed or cancelled by the host. Create a new room to host another game!
        </p>
        <Link href={`/${locale}`}>
          <Button variant="primary" size="md" className="mt-4">
            {dict.breadcrumbs.home}
          </Button>
        </Link>
      </div>
    );
  }

  if (errorMsg && !room && !isJoined) {
    return (
      <div className="w-full max-w-md mx-auto p-8 my-auto text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-2xl">
          ✕
        </div>
        <h2 className="font-display font-bold text-2xl text-white">Room Error</h2>
        <p className="text-xs text-slate-400">{errorMsg}</p>
        <Link href={`/${locale}`}>
          <Button variant="primary" size="md" className="mt-4">
            {dict.breadcrumbs.home}
          </Button>
        </Link>
      </div>
    );
  }

  // Never display "not found or expired" if an active room is verified and loaded
  const displayActionError =
    errorMsg &&
    isJoined &&
    !errorMsg.toLowerCase().includes('not found') &&
    !errorMsg.toLowerCase().includes('expired');

  return (
    <div className="w-full max-w-4xl lg:max-w-5xl mx-auto px-3 sm:px-4 py-2 sm:py-6 md:py-8 space-y-2.5 sm:space-y-6 flex-1 flex flex-col justify-start md:justify-between">
      {/* Reconnecting Banner */}
      {isReconnecting && (
        <div className="w-full p-2.5 rounded-2xl bg-brand-500/20 border border-brand-400/40 text-brand-300 text-xs font-semibold flex items-center justify-center gap-2 animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Restoring your player session...</span>
        </div>
      )}

      {/* Ephemeral Action Error Banner */}
      {displayActionError && (
        <div className="w-full p-3 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-300 text-xs font-semibold flex items-center justify-between animate-shake">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="p-1 text-rose-300 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-canvas-deep/85 backdrop-blur-md animate-fade-in pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="w-full max-w-xs p-5 sm:p-6 rounded-3xl bg-surface-elevated border border-white/10 text-center space-y-4 relative max-h-[calc(100dvh-2rem)] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
              aria-label={dict.multiplayer.closeQr}
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-display font-bold text-base sm:text-lg text-white">{dict.multiplayer.scanQr}</h3>
            {qrDataUrl && (
              <div className="p-3 bg-white rounded-2xl inline-block shadow-elevation-2">
                <img src={qrDataUrl} alt="Room QR Code" className="w-48 h-48 mx-auto" />
              </div>
            )}
            <p className="text-xs text-slate-400">Scan with any phone camera to join instantly!</p>
          </div>
        </div>
      )}

      {/* Leave Room Confirmation Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-canvas-deep/85 backdrop-blur-md animate-fade-in pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-surface-elevated border border-white/10 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-400 mx-auto flex items-center justify-center">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">Leave Party Room?</h3>
            <p className="text-xs text-slate-400">
              {isHost
                ? 'As host, leaving will automatically promote the next player to host.'
                : 'You will leave the current game room.'}
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button variant="secondary" size="md" onClick={() => setShowLeaveModal(false)}>
                Cancel
              </Button>
              <Button
                variant="secondary"
                size="md"
                className="!bg-rose-500/90 hover:!bg-rose-600 text-white border-rose-400/50"
                onClick={handleLeaveRoom}
              >
                Leave Room
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Host Lobby Settings Modal (Phase 1 & Phase 3) */}
      {showSettingsModal && isHost && isLobby && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-canvas-deep/85 backdrop-blur-md animate-fade-in pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="w-full max-w-md p-5 sm:p-6 rounded-3xl bg-surface-elevated border border-white/10 space-y-4 text-left max-h-[calc(100dvh-2rem)] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-brand-400" />
                <h3 className="font-display font-bold text-lg text-white">Room Settings</h3>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Question Language Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Shared Question Language:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ALL_LOCALES.map((loc) => {
                  const meta = SUPPORTED_LOCALES[loc];
                  const isSelected = room.language === loc;
                  return (
                    <button
                      key={loc}
                      onClick={() => dispatch('UPDATE_LOBBY_SETTINGS', { language: loc })}
                      className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                        isSelected
                          ? 'bg-brand-500/20 border-brand-400 text-white shadow-glow-brand'
                          : 'bg-surface-highlight border-white/5 text-slate-300 hover:text-white'
                      }`}
                    >
                      <span className="text-base">{meta.flag}</span>
                      <span className="truncate">{meta.nativeName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Category Deck:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categoriesList.map((cat) => {
                  const isSelected = room.categoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => dispatch('UPDATE_LOBBY_SETTINGS', { categoryId: cat.id })}
                      className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                        isSelected
                          ? 'bg-brand-500/20 border-brand-400 text-white shadow-glow-brand'
                          : 'bg-surface-highlight border-white/5 text-slate-300 hover:text-white'
                      }`}
                    >
                      <span className="text-base">{cat.icon}</span>
                      <span className="truncate">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Player Limit */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Player Capacity:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[4, 8, 12, 20].map((cap) => (
                  <button
                    key={cap}
                    onClick={() => dispatch('UPDATE_LOBBY_SETTINGS', { maxPlayers: cap })}
                    className={`py-1.5 rounded-xl border text-xs font-bold transition-all ${
                      room.maxPlayers === cap
                        ? 'bg-brand-500 text-white border-brand-400'
                        : 'bg-surface-highlight border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cap} Max
                  </button>
                ))}
              </div>
            </div>

            <Button variant="primary" size="md" onClick={() => setShowSettingsModal(false)} className="w-full font-bold">
              Save Settings
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================
          GLOBAL ROOM TOP BAR (Responsive: Mobile 3-Row & Desktop 1-Row)
         ======================================================== */}
      {/* 1. MOBILE TOOLBAR (Width < 768px: 3 Balanced Rows) */}
      <div className="flex md:hidden flex-col gap-2 p-2.5 rounded-2xl bg-surface-elevated border border-white/10 shrink-0 backdrop-blur-md shadow-elevation-1">
        {/* ROW 1: Back Navigation, Title & Status */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            {isJoined && (
              <button
                onClick={() => setShowLeaveModal(true)}
                className="p-2 rounded-xl bg-surface-highlight hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors border border-white/5 shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center active:scale-95"
                title="Leave Room"
                aria-label="Leave Room"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            <h1 className="font-display font-extrabold text-sm xs:text-base tracking-wider uppercase text-white whitespace-nowrap min-w-0 truncate">
              {dict.multiplayer.title}
            </h1>
          </div>

          {/* Compact Room Status Badges */}
          <div className="flex items-center gap-1.5 shrink-0">
            {isInGame ? (
              <span className="px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-[10px] font-mono font-bold tracking-wider whitespace-nowrap">
                Round {room.roundNumber}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span>Lobby</span>
              </span>
            )}

            {room?.customDeckSnapshot && (
              <span
                className="hidden xs:inline-block px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold max-w-[110px] truncate"
                title={room.customDeckSnapshot.name}
              >
                {room.customDeckSnapshot.name}
              </span>
            )}
          </div>
        </div>

        {/* ROW 2: Language Selector, Lobby Settings, and QR Code */}
        <div className="flex items-center gap-2 pt-1 border-t border-white/5">
          {/* Shared Language Selector / Indicator */}
          <button
            onClick={() => (isHost && isLobby ? setShowSettingsModal(true) : null)}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold min-h-[36px] transition-all min-w-0 ${
              isHost && isLobby
                ? 'bg-surface-highlight hover:bg-white/10 text-white border-white/10 active:scale-95 cursor-pointer'
                : 'bg-surface-highlight/70 text-slate-300 border-white/5 cursor-default'
            }`}
            title={isHost && isLobby ? 'Change shared question language' : 'Shared question language'}
          >
            <Globe className="w-3.5 h-3.5 text-brand-400 shrink-0" />
            <span className="text-xs shrink-0">{roomLangMeta.flag}</span>
            <span className="truncate">{roomLangMeta.nativeName}</span>
          </button>

          {/* Lobby Settings (Host Only) */}
          {isHost && isLobby && (
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 rounded-xl bg-surface-highlight hover:bg-white/10 border border-white/10 text-slate-300 min-h-[36px] min-w-[36px] flex items-center justify-center transition-all active:scale-95 shrink-0"
              title="Lobby Settings"
              aria-label="Lobby Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          {/* QR Code Button */}
          <button
            onClick={() => setShowQrModal(true)}
            aria-label={dict.multiplayer.scanQr}
            className="p-2 rounded-xl bg-surface-highlight hover:bg-white/10 border border-white/10 text-slate-300 min-h-[36px] min-w-[36px] flex items-center justify-center transition-all active:scale-95 shrink-0"
            title={dict.multiplayer.scanQr}
          >
            <QrCode className="w-4 h-4" />
          </button>
        </div>

        {/* ROW 3: Prominent Room Code, Copy Button, Share Button */}
        <div className="flex items-center gap-1.5 xs:gap-2 pt-1">
          {/* Room Code Card (Always Unclipped) */}
          <div
            onClick={handleCopyLink}
            className={`flex-1 flex items-center justify-center px-2.5 xs:px-3 py-1.5 rounded-xl border text-xs font-bold min-h-[38px] cursor-pointer transition-colors select-all group min-w-0 ${
              copiedLink
                ? 'border-emerald-400/60 bg-emerald-500/10 text-emerald-300'
                : 'border-brand-500/30 bg-canvas-base/80 text-brand-300 hover:border-brand-500/50'
            }`}
            title="Click to copy room code"
          >
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Room:</span>
              <span className="font-mono font-black text-xs xs:text-sm tracking-widest text-white group-hover:text-brand-300 transition-colors whitespace-nowrap">
                {roomCode}
              </span>
            </div>
          </div>

          {/* Dedicated Copy Button */}
          <button
            onClick={handleCopyLink}
            className="px-2.5 xs:px-3 py-1.5 rounded-xl bg-surface-highlight hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 min-h-[38px] flex items-center justify-center gap-1.5 transition-all active:scale-95 shrink-0"
            title="Copy room link to clipboard"
          >
            {copiedLink ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Dedicated Share Button */}
          <button
            onClick={handleShare}
            className="px-2.5 xs:px-3 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white border border-brand-400/40 text-xs font-black min-h-[38px] flex items-center justify-center gap-1.5 shadow-glow-brand transition-all active:scale-95 shrink-0"
            title="Share invitation link"
          >
            <Share2 className="w-3.5 h-3.5 shrink-0" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* 2. DESKTOP / TABLET TOOLBAR (Width >= 768px: Unified Single-Row) */}
      <div className="hidden md:flex items-center justify-between gap-3 p-3 rounded-2xl bg-surface-elevated border border-white/10 shrink-0 backdrop-blur-md shadow-elevation-1">
        {/* Left: Navigation, Title & Room Badges */}
        <div className="flex items-center gap-3 min-w-0">
          {isJoined && (
            <button
              onClick={() => setShowLeaveModal(true)}
              className="p-2 rounded-xl bg-surface-highlight hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors border border-white/5 shrink-0 min-h-[38px] min-w-[38px] flex items-center justify-center active:scale-95"
              title="Leave Room"
              aria-label="Leave Room"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-2.5 min-w-0">
            <h1 className="font-display font-extrabold text-base tracking-wider uppercase text-white whitespace-nowrap">
              {dict.multiplayer.title}
            </h1>

            {isInGame ? (
              <span className="px-2 py-0.5 rounded-lg bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-mono font-bold whitespace-nowrap">
                Round {room.roundNumber}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Lobby</span>
              </span>
            )}

            {room?.customDeckSnapshot && (
              <span
                className="px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold max-w-[200px] truncate"
                title={room.customDeckSnapshot.name}
              >
                Deck: {room.customDeckSnapshot.name}
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions, Language, Settings, QR & Room Code Share */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Language Badge */}
          <button
            onClick={() => (isHost && isLobby ? setShowSettingsModal(true) : null)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold min-h-[38px] transition-colors ${
              isHost && isLobby
                ? 'bg-surface-highlight hover:bg-white/10 text-white border-white/10 cursor-pointer'
                : 'bg-surface-highlight text-slate-300 border-white/10 cursor-default'
            }`}
            title={isHost && isLobby ? 'Change shared question language' : 'Shared question language'}
          >
            <Globe className="w-3.5 h-3.5 text-brand-400" />
            <span>
              {roomLangMeta.flag} {roomLangMeta.nativeName}
            </span>
          </button>

          {/* Lobby Settings (Host Only) */}
          {isHost && isLobby && (
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 rounded-xl bg-surface-elevated hover:bg-surface-highlight border border-white/10 text-slate-300 min-h-[38px] min-w-[38px] flex items-center justify-center transition-colors"
              title="Lobby Settings"
              aria-label="Lobby Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          {/* QR Code Button */}
          <button
            onClick={() => setShowQrModal(true)}
            aria-label={dict.multiplayer.scanQr}
            className="p-2 rounded-xl bg-surface-elevated hover:bg-surface-highlight border border-white/10 text-slate-300 min-h-[38px] min-w-[38px] flex items-center justify-center transition-colors"
            title={dict.multiplayer.scanQr}
          >
            <QrCode className="w-4 h-4" />
          </button>

          {/* Share Invitation Link Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white border border-brand-400/40 text-xs font-bold font-mono min-h-[38px] shadow-glow-brand transition-all active:scale-95"
            title="Share invitation link"
          >
            <span>{roomCode}</span>
            {copiedLink ? <CheckCircle className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4 shrink-0" />}
          </button>
        </div>
      </div>

      {/* ========================================================
          VIEW A: JOIN PROMPT (If not joined yet)
         ======================================================== */}
      {!isJoined ? (
        <div className="w-full max-w-md mx-auto my-auto p-5 sm:p-8 rounded-3xl bg-surface-elevated border border-white/10 space-y-5 sm:space-y-6 text-center shadow-elevation-2">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-400">
              {dict.multiplayer.title}
            </span>
            <h2 className="font-display font-extrabold text-2xl md:text-3xl text-white">
              {t('multiplayer.roomCode', { code: roomCode })}
            </h2>
            <p className="text-xs text-slate-400">
              {t('multiplayer.playerCount', { count: room?.players.length || 1 })} / {room?.maxPlayers || 12} Players
            </p>
            <p className="text-[11px] text-brand-300 pt-1">
              {t('multiplayer.roomLanguageBadge', { lang: `${roomLangMeta.flag} ${roomLangMeta.nativeName}` })}
            </p>
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            <input
              type="text"
              placeholder={dict.multiplayer.enterName}
              value={joinInputName}
              onChange={(e) => setJoinInputName(e.target.value)}
              maxLength={20}
              required
              className="w-full h-11 sm:h-12 px-4 rounded-xl bg-canvas-base border border-white/10 text-center font-bold text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-400"
            />
            <Button type="submit" variant="primary" size="lg" className="w-full font-bold min-h-[48px]">
              {dict.multiplayer.joinRoom} →
            </Button>
          </form>
        </div>
      ) : (
        /* ========================================================
            VIEW B: ACTIVE MULTIPLAYER ROOM (Lobby or In-Game)
           ======================================================== */
        <div className="w-full flex-1 flex flex-col justify-start md:justify-between space-y-2.5 sm:space-y-6">
          {/* Room Players Presence Bar (Showing connection status & scores) */}
          <div className="w-full p-2 sm:p-3 rounded-2xl bg-surface-elevated/80 border border-white/10 space-y-1.5 sm:space-y-2 backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs font-semibold px-1 text-slate-400">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-brand-400" />
                {room?.players.length || 0} / {room?.maxPlayers || 12} Players Connected
              </span>
              <span className="text-[11px] font-bold text-brand-300">
                {isHost ? dict.multiplayer.hostBadge : dict.multiplayer.guestBadge}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {room?.players.map((p) => {
                const isActive = p.id === room?.activePlayerId;
                const isOnline = p.isConnected !== false;
                return (
                  <div
                    key={p.id}
                    className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold border transition-all max-w-full ${
                      isActive
                        ? 'bg-brand-500/20 border-brand-400 text-white shadow-glow-brand'
                        : 'bg-surface-highlight border-white/5 text-slate-300'
                    }`}
                  >
                    {/* Live connection dot */}
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                      }`}
                      title={isOnline ? 'Online' : 'Reconnecting...'}
                    />
                    {p.isHost && <Crown className="w-3 h-3 text-amber-400 shrink-0" />}
                    <span className="max-w-[100px] sm:max-w-[140px] truncate">{p.name}</span>
                    <span className="text-[10px] text-brand-400 font-mono shrink-0">({p.score}pts)</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========================================================
              LOBBY VIEW (Phase 3: Waiting for Host to Start)
             ======================================================== */}
          {isLobby ? (
            <div className="w-full max-w-md mx-auto my-1 sm:my-auto p-4 sm:p-8 rounded-3xl bg-surface-elevated border border-white/10 text-center space-y-3 sm:space-y-6 shadow-elevation-2">
              <div className="w-11 h-11 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-brand-500/10 border border-brand-400/30 flex items-center justify-center text-brand-400 font-bold text-xl sm:text-2xl">
                ⏳
              </div>

              <div className="space-y-1">
                <h3 className="font-display font-bold text-xl sm:text-2xl text-white">Party Lobby</h3>
                <p className="text-xs text-slate-400">
                  {isHost
                    ? 'Invite your friends! When everyone is ready, start the game below.'
                    : dict.multiplayer.lobbyWaiting}
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-[11px] text-brand-300 border border-brand-400/30 mt-1">
                  <span>{roomLangMeta.flag} {roomLangMeta.nativeName}</span>
                  <span>•</span>
                  {room.customDeckSnapshot ? (
                    <span className="font-bold flex items-center gap-1 text-white">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Custom: {room.customDeckSnapshot.name} ({room.customDeckSnapshot.questions.length} cards)
                    </span>
                  ) : (
                    <span className="capitalize">{room.categoryId.replace(/-/g, ' ')}</span>
                  )}
                </div>
              </div>

              {isHost ? (
                <div className="space-y-2">
                  <Button
                    variant="primary"
                    size="xl"
                    onClick={() => dispatch('START_GAME')}
                    disabled={!room || room.players.length < 2}
                    className="w-full font-bold min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {dict.multiplayer.startGame} →
                  </Button>
                  {room && room.players.length < 2 && (
                    <p className="text-[11px] text-amber-300/90 font-medium pt-0.5">
                      ⚠️ Waiting for at least 1 more player to join before starting.
                    </p>
                  )}
                  <button
                    onClick={() => setShowSettingsModal(true)}
                    className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 mx-auto py-1.5 px-3 min-h-[36px] rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Adjust category or question language</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-canvas-base border border-white/5 text-xs text-slate-400 animate-pulse">
                  {dict.multiplayer.lobbyWaiting}
                </div>
              )}
            </div>
          ) : (
            /* ========================================================
                ACTIVE IN-GAME ARENA (Phase 4: Synchronized Gameplay)
               ======================================================== */
            <div className="w-full flex-1 flex flex-col items-center justify-between space-y-4 sm:space-y-6">
              {/* Active Player Turn Banner */}
              <div
                className={`px-3 sm:px-4 py-1.5 rounded-full border text-xs font-bold shadow-glow-brand flex items-center gap-1.5 sm:gap-2 max-w-full ${
                  isMyTurn
                    ? 'bg-brand-500 text-white border-brand-300 animate-pulse'
                    : 'bg-brand-500/20 border-brand-400/30 text-brand-300'
                }`}
              >
                <span className="truncate">
                  {isMyTurn
                    ? `🎯 ${dict.multiplayer.yourTurn}`
                    : t('multiplayer.playerTurn', { name: activePlayer?.name || 'Player' })}
                </span>
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
                  onListenType={(type) => {
                    if (isHost || isMyTurn) {
                      dispatch('FLIP_CARD', { type });
                    }
                  }}
                />
              </div>

              {/* Host & Active Player Turn Controls */}
              <div className="w-full max-w-md space-y-2.5 sm:space-y-3">
                {room?.isCardFlipped && (isHost || isMyTurn) ? (
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <Button
                      data-testid="skip-turn-btn"
                      variant="skip"
                      size="lg"
                      onClick={() => dispatch('SKIP_TURN')}
                      className="w-full gap-1 sm:gap-1.5 px-2 sm:px-4 text-xs sm:text-sm font-bold min-h-[48px]"
                    >
                      <SkipForward className="w-4 h-4 shrink-0" />
                      <span className="truncate">{dict.multiplayer.skipTurn}</span>
                    </Button>
                    <Button
                      data-testid="complete-dare-btn"
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
                      <span className="truncate">{dict.multiplayer.completeDare}</span>
                    </Button>
                  </div>
                ) : (
                  <p className="text-center text-xs text-slate-500">
                    {isMyTurn
                      ? dict.game.choosePath
                      : t('multiplayer.waitingForTurn', { name: activePlayer?.name || 'Player' })}
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
                      title={`Send ${emoji} reaction`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                {/* Live Floating Reactions Overlay */}
                {room?.recentEmojis && room.recentEmojis.length > 0 && (
                  <div className="flex items-center justify-center gap-2 overflow-hidden h-7 text-xs text-slate-400">
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
