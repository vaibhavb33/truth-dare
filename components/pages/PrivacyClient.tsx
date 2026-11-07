'use client';

import React from 'react';
import { ShieldCheck, Lock, EyeOff, Server, Cookie } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';

export function PrivacyClient() {
  const { dict } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-16 space-y-10 flex-1 w-full">
      <div className="space-y-3 text-center md:text-left">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-400">
          {dict.privacy.badge}
        </span>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-white">
          {dict.privacy.title}
        </h1>
        <p className="text-xs text-slate-400">{dict.privacy.lastUpdated}</p>
        <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl">
          {dict.privacy.subtitle}
        </p>
      </div>

      <div className="space-y-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-surface-elevated border border-white/10 space-y-3">
          <div className="flex items-center gap-2.5 text-brand-400">
            <Lock className="w-5 h-5" />
            <h2 className="font-display font-bold text-lg text-white">{dict.privacy.introTitle}</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {dict.privacy.introDesc}
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-surface-elevated border border-white/10 space-y-3">
          <div className="flex items-center gap-2.5 text-truth-400">
            <EyeOff className="w-5 h-5" />
            <h2 className="font-display font-bold text-lg text-white">{dict.privacy.dataCollectionTitle}</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {dict.privacy.dataCollectionDesc}
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-surface-elevated border border-white/10 space-y-3">
          <div className="flex items-center gap-2.5 text-amber-400">
            <Cookie className="w-5 h-5" />
            <h2 className="font-display font-bold text-lg text-white">{dict.privacy.cookiesTitle}</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {dict.privacy.cookiesDesc}
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-surface-elevated border border-white/10 space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
            <h2 className="font-display font-bold text-lg text-white">{dict.privacy.securityTitle}</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {dict.privacy.securityDesc}
          </p>
        </div>
      </div>
    </div>
  );
}
