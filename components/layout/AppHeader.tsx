'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Volume2, VolumeX, Sparkles, Users, Compass, Shield } from 'lucide-react';
import { sound } from '@/lib/audio/soundSynthesizer';
import { cn } from '@/lib/utils';

export function AppHeader() {
  const pathname = usePathname();
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsMuted(sound.getMuted());
  }, []);

  const handleToggleMute = () => {
    const nextMute = sound.toggleMute();
    setIsMuted(nextMute);
    sound.triggerHaptic(15);
  };

  const navLinks = [
    { label: 'All Games', href: '/games', icon: Compass },
    { label: 'Truth or Dare', href: '/games/truth-or-dare' },
    { label: 'Spinner Wheel', href: '/games/spin-the-bottle' },
    { label: 'Custom Deck', href: '/custom' },
    { label: 'Question Library', href: '/questions' },
    { label: 'Guides', href: '/blog' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-[#0A0A16]/85 backdrop-blur-xl border-b border-white/10 px-4 md:px-8 flex items-center justify-between transition-colors">
      {/* Brand Logo */}
      <Link href="/" className="flex items-center gap-2.5 group select-none">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 via-brand-600 to-indigo-500 flex items-center justify-center shadow-glow-brand group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] transition-all">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-display font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
            ASTERIA <span className="w-2 h-2 rounded-full bg-brand-400 shadow-glow-brand animate-pulse"></span>
          </span>
        </div>
      </Link>

      {/* Desktop Navigation Links with Active Indicator */}
      <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-300">
        {navLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5',
                isActive
                  ? 'bg-brand-500/20 text-brand-300 shadow-glow-brand border border-brand-500/30'
                  : 'hover:text-white hover:bg-white/5'
              )}
            >
              {Icon && <Icon className="w-3.5 h-3.5 text-brand-400" />}
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Header Actions */}
      <div className="flex items-center gap-2.5">
        {/* Join Room Quick CTA */}
        <Link
          href="/#join-room"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-surface-elevated hover:bg-surface-highlight border border-white/10 hover:border-brand-400/40 text-slate-200 hover:text-white transition-all shadow-sm active:scale-95"
        >
          <Users className="w-3.5 h-3.5 text-brand-400" />
          <span>Room Code</span>
        </Link>

        {/* Master Audio Mute Toggle */}
        <button
          onClick={handleToggleMute}
          aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          className="w-10 h-10 rounded-xl bg-surface-elevated hover:bg-surface-highlight border border-white/10 hover:border-white/25 flex items-center justify-center text-slate-300 hover:text-white transition-all active:scale-95 shadow-sm"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-rose-400 drop-shadow-[0_0_8px_rgba(255,92,119,0.8)]" />
          ) : (
            <Volume2 className="w-4 h-4 text-truth-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          )}
        </button>

        {/* Admin Link Icon */}
        <Link
          href="/admin"
          aria-label="Admin Portal"
          title="Admin Portal"
          className="w-10 h-10 rounded-xl bg-surface-elevated hover:bg-surface-highlight border border-white/10 hover:border-white/25 flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-95 shadow-sm"
        >
          <Shield className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
}
