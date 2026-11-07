'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Flame, Disc, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sound } from '@/lib/audio/soundSynthesizer';
import { useTranslation } from '@/lib/i18n/LanguageContext';

export function MobileDock() {
  const pathname = usePathname();
  const { t, locale } = useTranslation();

  // Normalize pathname to strip leading locale prefix so active state highlights correctly across all languages
  const normalizedPathname = React.useMemo(() => {
    const raw = pathname || '/';
    const segments = raw.split('/').filter(Boolean);
    if (segments.length > 0 && ['en', 'hi', 'es', 'pt', 'fr', 'id', 'ar', 'de'].includes(segments[0])) {
      const subpath = '/' + segments.slice(1).join('/');
      return subpath === '/' ? '/' : subpath;
    }
    return raw;
  }, [pathname]);

  const loc = (subpath: string) => (locale === 'en' ? subpath : `/${locale}${subpath === '/' ? '' : subpath}`);

  const navItems = [
    { label: t('breadcrumbs.home'), path: '/', icon: Home },
    { label: t('breadcrumbs.games'), path: '/games', icon: Compass },
    { label: t('nav.truthOrDare'), path: '/games/truth-or-dare', icon: Flame },
    { label: t('nav.spinnerWheel'), path: '/games/spin-the-bottle', icon: Disc },
    { label: t('nav.customDeck'), path: '/custom', icon: PlusCircle },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-canvas-base/95 backdrop-blur-xl border-t border-white/10 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-8px_24px_rgba(0,0,0,0.5)]"
    >
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = normalizedPathname === item.path || (item.path !== '/' && normalizedPathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              href={loc(item.path)}
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
