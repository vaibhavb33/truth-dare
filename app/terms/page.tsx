import React from 'react';

export const metadata = {
  title: 'Terms of Service & Safety Disclaimers — Asteria',
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-20 space-y-6 flex-1 text-slate-300 text-sm leading-relaxed">
      <h1 className="font-display font-extrabold text-3xl md:text-4xl text-white">Terms of Service & Safety Rules</h1>
      <p className="text-xs text-slate-400">Last updated: November 2026</p>

      <div className="space-y-4">
        <h2 className="font-bold text-lg text-white">1. Voluntary Participation & Consent</h2>
        <p>
          Participation in any party game hosted on Project Asteria is entirely voluntary. Every player holds absolute authority to veto or skip any question or dare for any reason, with no forced penalties, humiliation, or coercion.
        </p>

        <h2 className="font-bold text-lg text-white">2. Prohibited Conduct</h2>
        <p>
          Users must never perform, encourage, or input custom dares that involve physical danger, illegal acts, operating motor vehicles, harassment, property damage, or non-consensual behavior.
        </p>

        <h2 className="font-bold text-lg text-white">3. Mature Content (18+)</h2>
        <p>
          Access to spicy or adult categories requires affirmative age confirmation. By confirming, users certify that they are at least 18 years of age and that all participants in their gathering are consenting adults.
        </p>
      </div>
    </div>
  );
}

