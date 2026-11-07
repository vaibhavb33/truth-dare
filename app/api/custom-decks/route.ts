import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter } from '@/lib/security/rateLimiter';
import { validateCustomQuestion } from '@/lib/custom/safetyFilter';
import { CustomDeck, CustomQuestion } from '@/types';

// In-memory server-side mock storage fallback for API verification
const serverDeckStore = new Map<string, CustomDeck>();

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local-client';
    const rateCheck = rateLimiter.check(`custom-decks-get:${ip}`, 60, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const creatorId = searchParams.get('creatorId') || request.headers.get('x-creator-id');

    const decks = Array.from(serverDeckStore.values()).filter((d) => {
      if (d.visibility === 'public') return true;
      if (creatorId && d.creatorId === creatorId) return true;
      return false;
    });

    return NextResponse.json({ success: true, decks });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to retrieve custom decks.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local-client';
    const rateCheck = rateLimiter.check(`custom-decks-post:${ip}`, 30, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded. Please wait.' }, { status: 429 });
    }

    const body = await request.json();
    const {
      name,
      description = '',
      language = 'en',
      category = 'classic-party',
      visibility = 'private',
      creatorId = 'anonymous',
      questions = [],
    } = body;

    const cleanName = (name || '').trim();
    if (!cleanName) {
      return NextResponse.json({ success: false, error: 'Deck name is required.' }, { status: 400 });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ success: false, error: 'A custom deck must contain at least 1 question.' }, { status: 400 });
    }

    // Validate all questions (empty, duplicate, max length, and safety)
    const seenPrompts: string[] = [];
    const sanitizedQuestions: CustomQuestion[] = [];

    for (const q of questions) {
      const prompt = (q.prompt || '').trim();
      const validation = validateCustomQuestion(prompt, seenPrompts, 250);

      if (!validation.isValid) {
        return NextResponse.json(
          { success: false, error: `Invalid question: "${prompt.slice(0, 30)}..." — ${validation.error}` },
          { status: 400 }
        );
      }

      seenPrompts.push(prompt);
      sanitizedQuestions.push({
        id: q.id || 'cq-' + Math.random().toString(36).substring(2, 9),
        type: q.type === 'dare' ? 'dare' : 'truth',
        prompt,
        intensity: Math.max(1, Math.min(5, Number(q.intensity) || 3)),
      });
    }

    const deckId = 'deck-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36);
    const newDeck: CustomDeck = {
      id: deckId,
      name: cleanName,
      description: (description || '').trim().slice(0, 250),
      language,
      category,
      visibility,
      creatorId,
      questions: sanitizedQuestions,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    serverDeckStore.set(deckId, newDeck);

    return NextResponse.json({
      success: true,
      deck: newDeck,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to create custom deck.' }, { status: 500 });
  }
}
