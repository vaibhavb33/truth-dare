import { NextRequest, NextResponse } from 'next/server';
import { questionEngine } from '@/lib/questions/engine';
import { GameType, CategoryId, QuestionType } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const game = (searchParams.get('game') as GameType) || 'truth-or-dare';
  const category = (searchParams.get('category') as CategoryId) || undefined;
  const type = (searchParams.get('type') as QuestionType) || undefined;
  const intensity = searchParams.get('intensity') ? parseInt(searchParams.get('intensity')!, 10) : 5;
  const isFamilySafe = searchParams.get('family_safe') === 'true';

  const questions = questionEngine.getEligibleQuestions({
    gameId: game,
    categoryId: category,
    type,
    maxIntensity: intensity,
    isFamilySafe,
  });

  return NextResponse.json({
    success: true,
    count: questions.length,
    data: questions,
  });
}

