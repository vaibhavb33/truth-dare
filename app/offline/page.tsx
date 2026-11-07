'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { WifiOff, RefreshCw, Flame, BookOpen, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { sound } from '@/lib/audio/soundSynthesizer';

export default function OfflineFallbackPage() {
  const [isOnline, setIsOnline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : false);

    const handleOnline = () => {
      setIsOnline(true);
      sound.playVictory();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    sound.triggerHaptic(15);
    setIsRetrying(true);
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }, 600);
  };

  return (
    <div className="flex-1 w-full flex items-center justify-center px-4 py-12 md:py-20">
      <div className="w-full max-w-lg p-6 sm:p-8 md:p-10 rounded-3xl bg-surface-elevated border border-white/10 shadow-elevation-3 text-center space-y-6">
        {/* Offline Badge Icon */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-dare-500/10 border border-dare-400/30 flex items-center justify-center text-dare-400 shadow-glow-dare animate-pulse">
          <WifiOff className="w-10 h-10" />
        </div>

        {/* Primary Notification Message */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-slate-400">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <span>NO INTERNET CONNECTION</span>
          </div>

          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            Asteria is currently offline. Please reconnect to continue playing.
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
            You appear to have lost your network connection. Certain real-time features like multiplayer rooms require active internet, but you can continue playing local Pass & Play games offline.
          </p>
        </div>

        {/* Offline Capabilities & Multiplayer Transparency Notice */}
        <div className="p-4 rounded-2xl bg-canvas-base border border-white/5 space-y-2 text-left text-xs text-slate-300">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
            <span>
              <strong>Available Offline:</strong> Pass & Play Truth or Dare, Custom Decks, and locally stored Question Library prompts.
            </span>
          </div>
          <div className="flex items-start gap-2 text-slate-400">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Unavailable Offline:</strong> Online multiplayer rooms and live synchronized screens require internet access.
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col gap-3 pt-2">
          <Button
            variant="primary"
            size="lg"
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full font-bold gap-2 min-h-[48px]"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Reconnecting to Asteria...' : 'Try Reconnecting'}</span>
          </Button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Link href="/games/truth-or-dare" className="w-full">
              <Button variant="secondary" size="md" className="w-full gap-2 min-h-[44px]">
                <Flame className="w-4 h-4 text-dare-400" />
                <span>Play Pass & Play</span>
              </Button>
            </Link>

            <Link href="/questions" className="w-full">
              <Button variant="secondary" size="md" className="w-full gap-2 min-h-[44px]">
                <BookOpen className="w-4 h-4 text-brand-400" />
                <span>Question Library</span>
              </Button>
            </Link>
          </div>
        </div>

        {isOnline && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold animate-fade-in">
            ✓ Internet connection restored! Tap "Try Reconnecting" to resume.
          </div>
        )}
      </div>
    </div>
  );
}

