'use client';

import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { sound } from '@/lib/audio/soundSynthesizer';
import { cn } from '@/lib/utils';

interface DareTimerRingProps {
  initialSeconds?: number;
  onExpire?: () => void;
  className?: string;
  compact?: boolean;
}

export function DareTimerRing({ initialSeconds = 30, onExpire, className, compact = false }: DareTimerRingProps) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);

  const radius = compact ? 26 : 32;
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

  const isUrgent = timeLeft <= 5 && timeLeft > 0;
  const strokeColor = timeLeft > 10 ? '#10B981' : timeLeft > 5 ? '#F59E0B' : '#FF5C77';

  return (
    <div
      className={cn(
        'flex items-center justify-center select-none',
        compact ? 'gap-2 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm' : 'flex-col gap-1.5',
        className
      )}
    >
      <div className={cn('relative flex items-center justify-center', compact ? 'w-11 h-11 sm:w-13 sm:h-13' : 'w-16 h-16 sm:w-20 sm:h-20')}>
        <svg className="w-full h-full transform -rotate-90" viewBox={compact ? '0 0 64 64' : '0 0 76 76'}>
          {/* Background Track */}
          <circle
            cx={compact ? '32' : '38'}
            cy={compact ? '32' : '38'}
            r={radius}
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth={compact ? '4' : '5'}
            fill="transparent"
          />
          {/* Animated Progress Indicator */}
          <circle
            cx={compact ? '32' : '38'}
            cy={compact ? '32' : '38'}
            r={radius}
            stroke={strokeColor}
            strokeWidth={compact ? '4' : '5'}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>

        {/* Center Countdown Value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
          <span
            className={cn(
              'font-mono font-bold tracking-tight transition-colors',
              compact ? 'text-xs sm:text-sm' : 'text-base sm:text-xl tracking-tight',
              isUrgent ? 'text-dare-400 animate-pulse' : 'text-white'
            )}
          >
            {timeLeft}s
          </span>
          {!compact && (
            <span className="text-[8px] sm:text-[9px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">Dare</span>
          )}
        </div>
      </div>

      {/* Control Buttons */}
      <div className={cn('flex items-center gap-1.5', compact ? '' : '')}>
        <button
          onClick={toggleRunning}
          aria-label={isRunning ? 'Pause Timer' : 'Resume Timer'}
          className="p-1.5 rounded-lg bg-surface-elevated hover:bg-surface-highlight border border-white/10 text-slate-300 hover:text-white transition-colors"
          title={isRunning ? 'Pause' : 'Resume'}
        >
          {isRunning ? <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />}
        </button>
        <button
          onClick={resetTimer}
          aria-label="Reset Timer"
          className="p-1.5 rounded-lg bg-surface-elevated hover:bg-surface-highlight border border-white/10 text-slate-300 hover:text-white transition-colors"
          title="Reset Timer"
        >
          <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </button>
      </div>
    </div>
  );
}
