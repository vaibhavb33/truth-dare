import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter } from '@/lib/security/rateLimiter';
import { validateCustomQuestion } from '@/lib/custom/safetyFilter';
import { serverDeckRepository } from '@/lib/custom/serverDeckRepository';
import { CustomDeck, CustomQuestion } from '@/types';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const creatorId = searchParams.get('creatorId') || request.headers.get('x-creator-id');

    const deck = serverDeckRepository.getDeckById(id);
    if (!deck) {
      return NextResponse.json({ success: false, error: 'Deck not found.' }, { status: 404 });
    }

    // Security check: private decks require creator match
    if (deck.visibility === 'private' && deck.creatorId !== creatorId) {
      return NextResponse.json({ success: false, error: 'Permission denied: deck is private.' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      deck,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to retrieve deck.' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { name, questions, creatorId, language, category, visibility, description } = body;

    const requestCreatorId = creatorId || request.headers.get('x-creator-id');
    if (!requestCreatorId) {
      return NextResponse.json({ success: false, error: 'Creator authentication required.' }, { status: 401 });
    }

    const existing = serverDeckRepository.getDeckById(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Deck not found.' }, { status: 404 });
    }

    // Ownership check
    if (existing.creatorId !== requestCreatorId) {
      return NextResponse.json({ success: false, error: 'Permission denied: you can only edit your own decks.' }, { status: 403 });
    }

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Deck name cannot be empty.' }, { status: 400 });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ success: false, error: 'Deck must contain at least 1 question.' }, { status: 400 });
    }

    // Question validation
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

    const updatedDeck: CustomDeck = {
      ...existing,
      id,
      name: name.trim(),
      description: (description || '').trim().slice(0, 250),
      language: language || existing.language || 'en',
      category: category || existing.category || 'classic-party',
      visibility: visibility || existing.visibility || 'private',
      creatorId: requestCreatorId,
      questions: sanitizedQuestions,
      updatedAt: Date.now(),
    };

    const result = serverDeckRepository.saveDeck(updatedDeck);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || 'Failed to update deck.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, deck: result.deck });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update custom deck.' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const creatorId = searchParams.get('creatorId') || request.headers.get('x-creator-id');

    if (!creatorId) {
      return NextResponse.json({ success: false, error: 'Creator authentication required.' }, { status: 401 });
    }

    const result = serverDeckRepository.deleteDeck(id, creatorId);
    if (!result.success) {
      const existing = serverDeckRepository.getDeckById(id);
      if (!existing) {
        return NextResponse.json({ success: false, error: 'Deck not found.' }, { status: 404 });
      }
      return NextResponse.json({ success: false, error: result.error || 'Permission denied.' }, { status: 403 });
    }

    return NextResponse.json({ success: true, message: `Deck ${id} deleted successfully.` });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete custom deck.' }, { status: 500 });
  }
}
