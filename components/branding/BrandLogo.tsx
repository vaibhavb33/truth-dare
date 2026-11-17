import React from 'react';
import { BrandIcon } from './BrandIcon';

export interface BrandLogoProps {
  variant?: 'horizontal' | 'icon';
  theme?: 'dark' | 'light';
  showTagline?: boolean;
  className?: string;
  iconSize?: number | string;
}

export function BrandLogo({
  variant = 'horizontal',
  theme = 'dark',
  showTagline = false,
  className = '',
  iconSize,
}: BrandLogoProps) {
  if (variant === 'icon') {
    return (
      <BrandIcon
        size={iconSize || 36}
        variant={theme === 'dark' ? 'dark' : 'light'}
        className={className}
      />
    );
  }

  const isDark = theme === 'dark';

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Brand Icon Mark */}
      <BrandIcon
        size={iconSize || 38}
        variant="transparent"
        className="shrink-0 drop-shadow-[0_4px_12px_rgba(139,92,246,0.35)]"
      />

      {/* Typography Wordmark */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 font-display font-black text-xl tracking-tight leading-none">
          <span className={isDark ? 'text-white' : 'text-slate-900'}>Play</span>
          <span className="bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
            Truth
          </span>
          <span className="text-rose-400 font-extrabold">&amp;</span>
          <span className="bg-gradient-to-r from-rose-400 to-rose-600 bg-clip-text text-transparent">
            Dare
          </span>
        </div>

        {showTagline && (
          <span
            className={`text-[10px] font-bold tracking-[0.2em] uppercase mt-1 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Truth <span className="text-rose-400">•</span> Dare <span className="text-rose-400">•</span> Laugh <span className="text-rose-400">•</span> Repeat
          </span>
        )}
      </div>
    </div>
  );
}

