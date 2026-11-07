'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Disc, Plus, X, Trophy, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { sound } from '@/lib/audio/soundSynthesizer';
import { triggerConfetti } from '@/components/game/ConfettiCelebration';
import { setGameplayActive } from '@/lib/gameplay/gameplayState';

const PRESETS = {
  classic: {
    name: '🎉 Classic Party',
    segments: ['Alex', 'Truth', 'Maya', 'Dare', 'Jordan', 'Take 2 Sips', 'Sarah', 'Wild Card'],
  },
  couples: {
    name: '❤️ Couples Night',
    segments: ['Kiss Cheek', 'Deep Secret', 'Hug 30s', 'Flirty Truth', 'Slow Dance', 'Whisper Confession'],
  },
  chaos: {
    name: '🌶️ Party Chaos',
    segments: ['Take 1 Sip', 'Spicy Truth', 'Give 2 Sips', 'Wild Dare', 'Switch Seats', 'Veto Pass'],
  },
  family: {
    name: '🌟 Clean Family',
    segments: ['Tell a Joke', 'Sing Chorus', 'Wholesome Truth', '10 Jumping Jacks', 'Trivia Prompt', 'Silly Dance'],
  },
};

export function SpinnerWheelClient() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Wheel Segments
  const [segments, setSegments] = useState<string[]>(PRESETS.classic.segments);
  const [newSegmentInput, setNewSegmentInput] = useState('');

  // Spinning State
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const rotationRef = useRef<number>(0);

  useEffect(() => {
    setGameplayActive(isSpinning);
    return () => {
      setGameplayActive(false);
    };
  }, [isSpinning]);

  const colors = [
    '#8B5CF6', '#06B6D4', '#FF5C77', '#10B981',
    '#F59E0B', '#6366F1', '#EC4899', '#3B82F6',
    '#14B8A6', '#D946EF',
  ];

  // Draw the Elevated Luxury Wheel Canvas
  const drawWheel = (currentRotation: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 18;

    ctx.clearRect(0, 0, width, height);

    const numSegments = segments.length;
    const anglePerSegment = (2 * Math.PI) / numSegments;

    // 1. Draw Outer Glow Halo
    const haloGradient = ctx.createRadialGradient(centerX, centerY, radius - 10, centerX, centerY, radius + 15);
    haloGradient.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
    haloGradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 15, 0, 2 * Math.PI);
    ctx.fillStyle = haloGradient;
    ctx.fill();

    // 2. Draw Wheel Slices with Radial Shading
    for (let i = 0; i < numSegments; i++) {
      const angle = currentRotation + i * anglePerSegment;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + anglePerSegment);
      ctx.closePath();

      // Shaded slice fill
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();

      // Delicate slice separator line
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#0A0A16';
      ctx.stroke();

      // Inner lighting radial gradient overlay
      const sliceGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      sliceGrad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
      sliceGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0.05)');
      sliceGrad.addColorStop(1, 'rgba(0, 0, 0, 0.35)');

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + anglePerSegment);
      ctx.closePath();
      ctx.fillStyle = sliceGrad;
      ctx.fill();

      // Draw Slice Text with drop shadow
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + anglePerSegment / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px "Plus Jakarta Sans", Inter, sans-serif';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.fillText(segments[i], radius - 24, 5);
      ctx.restore();
    }

    // 3. Draw Metallic Outer Rim with Rivet Studs
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#1E1B4B';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 5, 0, 2 * Math.PI);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.stroke();

    // Rivet divider studs
    for (let i = 0; i < numSegments; i++) {
      const angle = currentRotation + i * anglePerSegment;
      const studX = centerX + Math.cos(angle) * (radius - 5);
      const studY = centerY + Math.sin(angle) * (radius - 5);

      ctx.beginPath();
      ctx.arc(studX, studY, 3, 0, 2 * Math.PI);
      ctx.fillStyle = '#FFD700';
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#000000';
      ctx.stroke();
    }

    // 4. Center Metallic Hub with Concentric Rings
    const hubGrad = ctx.createRadialGradient(centerX - 4, centerY - 4, 2, centerX, centerY, 28);
    hubGrad.addColorStop(0, '#FFFFFF');
    hubGrad.addColorStop(0.3, '#A78BFA');
    hubGrad.addColorStop(0.8, '#4C1D95');
    hubGrad.addColorStop(1, '#0A0A16');

    ctx.beginPath();
    ctx.arc(centerX, centerY, 26, 0, 2 * Math.PI);
    ctx.fillStyle = hubGrad;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#8B5CF6';
    ctx.stroke();

    // Center Core Jewel
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
  };

  useEffect(() => {
    drawWheel(rotationRef.current);
  }, [segments]);

  // Spin the Wheel with Deceleration Physics
  const spinWheel = () => {
    if (isSpinning || segments.length < 2) return;

    setIsSpinning(true);
    setWinner(null);
    sound.triggerHaptic(25);

    const spinDuration = 4200; // 4.2 seconds
    const startVelocity = 28 + Math.random() * 14;
    let currentSpeed = startVelocity;
    const friction = 0.984;
    let lastTickAngle = rotationRef.current;

    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;

      if (elapsed < spinDuration && currentSpeed > 0.04) {
        rotationRef.current += currentSpeed * 0.02;
        currentSpeed *= friction;

        // Procedural tick sound as slices pass top pointer
        const anglePerSegment = (2 * Math.PI) / segments.length;
        if (Math.abs(rotationRef.current - lastTickAngle) >= anglePerSegment) {
          sound.playTick();
          sound.triggerHaptic(8);
          lastTickAngle = rotationRef.current;
        }

        drawWheel(rotationRef.current);
        requestAnimationFrame(animate);
      } else {
        // Calculate Winner (Pointer at top = 3PI / 2)
        const anglePerSegment = (2 * Math.PI) / segments.length;
        const normalizedAngle = (2 * Math.PI - (rotationRef.current % (2 * Math.PI))) % (2 * Math.PI);
        const pointerAngle = (normalizedAngle + (3 * Math.PI) / 2) % (2 * Math.PI);
        const winningIndex = Math.floor(pointerAngle / anglePerSegment) % segments.length;

        const winningSegment = segments[winningIndex];
        setWinner(winningSegment);
        setIsSpinning(false);
        sound.playVictory();
        triggerConfetti();
      }
    };

    requestAnimationFrame(animate);
  };

  // Add Custom Segment
  const handleAddSegment = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newSegmentInput.trim().substring(0, 25);
    if (!clean) return;
    setSegments([...segments, clean]);
    setNewSegmentInput('');
    sound.triggerHaptic(15);
  };

  // Remove Segment
  const handleRemoveSegment = (idx: number) => {
    if (segments.length <= 2) return;
    setSegments(segments.filter((_, i) => i !== idx));
    sound.triggerHaptic(15);
  };

  const handleApplyPreset = (key: keyof typeof PRESETS) => {
    if (isSpinning) return;
    setSegments(PRESETS[key].segments);
    setWinner(null);
    sound.triggerHaptic(20);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-6 sm:space-y-8 flex-1 flex flex-col items-center">
      {/* Navigation Header */}
      <div className="w-full flex items-center justify-between">
        <Link
          href="/games"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> All Games
        </Link>
        <span className="text-xs font-bold uppercase tracking-widest text-brand-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Physics Spinner
        </span>
      </div>

      <div className="text-center space-y-2 px-2">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl md:text-5xl text-white tracking-tight">
          Spinner Wheel
        </h1>
        <p className="text-xs md:text-sm text-slate-400 max-w-md mx-auto">
          Spin the physics wheel to assign dare targets, decide forfeits, or settle who goes next!
        </p>
      </div>

      {/* Preset Quick Switcher */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        {(Object.keys(PRESETS) as Array<keyof typeof PRESETS>).map((key) => (
          <button
            key={key}
            onClick={() => handleApplyPreset(key)}
            disabled={isSpinning}
            className="px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold bg-surface-elevated hover:bg-surface-highlight border border-white/10 hover:border-brand-400/40 text-slate-300 hover:text-white transition-all disabled:opacity-50"
          >
            {PRESETS[key].name}
          </button>
        ))}
      </div>

      {/* Wheel Area */}
      <div className="relative flex flex-col items-center justify-center py-2 sm:py-4 w-full max-w-full overflow-hidden">
        {/* Top Indicator Arrow with Neon Drop Glow */}
        <div className="relative z-20 -mb-4 flex flex-col items-center">
          <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[26px] border-t-dare-400 drop-shadow-[0_0_15px_rgba(255,92,119,0.9)] animate-pulse" />
          <div className="w-2.5 h-2.5 rounded-full bg-white -mt-5" />
        </div>

        <canvas
          ref={canvasRef}
          width={380}
          height={380}
          onClick={spinWheel}
          className="w-full max-w-[280px] xs:max-w-[340px] sm:max-w-[380px] h-auto aspect-square cursor-pointer active:scale-95 transition-transform drop-shadow-[0_0_50px_rgba(139,92,246,0.35)]"
        />

        {/* Spin Trigger Button */}
        <div className="pt-5 sm:pt-6 w-full max-w-xs px-2">
          <Button
            variant="primary"
            size="xl"
            disabled={isSpinning || segments.length < 2}
            onClick={spinWheel}
            className="w-full text-base sm:text-lg font-black gap-2 shadow-[0_0_35px_rgba(139,92,246,0.5)] min-h-[48px]"
          >
            <Disc className={`w-5 h-5 sm:w-6 sm:h-6 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'SPINNING...' : 'SPIN THE WHEEL'}</span>
          </Button>
        </div>
      </div>

      {/* Winner Announcement Banner */}
      {winner && (
        <div className="w-full max-w-md p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-surface-elevated via-surface-highlight to-surface-elevated border border-brand-400/50 shadow-glow-brand text-center space-y-1.5 animate-float mx-2">
          <div className="flex items-center justify-center gap-1.5 text-brand-400 font-bold text-xs uppercase tracking-wider">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>THE WHEEL HAS SPOKEN!</span>
          </div>
          <p className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-white truncate px-2">
            {winner}
          </p>
        </div>
      )}

      {/* Customizable Segments Manager */}
      <div className="w-full max-w-md p-4 sm:p-6 md:p-8 rounded-3xl bg-surface-elevated border border-white/10 space-y-4 sm:space-y-5 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-xs sm:text-sm text-white uppercase tracking-wider">
            Wheel Slices ({segments.length})
          </h3>
          <span className="text-[10px] sm:text-[11px] text-slate-400">Min 2 Slices</span>
        </div>

        {/* Chips */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
          {segments.map((seg, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-surface-highlight border border-white/10 text-xs font-semibold text-white shadow-sm max-w-full"
            >
              <span className="max-w-[110px] sm:max-w-[180px] truncate">{seg}</span>
              {segments.length > 2 && (
                <button
                  onClick={() => handleRemoveSegment(idx)}
                  className="text-slate-400 hover:text-rose-400 ml-0.5 sm:ml-1 transition-colors shrink-0 p-0.5"
                  title="Remove slice"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add Input */}
        <form onSubmit={handleAddSegment} className="flex gap-2">
          <input
            type="text"
            placeholder="Add player name or dare..."
            value={newSegmentInput}
            onChange={(e) => setNewSegmentInput(e.target.value)}
            maxLength={25}
            className="flex-1 min-w-0 h-10 sm:h-11 px-3 sm:px-4 rounded-xl bg-canvas-base border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-400 transition-colors"
          />
          <Button type="submit" variant="secondary" size="md" className="shrink-0 h-10 sm:h-11 px-3 sm:px-4">
            <Plus className="w-4 h-4" /> Add
          </Button>
        </form>
      </div>
    </div>
  );
}
