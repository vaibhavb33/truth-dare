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
  Share2,
  ShieldAlert,
  History,
  FolderHeart,
  Globe,
  X,
  Trophy,
  Save,
  Lock,
  Compass,
  ChevronDown,
  ChevronUp,
  Settings2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { sound } from '@/lib/audio/soundSynthesizer';
import { EmptyState } from '@/components/ui/States';
import { CustomDeck, CustomQuestion, SupportedLanguageCode, CategoryId } from '@/types';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { QuestionVoiceControls } from '@/components/voice/QuestionVoiceControls';
import { deckStorage, getCreatorId } from '@/lib/custom/deckStorage';
import { validateCustomQuestion } from '@/lib/custom/safetyFilter';
import { SUPPORTED_LOCALES } from '@/lib/i18n/config';

type TabView = 'editor' | 'library' | 'play';

const DRAFT_STORAGE_KEY = 'asteria_custom_deck_draft';

export function CustomDeckClient() {
  const router = useRouter();
  const { t, dict, locale } = useTranslation();

  // Active View Tab
  const [activeTab, setActiveTab] = useState<TabView>('editor');

  // Decks Library State
  const [decks, setDecks] = useState<CustomDeck[]>([]);
  const [currentDeckId, setCurrentDeckId] = useState<string | null>(null);

  // Deck Core Settings (Phase 1 & Phase 2: Visible Only Deck Name & Language)
  const [deckName, setDeckName] = useState('Party Inside Jokes');
  const [deckLanguage, setDeckLanguage] = useState<SupportedLanguageCode>(locale);

  // Deck Advanced Settings (Phase 2: Collapsed by default)
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [deckDescription, setDeckDescription] = useState('');
  const [deckCategory, setDeckCategory] = useState<CategoryId>('classic-party');
  const [deckVisibility, setDeckVisibility] = useState<'private' | 'unlisted' | 'public'>('public');

  // Question List State
  const [questions, setQuestions] = useState<CustomQuestion[]>([]);

  // Simple Question Editor Form State (Phase 1, 2, 3)
  const [newPromptText, setNewPromptText] = useState('');
  const [newPromptType, setNewPromptType] = useState<'truth' | 'dare'>('truth');
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [questionInlineError, setQuestionInlineError] = useState<string | null>(null);
  const [addedSuccess, setAddedSuccess] = useState<string | null>(null);

  // Deck Operation Messages & Alerts (Separated from question inline validation)
  const [deckError, setDeckError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isHostingRoom, setIsHostingRoom] = useState(false);

  // Inline Question Editing State
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingType, setEditingType] = useState<'truth' | 'dare'>('truth');
  const [editError, setEditError] = useState<string | null>(null);

  // Preview Modal State
  const [previewQuestion, setPreviewQuestion] = useState<CustomQuestion | null>(null);

  // Single-Device Play State
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

  // Load Decks from Storage on mount
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
      setDeckVisibility(initial.visibility || 'public');
      setQuestions(initial.questions || []);
    } else {
      // Check for unsaved draft
      if (typeof window !== 'undefined') {
        try {
          const draft = localStorage.getItem(DRAFT_STORAGE_KEY);
          if (draft) {
            const parsed = JSON.parse(draft);
            if (parsed.name) setDeckName(parsed.name);
            if (parsed.language) setDeckLanguage(parsed.language);
            if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
              setQuestions(parsed.questions);
            }
          }
        } catch {}
      }
    }
  }, [locale]);

  // Auto-save draft so questions are never lost during ordinary UI changes
  useEffect(() => {
    if (typeof window !== 'undefined' && questions.length > 0) {
      try {
        localStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({
            name: deckName,
            language: deckLanguage,
            questions,
          })
        );
      } catch {}
    }
  }, [deckName, deckLanguage, questions]);

  // Question Counts
  const truthCount = useMemo(() => questions.filter((q) => q.type === 'truth').length, [questions]);
  const dareCount = useMemo(() => questions.filter((q) => q.type === 'dare').length, [questions]);
  const totalCount = questions.length;

  // PHASE 1 & 2: Question Validation State & Button Behaviour
  const cleanedQuestion = useMemo(() => newPromptText.trim(), [newPromptText]);
  const isOnlySpaces = useMemo(
    () => newPromptText.length > 0 && cleanedQuestion.length === 0,
    [newPromptText, cleanedQuestion]
  );
  const isTooLong = useMemo(
    () => newPromptText.length > 250 || cleanedQuestion.length > 250,
    [newPromptText, cleanedQuestion]
  );
  const isDuplicatePrompt = useMemo(() => {
    if (!cleanedQuestion) return false;
    const normalized = cleanedQuestion.toLowerCase();
    return questions.some((q) => q.prompt.trim().toLowerCase() === normalized);
  }, [cleanedQuestion, questions]);

  // Button is explicitly disabled when:
  // - Input is empty
  // - Input contains only spaces
  // - Input exceeds allowed character limit (> 250)
  // - Input is already in deck
  // - Submission is in flight
  const isInputValidToAdd = useMemo(() => {
    return (
      cleanedQuestion.length > 0 &&
      !isTooLong &&
      !isDuplicatePrompt &&
      !isSubmittingQuestion
    );
  }, [cleanedQuestion, isTooLong, isDuplicatePrompt, isSubmittingQuestion]);

  // PHASE 3: Inline Error Resolution (Shown directly below the question input)
  const displayInlineError = useMemo(() => {
    if (questionInlineError) return questionInlineError;
    if (isOnlySpaces) return 'Your question cannot contain only spaces.';
    if (isTooLong) return 'Maximum 250 characters allowed.';
    if (isDuplicatePrompt) return 'This question is already in your deck.';
    return null;
  }, [questionInlineError, isOnlySpaces, isTooLong, isDuplicatePrompt]);

  // PHASE 3 & 4: ADD QUESTION HANDLER & SUCCESS BEHAVIOUR
  const handleAddQuestion = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setQuestionInlineError(null);

    // Prevent duplicate or in-flight submissions
    if (isSubmittingQuestion) return;

    const clean = newPromptText.trim();
    if (!clean) {
      if (newPromptText.length > 0) {
        setQuestionInlineError('Your question cannot contain only spaces.');
      } else {
        setQuestionInlineError('Write a question before adding it.');
      }
      sound.playBuzzer();
      return;
    }

    if (newPromptText.length > 250 || clean.length > 250) {
      setQuestionInlineError('Maximum 250 characters allowed.');
      sound.playBuzzer();
      return;
    }

    if (isDuplicatePrompt) {
      setQuestionInlineError('This question is already in your deck.');
      sound.playBuzzer();
      return;
    }

    setIsSubmittingQuestion(true);

    const validation = validateCustomQuestion(
      clean,
      questions.map((q) => q.prompt),
      250
    );

    if (!validation.isValid) {
      setQuestionInlineError(validation.error || 'Please rephrase your question.');
      setIsSubmittingQuestion(false);
      sound.playBuzzer();
      return;
    }

    const newQuestion: CustomQuestion = {
      id: 'cq-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      type: newPromptType,
      prompt: clean,
      intensity: 3,
      language: deckLanguage,
    };

    // Phase 4: Success Behaviour
    // 1. Add new question to visible list
    setQuestions((prev) => [...prev, newQuestion]);

    // 2. Clear input
    setNewPromptText('');
    setQuestionInlineError(null);

    // 3. Keep selected question type (newPromptType remains unchanged)
    // 4. Update Truth and Dare question counts (handled automatically by useMemo)
    // 5. Display small confirmation message
    const typeLabel = newPromptType === 'truth' ? 'Truth' : 'Dare';
    setAddedSuccess(`✓ ${typeLabel} added! (${questions.length + 1} total)`);
    setTimeout(() => setAddedSuccess(null), 2500);

    // 6. Keep user on the same page
    sound.playChime();
    sound.triggerHaptic(15);
    setIsSubmittingQuestion(false);
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
    setEditError(null);
  };

  // Save Inline Question Edit
  const handleSaveEdit = (id: string) => {
    setEditError(null);
    const clean = editingText.trim();
    if (!clean) {
      if (editingText.length > 0) {
        setEditError('Your question cannot contain only spaces.');
      } else {
        setEditError('Write a question before adding it.');
      }
      sound.playBuzzer();
      return;
    }

    if (clean.length > 250) {
      setEditError('Maximum 250 characters allowed.');
      sound.playBuzzer();
      return;
    }

    const validation = validateCustomQuestion(
      clean,
      questions.filter((q) => q.id !== id).map((q) => q.prompt),
      250
    );

    if (!validation.isValid) {
      setEditError(validation.error || 'Invalid edited question.');
      sound.playBuzzer();
      return;
    }

    setQuestions(
      questions.map((q) =>
        q.id === id ? { ...q, prompt: clean, type: editingType } : q
      )
    );
    setEditingQuestionId(null);
    setEditError(null);
    sound.triggerHaptic(15);
  };

  // PHASE 5: SAVE DECK
  const handleSaveDeck = (): boolean => {
    setDeckError(null);
    const cleanName = deckName.trim() || 'My Custom Deck';

    if (questions.length === 0) {
      setDeckError('Please add at least one question before saving.');
      sound.playBuzzer();
      return false;
    }

    const saveResult = deckStorage.saveDeck({
      id: currentDeckId === 'starter-deck-01' ? undefined : (currentDeckId || undefined),
      name: cleanName,
      description: deckDescription,
      language: deckLanguage,
      category: deckCategory,
      visibility: deckVisibility,
      questions,
    });

    if (!saveResult.success) {
      setDeckError(saveResult.error || 'Failed to save deck.');
      sound.playBuzzer();
      return false;
    }

    if (saveResult.deck) {
      setCurrentDeckId(saveResult.deck.id);
      setDecks(deckStorage.getDecks());

      // Sync with server deck repository for multiplayer rooms
      if (typeof window !== 'undefined') {
        fetch('/api/custom-decks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-creator-id': saveResult.deck.creatorId,
          },
          body: JSON.stringify(saveResult.deck),
        }).catch((err) => {
          console.warn('Server sync offline, deck saved locally:', err);
        });
      }
    }

    setSavedSuccess(true);
    sound.playVictory();
    setTimeout(() => setSavedSuccess(false), 2500);
    return true;
  };

  // PHASE 5: SAVE DECK & PLAY
  const handleSaveAndPlay = () => {
    if (questions.length === 0) {
      setDeckError('Add at least one question to start playing!');
      sound.playBuzzer();
      return;
    }

    const saved = handleSaveDeck();
    if (saved) {
      setActiveTab('play');
      sound.triggerHaptic(20);
    }
  };

  // Create New Deck in Editor
  const handleCreateNewDeck = () => {
    setCurrentDeckId(null);
    setDeckName('My Custom Deck');
    setDeckDescription('');
    setDeckLanguage(locale);
    setDeckCategory('classic-party');
    setDeckVisibility('public');
    setQuestions([]);
    setNewPromptText('');
    setQuestionInlineError(null);
    setDeckError(null);
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
    setDeckVisibility(deck.visibility || 'public');
    setQuestions(deck.questions || []);
    setNewPromptText('');
    setQuestionInlineError(null);
    setDeckError(null);
    setActiveTab('editor');
    sound.triggerHaptic(15);
  };

  // Delete Deck from Library
  const handleDeleteDeck = (id: string) => {
    const creator = getCreatorId();
    const res = deckStorage.deleteDeck(id);
    if (res.success) {
      if (typeof window !== 'undefined') {
        fetch(`/api/custom-decks/${id}?creatorId=${creator}`, {
          method: 'DELETE',
          headers: { 'x-creator-id': creator },
        }).catch(() => {});
      }
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
      setDeckError(res.error || 'Failed to delete deck.');
    }
  };

  // Host Multiplayer Room with this Custom Deck Snapshot (Play with Friends)
  const handleHostMultiplayerRoom = async (targetDeck?: CustomDeck) => {
    const deckToHost = targetDeck || {
      id: currentDeckId === 'starter-deck-01' ? undefined : (currentDeckId || undefined),
      name: deckName.trim() || 'My Custom Deck',
      language: deckLanguage,
      category: deckCategory,
      questions,
    };

    if (deckToHost.questions.length < 2) {
      setDeckError('Add at least 2 questions to play with friends in a multiplayer room.');
      sound.playBuzzer();
      return;
    }

    if (!targetDeck) {
      handleSaveDeck();
    }

    setIsHostingRoom(true);
    setDeckError(null);

    try {
      const creator = getCreatorId();
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-creator-id': creator,
        },
        body: JSON.stringify({
          gameId: 'truth-or-dare',
          categoryId: 'custom',
          hostName: 'Host',
          language: deckToHost.language,
          timerSeconds: 30,
          deckId: deckToHost.id || undefined,
          creatorId: creator,
          customDeckSnapshot: {
            id: deckToHost.id || 'custom-deck-' + Date.now(),
            name: deckToHost.name,
            language: deckToHost.language,
            questions: deckToHost.questions,
            creatorId: creator,
          },
          clientRequestId: `req-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        }),
      });

      const data = await res.json();
      if (data.success && data.roomCode) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(
            `asteria_multiplayer_session_${data.roomCode}`,
            JSON.stringify({
              roomId: data.roomId,
              roomCode: data.roomCode,
              playerId: data.hostPlayerId,
              sessionToken: data.sessionToken,
              playerName: 'Host',
            })
          );
        }
        sound.playChime();
        router.push(`/room/${data.roomCode}`);
      } else {
        setDeckError(data.error || 'Failed to create multiplayer room.');
        sound.playBuzzer();
        setIsHostingRoom(false);
      }
    } catch {
      setDeckError('Network error while establishing multiplayer room.');
      sound.playBuzzer();
      setIsHostingRoom(false);
    }
  };

  // Single-Device Play Helpers
  const handleAddPlayer = () => {
    const clean = newPlayerName.trim();
    if (!clean || playPlayers.length >= 20) return;

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
    if (questions.length < 2) {
      setDeckError('Add at least 2 questions to start playing!');
      return;
    }
    if (playPlayers.length < 2) {
      setDeckError('Add at least 2 players for pass-and-play.');
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

    let chosen: CustomQuestion;
    if (eligible.length > 0) {
      chosen = eligible[Math.floor(Math.random() * eligible.length)];
      setDrawnQuestionIds([...drawnQuestionIds, chosen.id]);
    } else if (pool.length > 0) {
      chosen = pool[Math.floor(Math.random() * pool.length)];
      setDrawnQuestionIds([chosen.id]);
    } else {
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
    <div className="w-full max-w-3xl lg:max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 flex-1">
      {/* Header Banner - Compact & Welcoming */}
      <div className="space-y-1 text-center md:text-left px-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-[11px] font-bold uppercase tracking-wider text-brand-300">
          <Sparkles className="w-3 h-3 text-brand-400" />
          <span>{dict.customDeck.badge || 'Deck Creator'}</span>
        </div>
        <h1 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-white tracking-tight">
          {dict.customDeck.title || 'Custom Deck Studio'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
          Create your own Truth or Dare deck in seconds. Add questions, save, and play instantly.
        </p>
      </div>

      {/* Navigation View Switcher */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-surface-elevated/90 border border-white/10 backdrop-blur-md">
        <button
          type="button"
          onClick={() => {
            setActiveTab('editor');
            sound.triggerHaptic(10);
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'editor'
              ? 'bg-brand-500 text-white shadow-glow-brand'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Deck Editor</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('library');
            sound.triggerHaptic(10);
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'library'
              ? 'bg-brand-500 text-white shadow-glow-brand'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FolderHeart className="w-3.5 h-3.5" />
          <span>My Decks ({decks.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('play');
            sound.triggerHaptic(10);
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'play'
              ? 'bg-gradient-to-r from-truth-500 to-dare-500 text-white shadow-glow-dare'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Pass & Play</span>
        </button>
      </div>

      {/* Deck-level Warning / Error Notice (Only appears on explicit deck actions, never on initial load) */}
      {deckError && (
        <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs sm:text-sm animate-shake" role="alert">
          <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Attention</p>
            <p className="text-rose-200/90 leading-relaxed">{deckError}</p>
          </div>
          <button
            type="button"
            onClick={() => setDeckError(null)}
            className="text-rose-400 hover:text-white p-0.5"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================
          TAB 1: SIMPLIFIED DECK EDITOR
         ======================================================== */}
      {activeTab === 'editor' && (
        <div className="space-y-4 sm:space-y-5">
          {/* STEP 1: DECK ESSENTIALS (PHASE 2: Visible Only Deck Name & Language) */}
          <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-surface-elevated/90 border border-white/10 space-y-3 backdrop-blur-sm shadow-elevation-1">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-300 text-xs font-black flex items-center justify-center border border-brand-400/40">
                  1
                </span>
                <h2 className="font-display font-extrabold text-sm sm:text-base text-white">
                  Deck Details
                </h2>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="px-2 py-0.5 rounded-md bg-truth-500/15 text-truth-300 border border-truth-400/30 font-bold text-[11px]">
                  {truthCount} Truths
                </span>
                <span className="px-2 py-0.5 rounded-md bg-dare-500/15 text-dare-300 border border-dare-400/30 font-bold text-[11px]">
                  {dareCount} Dares
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Deck Name (Essential) */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Deck Name <span className="text-brand-400">*</span>
                </label>
                <input
                  type="text"
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  maxLength={60}
                  placeholder="e.g., Friday Night Party, Dorm Secrets..."
                  className="w-full h-11 px-3 rounded-xl bg-canvas-base border border-white/10 text-sm font-bold text-white focus:outline-none focus:border-brand-400 transition-colors"
                />
              </div>

              {/* Language Selector (Essential) */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-brand-400" />
                  <span>Language</span>
                </label>
                <select
                  value={deckLanguage}
                  onChange={(e) => setDeckLanguage(e.target.value as SupportedLanguageCode)}
                  className="w-full h-11 px-3 rounded-xl bg-canvas-base border border-white/10 text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-brand-400 transition-colors"
                >
                  {Object.entries(SUPPORTED_LOCALES).map(([code, meta]) => (
                    <option key={code} value={code} className="bg-canvas-deep text-white">
                      {meta.flag} {meta.nativeName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Collapsed Advanced Settings (Phase 2) */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-brand-300 transition-colors py-1"
                aria-expanded={showAdvancedSettings}
              >
                <Settings2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Advanced Settings (Description, Category, Visibility)</span>
                {showAdvancedSettings ? (
                  <ChevronUp className="w-3.5 h-3.5 text-brand-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {showAdvancedSettings && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 mt-2 border-t border-white/5 animate-fade-in">
                  {/* Optional Description */}
                  <div className="space-y-1 sm:col-span-3">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={deckDescription}
                      onChange={(e) => setDeckDescription(e.target.value)}
                      maxLength={250}
                      placeholder="Add an optional note or theme description..."
                      className="w-full h-10 px-3 rounded-xl bg-canvas-base border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-400"
                    />
                  </div>

                  {/* Optional Category */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Compass className="w-3 h-3 text-truth-400" />
                      <span>Category</span>
                    </label>
                    <select
                      value={deckCategory}
                      onChange={(e) => setDeckCategory(e.target.value as CategoryId)}
                      className="w-full h-10 px-3 rounded-xl bg-canvas-base border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-brand-400"
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

                  {/* Optional Visibility */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-dare-400" />
                      <span>Visibility</span>
                    </label>
                    <select
                      value={deckVisibility}
                      onChange={(e) => setDeckVisibility(e.target.value as any)}
                      className="w-full h-10 px-3 rounded-xl bg-canvas-base border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-brand-400"
                    >
                      <option value="public" className="bg-canvas-deep">🌍 Public</option>
                      <option value="private" className="bg-canvas-deep">🔒 Private</option>
                      <option value="unlisted" className="bg-canvas-deep">🔗 Unlisted</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* STEP 2: QUESTION CREATION (PHASE 3: Simple Question Editor) */}
          <form
            onSubmit={handleAddQuestion}
            className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-surface-elevated/90 border border-white/10 space-y-3.5 backdrop-blur-sm shadow-elevation-1"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-300 text-xs font-black flex items-center justify-center border border-brand-400/40">
                  2
                </span>
                <h2 className="font-display font-extrabold text-sm sm:text-base text-white">
                  Add a Question
                </h2>
              </div>
              <span className={`text-[11px] font-mono ${newPromptText.length > 250 ? 'text-rose-400 font-bold' : newPromptText.length > 220 ? 'text-amber-400 font-bold' : 'text-slate-500'}`}>
                {newPromptText.length}/250
              </span>
            </div>

            {/* Type Switcher Buttons (Truth / Dare) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setNewPromptType('truth');
                  sound.triggerHaptic(10);
                }}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all flex items-center justify-center gap-2 ${
                  newPromptType === 'truth'
                    ? 'bg-truth-500/25 border-truth-400 text-truth-300 shadow-glow-truth'
                    : 'bg-canvas-base border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>TRUTH</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setNewPromptType('dare');
                  sound.triggerHaptic(10);
                }}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all flex items-center justify-center gap-2 ${
                  newPromptType === 'dare'
                    ? 'bg-dare-500/25 border-dare-400 text-dare-300 shadow-glow-dare'
                    : 'bg-canvas-base border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <Flame className="w-4 h-4 fill-current" />
                <span>DARE</span>
              </button>
            </div>

            {/* Question Text Input & Add Button */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                placeholder={
                  newPromptType === 'truth'
                    ? 'Type a truth question (e.g. What is your most embarrassing secret?)...'
                    : 'Type a dare challenge (e.g. Do your best impression of someone in this room!)...'
                }
                value={newPromptText}
                onChange={(e) => {
                  setNewPromptText(e.target.value);
                  if (questionInlineError) setQuestionInlineError(null);
                  if (addedSuccess) setAddedSuccess(null);
                }}
                maxLength={300}
                className={`flex-1 min-w-0 h-11 sm:h-12 px-3.5 rounded-xl bg-canvas-base border text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none transition-colors ${
                  displayInlineError
                    ? 'border-rose-500/60 focus:border-rose-400'
                    : 'border-white/10 focus:border-brand-400'
                }`}
                aria-invalid={!!displayInlineError}
                aria-describedby={displayInlineError ? 'question-inline-error' : undefined}
              />

              <div className="flex items-center gap-2 shrink-0">
                {/* Listen to Question Before Saving (Preview) */}
                <div
                  title={
                    newPromptText.trim()
                      ? `Listen to ${newPromptType.toUpperCase()} before saving`
                      : 'Write a question to listen'
                  }
                  className="shrink-0"
                >
                  <QuestionVoiceControls
                    text={newPromptText.trim()}
                    language={deckLanguage}
                    type={newPromptType}
                    variant="compact"
                    isCustom={true}
                    dataTestId="preview-question-voice-btn"
                    className={!newPromptText.trim() ? 'opacity-40 pointer-events-none' : ''}
                  />
                </div>

                {/* Add Question Button: Explicitly Disabled When Input is Empty (Phases 1 & 2) */}
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={!isInputValidToAdd || isSubmittingQuestion}
                  aria-disabled={!isInputValidToAdd || isSubmittingQuestion}
                  className={`gap-1.5 shrink-0 h-11 sm:h-12 px-5 font-bold transition-all ${
                    !isInputValidToAdd || isSubmittingQuestion
                      ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500 border border-white/5 pointer-events-none'
                      : 'shadow-glow-brand hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  {isSubmittingQuestion ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Adding...</span>
                    </span>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add Question</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Inline Error Message directly below input (Phase 3 Requirement) */}
            {displayInlineError && (
              <div
                id="question-inline-error"
                role="alert"
                className="flex items-center gap-1.5 text-xs font-semibold text-rose-300 animate-fade-in pt-0.5"
              >
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>{displayInlineError}</span>
              </div>
            )}

            {/* Small Success Notice after adding question (Phase 4 Requirement) */}
            {addedSuccess && (
              <div
                role="status"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold animate-fade-in"
              >
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{addedSuccess}</span>
              </div>
            )}
          </form>

          {/* STEP 3: QUESTION LIST (PHASE 4: Simple Cards, Counters, Edit, Delete, Listen) */}
          <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-surface-elevated/90 border border-white/10 space-y-3.5 backdrop-blur-sm shadow-elevation-1">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-300 text-xs font-black flex items-center justify-center border border-brand-400/40">
                  3
                </span>
                <h3 className="font-display font-bold text-xs sm:text-sm text-white uppercase tracking-wider">
                  Deck Questions ({totalCount})
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                {totalCount < 2 ? '⚠️ Add at least 2 questions to play' : 'Ready to play!'}
              </span>
            </div>

            {questions.length > 0 ? (
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-3 rounded-2xl bg-surface-highlight border border-white/5 hover:border-white/15 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                  >
                    {editingQuestionId === q.id ? (
                      /* Inline Edit Form */
                      <div className="flex-1 space-y-2 w-full">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingType('truth')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                              editingType === 'truth'
                                ? 'bg-truth-500 text-white shadow-glow-truth'
                                : 'bg-canvas-base text-slate-400 border border-white/10'
                            }`}
                          >
                            Truth
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingType('dare')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                              editingType === 'dare'
                                ? 'bg-dare-500 text-white shadow-glow-dare'
                                : 'bg-canvas-base text-slate-400 border border-white/10'
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
                          className="w-full h-10 px-3 rounded-xl bg-canvas-base border border-white/15 text-white text-xs focus:outline-none focus:border-brand-400"
                        />
                        {editError && (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-300 animate-fade-in pt-0.5">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            <span>{editError}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 pt-1">
                          <Button size="sm" variant="primary" onClick={() => handleSaveEdit(q.id)} className="h-8 text-xs">
                            Save Changes
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => { setEditingQuestionId(null); setEditError(null); }} className="h-8 text-xs">
                            Cancel
                          </Button>
                          {editingText.trim() && (
                            <QuestionVoiceControls
                              text={editingText.trim()}
                              language={q.language || deckLanguage}
                              type={editingType}
                              variant="compact"
                              isCustom={true}
                              dataTestId={`edit-question-voice-${q.id}`}
                            />
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Display Card */
                      <>
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className="text-slate-500 font-mono text-[11px] w-5 text-right shrink-0">
                            {idx + 1}.
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-lg font-black text-[10px] uppercase tracking-wider border shrink-0 ${
                              q.type === 'truth'
                                ? 'bg-truth-500/15 text-truth-300 border-truth-400/30'
                                : 'bg-dare-500/15 text-dare-300 border-dare-400/30'
                            }`}
                          >
                            {q.type.toUpperCase()}
                          </span>
                          <span className="text-white font-medium text-xs sm:text-sm leading-relaxed break-words min-w-0">
                            {q.prompt}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                          {/* Speaker Button for Saved Questions */}
                          <QuestionVoiceControls
                            text={q.prompt}
                            language={q.language || deckLanguage}
                            type={q.type}
                            variant="compact"
                            isCustom={true}
                            dataTestId={`saved-question-voice-${q.id}`}
                          />

                          {/* Preview Question Button */}
                          <button
                            type="button"
                            onClick={() => setPreviewQuestion(q)}
                            className="text-slate-400 hover:text-truth-300 p-1.5 transition-colors rounded-xl hover:bg-white/5"
                            title="Preview Card"
                            aria-label="Preview Card"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Question Button (Phase 4) */}
                          <button
                            type="button"
                            onClick={() => handleStartEdit(q)}
                            className="text-slate-400 hover:text-brand-300 p-1.5 transition-colors rounded-xl hover:bg-white/5"
                            title="Edit Question"
                            aria-label="Edit Question"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete Question Button (Phase 4) */}
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="text-slate-400 hover:text-rose-400 p-1.5 transition-colors rounded-xl hover:bg-white/5"
                            title="Delete Question"
                            aria-label="Delete Question"
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
              <div className="p-6 text-center space-y-2 rounded-2xl bg-canvas-base border border-white/5">
                <HelpCircle className="w-8 h-8 mx-auto text-slate-500" />
                <p className="font-bold text-sm text-white">Your deck is currently empty</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Pick Truth or Dare above, write your first question, and click &ldquo;Add Question&rdquo; to build your deck!
                </p>
              </div>
            )}
          </div>

          {/* STEP 4: SAVE & PLAY ACTIONS (PHASE 5: Save Deck & Save Deck & Play) */}
          <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-surface-elevated/95 border border-white/10 backdrop-blur-md shadow-elevation-2 space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3">
              {/* Primary Action 1: Save Deck */}
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={handleSaveDeck}
                className="w-full sm:flex-1 font-bold gap-2 min-h-[46px] shadow-glow-brand"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>✓ Deck Saved Successfully!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Deck</span>
                  </>
                )}
              </Button>

              {/* Primary Action 2: Save Deck & Play (Phase 5) */}
              <Button
                type="button"
                variant="dare"
                size="lg"
                onClick={handleSaveAndPlay}
                disabled={questions.length < 2}
                className={`w-full sm:flex-1 gap-2 min-h-[46px] font-black text-white bg-gradient-to-r from-truth-500 to-dare-500 hover:from-truth-400 hover:to-dare-400 shadow-glow-dare transition-all ${
                  questions.length < 2 ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Save Deck & Play</span>
              </Button>

              {/* Secondary Action: Play with Friends (Host Room) */}
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => handleHostMultiplayerRoom()}
                disabled={questions.length < 2 || isHostingRoom}
                className="w-full sm:w-auto gap-2 min-h-[46px] text-xs font-semibold hover:border-brand-400"
                title="Create a live multiplayer room with this custom deck"
              >
                {isHostingRoom ? (
                  <Loader2 className="w-4 h-4 animate-spin text-brand-300" />
                ) : (
                  <Users className="w-4 h-4 text-brand-300" />
                )}
                <span>Play with Friends</span>
              </Button>
            </div>

            <p className="text-[11px] text-slate-500 text-center">
              💾 Decks are stored safely in your browser and automatically synchronized with private multiplayer rooms.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: DECK LIBRARY (PHASE 7: PRESERVE EXISTING DECKS)
         ======================================================== */}
      {activeTab === 'library' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-display font-extrabold text-xl text-white">Your Saved Decks</h2>
              <p className="text-xs text-slate-400">All custom decks created on this device.</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateNewDeck}
              className="gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> New Deck
            </Button>
          </div>

          {decks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {decks.map((deck) => {
                const isSelected = currentDeckId === deck.id;
                const truths = deck.questions.filter((q) => q.type === 'truth').length;
                const dares = deck.questions.filter((q) => q.type === 'dare').length;

                return (
                  <div
                    key={deck.id}
                    className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-surface-elevated/90 border transition-all flex flex-col justify-between gap-3.5 backdrop-blur-sm ${
                      isSelected ? 'border-brand-400/60 shadow-glow-brand' : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display font-bold text-base text-white break-words">
                          {deck.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono uppercase text-slate-400 shrink-0">
                          {deck.visibility || 'public'}
                        </span>
                      </div>

                      {deck.description && (
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {deck.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                        <span className="px-2 py-0.5 rounded-md bg-truth-500/15 text-truth-300 text-[11px] font-bold">
                          {truths} Truths
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-dare-500/15 text-dare-300 text-[11px] font-bold">
                          {dares} Dares
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300 text-[11px] font-mono">
                          {SUPPORTED_LOCALES[deck.language]?.flag || '🌐'} {deck.language.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/10 pt-3 gap-2">
                      <div className="text-[10px] text-slate-500">
                        {deck.questions.length} cards
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleHostMultiplayerRoom(deck)}
                          disabled={deck.questions.length < 2 || isHostingRoom}
                          className="gap-1 px-2.5 text-xs bg-gradient-to-r from-truth-500 to-dare-500 hover:from-truth-400 hover:to-dare-400 font-bold"
                          title="Host a multiplayer room with friends"
                        >
                          <Users className="w-3.5 h-3.5" /> Play with Friends
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            handleLoadDeckToEdit(deck);
                            setActiveTab('play');
                          }}
                          className="gap-1 px-2.5 text-xs"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" /> Single Device
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLoadDeckToEdit(deck)}
                          className="gap-1 px-2 text-xs text-slate-300 hover:text-white"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </Button>

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete custom deck "${deck.name}"?`)) {
                              handleDeleteDeck(deck.id);
                            }
                          }}
                          className="text-slate-500 hover:text-rose-400 p-1.5 rounded-xl transition-colors hover:bg-white/5"
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
              description="Create your first Truth or Dare deck in the Deck Editor above."
            />
          )}
        </div>
      )}

      {/* ========================================================
          TAB 3: PASS & PLAY GAMEPLAY (PHASE 7: PRESERVE GAMEPLAY)
         ======================================================== */}
      {activeTab === 'play' && (
        <div className="space-y-4 sm:space-y-6">
          {!isGameActive ? (
            /* Setup Screen: Player List */
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-surface-elevated/90 border border-white/10 space-y-5 backdrop-blur-sm shadow-elevation-1">
              <div>
                <h2 className="font-display font-extrabold text-lg sm:text-xl text-white">Pass & Play Setup</h2>
                <p className="text-xs text-slate-400">
                  Playing with: <span className="font-bold text-truth-300">{deckName}</span> ({totalCount} cards)
                </p>
              </div>

              {/* Add Player Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Players (2 to 20):
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
                  {playPlayers.map((p) => (
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
                          type="button"
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
                  className="w-full gap-2 min-h-[48px] font-black text-white bg-gradient-to-r from-truth-500 to-dare-500 shadow-glow-dare"
                >
                  <Play className="w-5 h-5 fill-current" /> Start Pass & Play Game
                </Button>
              </div>
            </div>
          ) : (
            /* Active Pass-and-Play Game Board */
            <div className="space-y-4 sm:space-y-6">
              {/* Turn Banner */}
              <div className="p-4 rounded-2xl sm:rounded-3xl bg-surface-elevated/90 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 backdrop-blur-sm shadow-elevation-1">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-black text-white text-base sm:text-lg shadow-elevation-2"
                    style={{ backgroundColor: playPlayers[activePlayerIndex].avatarColor }}
                  >
                    {playPlayers[activePlayerIndex].name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Round {roundNumber} • Current Turn:
                    </span>
                    <h2 className="font-display font-extrabold text-lg sm:text-xl text-white">
                      {playPlayers[activePlayerIndex].name}&apos;s Turn
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="text-xs text-slate-400 font-medium">
                    Next: <span className="font-bold text-white">{playPlayers[(activePlayerIndex + 1) % playPlayers.length].name}</span>
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
                    className="gap-1 text-xs text-slate-300"
                  >
                    <History className="w-3.5 h-3.5 text-truth-400" /> History ({questionHistory.length})
                  </Button>
                </div>
              </div>

              {/* Card Presentation */}
              <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-surface-elevated/95 border border-white/15 text-center space-y-5 shadow-elevation-3 min-h-[300px] flex flex-col justify-center items-center">
                {!isCardFlipped ? (
                  /* Face Down: Choose Truth or Dare */
                  <div className="space-y-5 w-full max-w-md">
                    <div className="space-y-1.5">
                      <span className="px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-xs font-bold uppercase tracking-wider text-brand-300">
                        Choose Your Challenge
                      </span>
                      <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
                        Truth or Dare?
                      </h3>
                      <p className="text-xs text-slate-400">
                        Pick a category from your custom deck to reveal the prompt.
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
                  <div className="space-y-5 w-full max-w-xl animate-fade-in">
                    <div className="flex items-center justify-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                          currentCard?.type === 'truth'
                            ? 'bg-truth-500/20 text-truth-300 border-truth-400/40 shadow-glow-truth'
                            : 'bg-dare-500/20 text-dare-300 border-dare-400/40 shadow-glow-dare'
                        }`}
                      >
                        {currentCard?.type === 'truth' ? 'TRUTH' : 'DARE'}
                      </span>
                    </div>

                    <p className="font-display font-extrabold text-lg sm:text-2xl text-white leading-relaxed px-2">
                      &ldquo;{currentCard?.prompt}&rdquo;
                    </p>

                    {/* Voice Controls */}
                    <div className="flex justify-center pt-1">
                      <QuestionVoiceControls
                        text={currentCard?.prompt || ''}
                        language={currentCard?.language || deckLanguage}
                        type={currentCard?.type || 'truth'}
                        variant="card"
                        isCustom={true}
                        dataTestId="custom-play-voice-btn"
                      />
                    </div>

                    {/* Action Controls: Skip / Complete */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
                      <Button
                        variant="secondary"
                        size="lg"
                        onClick={handleSkipTurn}
                        className="gap-2 font-bold text-slate-300 hover:text-white"
                      >
                        Skip
                      </Button>
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={handleCompleteDare}
                        className="gap-2 font-extrabold text-white"
                      >
                        <Check className="w-5 h-5 text-emerald-300" /> Done (+1 pt)
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* History Drawer */}
              {showHistoryDrawer && (
                <div className="p-4 rounded-2xl bg-surface-elevated/90 border border-white/10 space-y-3 backdrop-blur-md">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                      Session History
                    </h4>
                    <button type="button" onClick={() => setShowHistoryDrawer(false)} className="text-slate-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {questionHistory.length > 0 ? (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
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
                    <p className="text-xs text-slate-500">No questions played yet in this session.</p>
                  )}
                </div>
              )}

              {/* Bottom Utilities */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRestartGame}
                  className="gap-1.5 text-xs text-slate-400 hover:text-white"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restart
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowGameOverModal(true)}
                    className="gap-1.5 text-xs"
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-400" /> Scores
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
          PREVIEW MODAL
         ======================================================== */}
      {previewQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-canvas-deep/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md p-5 sm:p-6 rounded-3xl bg-surface-elevated border border-white/10 space-y-4 text-center">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Card Preview
              </span>
              <button
                type="button"
                onClick={() => setPreviewQuestion(null)}
                className="text-slate-400 hover:text-white"
                aria-label="Close preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-canvas-base border border-white/10 space-y-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                  previewQuestion.type === 'truth'
                    ? 'bg-truth-500/20 text-truth-300 border-truth-400/40'
                    : 'bg-dare-500/20 text-dare-300 border-dare-400/40'
                }`}
              >
                {previewQuestion.type.toUpperCase()}
              </span>

              <p className="font-display font-extrabold text-base sm:text-lg text-white">
                &ldquo;{previewQuestion.prompt}&rdquo;
              </p>

              {/* Voice in Preview */}
              <div className="flex justify-center pt-2">
                <QuestionVoiceControls
                  text={previewQuestion.prompt}
                  language={previewQuestion.language || deckLanguage}
                  type={previewQuestion.type}
                  variant="card"
                  isCustom={true}
                  dataTestId="custom-preview-modal-voice-btn"
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
          SCORES / LEADERBOARD MODAL
         ======================================================== */}
      {showGameOverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-canvas-deep/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md p-5 sm:p-6 rounded-3xl bg-surface-elevated border border-white/10 space-y-4 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-500/10 border border-brand-400/30 flex items-center justify-center text-brand-400">
              <Trophy className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-display font-extrabold text-lg text-white">Current Standings</h3>
              <p className="text-xs text-slate-400">Round {roundNumber}</p>
            </div>

            <div className="p-3 rounded-2xl bg-canvas-base border border-white/5 space-y-1.5 text-left max-h-56 overflow-y-auto custom-scrollbar">
              {playPlayers
                .slice()
                .sort((a, b) => b.score - a.score)
                .map((p, idx) => (
                  <div
                    key={p.id}
                    className="p-2 rounded-xl bg-surface-highlight border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-500 w-3">{idx + 1}.</span>
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-white text-[10px]"
                        style={{ backgroundColor: p.avatarColor }}
                      >
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-white">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-slate-400">{p.skips} skips</span>
                      <span className="font-bold text-truth-300">{p.score} pts</span>
                    </div>
                  </div>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button variant="secondary" size="md" onClick={() => setShowGameOverModal(false)}>
                Resume
              </Button>
              <Button variant="primary" size="md" onClick={handleRestartGame}>
                Restart
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
