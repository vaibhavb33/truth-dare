import { NextRequest, NextResponse } from 'next/server';
import { questionEngine } from '@/lib/questions/engine';
import { ALL_QUESTIONS } from '@/lib/questions/database';
import { GameType, CategoryId, QuestionType, SupportedLanguageCode } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Stats query
  if (searchParams.get('stats') === 'true') {
    const stats: Record<string, any> = {
      total: ALL_QUESTIONS.length,
      byType: {} as Record<string, number>,
      byGame: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      byLanguage: {} as Record<string, number>,
    };

    for (const q of ALL_QUESTIONS) {
      const type = q.question_type || q.type || 'unknown';
      const game = q.game_type || q.gameId || 'truth-or-dare';
      const cat = q.category || q.categoryId || 'uncategorized';
      const lang = q.language_code || 'en';

      stats.byType[type] = (stats.byType[type] || 0) + 1;
      stats.byGame[game] = (stats.byGame[game] || 0) + 1;
      stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1;
      stats.byLanguage[lang] = (stats.byLanguage[lang] || 0) + 1;
    }

    return NextResponse.json({
      success: true,
      stats,
    });
  }

  const game = (searchParams.get('game') as GameType) || 'truth-or-dare';
  const category = (searchParams.get('category') as CategoryId) || undefined;
  const type = (searchParams.get('type') as QuestionType) || undefined;
  const language = (searchParams.get('language') as SupportedLanguageCode) || 'en';
  const intensity = searchParams.get('intensity') ? parseInt(searchParams.get('intensity')!, 10) : 5;
  const isFamilySafe = searchParams.get('family_safe') === 'true';
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;
  const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;
  const isRandom = searchParams.get('random') === 'true';

  const excludeParam = searchParams.get('excludeIds');
  const excludeIds = excludeParam ? excludeParam.split(',').map((id) => id.trim()).filter(Boolean) : [];

  let questions = questionEngine.getEligibleQuestions({
    gameId: game,
    categoryId: category,
    type,
    language,
    maxIntensity: intensity,
    excludeIds,
    isFamilySafe,
  });

  if (isRandom) {
    questions = questionEngine.shuffle(questions);
  }

  const totalMatching = questions.length;
  const pagedQuestions = questions.slice(offset, offset + limit);

  return NextResponse.json({
    success: true,
    total: totalMatching,
    count: pagedQuestions.length,
    offset,
    limit,
    data: pagedQuestions,
  });
}
