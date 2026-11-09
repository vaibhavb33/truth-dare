'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Disc,
  Plus,
  X,
  Trophy,
  Sparkles,
  Shuffle,
  RotateCcw,
  Volume2,
  VolumeX,
  Users,
  Flame,
  Zap,
  Edit2,
  Check,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { sound } from '@/lib/audio/soundSynthesizer';
import { triggerConfetti } from '@/components/game/ConfettiCelebration';
import { setGameplayActive } from '@/lib/gameplay/gameplayState';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { cn } from '@/lib/utils';
import {
  DEFAULT_POINTER_ANGLE,
  getSegmentAtAngle,
  computeTargetRotation,
  quinticEaseOut,
} from '@/lib/games/spinnerMath';

// ========================================================
// COLOR PALETTES & PRESET DATA
// ========================================================
const WHEEL_PALETTE = [
  { start: '#8B5CF6', end: '#6D28D9', text: '#FFFFFF', name: 'Violet' },
  { start: '#06B6D4', end: '#0891B2', text: '#FFFFFF', name: 'Cyan' },
  { start: '#FF5C77', end: '#E11D48', text: '#FFFFFF', name: 'Coral' },
  { start: '#10B981', end: '#059669', text: '#FFFFFF', name: 'Emerald' },
  { start: '#F59E0B', end: '#D97706', text: '#FFFFFF', name: 'Amber' },
  { start: '#6366F1', end: '#4338CA', text: '#FFFFFF', name: 'Indigo' },
  { start: '#EC4899', end: '#BE185D', text: '#FFFFFF', name: 'Pink' },
  { start: '#3B82F6', end: '#1D4ED8', text: '#FFFFFF', name: 'Blue' },
  { start: '#14B8A6', end: '#0D9488', text: '#FFFFFF', name: 'Teal' },
  { start: '#D946EF', end: '#A21CAF', text: '#FFFFFF', name: 'Fuchsia' },
  { start: '#EAB308', end: '#CA8A04', text: '#FFFFFF', name: 'Gold' },
  { start: '#EF4444', end: '#B91C1C', text: '#FFFFFF', name: 'Ruby' },
];

const DEMO_PLAYERS = ['Alex', 'Maya', 'Jordan', 'Priya', 'Sarah', 'Leo', 'Chloe', 'Sam'];

type GameMode = 'players' | 'truthOrDare' | 'challenges' | 'custom';

export function SpinnerWheelClient() {
  const { t, dict, locale } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active Game Mode
  const [gameMode, setGameMode] = useState<GameMode>('players');

  // Segments State
  const [segments, setSegments] = useState<string[]>(DEMO_PLAYERS);
  const [newSegmentInput, setNewSegmentInput] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  // Spinning & Audio State
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [isMuted, setIsMuted] = useState(() => sound.getMuted());
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  // Physics Animation Handles
  const rotationRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const pointerDeflectionRef = useRef<number>(0);
  const segmentsRef = useRef<string[]>(segments);

  useEffect(() => {
    segmentsRef.current = segments;
  }, [segments]);

  // Initialize Game Mode presets
  const getModePresets = useCallback((): Record<GameMode, { title: string; icon: React.ElementType; segments: string[] }> => ({
    players: {
      title: 'Players',
      icon: Users,
      segments: DEMO_PLAYERS,
    },
    truthOrDare: {
      title: 'Truth or Dare',
      icon: Flame,
      segments: [
        dict.game.truth,
        dict.game.dare,
        'Double Truth',
        'Wild Dare',
        dict.game.truth,
        dict.game.dare,
        'Penalty Sip',
        'Pass Card',
      ],
    },
    challenges: {
      title: 'Party Forfeits',
      icon: Zap,
      segments: [
        'Sing Chorus',
        'Deep Secret',
        '10 Pushups',
        'Switch Seats',
        'Show Camera Roll',
        'Take 2 Sips',
        'Tell a Joke',
        'Dance No Music',
      ],
    },
    custom: {
      title: 'Custom Wheel',
      icon: Disc,
      segments: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
    },
  }), [dict]);

  // Sync active gameplay state
  useEffect(() => {
    setGameplayActive(isSpinning);
    return () => {
      setGameplayActive(false);
    };
  }, [isSpinning]);

  // Clean up animation on unmount only
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // ========================================================
  // CANVAS RENDERING: HiDPI, Gradients, Bevels & Rivet Studs
  // ========================================================
  const drawWheel = useCallback((currentRotation: number, pointerDeflection: number = 0) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle High-DPI Retina displays
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const logicalSize = canvas.clientWidth || 380;
    const physicalSize = logicalSize * dpr;

    if (canvas.width !== physicalSize || canvas.height !== physicalSize) {
      canvas.width = physicalSize;
      canvas.height = physicalSize;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    const width = logicalSize;
    const height = logicalSize;
    const centerX = width / 2;
    const centerY = height / 2;
    const rimThickness = logicalSize > 360 ? 14 : 10;
    const radius = Math.min(centerX, centerY) - rimThickness - 10;

    ctx.clearRect(0, 0, width, height);

    const N = segments.length;
    if (N === 0) {
      ctx.restore();
      return;
    }
    const anglePerSegment = (2 * Math.PI) / N;

    // 1. Ambient Outer Halo Glow
    const halo = ctx.createRadialGradient(centerX, centerY, radius - 5, centerX, centerY, radius + 20);
    halo.addColorStop(0, 'rgba(139, 92, 246, 0.45)');
    halo.addColorStop(0.5, 'rgba(6, 182, 212, 0.2)');
    halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 20, 0, 2 * Math.PI);
    ctx.fillStyle = halo;
    ctx.fill();

    // 2. Render Wheel Slices with Multi-Stop Gradients & Shading
    for (let i = 0; i < N; i++) {
      const startAngle = currentRotation + i * anglePerSegment;
      const endAngle = startAngle + anglePerSegment;
      const colorPair = WHEEL_PALETTE[i % WHEEL_PALETTE.length];

      // Slice Path
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      // Axial Linear Gradient for Slice Depth
      const midAngle = startAngle + anglePerSegment / 2;
      const gx1 = centerX + Math.cos(startAngle) * (radius * 0.4);
      const gy1 = centerY + Math.sin(startAngle) * (radius * 0.4);
      const gx2 = centerX + Math.cos(endAngle) * radius;
      const gy2 = centerY + Math.sin(endAngle) * radius;
      const sliceGrad = ctx.createLinearGradient(gx1, gy1, gx2, gy2);
      sliceGrad.addColorStop(0, colorPair.start);
      sliceGrad.addColorStop(1, colorPair.end);
      ctx.fillStyle = sliceGrad;
      ctx.fill();

      // Radial Depth Shading Overlay (Light center, dark perimeter)
      const depthOverlay = ctx.createRadialGradient(centerX, centerY, 20, centerX, centerY, radius);
      depthOverlay.addColorStop(0, 'rgba(255, 255, 255, 0.28)');
      depthOverlay.addColorStop(0.5, 'rgba(255, 255, 255, 0.04)');
      depthOverlay.addColorStop(0.9, 'rgba(0, 0, 0, 0.15)');
      depthOverlay.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
      ctx.fillStyle = depthOverlay;
      ctx.fill();

      // Slice Divider Line
      ctx.lineWidth = 2.0;
      ctx.strokeStyle = '#0B0B1A';
      ctx.stroke();

      // 3. Radial Text Label Rendering
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(midAngle);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = colorPair.text;

      // Dynamic font sizing based on slice count
      const fontSize = N <= 4 ? 15 : N <= 8 ? 13 : N <= 14 ? 11 : 9;
      ctx.font = `bold ${fontSize}px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif`;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      // Truncate label to fit segment length
      const maxTextWidth = radius - (logicalSize > 360 ? 55 : 45);
      let text = segments[i];
      if (ctx.measureText(text).width > maxTextWidth) {
        while (ctx.measureText(text + '..').width > maxTextWidth && text.length > 2) {
          text = text.slice(0, -1);
        }
        text += '..';
      }

      ctx.fillText(text, radius - 20, 0);
      ctx.restore();
    }

    // 4. Polished Metallic Outer Bezel
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + rimThickness / 2, 0, 2 * Math.PI);
    ctx.lineWidth = rimThickness;
    const rimGrad = ctx.createLinearGradient(0, 0, width, height);
    rimGrad.addColorStop(0, '#1E1B4B');
    rimGrad.addColorStop(0.25, '#4338CA');
    rimGrad.addColorStop(0.5, '#1E1B4B');
    rimGrad.addColorStop(0.75, '#6366F1');
    rimGrad.addColorStop(1, '#0B0B1A');
    ctx.strokeStyle = rimGrad;
    ctx.stroke();

    // Inner & Outer Metallic Rings
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + rimThickness, 0, 2 * Math.PI);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.stroke();

    // 5. Perimeter Gold Rivet Studs / Pegs
    const pegRadius = radius + rimThickness / 2;
    for (let i = 0; i < N; i++) {
      const angle = currentRotation + i * anglePerSegment;
      const px = centerX + Math.cos(angle) * pegRadius;
      const py = centerY + Math.sin(angle) * pegRadius;

      // Gold Peg Base
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, 2 * Math.PI);
      const pegGrad = ctx.createRadialGradient(px - 1, py - 1, 0.5, px, py, 4);
      pegGrad.addColorStop(0, '#FFFBEB');
      pegGrad.addColorStop(0.4, '#FBBF24');
      pegGrad.addColorStop(0.9, '#B45309');
      pegGrad.addColorStop(1, '#78350F');
      ctx.fillStyle = pegGrad;
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#000000';
      ctx.stroke();
    }

    // 6. Central Luxury Multi-Tier Hub
    const hubRadius = logicalSize > 360 ? 32 : 24;

    // Hub Outer Ring Bezel
    ctx.beginPath();
    ctx.arc(centerX, centerY, hubRadius + 4, 0, 2 * Math.PI);
    ctx.fillStyle = '#0B0B1A';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.stroke();

    // Hub Main Radial Metallic Jewel
    const hubGradient = ctx.createRadialGradient(centerX - 3, centerY - 3, 2, centerX, centerY, hubRadius);
    hubGradient.addColorStop(0, '#FFFFFF');
    hubGradient.addColorStop(0.2, '#DDD6FE');
    hubGradient.addColorStop(0.5, '#7C3AED');
    hubGradient.addColorStop(0.85, '#2E1065');
    hubGradient.addColorStop(1, '#0A0A16');
    ctx.beginPath();
    ctx.arc(centerX, centerY, hubRadius, 0, 2 * Math.PI);
    ctx.fillStyle = hubGradient;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#A78BFA';
    ctx.stroke();

    // Center Core Star / Diamond Jewel
    ctx.beginPath();
    ctx.arc(centerX, centerY, hubRadius * 0.35, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = '#C4B5FD';
    ctx.shadowBlur = 8;
    ctx.fill();

    // 7. Fixed Needle Indicator Arrow (Top 12 o'clock)
    const pointerTopY = centerY - radius - rimThickness - 8;
    const pointerLength = rimThickness + 18;
    const pointerWidth = 14;

    ctx.save();
    ctx.translate(centerX, pointerTopY);
    ctx.rotate(pointerDeflection); // Wiggle on peg collision

    // Pointer Drop Shadow
    ctx.shadowColor = 'rgba(244, 63, 94, 0.9)';
    ctx.shadowBlur = 14;

    // Ruby Arrow Body
    ctx.beginPath();
    ctx.moveTo(0, pointerLength); // Tip pointing down into wheel
    ctx.lineTo(-pointerWidth / 2, 0);
    ctx.lineTo(pointerWidth / 2, 0);
    ctx.closePath();

    const ptrGrad = ctx.createLinearGradient(0, 0, 0, pointerLength);
    ptrGrad.addColorStop(0, '#FB7185');
    ptrGrad.addColorStop(0.6, '#E11D48');
    ptrGrad.addColorStop(1, '#9F1239');
    ctx.fillStyle = ptrGrad;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

    // Pointer Pivot Stud
    ctx.beginPath();
    ctx.arc(0, 2, 4, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowBlur = 0;
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }, [segments]);

  // Initial draw and redraw on segments change
  useEffect(() => {
    drawWheel(rotationRef.current, pointerDeflectionRef.current);
  }, [segments, drawWheel]);

  // ========================================================
  // ANIMATION: Physics-Based Deceleration & Pointer Deflection
  // ========================================================
  const spinWheel = useCallback(() => {
    if (isSpinning || segments.length < 2) return;

    setIsSpinning(true);
    setWinner(null);
    setShowWinnerModal(false);
    setLiveAnnouncement('The wheel is spinning...');
    sound.triggerHaptic([20, 40, 20]);
    sound.playSpinStart();

    // 1. Randomly pick winning segment index in advance
    const N = segments.length;
    const targetWinnerIndex = Math.floor(Math.random() * N);

    // 2. Compute exact target angle aligning targetWinnerIndex with top pointer
    const currentRot = rotationRef.current;
    const fullTurns = 7 + Math.floor(Math.random() * 3); // 7 to 9 full turns
    const jitter = (Math.random() - 0.5) * 0.5; // ±25% of slice width away from dividers
    const targetAngle = computeTargetRotation(
      currentRot,
      targetWinnerIndex,
      N,
      fullTurns,
      jitter,
      DEFAULT_POINTER_ANGLE
    );
    const totalRotationDelta = targetAngle - currentRot;
    const startAngle = currentRot;

    // Check prefers-reduced-motion
    const prefersReducedMotion = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = prefersReducedMotion ? 400 : 4500; // 4.5s smooth deceleration

    const startTime = performance.now();
    let lastPegIndex = -1;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Quintic Ease-Out Curve: f(t) = 1 - (1 - t)^5
      const easedProgress = quinticEaseOut(progress);
      const currentAngle = startAngle + totalRotationDelta * easedProgress;
      rotationRef.current = currentAngle;

      // Peg collision & Tick Sound detection
      const currentSegIndex = getSegmentAtAngle(currentAngle, N, DEFAULT_POINTER_ANGLE);
      if (currentSegIndex !== lastPegIndex) {
        lastPegIndex = currentSegIndex;
        sound.playTick();
        sound.triggerHaptic(8);
        pointerDeflectionRef.current = 0.18; // Flapper kick
      } else {
        // Damp pointer deflection back to 0
        pointerDeflectionRef.current *= 0.85;
      }

      drawWheel(currentAngle, pointerDeflectionRef.current);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Spin Finished: Snap to targetAngle and resolve visible winner
        rotationRef.current = targetAngle;
        pointerDeflectionRef.current = 0;
        drawWheel(targetAngle, 0);

        const currentSegments = segmentsRef.current;
        const verifiedIndex = getSegmentAtAngle(targetAngle, currentSegments.length, DEFAULT_POINTER_ANGLE);
        const finalWinner = currentSegments[verifiedIndex] || currentSegments[0] || 'Winner';
        setWinner(finalWinner);
        setShowWinnerModal(true);
        setIsSpinning(false);
        setLiveAnnouncement(`Result: ${finalWinner} selected!`);

        sound.playVictory();
        sound.triggerHaptic([30, 60, 30, 80]);
        triggerConfetti();
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [isSpinning, segments, getSegmentAtAngle, drawWheel]);

  // ========================================================
  // PLAYER MANAGEMENT HANDLERS
  // ========================================================
  const handleAddSegment = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newSegmentInput.trim().substring(0, 24);
    if (!clean) return;
    setSegments((prev) => [...prev, clean]);
    setNewSegmentInput('');
    sound.triggerHaptic(12);
  };

  const handleRemoveSegment = (indexToRemove: number) => {
    if (segments.length <= 2) return;
    setSegments((prev) => prev.filter((_, i) => i !== indexToRemove));
    sound.triggerHaptic(15);
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditingText(segments[index]);
  };

  const handleSaveEdit = (index: number) => {
    const clean = editingText.trim().substring(0, 24);
    if (clean) {
      setSegments((prev) => prev.map((s, i) => (i === index ? clean : s)));
    }
    setEditingIndex(null);
    setEditingText('');
    sound.triggerHaptic(10);
  };

  const handleShuffleSegments = () => {
    if (isSpinning) return;
    setSegments((prev) => {
      const copy = [...prev];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    });
    sound.triggerHaptic(15);
  };

  const handlePopulateDemoPlayers = () => {
    if (isSpinning) return;
    setSegments(DEMO_PLAYERS);
    setGameMode('players');
    setWinner(null);
    sound.triggerHaptic(20);
  };

  const handleResetWheel = () => {
    if (isSpinning) return;
    const presets = getModePresets();
    setSegments(presets[gameMode].segments);
    setWinner(null);
    setShowWinnerModal(false);
    sound.triggerHaptic(15);
  };

  const handleRemoveWinnerAndSpin = () => {
    if (!winner || segments.length <= 2) return;
    const remaining = segments.filter((s) => s !== winner);
    setSegments(remaining);
    setShowWinnerModal(false);
    setWinner(null);
    sound.triggerHaptic(15);
  };

  const handleSwitchMode = (mode: GameMode) => {
    if (isSpinning) return;
    const presets = getModePresets();
    setGameMode(mode);
    setSegments(presets[mode].segments);
    setWinner(null);
    setShowWinnerModal(false);
    sound.triggerHaptic(15);
  };

  const handleToggleMute = () => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
  };

  const modePresets = getModePresets();

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 flex-1 flex flex-col items-center">
      {/* Screen Reader Live Region */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      {/* Navigation Header */}
      <div className="w-full flex items-center justify-between">
        <Link
          href={`/${locale}/games`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {dict.nav.allGames}
        </Link>
        <div className="flex items-center gap-2">
          {/* Mute Audio Toggle */}
          <button
            type="button"
            onClick={handleToggleMute}
            aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="p-2 rounded-xl bg-surface-elevated hover:bg-surface-highlight border border-white/10 text-slate-300 hover:text-white transition-colors active:scale-95"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-brand-300" />}
          </button>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-400 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-500/10 border border-brand-400/20">
            <Sparkles className="w-3.5 h-3.5" /> {dict.spinner.badge}
          </span>
        </div>
      </div>

      {/* Title & Tagline */}
      <div className="text-center space-y-2 px-2">
        <h1 className="font-display font-extrabold text-2xl sm:text-4xl md:text-5xl text-white tracking-tight">
          {dict.spinner.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          {dict.spinner.subtitle}
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 p-1 rounded-2xl bg-surface-elevated border border-white/10 max-w-full">
        {(Object.keys(modePresets) as GameMode[]).map((mode) => {
          const item = modePresets[mode];
          const Icon = item.icon;
          const isActive = gameMode === mode;
          return (
            <button
              key={mode}
              type="button"
              onClick={() => handleSwitchMode(mode)}
              disabled={isSpinning}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50',
                isActive
                  ? 'bg-brand-500 text-white shadow-glow-brand'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.title}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================
          MAIN GAME AREA: RESPONSIVE TWO-COLUMN / SINGLE-COLUMN
         ========================================================= */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start justify-center">
        {/* LEFT COLUMN: LUXURY CANVAS WHEEL (lg: 7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center space-y-5">
          <div className="relative flex flex-col items-center justify-center w-full max-w-[340px] xs:max-w-[380px] sm:max-w-[440px] aspect-square">
            <canvas
              ref={canvasRef}
              onClick={spinWheel}
              data-testid="spinner-wheel-canvas"
              className={cn(
                'w-full h-full cursor-pointer transition-transform duration-150',
                isSpinning ? 'cursor-not-allowed' : 'hover:scale-[1.01] active:scale-[0.98]'
              )}
            />
          </div>

          {/* Primary Spin CTA Button */}
          <div className="w-full max-w-xs space-y-2">
            <Button
              data-testid="spin-wheel-button"
              variant="primary"
              size="xl"
              disabled={isSpinning || segments.length < 2}
              onClick={spinWheel}
              className="w-full text-base sm:text-lg font-black gap-2 shadow-glow-brand min-h-[50px] uppercase tracking-wider"
            >
              <Disc className={cn('w-5 h-5 sm:w-6 sm:h-6', isSpinning && 'animate-spin')} />
              <span>{isSpinning ? dict.spinner.spinning : dict.spinner.spinButton}</span>
            </Button>
            <p className="text-[11px] text-center text-slate-400">
              {segments.length} segments active &bull; Click button or wheel to spin
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: PLAYER ROSTER & SEGMENT MANAGEMENT (lg: 5 cols) */}
        <div className="lg:col-span-5 w-full space-y-4">
          <div className="p-4 sm:p-6 rounded-3xl bg-surface-elevated border border-white/10 shadow-elevation-2 backdrop-blur-md space-y-4">
            {/* Header with Counter and Quick Actions */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                  Wheel Segments ({segments.length})
                </h3>
                <span className="text-[11px] text-slate-400">Minimum 2 slices required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleShuffleSegments}
                  disabled={isSpinning}
                  title="Shuffle segment order"
                  className="p-1.5 rounded-lg bg-surface-highlight hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                >
                  <Shuffle className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleResetWheel}
                  disabled={isSpinning}
                  title="Reset to default preset"
                  className="p-1.5 rounded-lg bg-surface-highlight hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Segment Chips List */}
            <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
              {segments.map((seg, idx) => {
                const color = WHEEL_PALETTE[idx % WHEEL_PALETTE.length];
                const isEditingThis = editingIndex === idx;

                if (isEditingThis) {
                  return (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-1 p-1 rounded-xl bg-brand-500/20 border border-brand-400 text-xs"
                    >
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        maxLength={24}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(idx);
                          if (e.key === 'Escape') setEditingIndex(null);
                        }}
                        className="w-24 px-1.5 py-0.5 rounded bg-black/60 text-white text-xs outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(idx)}
                        className="p-1 text-emerald-400 hover:text-emerald-300"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingIndex(null)}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                }

                return (
                  <div
                    key={idx}
                    className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-highlight border border-white/10 text-xs font-semibold text-white shadow-sm transition-all hover:border-white/20"
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: color.start }}
                    />
                    <span className="max-w-[120px] sm:max-w-[160px] truncate">{seg}</span>
                    <button
                      type="button"
                      onClick={() => handleStartEdit(idx)}
                      disabled={isSpinning}
                      title="Edit label"
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white transition-opacity p-0.5"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    {segments.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSegment(idx)}
                        disabled={isSpinning}
                        title="Remove segment"
                        className="text-slate-400 hover:text-rose-400 ml-0.5 transition-colors p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add Segment Input Form */}
            <form onSubmit={handleAddSegment} className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder={dict.spinner.addSlicePlaceholder || 'Add new player or option...'}
                value={newSegmentInput}
                onChange={(e) => setNewSegmentInput(e.target.value)}
                maxLength={24}
                disabled={isSpinning}
                className="flex-1 min-w-0 h-10 sm:h-11 px-3 sm:px-4 rounded-xl bg-canvas-base border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-400 transition-colors"
              />
              <Button
                type="submit"
                variant="secondary"
                size="md"
                disabled={isSpinning || !newSegmentInput.trim()}
                className="shrink-0 h-10 sm:h-11 px-3 sm:px-4"
              >
                <Plus className="w-4 h-4" /> {dict.spinner.addSliceButton}
              </Button>
            </form>

            {/* Quick Demo Players Button */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePopulateDemoPlayers}
                disabled={isSpinning}
                className="text-xs font-semibold text-brand-300 hover:text-brand-200 transition-colors inline-flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Populate Demo Players</span>
              </button>
              <button
                type="button"
                onClick={handleResetWheel}
                disabled={isSpinning}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Clear / Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          WINNER ANNOUNCEMENT MODAL & CELEBRATION
         ========================================================= */}
      {showWinnerModal && winner && (
        <div
          data-testid="winner-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-surface-elevated border border-brand-400/50 shadow-glow-brand text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-500/20 border border-brand-400/40 flex items-center justify-center text-amber-400 shadow-glow-brand animate-bounce">
              <Trophy className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-300">
                {dict.spinner.winnerHeading || 'Selected Winner!'}
              </span>
              <h2
                data-testid="winner-name"
                className="font-display font-black text-3xl sm:text-4xl text-white truncate px-2"
              >
                {winner}
              </h2>
            </div>

            <div className="space-y-2 pt-2">
              <Button
                variant="primary"
                size="lg"
                data-testid="modal-spin-again-btn"
                onClick={() => {
                  setShowWinnerModal(false);
                  spinWheel();
                }}
                className="w-full text-base font-bold gap-2"
              >
                <Disc className="w-4 h-4" />
                <span>Spin Again</span>
              </Button>

              {segments.length > 2 && (
                <Button
                  variant="secondary"
                  size="md"
                  data-testid="modal-remove-winner-btn"
                  onClick={handleRemoveWinnerAndSpin}
                  className="w-full text-xs font-semibold text-rose-300 hover:text-rose-200 hover:bg-rose-500/10"
                >
                  Remove Winner & Keep Playing ({segments.length - 1} left)
                </Button>
              )}

              <button
                type="button"
                onClick={() => setShowWinnerModal(false)}
                className="w-full text-center text-xs text-slate-400 hover:text-white py-1 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
