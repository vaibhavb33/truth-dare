'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Question, GameType, QuestionType, QuestionCategory, SupportedLanguageCode } from '@/types';

interface Stats {
  total: number;
  active: number;
  deactivated: number;
  byGame: Record<string, number>;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  byLanguage: Record<string, number>;
}

export default function AdminClient() {
  const [adminKey, setAdminKey] = useState<string>('playtruth-admin-2026');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // New question form state
  const [newPrompt, setNewPrompt] = useState<string>('');
  const [newGame, setNewGame] = useState<GameType>('truth-or-dare');
  const [newType, setNewType] = useState<QuestionType>('truth');
  const [newCategory, setNewCategory] = useState<QuestionCategory>('funny-truth');
  const [newLanguage, setNewLanguage] = useState<SupportedLanguageCode>('en');
  const [newIntensity, setNewIntensity] = useState<1 | 2 | 3 | 4 | 5>(2);

  // Bulk import state
  const [importJson, setImportJson] = useState<string>('');

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/admin/questions?stats=true`, {
        headers: { 'x-admin-key': adminKey },
      });
      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setIsAuthenticated(true);
      }
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: '30',
        language: selectedLanguage,
      });
      if (selectedGame) queryParams.set('game', selectedGame);
      if (selectedType) queryParams.set('type', selectedType);
      if (selectedCategory) queryParams.set('category', selectedCategory);
      if (search.trim()) queryParams.set('q', search.trim());

      const res = await fetch(`/api/admin/questions?${queryParams.toString()}`, {
        headers: { 'x-admin-key': adminKey },
      });
      if (res.status === 401) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setQuestions(data.items || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);
        setIsAuthenticated(true);
      } else {
        setError(data.error || 'Failed to load questions');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [adminKey]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchQuestions();
    }
  }, [page, selectedGame, selectedType, selectedCategory, selectedLanguage, search, isAuthenticated]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({
          prompt: newPrompt,
          gameId: newGame,
          type: newType,
          categoryId: newCategory,
          language_code: newLanguage,
          intensity: newIntensity,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create question');
        return;
      }
      setSuccessMsg('Question added successfully!');
      setIsAddOpen(false);
      setNewPrompt('');
      fetchQuestions();
      fetchStats();
    } catch (err: any) {
      setError(err.message || 'Failed to save question');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/admin/questions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({
          id: editingQuestion.id,
          prompt: editingQuestion.prompt,
          category: editingQuestion.category || editingQuestion.categoryId,
          intensity: editingQuestion.intensity || editingQuestion.difficulty,
          is_active: editingQuestion.is_active,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to update question');
        return;
      }
      setSuccessMsg('Question updated successfully!');
      setIsEditOpen(false);
      setEditingQuestion(null);
      fetchQuestions();
      fetchStats();
    } catch (err: any) {
      setError(err.message || 'Failed to update question');
    }
  };

  const handleToggleActive = async (q: Question) => {
    const nextState = !(q.is_active !== false);
    try {
      const res = await fetch('/api/admin/questions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({
          id: q.id,
          is_active: nextState,
        }),
      });
      if (res.ok) {
        setQuestions((prev) =>
          prev.map((item) => (item.id === q.id ? { ...item, is_active: nextState } : item))
        );
        fetchStats();
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleImport = async () => {
    setError(null);
    setSuccessMsg(null);
    try {
      const parsed = JSON.parse(importJson);
      const questionsList = Array.isArray(parsed) ? parsed : parsed.questions;
      if (!Array.isArray(questionsList)) {
        setError('Import payload must be a JSON array of questions or an object with a "questions" array.');
        return;
      }

      const res = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({ questions: questionsList }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to import questions');
        return;
      }
      setSuccessMsg(data.message);
      setIsImportOpen(false);
      setImportJson('');
      fetchQuestions();
      fetchStats();
    } catch (err: any) {
      setError(err.message || 'Invalid JSON format');
    }
  };

  const handleExportJson = () => {
    const jsonStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(questions, null, 2))}`;
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', jsonStr);
    dlAnchor.setAttribute('download', `questions_export_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchor.click();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      {/* Top Header */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-pink-500 hover:text-pink-400 font-bold text-sm tracking-wider uppercase">
              ← Back to Game
            </Link>
            <span className="text-slate-600">|</span>
            <span className="bg-pink-500/20 text-pink-400 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-pink-500/30">
              Admin Portal
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
            Question Management & Database Operations
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="password"
            placeholder="Admin Access Token"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs rounded-lg px-3 py-2 text-white focus:outline-none focus:border-pink-500"
          />
          <button
            onClick={() => {
              fetchStats();
              fetchQuestions();
            }}
            className="bg-pink-600 hover:bg-pink-500 text-white text-xs px-4 py-2 rounded-lg font-medium transition"
          >
            Authenticate
          </button>
        </div>
      </header>

      {/* Notifications */}
      <div className="max-w-7xl mx-auto mt-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
            ⚠️ {error}
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-lg text-sm mb-4">
            ✓ {successMsg}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      {stats && (
        <section className="max-w-7xl mx-auto mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400 uppercase font-semibold">Total Pool</div>
            <div className="text-2xl font-black text-pink-400 mt-1">{stats.total.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-1">All verified questions</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400 uppercase font-semibold">Truth Questions</div>
            <div className="text-2xl font-black text-cyan-400 mt-1">{(stats.byType['truth'] || 0).toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-1">Target: 1,000+</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400 uppercase font-semibold">Dare Challenges</div>
            <div className="text-2xl font-black text-orange-400 mt-1">{(stats.byType['dare'] || 0).toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-1">Target: 1,000+</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400 uppercase font-semibold">Party Games</div>
            <div className="text-2xl font-black text-purple-400 mt-1">
              {(
                (stats.byType['most_likely_to'] || 0) +
                (stats.byType['never_have_i_ever'] || 0) +
                (stats.byType['would_you_rather'] || 0) +
                (stats.byType['this_or_that'] || 0)
              ).toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1">MLT, NHIE, WYR, TOT</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400 uppercase font-semibold">Couples / Romance</div>
            <div className="text-2xl font-black text-rose-400 mt-1">
              {((stats.byCategory['romantic'] || 0) + (stats.byCategory['couples'] || 0)).toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1">Target: 300+</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400 uppercase font-semibold">Friendship</div>
            <div className="text-2xl font-black text-amber-400 mt-1">
              {(stats.byCategory['friendship'] || 0).toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1">Target: 300+</div>
          </div>
        </section>
      )}

      {/* Main Operations Controls */}
      <main className="max-w-7xl mx-auto mt-8 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsAddOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/20 transition"
            >
              + Add Question
            </button>
            <button
              onClick={() => setIsImportOpen(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white text-sm px-4 py-2 rounded-xl font-semibold transition"
            >
              📥 Import Batch (JSON)
            </button>
            <button
              onClick={handleExportJson}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm px-4 py-2 rounded-xl font-semibold border border-slate-700 transition"
            >
              📤 Export Current Page
            </button>
          </div>

          {/* Quick Counter */}
          <div className="text-xs text-slate-400 font-medium self-end lg:self-center">
            Showing <span className="text-white font-bold">{questions.length}</span> of{' '}
            <span className="text-white font-bold">{totalCount}</span> questions
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Search text</label>
            <input
              type="text"
              placeholder="Search prompts..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Language</label>
            <select
              value={selectedLanguage}
              onChange={(e) => {
                setSelectedLanguage(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
            >
              <option value="en">English (en)</option>
              <option value="hi">Hindi (hi)</option>
              <option value="es">Spanish (es)</option>
              <option value="pt">Portuguese (pt)</option>
              <option value="fr">French (fr)</option>
              <option value="id">Indonesian (id)</option>
              <option value="ar">Arabic (ar)</option>
              <option value="de">German (de)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Game Mode</label>
            <select
              value={selectedGame}
              onChange={(e) => {
                setSelectedGame(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
            >
              <option value="">All Games</option>
              <option value="truth-or-dare">Truth or Dare</option>
              <option value="most-likely-to">Most Likely To</option>
              <option value="never-have-i-ever">Never Have I Ever</option>
              <option value="would-you-rather">Would You Rather</option>
              <option value="this-or-that">This or That</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Question Type</label>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
            >
              <option value="">All Types</option>
              <option value="truth">Truth</option>
              <option value="dare">Dare</option>
              <option value="most_likely_to">Most Likely To</option>
              <option value="never_have_i_ever">Never Have I Ever</option>
              <option value="would_you_rather">Would You Rather</option>
              <option value="this_or_that">This or That</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
            >
              <option value="">All Categories</option>
              <option value="funny-truth">Funny Truth</option>
              <option value="funny-dare">Funny Dare</option>
              <option value="romantic">Romantic</option>
              <option value="couples">Couples</option>
              <option value="friendship">Friendship</option>
              <option value="icebreaker">Icebreaker</option>
              <option value="party">Party</option>
              <option value="creative-challenges">Creative Challenges</option>
              <option value="awkward">Awkward</option>
              <option value="embarrassing">Embarrassing</option>
              <option value="personal">Personal</option>
              <option value="family-friendly">Family Friendly</option>
              <option value="teen-friendly">Teen Friendly</option>
            </select>
          </div>
        </div>

        {/* Questions Table */}
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-6">Prompt</th>
                <th className="py-3 px-4 text-center">Intensity</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    Loading questions...
                  </td>
                </tr>
              ) : questions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    No questions found matching criteria.
                  </td>
                </tr>
              ) : (
                questions.map((q) => {
                  const isActive = q.is_active !== false;
                  const type = q.question_type || q.type;
                  const cat = q.category || q.categoryId;

                  return (
                    <tr key={q.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">{q.id}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            type === 'truth'
                              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                              : type === 'dare'
                              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                              : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          }`}
                        >
                          {type}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">
                          {cat}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-slate-200 font-medium max-w-xl">
                        {q.prompt || q.question_text}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-amber-400 whitespace-nowrap">
                        {'★'.repeat(q.intensity || q.difficulty || 2)}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(q)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition ${
                            isActive
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30'
                          }`}
                        >
                          {isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            setEditingQuestion({ ...q });
                            setIsEditOpen(true);
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded text-[11px] font-medium transition"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800 text-xs">
          <div className="text-slate-400">
            Page <span className="text-white font-bold">{page}</span> of{' '}
            <span className="text-white font-bold">{totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg transition"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg transition"
            >
              Next
            </button>
          </div>
        </div>
      </main>

      {/* MODAL: ADD QUESTION */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Add New Question</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Prompt / Question Text</label>
                <textarea
                  required
                  rows={3}
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  placeholder="Enter question prompt..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Game</label>
                  <select
                    value={newGame}
                    onChange={(e) => setNewGame(e.target.value as GameType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  >
                    <option value="truth-or-dare">Truth or Dare</option>
                    <option value="most-likely-to">Most Likely To</option>
                    <option value="never-have-i-ever">Never Have I Ever</option>
                    <option value="would-you-rather">Would You Rather</option>
                    <option value="this-or-that">This or That</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as QuestionType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  >
                    <option value="truth">Truth</option>
                    <option value="dare">Dare</option>
                    <option value="most_likely_to">Most Likely To</option>
                    <option value="never_have_i_ever">Never Have I Ever</option>
                    <option value="would_you_rather">Would You Rather</option>
                    <option value="this_or_that">This or That</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as QuestionCategory)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  >
                    <option value="funny-truth">Funny Truth</option>
                    <option value="funny-dare">Funny Dare</option>
                    <option value="romantic">Romantic</option>
                    <option value="friendship">Friendship</option>
                    <option value="icebreaker">Icebreaker</option>
                    <option value="party">Party</option>
                    <option value="creative-challenges">Challenges</option>
                    <option value="awkward">Awkward</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Language</label>
                  <select
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value as SupportedLanguageCode)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="es">Spanish</option>
                    <option value="pt">Portuguese</option>
                    <option value="fr">French</option>
                    <option value="id">Indonesian</option>
                    <option value="ar">Arabic</option>
                    <option value="de">German</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Intensity</label>
                  <select
                    value={newIntensity}
                    onChange={(e) => setNewIntensity(Number(e.target.value) as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  >
                    <option value="1">1 (Mild)</option>
                    <option value="2">2 (Medium)</option>
                    <option value="3">3 (Spicy)</option>
                    <option value="4">4 (Intense)</option>
                    <option value="5">5 (Extreme)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl font-bold transition shadow-lg shadow-emerald-900/20"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT QUESTION */}
      {isEditOpen && editingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Edit Question ({editingQuestion.id})</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-white text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdate} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Prompt</label>
                <textarea
                  required
                  rows={3}
                  value={editingQuestion.prompt}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, prompt: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Category</label>
                  <select
                    value={editingQuestion.category || editingQuestion.categoryId}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        category: e.target.value as any,
                        categoryId: e.target.value as any,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  >
                    <option value="funny-truth">Funny Truth</option>
                    <option value="funny-dare">Funny Dare</option>
                    <option value="romantic">Romantic</option>
                    <option value="couples">Couples</option>
                    <option value="friendship">Friendship</option>
                    <option value="icebreaker">Icebreaker</option>
                    <option value="party">Party</option>
                    <option value="creative-challenges">Challenges</option>
                    <option value="awkward">Awkward</option>
                    <option value="embarrassing">Embarrassing</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Intensity</label>
                  <select
                    value={editingQuestion.intensity || editingQuestion.difficulty || 2}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        intensity: Number(e.target.value) as any,
                        difficulty: Number(e.target.value) as any,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  >
                    <option value="1">1 (Mild)</option>
                    <option value="2">2 (Medium)</option>
                    <option value="3">3 (Spicy)</option>
                    <option value="4">4 (Intense)</option>
                    <option value="5">5 (Extreme)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-pink-600 hover:bg-pink-500 text-white px-5 py-2 rounded-xl font-bold transition shadow-lg shadow-pink-900/20"
                >
                  Update Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BATCH IMPORT */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Bulk Question Import (JSON)</h3>
              <button onClick={() => setIsImportOpen(false)} className="text-slate-400 hover:text-white text-lg">
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <p className="text-slate-400">
                Paste a JSON array of question objects. Any duplicates against the existing database will be automatically detected and safely skipped.
              </p>

              <textarea
                rows={10}
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder='[{"prompt": "Never have I ever...", "type": "never_have_i_ever", "gameId": "never-have-i-ever", "category": "funny-dare", "language_code": "en"}]'
                className="w-full bg-slate-950 font-mono border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-pink-500"
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setIsImportOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-xl font-bold transition shadow-lg shadow-purple-900/20"
                >
                  Execute Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

