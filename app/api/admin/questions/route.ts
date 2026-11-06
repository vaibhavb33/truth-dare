import { NextRequest, NextResponse } from 'next/server';
import {
  questionEngine,
} from '@/lib/questions/engine';
import {
  ALL_QUESTIONS,
  QUESTIONS_BY_LANGUAGE,
  getQuestionsCountByLanguage,
  findDuplicateQuestions,
  QUESTION_CATEGORIES,
} from '@/lib/questions/database';
import { Question, SupportedLanguageCode, QuestionCategory, ContentRating, AgeGroup } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const stats = searchParams.get('stats');
  const duplicates = searchParams.get('duplicates');
  const language = searchParams.get('language') as SupportedLanguageCode | null;
  const category = searchParams.get('category') as QuestionCategory | null;

  // 1. Language breakdown statistics
  if (stats === 'true') {
    const statsData = getQuestionsCountByLanguage();
    return NextResponse.json({
      success: true,
      total_languages: Object.keys(statsData).length,
      total_questions: ALL_QUESTIONS.length,
      breakdown: statsData,
    });
  }

  // 2. Duplicate detection
  if (duplicates === 'true') {
    const duplicateList = findDuplicateQuestions(language || undefined);
    return NextResponse.json({
      success: true,
      language_filtered: language || 'all',
      duplicate_groups_count: duplicateList.length,
      duplicates: duplicateList,
    });
  }

  // 3. Filtered questions
  let results: Question[] = ALL_QUESTIONS;

  if (language) {
    results = QUESTIONS_BY_LANGUAGE[language] || [];
  }

  if (category) {
    results = results.filter((q) => q.category === category || q.categoryId === category);
  }

  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const paginated = results.slice(offset, offset + limit);

  return NextResponse.json({
    success: true,
    total_matching: results.length,
    offset,
    limit,
    data: paginated,
  });
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer asteria_admin_')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Valid Admin Bearer token is required.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const promptText = (body.question_text || body.prompt || '').trim();
    const gameType = body.game_type || body.gameId || 'truth-or-dare';
    const questionType = body.question_type || body.type || 'truth';
    const languageCode: SupportedLanguageCode = body.language_code || 'en';
    const category: QuestionCategory = body.category || 'funny-truth';
    const difficulty = (Math.max(1, Math.min(5, Number(body.difficulty || body.intensity || 2))) as 1 | 2 | 3 | 4 | 5);
    const contentRating: ContentRating = body.content_rating || (body.isNsfw ? 'R-18' : 'PG-13');
    const ageGroup: AgeGroup = body.age_group || (contentRating === 'R-18' ? 'adults' : 'all-ages');

    if (!promptText) {
      return NextResponse.json(
        { success: false, error: 'Question text (prompt) is mandatory.' },
        { status: 400 }
      );
    }

    // Sanitize prompt text to prevent XSS
    const cleanPrompt = promptText.replace(/<[^>]*>?/gm, '').trim();

    const newQuestion: Question = {
      id: `admin-${languageCode}-${Date.now()}`,
      game_type: gameType,
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
      gameId: gameType,
      categoryId: category,
      type: questionType,
      intensity: difficulty,
      isNsfw: contentRating === 'R-18',
    };

    questionEngine.addCustomQuestions([newQuestion]);

    return NextResponse.json({
      success: true,
      message: `Question added to ${languageCode.toUpperCase()} pool successfully.`,
      data: newQuestion,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to process question creation.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer asteria_admin_')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Valid Admin Bearer token is required.' },
        { status: 401 }
      );
    }

    const { id, is_active, safety_reviewed, category, difficulty, question_text } = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, error: 'Question ID is required.' }, { status: 400 });
    }

    const target = ALL_QUESTIONS.find((q) => q.id === id);
    if (!target) {
      return NextResponse.json({ success: false, error: 'Question not found.' }, { status: 404 });
    }

    if (is_active !== undefined) target.is_active = Boolean(is_active);
    if (safety_reviewed !== undefined) target.safety_reviewed = Boolean(safety_reviewed);
    if (category) {
      target.category = category;
      target.categoryId = category;
    }
    if (difficulty) {
      const diffVal = Math.max(1, Math.min(5, Number(difficulty))) as 1 | 2 | 3 | 4 | 5;
      target.difficulty = diffVal;
      target.intensity = diffVal;
    }
    if (question_text) {
      const sanitized = question_text.replace(/<[^>]*>?/gm, '').trim();
      target.question_text = sanitized;
      target.prompt = sanitized;
    }

    return NextResponse.json({
      success: true,
      message: `Question ${id} updated successfully.`,
      data: target,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to update question.' }, { status: 500 });
  }
}
