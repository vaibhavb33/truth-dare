import { NextRequest, NextResponse } from 'next/server';
import { questionEngine } from '@/lib/questions/engine';
import { Question } from '@/types';

export async function GET() {
  const allQuestions = questionEngine.getEligibleQuestions({
    gameId: 'truth-or-dare',
    maxIntensity: 5,
  });

  return NextResponse.json({
    success: true,
    count: allQuestions.length,
    data: allQuestions,
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

    const newQuestion: Question = await request.json();

    if (!newQuestion.prompt || !newQuestion.gameId) {
      return NextResponse.json({ success: false, error: 'Prompt and gameId are required.' }, { status: 400 });
    }

    // Sanitize prompt text to prevent XSS
    newQuestion.prompt = newQuestion.prompt.replace(/<[^>]*>?/gm, '').trim();
    newQuestion.id = 'admin-q-' + Date.now();
    questionEngine.addCustomQuestions([newQuestion]);

    return NextResponse.json({
      success: true,
      message: 'Question created and added to active pool.',
      data: newQuestion,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to create question.' }, { status: 400 });
  }
}
