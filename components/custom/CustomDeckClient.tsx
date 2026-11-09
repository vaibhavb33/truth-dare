'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  Play,
  Sparkles,
  HelpCircle,
  Flame,
  Check,
  Edit2,
  Eye,
  RotateCcw,
  Users,
  ArrowRight,
  Share2,
  ShieldAlert,
  History,
  FolderHeart,
  Globe,
  X,
  Trophy,
  Volume2,
  Save,
  Lock,
  Compass,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { sound } from '@/lib/audio/soundSynthesizer';
import { EmptyState } from '@/components/ui/States';
import { CustomDeck, CustomQuestion, SupportedLanguageCode, CategoryId } from '@/types';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { QuestionVoiceControls } from '@/components/voice/QuestionVoiceControls';
import { deckStorage, getCreatorId } from '@/lib/custom/deckStorage';
import { validateCustomQuestion, validateQuestionSafety } from '@/lib/custom/safetyFilter';
import { SUPPORTED_LOCALES, Locale } from '@/lib/i18n/config';

type TabView = 'editor' | 'library' | 'play';

export function CustomDeckClient() {
  const router = useRouter();
  const { t, dict, locale } = useTranslation();

  // Active View Tab
  const [activeTab, setActiveTab] = useState<TabView>('editor');

  // Decks Library State
  const [decks, setDecks] = useState<CustomDeck[]>([]);
  const [currentDeckId, setCurrentDeckId] = useState<string | null>(null);

  // Deck Editor State (Phase 1 & 2)
  const [deckName, setDeckName] = useState('Party Inside Jokes');
  const [deckDescription, setDeckDescription] = useState('Custom icebreakers, group secrets, and dares for close friend circles.');
  const [deckLanguage, setDeckLanguage] = useState<SupportedLanguageCode>(locale);
  const [deckCategory, setDeckCategory] = useState<CategoryId>('classic-party');
  const [deckVisibility, setDeckVisibility] = useState<'private' | 'unlisted' | 'public'>('private');
  const [questions, setQuestions] = useState<CustomQuestion[]>([]);

  // Add Question Input Form State
  const [newPromptText, setNewPromptText] = useState('');
  const [newPromptType, setNewPromptType] = useState<'truth' | 'dare'>('truth');
  const [inputError, setInputError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Question Editing State
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingType, setEditingType] = useState<'truth' | 'dare'>('truth');

  // Preview Modal State
  const [previewQuestion, setPreviewQuestion] = useState<CustomQuestion | null>(null);
  const [previewFlipped, setPreviewFlipped] = useState(false);

  // Single-Device Play State (Phase 4)
  const [playPlayers, setPlayPlayers] = useState<Array<{ id: string; name: string; score: number; skips: number; avatarColor: string }>>([
    { id: 'p1', name: 'Player 1', score: 0, skips: 0, avatarColor: '#8B5CF6' },
    { id: 'p2', name: 'Player 2', score: 0, skips: 0, avatarColor: '#06B6D4' },
  ]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [isGameActive, setIsGameActive] = useState(false);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [currentCard, setCurrentCard] = useState<CustomQuestion | null>(null);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [roundNumber, setRoundNumber] = useState(1);
  const [questionHistory, setQuestionHistory] = useState<Array<{ card: CustomQuestion; playerName: string; outcome: 'completed' | 'skipped' }>>([]);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [drawnQuestionIds, setDrawnQuestionIds] = useState<string[]>([]);

  // Load Decks from Local Storage on mount
  useEffect(() => {
    const loadedDecks = deckStorage.getDecks();
    setDecks(loadedDecks);

    if (loadedDecks.length > 0) {
      const initial = loadedDecks[0];
      setCurrentDeckId(initial.id);
      setDeckName(initial.name);
      setDeckDescription(initial.description || '');
      setDeckLanguage(initial.language || locale);
      setDeckCategory(initial.category || 'classic-party');
      setDeckVisibility(initial.visibility || 'private');
      setQuestions(initial.questions || []);
    }
  }, [locale]);

  // Question Counts
  const truthCount = useMemo(() => questions.filter((q) => q.type === 'truth').length, [questions]);
  const dareCount = useMemo(() => questions.filter((q) => q.type === 'dare').length, [questions]);
  const totalCount = questions.length;

  // Add Question Handler with Validation (Empty, Duplicate, Length, Safety)
  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);

    const validation = validateCustomQuestion(
      newPromptText,
      questions.map((q) => q.prompt),
      250
    );

    if (!validation.isValid) {
      setInputError(validation.error || 'Invalid question prompt.');
      sound.playBuzzer();
      return;
    }

    const newQuestion: CustomQuestion = {
      id: 'cq-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      type: newPromptType,
      prompt: newPromptText.trim(),
      intensity: 3,
    };

    setQuestions([...questions, newQuestion]);
    setNewPromptText('');
    sound.triggerHaptic(15);
  };

  // Delete Question
  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
    sound.triggerHaptic(15);
  };

  // Start Inline Question Edit
  const handleStartEdit = (q: CustomQuestion) => {
    setEditingQuestionId(q.id);
    setEditingText(q.prompt);
    setEditingType(q.type);
  };

  // Save Inline Question Edit
  const handleSaveEdit = (id: string) => {
    const validation = validateCustomQuestion(
      editingText,
      questions.filter((q) => q.id !== id).map((q) => q.prompt),
      250
    );

    if (!validation.isValid) {
      setInputError(validation.error || 'Invalid edited question.');
      sound.playBuzzer();
      return;
    }

    setQuestions(
      questions.map((q) =>
        q.id === id ? { ...q, prompt: editingText.trim(), type: editingType } : q
      )
    );
    setEditingQuestionId(null);
    setInputError(null);
    sound.triggerHaptic(15);
  };

  // Save Deck to Library & Local Storage
  const handleSaveDeck = () => {
    setInputError(null);
    const saveResult = deckStorage.saveDeck({
      id: currentDeckId || undefined,
      name: deckName,
      description: deckDescription,
      language: deckLanguage,
      category: deckCategory,
      visibility: deckVisibility,
      questions,
    });

    if (!saveResult.success) {
      setInputError(saveResult.error || 'Failed to save deck.');
      sound.playBuzzer();
      return;
    }

    if (saveResult.deck) {
      setCurrentDeckId(saveResult.deck.id);
      setDecks(deckStorage.getDecks());
    }

    setSavedSuccess(true);
    sound.playVictory();
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Create New Deck in Editor
  const handleCreateNewDeck = () => {
    setCurrentDeckId(null);
    setDeckName('New Custom Deck');
    setDeckDescription('');
    setDeckLanguage(locale);
    setDeckCategory('classic-party');
    setDeckVisibility('private');
    setQuestions([]);
    setActiveTab('editor');
    sound.triggerHaptic(15);
  };

  // Load Deck into Editor
  const handleLoadDeckToEdit = (deck: CustomDeck) => {
    setCurrentDeckId(deck.id);
    setDeckName(deck.name);
    setDeckDescription(deck.description || '');
    setDeckLanguage(deck.language || locale);
    setDeckCategory(deck.category || 'classic-party');
    setDeckVisibility(deck.visibility || 'private');
    setQuestions(deck.questions || []);
    setActiveTab('editor');
    sound.triggerHaptic(15);
  };

  // Delete Deck from Library
  const handleDeleteDeck = (id: string) => {
    const res = deckStorage.deleteDeck(id);
    if (res.success) {
      const remaining = deckStorage.getDecks();
      setDecks(remaining);
      if (currentDeckId === id) {
        if (remaining.length > 0) {
          handleLoadDeckToEdit(remaining[0]);
        } else {
          handleCreateNewDeck();
        }
      }
      sound.triggerHaptic(15);
    } else {
      alert(res.error || 'Failed to delete deck.');
    }
  };

  // Host Multiplayer Room with this Custom Deck Snapshot (Phase 5)
  const handleHostMultiplayerRoom = async () => {
    if (questions.length < 3) {
      setInputError('A custom deck must contain at least 3 cards to host a multiplayer room.');
      sound.playBuzzer();
      return;
    }

    try {
      const creator = getCreatorId();
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: 'truth-or-dare',
          categoryId: deckCategory,
          hostName: 'Host (' + creator.slice(0, 5) + ')',
          language: deckLanguage,
          timerSeconds: 30,
          customDeckSnapshot: {
            id: currentDeckId || 'custom-deck-' + Date.now(),
            name: deckName,
            language: deckLanguage,
            questions,
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.roomCode) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(
            `asteria_multiplayer_session_${data.roomCode}`,
            JSON.stringify({
              playerId: data.hostPlayerId,
              sessionToken: data.sessionToken,
            })
          );
        }
        router.push(`/room/${data.roomCode}`);
      } else {
        setInputError(data.error || 'Failed to create multiplayer room.');
      }
    } catch {
      setInputError('Network error while establishing multiplayer room.');
    }
  };

  // ========================================================
  // SINGLE-DEVICE PASS-AND-PLAY GAMEPLAY (Phase 4)
  // ========================================================

  const handleAddPlayer = () => {
    const clean = newPlayerName.trim();
    if (!clean) return;
    if (playPlayers.length >= 20) return;

    const colors = ['#8B5CF6', '#06B6D4', '#EC4899', '#10B981', '#F59E0B', '#6366F1'];
    const newPlayer = {
      id: 'p-' + Date.now(),
      name: clean,
      score: 0,
      skips: 0,
      avatarColor: colors[playPlayers.length % colors.length],
    };

    setPlayPlayers([...playPlayers, newPlayer]);
    setNewPlayerName('');
    sound.triggerHaptic(15);
  };

  const handleRemovePlayer = (id: string) => {
    if (playPlayers.length <= 2) return;
    setPlayPlayers(playPlayers.filter((p) => p.id !== id));
  };

  const handleStartPassAndPlay = () => {
    if (questions.length < 3) {
      setInputError('Add at least 3 cards to start playing!');
      return;
    }
    if (playPlayers.length < 2) {
      setInputError('Add at least 2 players for pass-and-play.');
      return;
    }

    setIsGameActive(true);
    setActivePlayerIndex(0);
    setCurrentCard(null);
    setIsCardFlipped(false);
    setRoundNumber(1);
    setQuestionHistory([]);
    setDrawnQuestionIds([]);
    sound.playChime();
  };

  const handleDrawCard = (type: 'truth' | 'dare') => {
    const pool = questions.filter((q) => q.type === type);
    const eligible = pool.filter((q) => !drawnQuestionIds.includes(q.id));

    // Reset drawn IDs if all cards of this type were exhausted
    let chosen: CustomQuestion;
    if (eligible.length > 0) {
      chosen = eligible[Math.floor(Math.random() * eligible.length)];
      setDrawnQuestionIds([...drawnQuestionIds, chosen.id]);
    } else if (pool.length > 0) {
      chosen = pool[Math.floor(Math.random() * pool.length)];
      setDrawnQuestionIds([chosen.id]);
    } else {
      // Fallback if deck has 0 cards of this type
      chosen = questions[Math.floor(Math.random() * questions.length)];
    }

    setCurrentCard(chosen);
    setIsCardFlipped(true);
    sound.playWhoosh();
  };

  const handleCompleteDare = () => {
    if (!currentCard) return;

    const activeP = playPlayers[activePlayerIndex];
    activeP.score += 1;

    setQuestionHistory([
      { card: currentCard, playerName: activeP.name, outcome: 'completed' },
      ...questionHistory,
    ]);

    sound.playVictory();
    advanceTurn();
  };

  const handleSkipTurn = () => {
    if (!currentCard) return;

    const activeP = playPlayers[activePlayerIndex];
    activeP.skips += 1;

    setQuestionHistory([
      { card: currentCard, playerName: activeP.name, outcome: 'skipped' },
      ...questionHistory,
    ]);

    sound.playBuzzer();
    advanceTurn();
  };

  const advanceTurn = () => {
    const nextIndex = (activePlayerIndex + 1) % playPlayers.length;
    if (nextIndex === 0) {
      setRoundNumber((r) => r + 1);
    }
    setActivePlayerIndex(nextIndex);
    setCurrentCard(null);
    setIsCardFlipped(false);
  };

  const handleRestartGame = () => {
    setPlayPlayers(playPlayers.map((p) => ({ ...p, score: 0, skips: 0 })));
    setActivePlayerIndex(0);
    setCurrentCard(null);
    setIsCardFlipped(false);
    setRoundNumber(1);
    setQuestionHistory([]);
    setDrawnQuestionIds([]);
    setShowGameOverModal(false);
    sound.playChime();
  };

  return (
    <div className="w-full max-w-4xl lg:max-w-5xl mx-auto px-3 sm:px-4 md:px-8 py-6 sm:py-8 md:py-12 space-y-6 sm:space-y-8 flex-1">
      {/* Header Banner */}
      <div className="space-y-2 text-center md:text-left px-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-xs font-bold uppercase tracking-wider text-brand-300">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>{dict.customDeck.badge}</span>
        </div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl md:text-5xl text-white tracking-tight">
          {dict.customDeck.title}
        </h1>
        <p className="text-xs md:text-sm text-slate-400 max-w-xl">
          Build and play personalized Truth or Dare decks with friends on this device or inside private multiplayer rooms.
        </p>
      </div>

      {/* Navigation View Switcher */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-surface-elevated/90 border border-white/10 backdrop-blur-md">
        <button
          onClick={() => {
            setActiveTab('editor');
            sound.triggerHaptic(10);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'editor'
              ? 'bg-brand-500 text-white shadow-glow-brand'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Edit2 className="w-4 h-4" />
          <span>Deck Studio</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('library');
            sound.triggerHaptic(10);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'library'
              ? 'bg-brand-500 text-white shadow-glow-brand'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FolderHeart className="w-4 h-4" />
          <span>My Library ({decks.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('play');
            sound.triggerHaptic(10);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'play'
              ? 'bg-gradient-to-r from-truth-500 to-dare-500 text-white shadow-glow-dare'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Pass & Play</span>
        </button>
      </div>

      {/* Global Validation Error Notice */}
      {inputError && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs sm:text-sm animate-shake">
          <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Notice</p>
            <p className="text-rose-200/90 leading-relaxed">{inputError}</p>
          </div>
          <button onClick={() => setInputError(null)} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================
          TAB 1: DECK STUDIO (PHASES 1, 2, 6, 7)
         ======================================================== */}
      {activeTab === 'editor' && (
        <div className="space-y-6">
          {/* Deck Configuration Card (Phase 1) */}
          <div className="p-4 sm:p-6 md:p-8 rounded-3xl bg-surface-elevated/90 border border-white/10 space-y-4 backdrop-blur-sm shadow-elevation-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h3 className="font-display font-extrabold text-lg text-white">Deck Configuration</h3>
                <p className="text-xs text-slate-400">Set deck metadata, shared question language, and category.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-truth-500/15 text-truth-300 border border-truth-400/30 text-xs font-bold">
                  {truthCount} Truths
                </span>
                <span className="px-3 py-1 rounded-lg bg-dare-500/15 text-dare-300 border border-dare-400/30 text-xs font-bold">
                  {dareCount} Dares
                </span>
                <span className="px-3 py-1 rounded-lg bg-white/5 text-slate-300 border border-white/10 text-xs font-bold">
                  {totalCount} Total
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Deck Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  {dict.customDeck.deckNameLabel}
                </label>
                <input
                  type="text"
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  maxLength={60}
                  placeholder={dict.customDeck.deckNamePlaceholder}
                  className="w-full h-11 px-3.5 rounded-xl bg-canvas-base border border-white/10 text-sm font-bold text-white focus:outline-none focus:border-brand-400 transition-colors"
                />
              </div>

              {/* Language Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-brand-400" />
                  <span>Question Language:</span>
                </label>
                <select
                  value={deckLanguage}
                  onChange={(e) => setDeckLanguage(e.target.value as SupportedLanguageCode)}
                  className="w-full h-11 px-3.5 rounded-xl bg-canvas-base border border-white/10 text-sm font-semibold text-white focus:outline-none focus:border-brand-400 transition-colors"
                >
                  {Object.entries(SUPPORTED_LOCALES).map(([code, meta]) => (
                    <option key={code} value={code} className="bg-canvas-deep text-white">
                      {meta.flag} {meta.nativeName} ({meta.name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Description (Optional):
                </label>
                <input
                  type="text"
                  value={deckDescription}
                  onChange={(e) => setDeckDescription(e.target.value)}
                  maxLength={250}
                  placeholder="e.g. Inside jokes, road trip secrets, and spicy college questions..."
                  className="w-full h-11 px-3.5 rounded-xl bg-canvas-base border border-white/10 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-400 transition-colors"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-truth-400" />
                  <span>Category Tag:</span>
                </label>
                <select
                  value={deckCategory}
                  onChange={(e) => setDeckCategory(e.target.value as CategoryId)}
                  className="w-full h-11 px-3.5 rounded-xl bg-canvas-base border border-white/10 text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-brand-400 transition-colors"
                >
                  <option value="classic-party" className="bg-canvas-deep">🎉 Classic Party</option>
                  <option value="couples-flirty" className="bg-canvas-deep">❤️ Couples & Flirty</option>
                  <option value="deep-secrets" className="bg-canvas-deep">🤫 Deep Secrets</option>
                  <option value="wild-party" className="bg-canvas-deep">⚡ Wild Party</option>
                  <option value="icebreaker" className="bg-canvas-deep">🧊 Icebreakers</option>
                  <option value="family-kids" className="bg-canvas-deep">👨‍👩‍👧 Clean Family</option>
                  <option value="extreme" className="bg-canvas-deep">🔥 Extreme Dares</option>
                  <option value="teens-hangout" className="bg-canvas-deep">🍕 Teens Hangout</option>
                </select>
              </div>

              {/* Visibility */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-dare-400" />
                  <span>Visibility:</span>
                </label>
                <select
                  value={deckVisibility}
                  onChange={(e) => setDeckVisibility(e.target.value as any)}
                  className="w-full h-11 px-3.5 rounded-xl bg-canvas-base border border-white/10 text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-brand-400 transition-colors"
                >
                  <option value="private" className="bg-canvas-deep">🔒 Private (Only Me & Invited Rooms)</option>
                  <option value="unlisted" className="bg-canvas-deep">🔗 Unlisted (Anyone with direct link)</option>
                  <option value="public" className="bg-canvas-deep">🌍 Public (Community Showcase)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Add Question Form (Phase 2 & Phase 7) */}
          <form
            onSubmit={handleAddQuestion}
            className="p-4 sm:p-6 md:p-8 rounded-3xl bg-surface-elevated/90 border border-white/10 space-y-4 backdrop-blur-sm shadow-elevation-1"
          >
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {dict.customDeck.addCardTitle}:
              </label>
              <span className={`text-[11px] font-mono ${newPromptText.length > 240 ? 'text-amber-400 font-bold' : 'text-slate-500'}`}>
                {newPromptText.length}/250 chars
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setNewPromptType('truth');
                  sound.triggerHaptic(10);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all flex items-center gap-1.5 ${
                  newPromptType === 'truth'
                    ? 'bg-truth-500/20 border-truth-400 text-truth-300 shadow-glow-truth'
                    : 'bg-canvas-base border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{dict.customDeck.cardTypeTruth}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewPromptType('dare');
                  sound.triggerHaptic(10);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all flex items-center gap-1.5 ${
                  newPromptType === 'dare'
                    ? 'bg-dare-500/20 border-dare-400 text-dare-300 shadow-glow-dare'
                    : 'bg-canvas-base border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>{dict.customDeck.cardTypeDare}</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                placeholder={dict.customDeck.promptPlaceholder}
                value={newPromptText}
                onChange={(e) => setNewPromptText(e.target.value)}
                maxLength={250}
                className="flex-1 min-w-0 h-11 sm:h-12 px-3 sm:px-4 rounded-xl bg-canvas-base border border-white/10 text-xs md:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-400 transition-colors"
              />
              <Button type="submit" variant="primary" size="md" className="gap-1.5 shrink-0 h-11 sm:h-12 px-5">
                <Plus className="w-4 h-4" /> {dict.customDeck.addCardButton}
              </Button>
            </div>
          </form>

          {/* Cards List in Deck (Phase 2 & 6) */}
          <div className="p-4 sm:p-6 md:p-8 rounded-3xl bg-surface-elevated/90 border border-white/10 space-y-4 backdrop-blur-sm shadow-elevation-1">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-xs sm:text-sm text-white uppercase tracking-wider">
                {t('customDeck.cardsInDeck', { count: questions.length })}
              </h3>
              <span className="text-[11px] sm:text-xs text-slate-400">Min 3 cards recommended</span>
            </div>

            {questions.length > 0 ? (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-3 sm:p-3.5 rounded-2xl bg-surface-highlight border border-white/5 hover:border-white/15 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                  >
                    {editingQuestionId === q.id ? (
                      /* Inline Edit Form */
                      <div className="flex-1 space-y-2 w-full">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingType('truth')}
                            className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                              editingType === 'truth' ? 'bg-truth-500 text-white' : 'bg-canvas-base text-slate-400'
                            }`}
                          >
                            Truth
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingType('dare')}
                            className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                              editingType === 'dare' ? 'bg-dare-500 text-white' : 'bg-canvas-base text-slate-400'
                            }`}
                          >
                            Dare
                          </button>
                        </div>
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          maxLength={250}
                          className="w-full h-9 px-3 rounded-lg bg-canvas-base border border-white/15 text-white text-xs focus:outline-none focus:border-brand-400"
                        />
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="primary" onClick={() => handleSaveEdit(q.id)}>
                            Save
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => setEditingQuestionId(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* Display Row */
                      <>
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className="text-slate-500 font-mono text-[11px] w-5 text-right">{idx + 1}.</span>
                          <span
                            className={`px-2 sm:px-2.5 py-1 rounded-lg font-black text-[10px] uppercase tracking-wider border shrink-0 ${
                              q.type === 'truth'
                                ? 'bg-truth-500/15 text-truth-300 border-truth-400/30'
                                : 'bg-dare-500/15 text-dare-300 border-dare-400/30'
                            }`}
                          >
                            {q.type === 'truth' ? dict.customDeck.cardTypeTruth : dict.customDeck.cardTypeDare}
                          </span>
                          <span className="text-white font-medium text-xs sm:text-sm leading-relaxed break-words min-w-0">
                            {q.prompt}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                          {/* Voice Playback (Phase 6) */}
                          <QuestionVoiceControls
                            text={q.prompt}
                            language={deckLanguage}
                            type={q.type}
                            variant="compact"
                            isCustom={true}
                          />

                          {/* Preview Question Button */}
                          <button
                            onClick={() => {
                              setPreviewQuestion(q);
                              setPreviewFlipped(false);
                            }}
                            className="text-slate-400 hover:text-truth-300 p-1.5 transition-colors rounded-xl hover:bg-white/5"
                            title="Preview Card"
                            aria-label="Preview Card"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Question Button */}
                          <button
                            onClick={() => handleStartEdit(q)}
                            className="text-slate-400 hover:text-brand-300 p-1.5 transition-colors rounded-xl hover:bg-white/5"
                            title="Edit Card"
                            aria-label="Edit Card"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete Question Button */}
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="text-slate-400 hover:text-rose-400 p-1.5 transition-colors rounded-xl hover:bg-white/5"
                            title={dict.customDeck.deleteCard}
                            aria-label={dict.customDeck.deleteCard}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title={dict.customDeck.emptyDeckTitle}
                description={dict.customDeck.emptyDeckDesc}
              />
            )}
          </div>

          {/* Action Controls Row (Save, Single-Device, Multiplayer) */}
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
                  <span>{dict.customDeck.deckSaved}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{dict.customDeck.saveDeck}</span>
                </>
              )}
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                handleSaveDeck();
                setActiveTab('play');
              }}
              disabled={questions.length < 3}
              className="w-full sm:w-auto gap-2 min-h-[48px]"
            >
              <Users className="w-4 h-4 text-truth-400" />
              <span>Pass & Play</span>
            </Button>

            <Button
              variant="dare"
              size="lg"
              onClick={handleHostMultiplayerRoom}
              disabled={questions.length < 3}
              className="w-full sm:w-auto gap-2 min-h-[48px]"
            >
              <Share2 className="w-4 h-4" />
              <span>Host Party Room</span>
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: DECK LIBRARY (PHASE 3)
         ======================================================== */}
      {activeTab === 'library' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-extrabold text-xl text-white">Your Custom Deck Library</h2>
              <p className="text-xs text-slate-400">All decks created in this browser. Only you can manage your decks.</p>
            </div>
            <Button variant="primary" size="sm" onClick={handleCreateNewDeck} className="gap-1.5">
              <Plus className="w-4 h-4" /> Create Deck
            </Button>
          </div>

          {decks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {decks.map((deck) => {
                const isSelected = currentDeckId === deck.id;
                const truths = deck.questions.filter((q) => q.type === 'truth').length;
                const dares = deck.questions.filter((q) => q.type === 'dare').length;

                return (
                  <div
                    key={deck.id}
                    className={`p-5 rounded-3xl bg-surface-elevated/90 border transition-all flex flex-col justify-between gap-4 backdrop-blur-sm ${
                      isSelected ? 'border-brand-400/60 shadow-glow-brand' : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display font-bold text-base text-white break-words">
                          {deck.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono uppercase text-slate-400">
                          {deck.visibility}
                        </span>
                      </div>

                      {deck.description && (
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {deck.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                        <span className="px-2 py-1 rounded-lg bg-truth-500/15 text-truth-300 text-[11px] font-bold">
                          {truths} Truths
                        </span>
                        <span className="px-2 py-1 rounded-lg bg-dare-500/15 text-dare-300 text-[11px] font-bold">
                          {dares} Dares
                        </span>
                        <span className="px-2 py-1 rounded-lg bg-white/5 text-slate-300 text-[11px] font-mono">
                          {SUPPORTED_LOCALES[deck.language]?.flag || '🌐'} {deck.language.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/10 pt-3 gap-2">
                      <div className="text-[10px] text-slate-500">
                        Updated {new Date(deck.updatedAt).toLocaleDateString()}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            handleLoadDeckToEdit(deck);
                            setActiveTab('play');
                          }}
                          className="gap-1 px-3 text-xs"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" /> Play
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLoadDeckToEdit(deck)}
                          className="gap-1 px-2.5 text-xs"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </Button>

                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${deck.name}"?`)) {
                              handleDeleteDeck(deck.id);
                            }
                          }}
                          className="text-slate-500 hover:text-rose-400 p-2 rounded-xl transition-colors hover:bg-white/5"
                          title="Delete Deck"
                          aria-label="Delete Deck"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No custom decks found"
              description="Create your first Truth or Dare custom deck above."
            />
          )}
        </div>
      )}

      {/* ========================================================
          TAB 3: SINGLE-DEVICE PASS-AND-PLAY (PHASE 4)
         ======================================================== */}
      {activeTab === 'play' && (
        <div className="space-y-6">
          {!isGameActive ? (
            /* Setup Screen: Player List */
            <div className="p-4 sm:p-6 md:p-8 rounded-3xl bg-surface-elevated/90 border border-white/10 space-y-6 backdrop-blur-sm shadow-elevation-1">
              <div>
                <h2 className="font-display font-extrabold text-xl text-white">Single-Device Pass & Play Setup</h2>
                <p className="text-xs text-slate-400">
                  Playing with: <span className="font-bold text-truth-300">{deckName}</span> ({totalCount} cards)
                </p>
              </div>

              {/* Add Player Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Add Players (2 to 20):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    maxLength={20}
                    placeholder="Enter player name..."
                    className="flex-1 h-11 px-3.5 rounded-xl bg-canvas-base border border-white/10 text-sm font-semibold text-white focus:outline-none focus:border-brand-400"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddPlayer();
                      }
                    }}
                  />
                  <Button variant="primary" size="md" onClick={handleAddPlayer} className="gap-1.5 px-4">
                    <Plus className="w-4 h-4" /> Add
                  </Button>
                </div>
              </div>

              {/* Player Roster */}
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Player Roster ({playPlayers.length}):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {playPlayers.map((p, idx) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-2xl bg-canvas-base border border-white/10 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs"
                          style={{ backgroundColor: p.avatarColor }}
                        >
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-sm text-white">{p.name}</span>
                      </div>
                      {playPlayers.length > 2 && (
                        <button
                          onClick={() => handleRemovePlayer(p.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Start Game Action */}
              <div className="pt-2">
                <Button
                  variant="dare"
                  size="lg"
                  onClick={handleStartPassAndPlay}
                  className="w-full gap-2 min-h-[50px] font-bold text-base"
                >
                  <Play className="w-5 h-5 fill-current" /> Start Pass & Play Game
                </Button>
              </div>
            </div>
          ) : (
            /* Active Pass-and-Play Game Board */
            <div className="space-y-6">
              {/* Turn Banner */}
              <div className="p-4 sm:p-5 rounded-3xl bg-surface-elevated/90 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 backdrop-blur-sm shadow-elevation-1">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-elevation-2"
                    style={{ backgroundColor: playPlayers[activePlayerIndex].avatarColor }}
                  >
                    {playPlayers[activePlayerIndex].name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Round {roundNumber} • Current Turn:
                    </span>
                    <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white">
                      {playPlayers[activePlayerIndex].name}&apos;s Turn
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="text-xs text-slate-400 font-medium">
                    Next up: <span className="font-bold text-white">{playPlayers[(activePlayerIndex + 1) % playPlayers.length].name}</span>
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
                    className="gap-1.5 text-xs text-slate-300"
                  >
                    <History className="w-4 h-4 text-truth-400" /> History ({questionHistory.length})
                  </Button>
                </div>
              </div>

              {/* Card Presentation */}
              <div className="p-6 sm:p-10 rounded-3xl bg-surface-elevated/95 border border-white/15 text-center space-y-6 shadow-elevation-3 min-h-[340px] flex flex-col justify-center items-center">
                {!isCardFlipped ? (
                  /* Face Down: Choose Truth or Dare */
                  <div className="space-y-6 w-full max-w-md">
                    <div className="space-y-2">
                      <span className="px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-xs font-bold uppercase tracking-wider text-brand-300">
                        Choose Your Fate
                      </span>
                      <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
                        Truth or Dare?
                      </h3>
                      <p className="text-xs text-slate-400">
                        Select a category from your custom deck to reveal the challenge.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <Button
                        variant="truth"
                        size="xl"
                        onClick={() => handleDrawCard('truth')}
                        className="gap-2 font-black tracking-wider text-base"
                      >
                        <HelpCircle className="w-5 h-5" /> TRUTH
                      </Button>
                      <Button
                        variant="dare"
                        size="xl"
                        onClick={() => handleDrawCard('dare')}
                        className="gap-2 font-black tracking-wider text-base"
                      >
                        <Flame className="w-5 h-5 fill-current" /> DARE
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Face Up: Question Revealed */
                  <div className="space-y-6 w-full max-w-xl animate-fade-in">
                    <div className="flex items-center justify-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                          currentCard?.type === 'truth'
                            ? 'bg-truth-500/20 text-truth-300 border-truth-400/40 shadow-glow-truth'
                            : 'bg-dare-500/20 text-dare-300 border-dare-400/40 shadow-glow-dare'
                        }`}
                      >
                        {currentCard?.type === 'truth' ? 'TRUTH CHALLENGE' : 'DARE CHALLENGE'}
                      </span>
                    </div>

                    <p className="font-display font-extrabold text-xl sm:text-2xl md:text-3xl text-white leading-relaxed px-2">
                      &ldquo;{currentCard?.prompt}&rdquo;
                    </p>

                    {/* Voice Controls (Phase 6) */}
                    <div className="flex justify-center pt-1">
                      <QuestionVoiceControls
                        text={currentCard?.prompt || ''}
                        language={deckLanguage}
                        type={currentCard?.type || 'truth'}
                        variant="card"
                        isCustom={true}
                      />
                    </div>

                    {/* Action Controls: Complete / Skip */}
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                      <Button
                        variant="secondary"
                        size="lg"
                        onClick={handleSkipTurn}
                        className="gap-2 font-bold text-slate-300 hover:text-white"
                      >
                        Skip (+0 pts)
                      </Button>
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={handleCompleteDare}
                        className="gap-2 font-extrabold text-white"
                      >
                        <Check className="w-5 h-5 text-emerald-300" /> Completed (+1 pt)
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* History Drawer */}
              {showHistoryDrawer && (
                <div className="p-4 sm:p-6 rounded-3xl bg-surface-elevated/90 border border-white/10 space-y-3 backdrop-blur-md">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                      Question History (This Session)
                    </h4>
                    <button onClick={() => setShowHistoryDrawer(false)} className="text-slate-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {questionHistory.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                      {questionHistory.map((h, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-canvas-base border border-white/5 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-slate-400 mr-2">{h.playerName}:</span>
                            <span className="text-slate-200">{h.card.prompt}</span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                              h.outcome === 'completed'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {h.outcome}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No questions completed yet in this session.</p>
                  )}
                </div>
              )}

              {/* Bottom Gameplay Utilities */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRestartGame}
                  className="gap-1.5 text-xs text-slate-400 hover:text-white"
                >
                  <RotateCcw className="w-4 h-4" /> Reshuffle & Restart
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowGameOverModal(true)}
                    className="gap-1.5 text-xs"
                  >
                    <Trophy className="w-4 h-4 text-amber-400" /> Leaderboard
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsGameActive(false)}
                    className="gap-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Exit Game
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          PREVIEW MODAL (Phase 2 & Phase 6)
         ======================================================== */}
      {previewQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-canvas-deep/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-surface-elevated border border-white/10 space-y-5 text-center">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Card Preview Simulation
              </span>
              <button onClick={() => setPreviewQuestion(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-canvas-base border border-white/10 space-y-4">
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                  previewQuestion.type === 'truth'
                    ? 'bg-truth-500/20 text-truth-300 border-truth-400/40'
                    : 'bg-dare-500/20 text-dare-300 border-dare-400/40'
                }`}
              >
                {previewQuestion.type.toUpperCase()}
              </span>

              <p className="font-display font-extrabold text-lg sm:text-xl text-white">
                &ldquo;{previewQuestion.prompt}&rdquo;
              </p>

              {/* Voice in Preview (Phase 6) */}
              <div className="flex justify-center pt-2">
                <QuestionVoiceControls
                  text={previewQuestion.prompt}
                  language={deckLanguage}
                  type={previewQuestion.type}
                  variant="card"
                  isCustom={true}
                />
              </div>
            </div>

            <Button variant="secondary" size="md" onClick={() => setPreviewQuestion(null)} className="w-full">
              Close Preview
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================
          LEADERBOARD / SUMMARY MODAL (Phase 4)
         ======================================================== */}
      {showGameOverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-canvas-deep/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-surface-elevated border border-white/10 space-y-5 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-500/10 border border-brand-400/30 flex items-center justify-center text-brand-400">
              <Trophy className="w-7 h-7" />
            </div>

            <div>
              <h3 className="font-display font-extrabold text-xl text-white">Party Leaderboard</h3>
              <p className="text-xs text-slate-400">Round {roundNumber} Current Standings</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-canvas-base border border-white/5 space-y-2 text-left max-h-56 overflow-y-auto custom-scrollbar">
              {playPlayers
                .slice()
                .sort((a, b) => b.score - a.score)
                .map((p, idx) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-xl bg-surface-highlight border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-500 w-4">{idx + 1}.</span>
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-white text-[10px]"
                        style={{ backgroundColor: p.avatarColor }}
                      >
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-white">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">{p.skips} skips</span>
                      <span className="font-bold text-truth-300">{p.score} pts</span>
                    </div>
                  </div>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button variant="secondary" size="md" onClick={() => setShowGameOverModal(false)}>
                Resume Game
              </Button>
              <Button variant="primary" size="md" onClick={handleRestartGame}>
                Restart Round 1
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
