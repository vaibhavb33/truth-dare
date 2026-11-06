'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { sound } from '@/lib/audio/soundSynthesizer';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'truth' | 'dare' | 'skip' | 'secondary' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  hapticFeedback?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', hapticFeedback = true, onClick, children, disabled, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;
      if (hapticFeedback) {
        sound.triggerHaptic(15);
      }
      if (onClick) onClick(e);
    };

    const variants = {
      primary:
        'bg-gradient-to-r from-brand-500 via-brand-600 to-indigo-600 text-white shadow-glow-brand hover:shadow-[0_0_45px_-5px_rgba(139,92,246,0.6)] hover:brightness-110 active:scale-[0.96] border border-brand-300/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]',
      truth:
        'bg-gradient-to-r from-truth-500 via-cyan-500 to-truth-700 text-white shadow-glow-truth hover:shadow-[0_0_40px_-5px_rgba(6,182,212,0.6)] hover:brightness-110 active:scale-[0.96] border border-truth-300/40 font-bold shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)]',
      dare:
        'bg-gradient-to-r from-dare-500 via-rose-500 to-rose-700 text-white shadow-glow-dare hover:shadow-[0_0_40px_-5px_rgba(255,92,119,0.6)] hover:brightness-110 active:scale-[0.96] border border-dare-300/40 font-bold shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)]',
      skip:
        'bg-white/5 hover:bg-rose-500/15 text-slate-300 hover:text-rose-200 border border-white/10 hover:border-rose-400/40 active:scale-[0.96] hover:shadow-[0_0_20px_rgba(255,92,119,0.2)]',
      secondary:
        'bg-surface-elevated hover:bg-surface-highlight text-slate-100 border border-white/10 hover:border-white/25 active:scale-[0.96] hover:shadow-elevation-2',
      glass:
        'bg-white/5 backdrop-blur-md hover:bg-white/10 text-white border border-white/15 hover:border-white/30 active:scale-[0.96]',
      ghost:
        'bg-transparent hover:bg-white/5 text-slate-300 hover:text-white active:scale-[0.96]',
    };

    const sizes = {
      sm: 'h-9 px-3.5 text-xs rounded-xl font-medium',
      md: 'h-11 px-5 text-sm rounded-xl font-semibold',
      lg: 'h-14 px-6 text-base font-bold rounded-2xl',
      xl: 'h-16 px-8 text-lg font-extrabold rounded-2xl tracking-wide',
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 transition-all duration-200 select-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas-base',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
