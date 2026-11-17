import React from 'react';

export interface BrandIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  variant?: 'transparent' | 'dark' | 'light';
  className?: string;
  idPrefix?: string;
}

export function BrandIcon({
  size = 32,
  variant = 'transparent',
  className = '',
  idPrefix = 'brand-icon',
  ...props
}: BrandIconProps) {
  const truthGradId = `${idPrefix}-truth-grad`;
  const dareGradId = `${idPrefix}-dare-grad`;
  const sparkGradId = `${idPrefix}-spark-grad`;
  const coreGradId = `${idPrefix}-core-grad`;
  const neonGlowId = `${idPrefix}-neon-glow`;
  const dareGlowId = `${idPrefix}-dare-glow`;
  const bgGradDarkId = `${idPrefix}-bg-dark`;
  const bgGradLightId = `${idPrefix}-bg-light`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Play Truth &amp; Dare Logo Icon"
      {...props}
    >
      <defs>
        {/* Dark Background Gradient */}
        <linearGradient id={bgGradDarkId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#180C34" />
          <stop offset="50%" stopColor="#0E0822" />
          <stop offset="100%" stopColor="#070414" />
        </linearGradient>

        {/* Light Background Gradient */}
        <linearGradient id={bgGradLightId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F1F5F9" />
        </linearGradient>

        {/* Truth (Cyan to Violet) Gradient */}
        <linearGradient id={truthGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="35%" stopColor="#22D3EE" />
          <stop offset="70%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>

        {/* Dare (Coral to Rose to Amber) Gradient */}
        <linearGradient id={dareGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F43F5E" />
          <stop offset="60%" stopColor="#FB7185" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>

        {/* Spark Diamond Gradient */}
        <linearGradient id={sparkGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE4E6" />
          <stop offset="40%" stopColor="#FB7185" />
          <stop offset="100%" stopColor="#E11D48" />
        </linearGradient>

        {/* Central Flame Core Gradient */}
        <linearGradient id={coreGradId} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="50%" stopColor="#F43F5E" />
          <stop offset="100%" stopColor="#FBBF24" />
        </linearGradient>

        {/* Glow Filters */}
        <filter id={neonGlowId} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="16" floodColor="#8B5CF6" floodOpacity="0.4" />
          <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="#22D3EE" floodOpacity="0.3" />
        </filter>

        <filter id={dareGlowId} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="4" stdDeviation="12" floodColor="#FB7185" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Optional Dark Background Shape */}
      {variant === 'dark' && (
        <g>
          <rect width="512" height="512" rx="128" fill={`url(#${bgGradDarkId})`} />
          <rect
            width="508"
            height="508"
            x="2"
            y="2"
            rx="126"
            fill="none"
            stroke="#8B5CF6"
            strokeWidth="4"
            strokeOpacity="0.3"
          />
        </g>
      )}

      {/* Optional Light Background Shape */}
      {variant === 'light' && (
        <g>
          <rect width="512" height="512" rx="128" fill={`url(#${bgGradLightId})`} />
          <rect
            width="508"
            height="508"
            x="2"
            y="2"
            rx="126"
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="4"
            strokeOpacity="0.6"
          />
        </g>
      )}

      {/* Emblem Master Elements */}
      <g>
        {/* Ambient Aura */}
        <circle cx="256" cy="245" r="150" fill={`url(#${truthGradId})`} opacity="0.14" />
        <circle cx="280" cy="275" r="110" fill={`url(#${dareGradId})`} opacity="0.12" />

        {/* The Dare Action Blade / Play Element */}
        <path
          d="M256 160 C256 160 292 205 284 252 C278 288 256 304 256 304 C256 304 234 288 228 252 C220 205 256 160 256 160 Z"
          fill={`url(#${coreGradId})`}
          filter={`url(#${dareGlowId})`}
        />

        {/* Inner Blade Glint */}
        <path
          d="M256 182 C256 182 274 214 269 246 C266 268 256 278 256 278 C256 278 246 268 243 246 C238 214 256 182 256 182 Z"
          fill="#FFFFFF"
          opacity="0.8"
        />

        {/* The Truth Question Mark Arc */}
        <path
          d="M212 304 C202 292 206 274 218 262 C236 244 266 226 288 206 C314 182 324 154 310 128 C294 98 254 90 220 102 C188 114 168 138 160 166 C157 176 147 182 136 179 C126 176 120 165 124 154 C136 114 166 78 212 64 C262 48 322 62 346 106 C368 146 352 190 316 224 C290 248 266 266 254 280 C248 288 246 296 244 306 C242 318 228 324 218 316 C215 313 213 309 212 304 Z"
          fill={`url(#${truthGradId})`}
          filter={`url(#${neonGlowId})`}
        />

        {/* Truth Inner Ribbon Highlight */}
        <path
          d="M216 266 C234 248 262 232 284 212 C306 190 314 166 304 144 C294 122 264 116 236 124 C212 132 196 150 188 170"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.45"
        />

        {/* Truth & Dare Diamond Star Spark */}
        <g transform="translate(256, 382)">
          <path
            d="M0 -34 C0 -10 10 0 34 0 C10 0 0 10 0 34 C0 10 -10 0 -34 0 C-10 0 0 -10 0 -34 Z"
            fill={`url(#${sparkGradId})`}
          />
          <circle cx="0" cy="0" r="6" fill="#FFFFFF" />
        </g>
      </g>
    </svg>
  );
}

