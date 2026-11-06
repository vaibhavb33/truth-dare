'use client';

import React from 'react';
import { AlertCircle, RefreshCw, Sparkles, FolderOpen } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'w-full p-8 md:p-12 rounded-3xl bg-surface-elevated/60 border border-white/10 flex flex-col items-center justify-center text-center space-y-4 backdrop-blur-md',
        className
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shadow-glow-brand animate-float">
        <FolderOpen className="w-8 h-8" />
      </div>

      <div className="space-y-1.5 max-w-sm">
        <h3 className="font-display font-bold text-lg md:text-xl text-white">
          {title}
        </h3>
        <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>

      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction} className="mt-2">
          <Sparkles className="w-4 h-4" />
          <span>{actionLabel}</span>
        </Button>
      )}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Something Went Wrong',
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'w-full p-6 md:p-10 rounded-3xl bg-rose-950/20 border border-rose-500/30 flex flex-col items-center justify-center text-center space-y-4 backdrop-blur-md',
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-glow-dare">
        <AlertCircle className="w-7 h-7" />
      </div>

      <div className="space-y-1 max-w-sm">
        <h3 className="font-display font-bold text-base md:text-lg text-rose-200">
          {title}
        </h3>
        <p className="text-xs text-rose-300/80 leading-relaxed">{message}</p>
      </div>

      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} className="gap-2 border-rose-500/30 hover:border-rose-400">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </Button>
      )}
    </div>
  );
}

interface SkeletonProps {
  className?: string;
}

export function LoadingSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-surface-elevated animate-shimmer border border-white/5',
        className
      )}
    />
  );
}

export function CardShimmer() {
  return (
    <div className="w-full max-w-md h-[460px] rounded-3xl bg-surface-elevated/70 border border-white/10 p-8 flex flex-col justify-between animate-shimmer">
      <div className="flex justify-between items-center w-full">
        <LoadingSkeleton className="h-6 w-24 rounded-full" />
        <LoadingSkeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="space-y-3 my-auto">
        <LoadingSkeleton className="h-7 w-3/4 mx-auto rounded-xl" />
        <LoadingSkeleton className="h-7 w-1/2 mx-auto rounded-xl" />
      </div>
      <div className="grid grid-cols-2 gap-3 w-full">
        <LoadingSkeleton className="h-14 rounded-2xl" />
        <LoadingSkeleton className="h-14 rounded-2xl" />
      </div>
    </div>
  );
}

