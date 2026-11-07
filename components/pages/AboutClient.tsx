'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Heart, Zap, Play, MessageSquare, Compass } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/lib/i18n/LanguageContext';

export function AboutClient() {
  const { dict, locale } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-16 space-y-12 flex-1 w-full">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-400">
          {dict.about.badge}
        </span>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-white">
          {dict.about.title}
        </h1>
        <p className="text-sm md:text-base text-slate-300 leading-relaxed">
          {dict.about.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-surface-elevated border border-white/10 space-y-3">
          <Zap className="w-8 h-8 text-truth-400" />
          <h3 className="font-bold text-lg text-white">{dict.about.webFirstTitle}</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {dict.about.webFirstDesc}
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-surface-elevated border border-white/10 space-y-3">
          <Shield className="w-8 h-8 text-emerald-400" />
          <h3 className="font-bold text-lg text-white">{dict.about.noAdsTitle}</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {dict.about.noAdsDesc}
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-surface-elevated border border-white/10 space-y-3">
          <Heart className="w-8 h-8 text-dare-400" />
          <h3 className="font-bold text-lg text-white">{dict.about.safetyTitle}</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {dict.about.safetyDesc}
          </p>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-surface-elevated border border-brand-500/30 text-center space-y-4">
        <h3 className="font-display font-bold text-2xl text-white">{dict.about.ctaTitle}</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          {dict.about.ctaDesc}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href={`/${locale}/games/truth-or-dare`}>
            <Button variant="primary" size="lg" className="font-bold gap-2">
              <Play className="w-4 h-4 fill-white" />
              <span>{dict.about.ctaPlay}</span>
            </Button>
          </Link>
          <Link href={`/${locale}/games`}>
            <Button variant="secondary" size="lg" className="font-semibold gap-2">
              <Compass className="w-4 h-4 text-brand-400" />
              <span>{dict.about.ctaBrowse}</span>
            </Button>
          </Link>
          <Link href={`/${locale}/contact`}>
            <Button variant="secondary" size="lg" className="font-semibold gap-2">
              <MessageSquare className="w-4 h-4 text-truth-400" />
              <span>{dict.about.ctaContact}</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
