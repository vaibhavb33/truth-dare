'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Flame, Disc, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sound } from '@/lib/audio/soundSynthesizer';

export function MobileDock() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Games', href: '/games', icon: Compass },
    { label: 'Truth/Dare', href: '/games/truth-or-dare', icon: Flame },
    { label: 'Spinner', href: '/games/spin-the-bottle', icon: Disc },
    { label: 'Custom', href: '/custom', icon: PlusCircle },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-canvas-base/95 backdrop-blur-xl border-t border-white/10 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-8px_24px_rgba(0,0,0,0.5)]"
    >
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => sound.triggerHaptic(10)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 h-full min-h-[48px] py-1 text-[10px] sm:text-[11px] font-medium transition-colors select-none touch-manipulation',
                isActive ? 'text-brand-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-xl flex items-center justify-center transition-all',
                  isActive ? 'bg-brand-500/25 shadow-glow-brand ring-1 ring-brand-400/40 scale-105' : 'hover:bg-white/5'
                )}
              >
                <Icon className={cn('w-4 h-4 sm:w-5 sm:h-5', isActive ? 'text-brand-400' : 'text-slate-400')} />
              </div>
              <span className="truncate max-w-full text-center px-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
