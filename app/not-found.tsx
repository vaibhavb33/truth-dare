import Link from 'next/link';
import { BrandIcon } from '@/components/branding';
import { Home, Compass, RotateCcw } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl bg-surface-elevated/40 border border-white/10 backdrop-blur-xl shadow-2xl">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#180C34] border border-brand-500/30 shadow-glow-brand mx-auto">
          <BrandIcon size={36} className="w-9 h-9" idPrefix="not-found-icon" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-400">
            Error 404 • Lost in the Party
          </span>
          <h1 className="text-3xl font-black text-white font-display">
            Page Not Found
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            The round or question deck you were looking for doesn&apos;t exist or has moved to the new Play Truth &amp; Dare arena.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-glow-brand transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Return to Lobby</span>
          </Link>

          <Link
            href="/games"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-semibold text-sm transition-all"
          >
            <Compass className="w-4 h-4 text-brand-400" />
            <span>Browse Games</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

