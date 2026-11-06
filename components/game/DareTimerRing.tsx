'use client';

import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { sound } from '@/lib/audio/soundSynthesizer';
import { cn } from '@/lib/utils';

interface DareTimerRingProps {
  initialSeconds?: number;
  onExpire?: () => void;
  className?: string;
}

export function DareTimerRing({ initialSeconds = 30, onExpire, className }: DareTimerRingProps) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timeLeft / initialSeconds) * circumference;

  useEffect(() => {
    setTimeLeft(initialSeconds);
    setIsRunning(true);
  }, [initialSeconds]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            sound.playBuzzer();
            sound.triggerHaptic([150, 80, 200]);
            setIsRunning(false);
            if (onExpire) onExpire();
            return 0;
          }
          // Tick sound & warning haptics
          if (prev <= 5) {
            sound.triggerHaptic(20);
          }
          sound.playTick();
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, onExpire]);

  const toggleRunning = () => {
    setIsRunning(!isRunning);
    sound.triggerHaptic(15);
  };

  const resetTimer = () => {
    setTimeLeft(initialSeconds);
    setIsRunning(true);
    sound.triggerHaptic(15);
  };

  // Color dynamics: Emerald (>10s) -> Amber (5-10s) -> Rose (<5s)
  const isUrgent = timeLeft <= 5 && timeLeft > 0;
  const strokeColor = timeLeft > 10 ? '#10B981' : timeLeft > 5 ? '#F59E0B' : '#FF5C77';

  return (
    <div className={cn('flex flex-col items-center gap-2 select-none', className)}>
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background Track */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="6"
            fill="transparent"
          />
          {/* Animated Progress Indicator */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke={strokeColor}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>

        {/* Center Countdown Value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn(
              'font-mono font-bold text-2xl tracking-tighter transition-colors',
              isUrgent ? 'text-dare-400 animate-pulse' : 'text-white'
            )}
          >
            {timeLeft}s
          </span>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Dare Time</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleRunning}
          aria-label={isRunning ? 'Pause Timer' : 'Resume Timer'}
          className="p-1.5 rounded-lg bg-surface-elevated hover:bg-surface-highlight border border-white/10 text-slate-300 hover:text-white"
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
        </button>
        <button
          onClick={resetTimer}
          aria-label="Reset Timer"
          className="p-1.5 rounded-lg bg-surface-elevated hover:bg-surface-highlight border border-white/10 text-slate-300 hover:text-white"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

