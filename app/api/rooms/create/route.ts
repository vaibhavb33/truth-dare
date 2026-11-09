import { NextRequest, NextResponse } from 'next/server';
import { roomEngine } from '@/lib/multiplayer/roomEngine';
import { rateLimiter } from '@/lib/security/rateLimiter';
import { serverDeckRepository } from '@/lib/custom/serverDeckRepository';
import { GameType, CategoryId, SupportedLanguageCode } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local-room-client';
    const rateCheck = rateLimiter.check(`create-room:${ip}`, 30, 60 * 1000); // 30 rooms per minute max

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, code: 'PERMISSION_DENIED', error: 'Too many room creations. Please slow down.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      gameId = 'truth-or-dare',
      categoryId = 'classic-party',
      hostName = 'Host',
      timerSeconds = 30,
      language = 'en',
      maxPlayers = 12,
      deckId,
      creatorId,
      customDeckSnapshot = null,
      clientRequestId,
    } = body;

    let verifiedSnapshot = null;

    // Phase 2, 3 & 6: Validate Custom Deck & Build Immutable Room Snapshot
    if (deckId || customDeckSnapshot) {
      const hostCreatorId = creatorId || request.headers.get('x-creator-id') || 'anonymous';
      const snapshotResult = serverDeckRepository.createRoomSnapshot({
        deckId,
        creatorId: hostCreatorId,
        clientPayload: customDeckSnapshot,
      });

      if (!snapshotResult.success) {
        const statusCode = snapshotResult.code === 'PERMISSION_DENIED' ? 403 : 400;
        return NextResponse.json(
          {
            success: false,
            code: snapshotResult.code || 'INVALID_DECK',
            error: snapshotResult.error || 'Failed to validate custom deck.',
          },
          { status: statusCode }
        );
      }

      verifiedSnapshot = snapshotResult.snapshot;
    }

    const chosenLanguage = (verifiedSnapshot?.language || language || 'en') as SupportedLanguageCode;

    const { room, hostPlayerId, sessionToken, roomId, roomCode } = roomEngine.createRoom({
      gameId: gameId as GameType,
      categoryId: (verifiedSnapshot ? 'custom' : categoryId) as CategoryId,
      hostName,
      timerSeconds,
      language: chosenLanguage,
      maxPlayers: Number(maxPlayers),
      customDeckSnapshot: verifiedSnapshot,
      clientRequestId,
    });

    return NextResponse.json({
      success: true,
      roomId,
      roomCode,
      hostPlayerId,
      sessionToken,
      room,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to create room.' }, { status: 400 });
  }
}
