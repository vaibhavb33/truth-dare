'use client';

import React from 'react';
import { Download, Smartphone } from 'lucide-react';
import { usePWA } from '@/lib/pwa/usePWA';
import { cn } from '@/lib/utils';
import { IOSInstallModal } from './IOSInstallModal';

interface PWAInstallButtonProps {
  variant?: 'header' | 'drawer' | 'footer' | 'pill';
  className?: string;
}

export function PWAInstallButton({ variant = 'header', className }: PWAInstallButtonProps) {
  const { isInstallable, isInstalled, isIOS, showIOSPrompt, setShowIOSPrompt, promptInstall } = usePWA();

  // If already running in standalone installed mode, do not show install CTA
  if (isInstalled) {
    return null;
  }

  // If not installable and not on iOS, hide
  if (!isInstallable && !isIOS) {
    return null;
  }

  return (
    <>
      {variant === 'header' && (
        <button
          onClick={promptInstall}
          type="button"
          aria-label="Install Asteria App"
          title="Install Asteria App on your device"
          className={cn(
            'hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-brand-500/15 hover:bg-brand-500/25 border border-brand-400/40 text-brand-300 hover:text-white transition-all shadow-sm active:scale-95',
            className
          )}
        >
          <Download className="w-3.5 h-3.5 text-brand-400" />
          <span>Install App</span>
        </button>
      )}

      {variant === 'drawer' && (
        <button
          onClick={promptInstall}
          type="button"
          className={cn(
            'w-full p-3 rounded-2xl bg-brand-500/20 hover:bg-brand-500/30 border border-brand-400/40 flex items-center justify-between text-xs font-bold text-brand-300 transition-all active:scale-[0.99]',
            className
          )}
        >
          <span className="flex items-center gap-2.5">
            <Smartphone className="w-4 h-4 text-brand-400" />
            <span>Install Asteria App (Offline Ready)</span>
          </span>
          <Download className="w-4 h-4 text-brand-300" />
        </button>
      )}

      {variant === 'footer' && (
        <button
          onClick={promptInstall}
          type="button"
          className={cn(
            'inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 font-semibold transition-colors',
            className
          )}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install Asteria (PWA)</span>
        </button>
      )}

      {variant === 'pill' && (
        <button
          onClick={promptInstall}
          type="button"
          className={cn(
            'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/20 hover:bg-brand-500/30 border border-brand-400/40 text-xs font-bold text-brand-300 transition-all active:scale-95 shadow-glow-brand',
            className
          )}
        >
          <Download className="w-3.5 h-3.5 text-brand-400" />
          <span>Install Web App</span>
        </button>
      )}

      <IOSInstallModal isOpen={showIOSPrompt} onClose={() => setShowIOSPrompt(false)} />
    </>
  );
}

