import React from 'react';
import Link from 'next/link';
import { Sparkles, Heart } from 'lucide-react';

export function AppFooter() {
  return (
    <footer className="w-full bg-canvas-deep border-t border-white/10 pt-12 pb-16 px-4 md:px-8 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Col 1: Brand Info */}
        <div className="space-y-4 md:col-span-1">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-white">ASTERIA</span>
          </Link>
          <p className="text-xs text-slate-400 leading-relaxed">
            The next-generation online party gaming platform. 100% free, zero ads, zero downloads, and real-time multiplayer synchronization.
          </p>
        </div>

        {/* Col 2: Games Directory */}
        <div className="space-y-3">
          <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Party Games</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/games/truth-or-dare" className="hover:text-white transition-colors">Truth or Dare Online</Link></li>
            <li><Link href="/games/spin-the-bottle" className="hover:text-white transition-colors">Spin the Bottle Wheel</Link></li>
            <li><Link href="/games/never-have-i-ever" className="hover:text-white transition-colors">Never Have I Ever</Link></li>
            <li><Link href="/games/would-you-rather" className="hover:text-white transition-colors">Would You Rather</Link></li>
            <li><Link href="/games/most-likely-to" className="hover:text-white transition-colors">Most Likely To</Link></li>
            <li><Link href="/games/this-or-that" className="hover:text-white transition-colors">This or That Gauntlet</Link></li>
          </ul>
        </div>

        {/* Col 3: Resources & Guides */}
        <div className="space-y-3">
          <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Resources</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/custom" className="hover:text-white transition-colors">Custom Deck Creator</Link></li>
            <li><Link href="/questions" className="hover:text-white transition-colors">Question Library</Link></li>
            <li><Link href="/blog" className="hover:text-white transition-colors">Official Game Rules</Link></li>
            <li><Link href="/about" className="hover:text-white transition-colors">About Project Asteria</Link></li>
            <li><Link href="/contact" className="hover:text-white transition-colors">Contact & Suggestions</Link></li>
          </ul>
        </div>

        {/* Col 4: Safety & Legal */}
        <div className="space-y-3">
          <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Safety & Privacy</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            <li><Link href="/admin" className="hover:text-white transition-colors">Admin Dashboard</Link></li>
          </ul>
          <div className="p-3 rounded-xl bg-surface-elevated/60 border border-white/5 text-[11px] text-slate-400">
            🛡️ Safe Skipping: We believe in consent and comfort. Players always have the power to veto dares without penalty.
          </div>
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

