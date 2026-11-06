import React from 'react';

export const metadata = {
  title: 'Privacy Policy — Asteria Party Platform',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-20 space-y-6 flex-1 text-slate-300 text-sm leading-relaxed">
      <h1 className="font-display font-extrabold text-3xl md:text-4xl text-white">Privacy Policy</h1>
      <p className="text-xs text-slate-400">Last updated: November 2026</p>

      <div className="space-y-4">
        <h2 className="font-bold text-lg text-white">1. Zero Mandatory Personal Data Collection</h2>
        <p>
          Project Asteria is engineered with privacy as a foundational constraint. We do not require accounts, phone numbers, or email addresses to play our party games.
        </p>

        <h2 className="font-bold text-lg text-white">2. Browser Local Storage</h2>
        <p>
          We use modern browser `localStorage` and `sessionStorage` strictly to remember your preferences (such as audio mute state, affirmative 18+ age verification, and custom user-authored decks) directly on your device. This data never leaves your browser unless you explicitly choose to export or broadcast a deck.
        </p>

        <h2 className="font-bold text-lg text-white">3. Multiplayer Room Data</h2>
        <p>
          Multiplayer room codes and temporary nicknames are retained only for the active duration of the game session (maximum 2 hours of inactivity), after which they are permanently expunged from memory.
        </p>
      </div>
    </div>
  );
}

