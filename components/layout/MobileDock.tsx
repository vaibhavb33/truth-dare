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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-canvas-base/90 backdrop-blur-lg border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => sound.triggerHaptic(10)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 h-full text-[11px] font-medium transition-colors select-none',
                isActive ? 'text-brand-400' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-xl flex items-center justify-center transition-all',
                  isActive && 'bg-brand-500/20 shadow-glow-brand'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive ? 'text-brand-400' : 'text-slate-400')} />
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

