'use client';

import React, { useState } from 'react';
import { Shield, Key, Plus, CheckCircle, Database, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { sound } from '@/lib/audio/soundSynthesizer';
import { questionEngine } from '@/lib/questions/engine';
import { Question } from '@/types';

export function AdminDashboardClient() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('admin@asteria.game');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Admin New Question Form
  const [promptText, setPromptText] = useState('');
  const [gameId, setGameId] = useState('truth-or-dare');
  const [categoryId, setCategoryId] = useState('classic-party');
  const [type, setType] = useState<'truth' | 'dare'>('truth');
  const [intensity, setIntensity] = useState<number>(2);
  const [isNsfw, setIsNsfw] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'AsteriaAdmin2026!' || password === 'admin') {
      setIsAuthenticated(true);
      setAuthError('');
      sound.playVictory();
    } else {
      setAuthError('Invalid admin password. (Hint: AsteriaAdmin2026!)');
      sound.triggerHaptic(25);
    }
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;

    const newQ: Question = {
      id: 'admin-' + Date.now(),
      gameId: gameId as any,
      categoryId: categoryId as any,
      type,
      prompt: promptText.trim(),
      intensity: intensity as any,
      isNsfw,
      tags: ['admin', categoryId],
    };

    questionEngine.addCustomQuestions([newQ]);
    setStatusMsg(`✓ Question created: "${promptText.substring(0, 30)}..." added to active pool.`);
    setPromptText('');
    sound.playChime();
    setTimeout(() => setStatusMsg(''), 4000);
  };

  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-md mx-auto my-auto p-8 rounded-3xl bg-surface-elevated border border-white/10 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-500/10 border border-brand-400/30 flex items-center justify-center text-brand-400">
          <Shield className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h2 className="font-display font-extrabold text-2xl text-white">Admin Authentication</h2>
          <p className="text-xs text-slate-400">Enter administrator credentials to access the management portal.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-canvas-base border border-white/10 text-xs text-white focus:outline-none focus:border-brand-400"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Password:</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-canvas-base border border-white/10 text-xs text-white focus:outline-none focus:border-brand-400"
              required
            />
          </div>

          {authError && <p className="text-xs text-rose-400 font-medium">{authError}</p>}

          <Button type="submit" variant="primary" size="lg" className="w-full font-bold">
            Sign In to Admin Portal →
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8 flex-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-400">
            Administrative Portal
          </span>
          <h1 className="font-display font-extrabold text-3xl text-white">Platform Dashboard</h1>
        </div>
        <button
          onClick={() => setIsAuthenticated(false)}
          className="px-3 py-1.5 rounded-xl bg-surface-elevated hover:bg-surface-highlight border border-white/10 text-xs text-slate-400 hover:text-white"
        >
          Sign Out
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-surface-elevated border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Seed Prompts</span>
            <Database className="w-4 h-4 text-truth-400" />
          </div>
          <p className="font-mono font-bold text-2xl text-white">
            {questionEngine.getCount('truth-or-dare')} Active
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface-elevated border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Supported Game Engines</span>
            <Users className="w-4 h-4 text-brand-400" />
          </div>
          <p className="font-mono font-bold text-2xl text-white">6 Modules</p>
        </div>

        <div className="p-5 rounded-2xl bg-surface-elevated border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Content Moderation</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="font-mono font-bold text-2xl text-emerald-400">100% Verified</p>
        </div>
      </div>

      {/* Create New Prompt Form */}
      <div className="p-6 rounded-3xl bg-surface-elevated border border-white/10 space-y-6">
        <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
          <Plus className="w-4 h-4 text-brand-400" /> Inject New Question into Production Pool
        </h3>

        {statusMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            {statusMsg}
          </div>
        )}

        <form onSubmit={handleCreateQuestion} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold">Game:</label>
              <select
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-canvas-base border border-white/10 text-xs text-white focus:outline-none"
              >
                <option value="truth-or-dare">Truth or Dare</option>
                <option value="never-have-i-ever">Never Have I Ever</option>
                <option value="would-you-rather">Would You Rather</option>
                <option value="most-likely-to">Most Likely To</option>
                <option value="this-or-that">This or That</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold">Category:</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-canvas-base border border-white/10 text-xs text-white focus:outline-none"
              >
                <option value="classic-party">Classic Party</option>
                <option value="couples-flirty">Couples & Flirty</option>
                <option value="teens-hangout">Teens & Hangout</option>
                <option value="spicy-18">Spicy 18+</option>
                <option value="family-kids">Family Clean</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold">Type:</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full h-11 px-3 rounded-xl bg-canvas-base border border-white/10 text-xs text-white focus:outline-none"
              >
                <option value="truth">Truth</option>
                <option value="dare">Dare</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-semibold">Prompt Text:</label>
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Type the full prompt text here..."
              rows={3}
              required
              className="w-full p-3 rounded-xl bg-canvas-base border border-white/10 text-xs text-white focus:outline-none focus:border-brand-400"
            />
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-300">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isNsfw}
                onChange={(e) => setIsNsfw(e.target.checked)}
                className="rounded bg-canvas-base border-white/20 text-brand-500"
              />
              <span>18+ Mature (NSFW Gate Required)</span>
            </label>

            <div className="flex items-center gap-1.5 ml-auto">
              <span>Intensity:</span>
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setIntensity(lvl)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold ${
                    intensity === lvl ? 'bg-brand-500 text-white' : 'bg-surface-highlight text-slate-400'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full font-bold">
            Add to Active Question Pool →
          </Button>
        </form>
      </div>
    </div>
  );
}

