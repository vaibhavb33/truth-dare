'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Download, Play, Sparkles, HelpCircle, Flame, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { sound } from '@/lib/audio/soundSynthesizer';
import { questionEngine } from '@/lib/questions/engine';
import { EmptyState } from '@/components/ui/States';
import { Question } from '@/types';

export function CustomDeckClient() {
  const [deckName, setDeckName] = useState('My Inside Jokes Deck');
  const [prompts, setPrompts] = useState<Array<{ id: string; type: 'truth' | 'dare'; prompt: string }>>([
    { id: '1', type: 'truth', prompt: 'Who in our group has the most questionable dating history?' },
    { id: '2', type: 'dare', prompt: 'Let the group compose a text message to send to your most recent contact.' },
    { id: '3', type: 'truth', prompt: 'What is the biggest secret you kept from everyone in this room?' },
    { id: '4', type: 'dare', prompt: 'Do your best impression of the person who created this deck.' },
    { id: '5', type: 'truth', prompt: 'If you had to delete one person’s contact number forever, who is it?' },
  ]);

  const [newPromptText, setNewPromptText] = useState('');
  const [newPromptType, setNewPromptType] = useState<'truth' | 'dare'>('truth');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('asteria_custom_deck');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.name) setDeckName(parsed.name);
          if (Array.isArray(parsed.prompts)) setPrompts(parsed.prompts);
        } catch {}
      }
    }
  }, []);

  const handleAddPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newPromptText.trim();
    if (!clean) return;

    const newCard = {
      id: 'custom-' + Date.now(),
      type: newPromptType,
      prompt: clean,
    };

    setPrompts([...prompts, newCard]);
    setNewPromptText('');
    sound.triggerHaptic(15);
  };

  const handleRemovePrompt = (id: string) => {
    setPrompts(prompts.filter((p) => p.id !== id));
    sound.triggerHaptic(15);
  };

  const handleSaveDeck = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'asteria_custom_deck',
        JSON.stringify({ name: deckName, prompts })
      );
      setSavedSuccess(true);
      sound.playVictory();
      setTimeout(() => setSavedSuccess(false), 2500);

      // Inject into Question Engine so it's playable immediately
      const formatted: Question[] = prompts.map((p) => ({
        id: p.id,
        game_type: 'truth-or-dare',
        question_type: p.type,
        language_code: 'en',
        category: 'party',
        difficulty: 3,
        question_text: p.prompt,
        content_rating: 'PG-13',
        age_group: 'all-ages',
        is_active: true,
        safety_reviewed: true,
        created_at: new Date().toISOString(),
        tags: ['custom'],
        gameId: 'truth-or-dare',
        categoryId: 'custom',
        type: p.type,
        prompt: p.prompt,
        intensity: 3,
        isNsfw: false,
      }));
      questionEngine.addCustomQuestions(formatted);
    }
  };

  // Export as JSON file
  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ name: deckName, prompts }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${deckName.toLowerCase().replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    sound.triggerHaptic(15);
  };

  return (
    <div className="w-full max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto px-3 sm:px-4 md:px-8 py-6 sm:py-8 md:py-12 space-y-6 sm:space-y-8 flex-1">
      <div className="space-y-2 text-center md:text-left px-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-xs font-bold uppercase tracking-wider text-brand-300">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>Personal Deck Studio</span>
        </div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl md:text-5xl text-white tracking-tight">
          Custom Deck Studio
        </h1>
        <p className="text-xs md:text-sm text-slate-400 max-w-lg">
          Craft personal inside jokes, group secrets, and wild challenges. Saved safely in your local browser and playable in live party rounds.
        </p>
      </div>

      {/* Deck Title Card */}
      <div className="p-4 sm:p-6 md:p-8 rounded-3xl bg-surface-elevated/90 border border-white/10 space-y-3 backdrop-blur-sm shadow-elevation-1">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Deck Title:
        </label>
        <input
          type="text"
          value={deckName}
          onChange={(e) => setDeckName(e.target.value)}
          maxLength={40}
          className="w-full h-11 sm:h-12 px-3 sm:px-4 rounded-xl bg-canvas-base border border-white/10 text-sm sm:text-base font-bold text-white focus:outline-none focus:border-brand-400 transition-colors"
        />
      </div>

      {/* Add New Prompt Form */}
      <form onSubmit={handleAddPrompt} className="p-4 sm:p-6 md:p-8 rounded-3xl bg-surface-elevated/90 border border-white/10 space-y-4 backdrop-blur-sm shadow-elevation-1">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Add New Prompt:
        </label>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setNewPromptType('truth');
              sound.triggerHaptic(10);
            }}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all flex items-center gap-1.5 ${
              newPromptType === 'truth'
                ? 'bg-truth-500/20 border-truth-400 text-truth-300 shadow-glow-truth'
                : 'bg-canvas-base border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Truth</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setNewPromptType('dare');
              sound.triggerHaptic(10);
            }}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all flex items-center gap-1.5 ${
              newPromptType === 'dare'
                ? 'bg-dare-500/20 border-dare-400 text-dare-300 shadow-glow-dare'
                : 'bg-canvas-base border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>Dare</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            placeholder="Type your custom question or dare challenge..."
            value={newPromptText}
            onChange={(e) => setNewPromptText(e.target.value)}
            maxLength={250}
            className="flex-1 min-w-0 h-11 sm:h-12 px-3 sm:px-4 rounded-xl bg-canvas-base border border-white/10 text-xs md:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-400 transition-colors"
          />
          <Button type="submit" variant="primary" size="md" className="gap-1.5 shrink-0 h-11 sm:h-12 px-4">
            <Plus className="w-4 h-4" /> Add Card
          </Button>
        </div>
      </form>

      {/* Prompts List Table */}
      <div className="p-4 sm:p-6 md:p-8 rounded-3xl bg-surface-elevated/90 border border-white/10 space-y-4 backdrop-blur-sm shadow-elevation-1">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-xs sm:text-sm text-white uppercase tracking-wider">
            Deck Cards ({prompts.length})
          </h3>
          <span className="text-[11px] sm:text-xs text-slate-400">Min 3 cards to launch</span>
        </div>

        {prompts.length > 0 ? (
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
            {prompts.map((p) => (
              <div
                key={p.id}
                className="p-3 sm:p-3.5 rounded-2xl bg-surface-highlight border border-white/5 hover:border-white/15 transition-all flex items-center justify-between gap-2.5 sm:gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  <span
                    className={`px-2 sm:px-2.5 py-1 rounded-lg font-black text-[10px] uppercase tracking-wider border shrink-0 ${
                      p.type === 'truth'
                        ? 'bg-truth-500/15 text-truth-300 border-truth-400/30'
                        : 'bg-dare-500/15 text-dare-300 border-dare-400/30'
                    }`}
                  >
                    {p.type}
                  </span>
                  <span className="text-white font-medium text-xs md:text-sm leading-relaxed break-words min-w-0">
                    {p.prompt}
                  </span>
                </div>
                <button
                  onClick={() => handleRemovePrompt(p.id)}
                  className="text-slate-400 hover:text-rose-400 shrink-0 p-1.5 transition-colors"
                  title="Delete card"
                  aria-label="Delete card"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Your Custom Deck is Empty"
            description="Add your first custom Truth or Dare prompt using the input form above to begin building your personal pack."
          />
        )}
      </div>

      {/* Save & Play Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 pt-2">
        <Button
          variant="primary"
          size="lg"
          onClick={handleSaveDeck}
          className="w-full sm:flex-1 font-bold gap-2 min-h-[48px]"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Deck Saved to Browser!</span>
            </>
          ) : (
            <span>Save Deck to Browser</span>
          )}
        </Button>

        <Button variant="secondary" size="lg" onClick={handleExport} className="w-full sm:w-auto gap-2 min-h-[48px]">
          <Download className="w-4 h-4" />
          <span>Export JSON</span>
        </Button>

        <Link href="/games/truth-or-dare?category=custom" className="w-full sm:w-auto">
          <Button variant="dare" size="lg" disabled={prompts.length < 3} className="w-full sm:w-auto gap-2 min-h-[48px]">
            <Play className="w-4 h-4 fill-white" />
            <span>Play Deck</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}

