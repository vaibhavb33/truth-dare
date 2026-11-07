'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Volume2,
  VolumeX,
  Sparkles,
  Users,
  Compass,
  Menu,
  X,
  Flame,
  Disc,
  HelpCircle,
  Zap,
  PlusCircle,
  BookOpen,
  Info,
  MessageSquare,
  FileText,
  Lock,
} from 'lucide-react';
import { sound } from '@/lib/audio/soundSynthesizer';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { LanguageSelector } from '@/components/i18n/LanguageSelector';
import { PWAInstallButton } from '@/components/pwa/PWAInstallButton';

export function AppHeader() {
  const pathname = usePathname();
  const { t, dict, locale } = useTranslation();
  const [isMuted, setIsMuted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsMuted(sound.getMuted());
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = orig;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  // Auto-close menu when path changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleToggleMute = () => {
    const nextMute = sound.toggleMute();
    setIsMuted(nextMute);
    sound.triggerHaptic(15);
  };

  // Strip leading locale prefix so active state highlights properly
  const normalizedPathname = useMemo(() => {
    const raw = pathname || '/';
    const segments = raw.split('/').filter(Boolean);
    if (segments.length > 0 && ['en', 'hi', 'es', 'pt', 'fr', 'id', 'ar', 'de'].includes(segments[0])) {
      const subpath = '/' + segments.slice(1).join('/');
      return subpath === '/' ? '/' : subpath;
    }
    return raw;
  }, [pathname]);

  const loc = (subpath: string) => (locale === 'en' ? subpath : `/${locale}${subpath === '/' ? '' : subpath}`);

  const navLinks = [
    { label: t('nav.allGames'), path: '/games', icon: Compass },
    { label: t('nav.truthOrDare'), path: '/games/truth-or-dare' },
    { label: t('nav.spinnerWheel'), path: '/games/spin-the-bottle' },
    { label: t('nav.customDeck'), path: '/custom' },
    { label: t('nav.questionLibrary'), path: '/questions' },
    { label: t('nav.guides'), path: '/blog' },
  ];

  const drawerGameLinks = [
    { label: dict.gamesList.truthOrDare.name, href: loc('/games/truth-or-dare'), icon: Flame, badge: 'Popular' },
    { label: dict.gamesList.spinTheBottle.name, href: loc('/games/spin-the-bottle'), icon: Disc, badge: 'Physics' },
    { label: dict.gamesList.neverHaveIEver.name, href: loc('/games/never-have-i-ever'), icon: HelpCircle, badge: '10 Lives' },
    { label: dict.gamesList.wouldYouRather.name, href: loc('/games/would-you-rather'), icon: Sparkles, badge: 'Live %' },
    { label: dict.gamesList.mostLikelyTo.name, href: loc('/games/most-likely-to'), icon: Users, badge: 'Votes' },
    { label: dict.gamesList.thisOrThat.name, href: loc('/games/this-or-that'), icon: Zap, badge: '60s' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full h-16 bg-[#0A0A16]/85 backdrop-blur-xl border-b border-white/10 px-3 sm:px-4 md:px-8 flex items-center justify-between transition-colors">
        {/* Brand Logo */}
        <Link href={loc('/')} className="flex items-center gap-2 sm:gap-2.5 group select-none shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-brand-500 via-brand-600 to-indigo-500 flex items-center justify-center shadow-glow-brand group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] transition-all">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-base sm:text-lg md:text-xl tracking-tight text-white flex items-center gap-1 sm:gap-1.5">
              ASTERIA <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-brand-400 shadow-glow-brand animate-pulse"></span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links with Active Indicator */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-300">
          {navLinks.map((link) => {
            const isActive = normalizedPathname === link.path || (link.path !== '/' && normalizedPathname.startsWith(link.path));
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                href={loc(link.path)}
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
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Language Selector Dropdown */}
          <LanguageSelector variant="header" />

          {/* PWA Install Button (Desktop/Tablet) */}
          <PWAInstallButton variant="header" />

          {/* Join Room Quick CTA */}
          <Link
            href="/#join-room"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-surface-elevated hover:bg-surface-highlight border border-white/10 hover:border-brand-400/40 text-slate-200 hover:text-white transition-all shadow-sm active:scale-95"
          >
            <Users className="w-3.5 h-3.5 text-brand-400" />
            <span>{t('nav.roomCode')}</span>
          </Link>

          {/* Master Audio Mute Toggle */}
          <button
            onClick={handleToggleMute}
            aria-label={isMuted ? t('nav.unmuteAudio') : t('nav.muteAudio')}
            title={isMuted ? t('nav.unmuteAudio') : t('nav.muteAudio')}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-surface-elevated hover:bg-surface-highlight border border-white/10 hover:border-white/25 flex items-center justify-center text-slate-300 hover:text-white transition-all active:scale-95 shadow-sm"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400 drop-shadow-[0_0_8px_rgba(255,92,119,0.8)]" />
            ) : (
              <Volume2 className="w-4 h-4 text-truth-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            )}
          </button>

          {/* Mobile Menu Toggle (visible on < lg) */}
          <button
            onClick={() => {
              sound.triggerHaptic(10);
              setIsMobileMenuOpen(!isMobileMenuOpen);
            }}
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
            className="lg:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-surface-elevated hover:bg-surface-highlight border border-white/10 hover:border-brand-400/40 flex items-center justify-center text-slate-300 hover:text-white transition-all active:scale-95 shadow-sm"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4 text-brand-300" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Responsive Mobile Navigation Drawer (Portaled to prevent clipping) */}
      {mounted && isMobileMenuOpen &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
            className="lg:hidden fixed inset-0 z-50 flex flex-col bg-[#07070F]/95 backdrop-blur-2xl animate-in fade-in duration-200"
          >
            {/* Drawer Header */}
            <div className="h-16 px-4 border-b border-white/10 flex items-center justify-between shrink-0 pt-[env(safe-area-inset-top,0px)]">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500 via-brand-600 to-indigo-500 flex items-center justify-center shadow-glow-brand">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-display font-extrabold text-lg text-white">ASTERIA</span>
              </Link>

              <button
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close Navigation Menu"
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6 pb-[calc(6rem+env(safe-area-inset-bottom,0px))]">
              {/* PWA Install Action in Mobile Drawer */}
              <PWAInstallButton variant="drawer" />

              {/* Quick Actions Bar */}
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  href="/#join-room"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-3 rounded-2xl bg-surface-elevated border border-brand-500/30 flex items-center gap-2.5 text-xs font-bold text-brand-300"
                >
                  <Users className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Join Room Code</span>
                </Link>

                <button
                  onClick={handleToggleMute}
                  className="p-3 rounded-2xl bg-surface-elevated border border-white/10 flex items-center gap-2.5 text-xs font-bold text-slate-300"
                >
                  {isMuted ? (
                    <>
                      <VolumeX className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>Audio: Muted</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-truth-400 shrink-0" />
                      <span>Audio: Active</span>
                    </>
                  )}
                </button>
              </div>

              {/* Party Games Grid */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-400">
                  Party Game Engines
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {drawerGameLinks.map((game) => {
                    const Icon = game.icon;
                    const isActive = normalizedPathname === game.href;
                    return (
                      <Link
                        key={game.href}
                        href={game.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          'p-3 rounded-2xl border transition-all flex items-center justify-between',
                          isActive
                            ? 'bg-brand-500/20 border-brand-400/50 text-brand-300 shadow-glow-brand'
                            : 'bg-surface-elevated hover:bg-surface-highlight border-white/10 text-slate-200'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 text-brand-400" />
                          <span className="text-xs font-bold">{game.label}</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
                          {game.badge}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Game Directory & Custom Creator */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-400">
                  Studio & Vault
                </span>
                <div className="grid grid-cols-1 gap-2">
                  <Link
                    href="/games"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-3 rounded-2xl bg-surface-elevated hover:bg-surface-highlight border border-white/10 flex items-center gap-3 text-xs font-bold text-slate-200"
                  >
                    <Compass className="w-4 h-4 text-brand-400" />
                    <span>Browse All Games Directory</span>
                  </Link>
                  <Link
                    href="/custom"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-3 rounded-2xl bg-surface-elevated hover:bg-surface-highlight border border-white/10 flex items-center gap-3 text-xs font-bold text-truth-300"
                  >
                    <PlusCircle className="w-4 h-4 text-truth-400" />
                    <span>Custom Deck Creator Studio</span>
                  </Link>
                  <Link
                    href="/questions"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-3 rounded-2xl bg-surface-elevated hover:bg-surface-highlight border border-white/10 flex items-center gap-3 text-xs font-bold text-slate-200"
                  >
                    <BookOpen className="w-4 h-4 text-brand-400" />
                    <span>500+ Truth or Dare Question Library</span>
                  </Link>
                  <Link
                    href="/blog"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-3 rounded-2xl bg-surface-elevated hover:bg-surface-highlight border border-white/10 flex items-center gap-3 text-xs font-bold text-slate-200"
                  >
                    <FileText className="w-4 h-4 text-dare-400" />
                    <span>Party Game Rules & Guides</span>
                  </Link>
                </div>
              </div>

              {/* Informational & Company Links */}
              <div className="pt-2 border-t border-white/10 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Asteria Platform
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                  <Link
                    href="/about"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/5 border border-white/5 flex items-center gap-2"
                  >
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    <span>About Us</span>
                  </Link>
                  <Link
                    href="/contact"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/5 border border-white/5 flex items-center gap-2"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                    <span>Contact</span>
                  </Link>
                  <Link
                    href="/privacy"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/5 border border-white/5 flex items-center gap-2"
                  >
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Privacy</span>
                  </Link>
                  <Link
                    href="/terms"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/5 border border-white/5 flex items-center gap-2"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Terms</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
