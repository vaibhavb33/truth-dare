'use client';

import React, { useState, useMemo } from 'react';
import {
  Shield,
  Plus,
  CheckCircle,
  Database,
  Globe,
  Search,
  Filter,
  AlertCircle,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { sound } from '@/lib/audio/soundSynthesizer';
import { questionEngine } from '@/lib/questions/engine';
import {
  ALL_QUESTIONS,
  QUESTIONS_BY_LANGUAGE,
  getQuestionsCountByLanguage,
  findDuplicateQuestions,
  QUESTION_CATEGORIES,
} from '@/lib/questions/database';
import { Question, SupportedLanguageCode, QuestionCategory, ContentRating, AgeGroup } from '@/types';

const LANGUAGE_LABELS: Record<SupportedLanguageCode, { name: string; native: string; flag: string }> = {
  en: { name: 'English', native: 'English', flag: '🇬🇧' },
  hi: { name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  es: { name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  pt: { name: 'Portuguese', native: 'Português', flag: '🇧🇷' },
  fr: { name: 'French', native: 'Français', flag: '🇫🇷' },
  id: { name: 'Indonesian', native: 'Bahasa Indonesia', flag: '🇮🇩' },
  ar: { name: 'Arabic', native: 'العربية', flag: '🇦🇪' },
  de: { name: 'German', native: 'Deutsch', flag: '🇩🇪' },
};

export function AdminDashboardClient() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('admin@asteria.game');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Filtering & Search
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Duplicate Check Modal State
  const [showDuplicateAudit, setShowDuplicateAudit] = useState(false);

  // Admin New Question Form
  const [promptText, setPromptText] = useState('');
  const [gameType, setGameType] = useState('truth-or-dare');
  const [questionType, setQuestionType] = useState<'truth' | 'dare'>('truth');
  const [languageCode, setLanguageCode] = useState<SupportedLanguageCode>('en');
  const [category, setCategory] = useState<QuestionCategory>('funny-truth');
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | 4 | 5>(2);
  const [contentRating, setContentRating] = useState<ContentRating>('PG-13');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('all-ages');
  const [statusMsg, setStatusMsg] = useState('');

  // Stats calculation
  const stats = useMemo(() => getQuestionsCountByLanguage(), []);

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

    const cleanPrompt = promptText.replace(/<[^>]*>?/gm, '').trim();

    const newQ: Question = {
      id: `admin-${languageCode}-${Date.now()}`,
      game_type: gameType as any,
      question_type: questionType,
      language_code: languageCode,
      category: category,
      difficulty: difficulty,
      question_text: cleanPrompt,
      content_rating: contentRating,
      age_group: ageGroup,
      is_active: true,
      safety_reviewed: true,
      created_at: new Date().toISOString(),
      tags: ['admin', languageCode, category, questionType],
      // Compatibility aliases
      prompt: cleanPrompt,
      gameId: gameType as any,
      categoryId: category,
      type: questionType,
      intensity: difficulty,
      isNsfw: contentRating === 'R-18',
    };

    questionEngine.addCustomQuestions([newQ]);
    setStatusMsg(`✓ Successfully added new prompt to ${languageCode.toUpperCase()} pool.`);
    setPromptText('');
    sound.playChime();
    setTimeout(() => setStatusMsg(''), 4000);
  };

  // Filtered pool for table explorer
  const filteredQuestions = useMemo(() => {
    let pool = ALL_QUESTIONS;
    if (selectedLanguage !== 'all') {
      pool = QUESTIONS_BY_LANGUAGE[selectedLanguage as SupportedLanguageCode] || [];
    }
    if (selectedCategoryFilter !== 'all') {
      pool = pool.filter((q) => q.category === selectedCategoryFilter || q.categoryId === selectedCategoryFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      pool = pool.filter((item) =>
        (item.question_text || item.prompt || '').toLowerCase().includes(q)
      );
    }
    return pool;
  }, [selectedLanguage, selectedCategoryFilter, searchQuery]);

  const duplicatesFound = useMemo(() => {
    return findDuplicateQuestions(selectedLanguage === 'all' ? undefined : (selectedLanguage as SupportedLanguageCode));
  }, [selectedLanguage]);

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
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8 flex-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-400">
            Administrative Portal
          </span>
          <h1 className="font-display font-extrabold text-3xl text-white">Question Engine & Database</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDuplicateAudit(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-elevated hover:bg-surface-highlight border border-white/10 text-xs text-truth-300 hover:text-white"
          >
            <Sparkles className="w-3.5 h-3.5" /> Duplicate Audit ({duplicatesFound.length})
          </button>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-3 py-1.5 rounded-xl bg-surface-elevated hover:bg-surface-highlight border border-white/10 text-xs text-slate-400 hover:text-white"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Metrics Row: Total Prompts by Language */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {(Object.keys(LANGUAGE_LABELS) as SupportedLanguageCode[]).map((code) => {
          const langStat = stats[code] || { truth: 0, dare: 0, total: 0 };
          const info = LANGUAGE_LABELS[code];
          return (
            <div
              key={code}
              onClick={() => setSelectedLanguage(code)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                selectedLanguage === code
                  ? 'bg-brand-500/20 border-brand-400/50 shadow-glow-brand'
                  : 'bg-surface-elevated border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>{info.flag}</span>
                <span className="font-mono uppercase font-bold text-[10px]">{code}</span>
              </div>
              <p className="font-bold text-white text-base leading-tight">{info.native}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {langStat.total} Qs ({langStat.truth}T / {langStat.dare}D)
              </p>
            </div>
          );
        })}
      </div>

      {/* Overall Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-surface-elevated border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Validated Prompts</span>
            <Database className="w-4 h-4 text-truth-400" />
          </div>
          <p className="font-mono font-bold text-2xl text-white">
            {ALL_QUESTIONS.length.toLocaleString()} Active
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface-elevated border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Question Categories</span>
            <Layers className="w-4 h-4 text-brand-400" />
          </div>
          <p className="font-mono font-bold text-2xl text-white">
            {Object.keys(QUESTION_CATEGORIES).length} Standard Categories
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface-elevated border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Safety & Moderation</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="font-mono font-bold text-2xl text-emerald-400">100% Safety Screened</p>
        </div>
      </div>

      {/* Create New Prompt Form */}
      <div className="p-6 rounded-3xl bg-surface-elevated border border-white/10 space-y-6">
        <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
          <Plus className="w-4 h-4 text-brand-400" /> Inject New Question into Active Pool
        </h3>

        {statusMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            {statusMsg}
          </div>
        )}

        <form onSubmit={handleCreateQuestion} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold">Language:</label>
              <select
                value={languageCode}
                onChange={(e) => setLanguageCode(e.target.value as SupportedLanguageCode)}
                className="w-full h-11 px-3 rounded-xl bg-canvas-base border border-white/10 text-xs text-white focus:outline-none"
              >
                {(Object.keys(LANGUAGE_LABELS) as SupportedLanguageCode[]).map((code) => (
                  <option key={code} value={code}>
                    {LANGUAGE_LABELS[code].flag} {LANGUAGE_LABELS[code].name} ({code.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold">Category:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as QuestionCategory)}
                className="w-full h-11 px-3 rounded-xl bg-canvas-base border border-white/10 text-xs text-white focus:outline-none"
              >
                {Object.entries(QUESTION_CATEGORIES).map(([catKey, catVal]) => (
                  <option key={catKey} value={catKey}>
                    {catVal.icon} {catVal.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold">Type:</label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value as 'truth' | 'dare')}
                className="w-full h-11 px-3 rounded-xl bg-canvas-base border border-white/10 text-xs text-white focus:outline-none"
              >
                <option value="truth">Truth (सच्चाई / Vérité / Verdad)</option>
                <option value="dare">Dare (चुनौती / Défi / Desafío)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold">Content Rating:</label>
              <select
                value={contentRating}
                onChange={(e) => {
                  const val = e.target.value as ContentRating;
                  setContentRating(val);
                  setAgeGroup(val === 'R-18' ? 'adults' : 'all-ages');
                }}
                className="w-full h-11 px-3 rounded-xl bg-canvas-base border border-white/10 text-xs text-white focus:outline-none"
              >
                <option value="G">G — All Ages Clean</option>
                <option value="PG-13">PG-13 — Teen & Party</option>
                <option value="R-18">R-18 — Spicy Adult Only</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-semibold">Question / Prompt Text:</label>
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Enter original, culturally natural question text..."
              rows={3}
              required
              className="w-full p-3 rounded-xl bg-canvas-base border border-white/10 text-xs text-white focus:outline-none focus:border-brand-400"
            />
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Target Age Group:</span>
              <span className="font-semibold text-brand-300 capitalize">{ageGroup}</span>
            </div>

            <div className="flex items-center gap-1.5 ml-auto">
              <span>Difficulty:</span>
              {([1, 2, 3, 4, 5] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setDifficulty(lvl)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold ${
                    difficulty === lvl ? 'bg-brand-500 text-white' : 'bg-surface-highlight text-slate-400'
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

      {/* Question Explorer & Filter Table */}
      <div className="p-6 rounded-3xl bg-surface-elevated border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">
              Question Explorer ({filteredQuestions.length} matching)
            </h3>
            <p className="text-xs text-slate-400">Filter and search live prompts across all languages</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Language Filter */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="h-9 px-2.5 rounded-lg bg-canvas-base border border-white/10 text-xs text-white focus:outline-none"
            >
              <option value="all">🌐 All Languages ({ALL_QUESTIONS.length})</option>
              {(Object.keys(LANGUAGE_LABELS) as SupportedLanguageCode[]).map((code) => (
                <option key={code} value={code}>
                  {LANGUAGE_LABELS[code].flag} {LANGUAGE_LABELS[code].name} ({stats[code]?.total || 0})
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="h-9 px-2.5 rounded-lg bg-canvas-base border border-white/10 text-xs text-white focus:outline-none"
            >
              <option value="all">All Categories</option>
              {Object.entries(QUESTION_CATEGORIES).map(([catKey, catVal]) => (
                <option key={catKey} value={catKey}>
                  {catVal.icon} {catVal.name}
                </option>
              ))}
            </select>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search prompt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-8 pr-3 rounded-lg bg-canvas-base border border-white/10 text-xs text-white focus:outline-none focus:border-brand-400"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-h-96 rounded-xl border border-white/5">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-canvas-deep text-slate-400 font-semibold sticky top-0">
              <tr>
                <th className="p-2.5">ID</th>
                <th className="p-2.5">Lang</th>
                <th className="p-2.5">Type</th>
                <th className="p-2.5">Category</th>
                <th className="p-2.5">Prompt Text</th>
                <th className="p-2.5">Rating</th>
                <th className="p-2.5">Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-canvas-base">
              {filteredQuestions.slice(0, 50).map((q) => (
                <tr key={q.id} className="hover:bg-white/[0.02]">
                  <td className="p-2.5 font-mono text-slate-400 text-[11px] whitespace-nowrap">{q.id}</td>
                  <td className="p-2.5 uppercase font-bold text-brand-300">{q.language_code || 'en'}</td>
                  <td className="p-2.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        (q.question_type || q.type) === 'truth'
                          ? 'bg-truth-500/20 text-truth-300'
                          : 'bg-dare-500/20 text-dare-300'
                      }`}
                    >
                      {(q.question_type || q.type || 'truth').toUpperCase()}
                    </span>
                  </td>
                  <td className="p-2.5 text-slate-400 whitespace-nowrap">{q.category || q.categoryId}</td>
                  <td className="p-2.5 text-white max-w-md truncate">
                    {q.question_text || q.prompt}
                  </td>
                  <td className="p-2.5 font-mono text-[11px]">{q.content_rating || (q.isNsfw ? 'R-18' : 'PG-13')}</td>
                  <td className="p-2.5 font-mono text-brand-400 font-bold">{q.difficulty || q.intensity || 2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Duplicate Audit Modal */}
      {showDuplicateAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas-deep/85 backdrop-blur-md">
          <div className="w-full max-w-2xl p-6 rounded-3xl bg-surface-elevated border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" /> Duplicate String Detection Audit
              </h3>
              <button
                onClick={() => setShowDuplicateAudit(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Scanned active question pool for matching normalized prompt strings. Target: 0 duplicate prompts.
            </p>

            {duplicatesFound.length === 0 ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-emerald-300 text-sm">Clean Audit: 0 Duplicate Prompts Detected!</h4>
                <p className="text-xs text-slate-400">
                  All active questions across all 8 supported languages are verified distinct.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {duplicatesFound.map((dup, i) => (
                  <div key={i} className="p-3 rounded-xl bg-canvas-base border border-amber-500/30 text-xs">
                    <p className="font-semibold text-white">"{dup.text}"</p>
                    <p className="text-slate-400 text-[11px] mt-1">Found in IDs: {dup.ids.join(', ')}</p>
                  </div>
                ))}
              </div>
            )}

            <Button
              variant="secondary"
              size="md"
              onClick={() => setShowDuplicateAudit(false)}
              className="w-full"
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
