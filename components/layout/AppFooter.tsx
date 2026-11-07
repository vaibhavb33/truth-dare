'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Heart } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { LanguageSelector } from '@/components/i18n/LanguageSelector';
import { PWAInstallButton } from '@/components/pwa/PWAInstallButton';
import { isGameplayActive, subscribeGameplayActive } from '@/lib/gameplay/gameplayState';

export function AppFooter() {
  const { t } = useTranslation();
  const pathname = usePathname() || '';
  const [gameplayActive, setGameplayActiveState] = useState(false);

  useEffect(() => {
    setGameplayActiveState(isGameplayActive());
    const unsubscribe = subscribeGameplayActive((active) => {
      setGameplayActiveState(active);
    });
    return unsubscribe;
  }, [pathname]);

  // Hide footer completely on active gameplay sessions or multiplayer rooms
  if (gameplayActive || pathname.includes('/room/')) {
    return null;
  }

  // On individual game routes (like /games/truth-or-dare), hide footer on mobile (< md)
  // to preserve an app-like full-canvas experience without dock/footer clipping
  const isGameRoute = pathname.startsWith('/games/') && pathname !== '/games';
  const mobileVisibilityClass = isGameRoute ? 'hidden md:block' : '';

  return (
    <footer className={`w-full bg-canvas-deep border-t border-white/10 pt-12 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] lg:pb-16 px-4 md:px-8 text-slate-400 text-sm ${mobileVisibilityClass}`}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 mb-12">
        {/* Col 1: Brand Info */}
        <div className="space-y-4 sm:col-span-2 md:col-span-1">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center shadow-glow-brand">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-white">ASTERIA</span>
          </Link>
          <p className="text-xs text-slate-400 leading-relaxed">
            {t('footer.tagline')}
          </p>
          <div className="p-3 rounded-xl bg-surface-elevated/60 border border-white/5 text-[11px] text-slate-400 leading-relaxed">
            🛡️ {t('footer.safeSkipping')}
          </div>
        </div>

        {/* Col 2: Party Games */}
        <div className="space-y-3">
          <h4 className="font-semibold text-white text-xs uppercase tracking-wider">{t('footer.colGames')}</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/games/truth-or-dare" className="hover:text-white transition-colors">
                {t('gamesList.truthOrDare.playButton')}
              </Link>
            </li>
            <li>
              <Link href="/games/spin-the-bottle" className="hover:text-white transition-colors">
                {t('gamesList.spinTheBottle.playButton')}
              </Link>
            </li>
            <li>
              <Link href="/games/never-have-i-ever" className="hover:text-white transition-colors">
                {t('gamesList.neverHaveIEver.playButton')}
              </Link>
            </li>
            <li>
              <Link href="/games/would-you-rather" className="hover:text-white transition-colors">
                {t('gamesList.wouldYouRather.playButton')}
              </Link>
            </li>
            <li>
              <Link href="/games/most-likely-to" className="hover:text-white transition-colors">
                {t('gamesList.mostLikelyTo.playButton')}
              </Link>
            </li>
            <li>
              <Link href="/games/this-or-that" className="hover:text-white transition-colors">
                {t('gamesList.thisOrThat.playButton')}
              </Link>
            </li>
            <li>
              <Link href="/games" className="text-brand-400 font-semibold hover:text-brand-300 transition-colors">
                {t('home.exploreGames')} →
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Categories & Studio */}
        <div className="space-y-3">
          <h4 className="font-semibold text-white text-xs uppercase tracking-wider">{t('footer.colCategories')}</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/games/truth-or-dare?category=classic-party" className="hover:text-white transition-colors">
                🎉 {t('categories.classicParty.name')}
              </Link>
            </li>
            <li>
              <Link href="/games/truth-or-dare?category=couples-flirty" className="hover:text-white transition-colors">
                ❤️ {t('categories.couplesFlirty.name')}
              </Link>
            </li>
            <li>
              <Link href="/games/truth-or-dare?category=teens-hangout" className="hover:text-white transition-colors">
                🍕 {t('categories.teensHangout.name')}
              </Link>
            </li>
            <li>
              <Link href="/games/truth-or-dare?category=spicy-18" className="hover:text-white transition-colors">
                🌶️ {t('categories.spicy18.name')}
              </Link>
            </li>
            <li>
              <Link href="/games/truth-or-dare?category=family-kids" className="hover:text-white transition-colors">
                🌟 {t('categories.familyKids.name')}
              </Link>
            </li>
            <li>
              <Link href="/custom" className="text-truth-400 font-semibold hover:text-truth-300 transition-colors">
                ⚡ {t('nav.customDeck')} →
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Guides & Vault */}
        <div className="space-y-3">
          <h4 className="font-semibold text-white text-xs uppercase tracking-wider">{t('footer.colGuides')}</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/questions" className="hover:text-white transition-colors">
                📚 {t('nav.questionLibrary')}
              </Link>
            </li>
            <li>
              <Link href="/blog/official-truth-or-dare-rules" className="hover:text-white transition-colors">
                📖 Official Truth or Dare Rules
              </Link>
            </li>
            <li>
              <Link href="/blog/50-best-dares-over-facetime" className="hover:text-white transition-colors">
                📱 50 Best FaceTime Dares
              </Link>
            </li>
            <li>
              <Link href="/blog/clean-icebreakers-for-work" className="hover:text-white transition-colors">
                💼 Clean Icebreakers for Work
              </Link>
            </li>
            <li>
              <Link href="/blog" className="text-brand-400 font-semibold hover:text-brand-300 transition-colors">
                {t('nav.guides')} →
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 5: Company, Legal & Language */}
        <div className="space-y-3">
          <h4 className="font-semibold text-white text-xs uppercase tracking-wider">{t('footer.colLegal')}</h4>
          <ul className="space-y-2 text-xs mb-3">
            <li>
              <Link href="/about" className="hover:text-white transition-colors">
                {t('breadcrumbs.about')}
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white transition-colors">
                {t('breadcrumbs.contact')}
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-white transition-colors">
                {t('breadcrumbs.privacy')}
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white transition-colors">
                {t('breadcrumbs.terms')}
              </Link>
            </li>
            <li className="pt-1">
              <PWAInstallButton variant="footer" />
            </li>
          </ul>

          <div className="pt-2">
            <LanguageSelector variant="footer" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <p>© 2026 Project Asteria. {t('footer.allRightsReserved')}</p>
        <p className="flex items-center gap-1 text-slate-500">
          Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for parties worldwide
        </p>
      </div>
    </footer>
  );
}
