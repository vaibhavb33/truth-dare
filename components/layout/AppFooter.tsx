import React from 'react';
import Link from 'next/link';
import { Sparkles, Heart } from 'lucide-react';

export function AppFooter() {
  return (
    <footer className="w-full bg-canvas-deep border-t border-white/10 pt-12 pb-16 px-4 md:px-8 text-slate-400 text-sm">
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
            The next-generation online party gaming platform. 100% free, zero ads, zero downloads, and real-time multiplayer synchronization.
          </p>
          <div className="p-3 rounded-xl bg-surface-elevated/60 border border-white/5 text-[11px] text-slate-400 leading-relaxed">
            🛡️ Safe Skipping: We believe in consent and comfort. Players always have the power to veto dares without penalty.
          </div>
        </div>

        {/* Col 2: Party Games */}
        <div className="space-y-3">
          <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Party Games</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/games/truth-or-dare" className="hover:text-white transition-colors">
                Truth or Dare Online
              </Link>
            </li>
            <li>
              <Link href="/games/spin-the-bottle" className="hover:text-white transition-colors">
                Spin the Bottle Wheel
              </Link>
            </li>
            <li>
              <Link href="/games/never-have-i-ever" className="hover:text-white transition-colors">
                Never Have I Ever Online
              </Link>
            </li>
            <li>
              <Link href="/games/would-you-rather" className="hover:text-white transition-colors">
                Would You Rather Online
              </Link>
            </li>
            <li>
              <Link href="/games/most-likely-to" className="hover:text-white transition-colors">
                Most Likely To Online
              </Link>
            </li>
            <li>
              <Link href="/games/this-or-that" className="hover:text-white transition-colors">
                This or That Gauntlet
              </Link>
            </li>
            <li>
              <Link href="/games" className="text-brand-400 font-semibold hover:text-brand-300 transition-colors">
                View All Games Directory →
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Popular Decks & Categories */}
        <div className="space-y-3">
          <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Game Categories</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/games/truth-or-dare?category=classic-party" className="hover:text-white transition-colors">
                🎉 Classic Party Deck
              </Link>
            </li>
            <li>
              <Link href="/games/truth-or-dare?category=couples-flirty" className="hover:text-white transition-colors">
                ❤️ Couples & Flirty Deck
              </Link>
            </li>
            <li>
              <Link href="/games/truth-or-dare?category=teens-hangout" className="hover:text-white transition-colors">
                🍕 Teens & Sleepovers
              </Link>
            </li>
            <li>
              <Link href="/games/truth-or-dare?category=spicy-18" className="hover:text-white transition-colors">
                🌶️ Spicy 18+ (Adults)
              </Link>
            </li>
            <li>
              <Link href="/games/truth-or-dare?category=family-kids" className="hover:text-white transition-colors">
                🌟 Family Clean Prompts
              </Link>
            </li>
            <li>
              <Link href="/custom" className="text-brand-400 font-semibold hover:text-brand-300 transition-colors">
                Build a Custom Deck →
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Guides & Resources */}
        <div className="space-y-3">
          <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Guides & Vault</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/questions" className="hover:text-white transition-colors">
                500+ Best Truth or Dare Questions
              </Link>
            </li>
            <li>
              <Link href="/blog/official-truth-or-dare-rules" className="hover:text-white transition-colors">
                Official Truth or Dare Rules
              </Link>
            </li>
            <li>
              <Link href="/blog/50-best-dares-over-facetime" className="hover:text-white transition-colors">
                50 Best FaceTime Dares
              </Link>
            </li>
            <li>
              <Link href="/blog/clean-icebreakers-for-work" className="hover:text-white transition-colors">
                Clean Icebreakers for Work
              </Link>
            </li>
            <li>
              <Link href="/blog" className="text-brand-400 font-semibold hover:text-brand-300 transition-colors">
                All Party Game Guides →
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 5: Company & Legal */}
        <div className="space-y-3">
          <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Company & Legal</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/about" className="hover:text-white transition-colors">
                About Project Asteria
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact & Suggestions
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/admin" className="hover:text-white transition-colors text-slate-500 hover:text-slate-400">
                Admin Control Center
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <p>© 2026 Project Asteria. All rights reserved. Crafted for unforgettable party nights.</p>
        <p className="flex items-center gap-1 text-slate-500">
          Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for parties worldwide
        </p>
      </div>
    </footer>
  );
}
