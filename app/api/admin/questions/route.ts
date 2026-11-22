import { NextRequest, NextResponse } from 'next/server';
import { ALL_QUESTIONS } from '@/lib/questions/database';
import { Question, GameType, QuestionType, QuestionCategory, SupportedLanguageCode } from '@/types';

const ADMIN_SECRET = process.env.ADMIN_ACCESS_TOKEN || 'playtruth-admin-2026';

function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('x-admin-key') || request.headers.get('authorization')?.replace('Bearer ', '');
  const urlKey = request.nextUrl.searchParams.get('admin_key');
  return (authHeader === ADMIN_SECRET || urlKey === ADMIN_SECRET);
}

function normalize(s: string): string {
  return (s || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Memory store for runtime overrides / custom additions in the process
const dynamicOverrides = new Map<string, Question>();
const deactivatedIds = new Set<string>();

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized: invalid admin credentials' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  // Return stats
  if (searchParams.get('stats') === 'true') {
    const stats = {
      total: ALL_QUESTIONS.length + dynamicOverrides.size - deactivatedIds.size,
      active: 0,
      deactivated: deactivatedIds.size,
      byGame: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      byLanguage: {} as Record<string, number>,
    };

    for (const q of ALL_QUESTIONS) {
      if (deactivatedIds.has(q.id)) continue;
      stats.active++;
      const game = q.game_type || q.gameId || 'truth-or-dare';
      const type = q.question_type || q.type || 'unknown';
      const cat = q.category || q.categoryId || 'uncategorized';
      const lang = q.language_code || 'en';

      stats.byGame[game] = (stats.byGame[game] || 0) + 1;
      stats.byType[type] = (stats.byType[type] || 0) + 1;
      stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1;
      stats.byLanguage[lang] = (stats.byLanguage[lang] || 0) + 1;
    }

    return NextResponse.json({ success: true, stats });
  }

  const game = searchParams.get('game');
  const type = searchParams.get('type');
  const category = searchParams.get('category');
  const language = searchParams.get('language');
  const search = searchParams.get('q')?.toLowerCase() || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  // Combine static and dynamic
  const pool: Question[] = [];
  for (const q of ALL_QUESTIONS) {
    if (dynamicOverrides.has(q.id)) {
      pool.push(dynamicOverrides.get(q.id)!);
    } else {
      pool.push({
        ...q,
        is_active: !deactivatedIds.has(q.id),
      });
    }
  }

  // Filter
  const filtered = pool.filter((q) => {
    if (game && (q.game_type || q.gameId) !== game) return false;
    if (type && (q.question_type || q.type) !== type) return false;
    if (category && (q.category || q.categoryId) !== category) return false;
    if (language && (q.language_code || 'en') !== language) return false;
    if (search) {
      const text = (q.prompt || q.question_text || '').toLowerCase();
      if (!text.includes(search)) return false;
    }
    return true;
  });

  const total = filtered.length;
  const offset = (page - 1) * limit;
  const items = filtered.slice(offset, offset + limit);

  return NextResponse.json({
    success: true,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    items,
  });
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized: invalid admin credentials' }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Check if bulk import
    if (Array.isArray(body.questions)) {
      const added: Question[] = [];
      const skippedDuplicates: string[] = [];

      for (const item of body.questions) {
        const text = item.prompt || item.question_text || '';
        const norm = normalize(text);
        if (!norm) continue;

        const isDup = ALL_QUESTIONS.some((q) => normalize(q.prompt || q.question_text || '') === norm);
        if (isDup) {
          skippedDuplicates.push(text);
          continue;
        }

        const newQuestion: Question = {
          id: item.id || `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          prompt: text,
          question_text: text,
          gameId: item.gameId || item.game_type || 'truth-or-dare',
          game_type: item.game_type || item.gameId || 'truth-or-dare',
          type: item.type || item.question_type || 'truth',
          question_type: item.question_type || item.type || 'truth',
          categoryId: item.categoryId || item.category || 'funny-truth',
          category: item.category || item.categoryId || 'funny-truth',
          language_code: item.language_code || 'en',
          intensity: item.intensity || item.difficulty || 2,
          difficulty: item.difficulty || item.intensity || 2,
          isNsfw: Boolean(item.isNsfw),
          content_rating: item.content_rating || 'G',
          age_group: item.age_group || 'all-ages',
          is_active: item.is_active !== false,
          created_at: new Date().toISOString(),
        };

        dynamicOverrides.set(newQuestion.id, newQuestion);
        added.push(newQuestion);
      }

      return NextResponse.json({
        success: true,
        message: `Imported ${added.length} questions. Skipped ${skippedDuplicates.length} duplicates.`,
        addedCount: added.length,
        skippedCount: skippedDuplicates.length,
        skippedDuplicates,
      });
    }

    // Single question creation
    const { prompt, gameId, type, categoryId, language_code, intensity } = body;
    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: 'Question prompt cannot be empty' }, { status: 400 });
    }

    const norm = normalize(prompt);
    const isDup = ALL_QUESTIONS.some((q) => normalize(q.prompt || q.question_text || '') === norm);
    if (isDup) {
      return NextResponse.json({
        error: 'Duplicate question detected: an identical question already exists in the database',
        duplicatePrompt: prompt,
      }, { status: 409 });
    }

    const newQuestion: Question = {
      id: `admin-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      prompt: prompt.trim(),
      question_text: prompt.trim(),
      gameId: gameId || 'truth-or-dare',
      game_type: gameId || 'truth-or-dare',
      type: type || 'truth',
      question_type: type || 'truth',
      categoryId: categoryId || 'funny-truth',
      category: categoryId || 'funny-truth',
      language_code: language_code || 'en',
      intensity: intensity || 2,
      difficulty: intensity || 2,
      isNsfw: false,
      content_rating: 'G',
      age_group: 'all-ages',
      is_active: true,
      created_at: new Date().toISOString(),
    };

    dynamicOverrides.set(newQuestion.id, newQuestion);

    return NextResponse.json({
      success: true,
      message: 'Question created successfully',
      question: newQuestion,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized: invalid admin credentials' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, prompt, categoryId, category, intensity, difficulty, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing question id' }, { status: 400 });
    }

    const existing = dynamicOverrides.get(id) || ALL_QUESTIONS.find((q) => q.id === id);
    if (!existing) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const updated: Question = {
      ...existing,
      prompt: prompt !== undefined ? prompt.trim() : existing.prompt,
      question_text: prompt !== undefined ? prompt.trim() : existing.question_text,
      categoryId: (categoryId || category || existing.categoryId) as QuestionCategory,
      category: (category || categoryId || existing.category) as QuestionCategory,
      intensity: (intensity || difficulty || existing.intensity) as 1 | 2 | 3 | 4 | 5,
      difficulty: (difficulty || intensity || existing.difficulty) as 1 | 2 | 3 | 4 | 5,
      is_active: is_active !== undefined ? is_active : existing.is_active,
    };

    dynamicOverrides.set(id, updated);
    if (is_active === false) {
      deactivatedIds.add(id);
    } else {
      deactivatedIds.delete(id);
    }

    return NextResponse.json({
      success: true,
      message: 'Question updated successfully',
      question: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized: invalid admin credentials' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing question id' }, { status: 400 });
  }

  deactivatedIds.add(id);
  if (dynamicOverrides.has(id)) {
    const item = dynamicOverrides.get(id)!;
    item.is_active = false;
    dynamicOverrides.set(id, item);
  }

  return NextResponse.json({
    success: true,
    message: `Question ${id} deactivated successfully`,
  });
}

