import { NextRequest, NextResponse } from 'next/server';
import { roomEngine } from '@/lib/multiplayer/roomEngine';
import { rateLimiter } from '@/lib/security/rateLimiter';
import { GameType, CategoryId } from '@/types';

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
      customDeckSnapshot = null,
      clientRequestId,
    } = body;

    const { room, hostPlayerId, sessionToken, roomId, roomCode } = roomEngine.createRoom({
      gameId: gameId as GameType,
      categoryId: categoryId as CategoryId,
      hostName,
      timerSeconds,
      language,
      maxPlayers: Number(maxPlayers),
      customDeckSnapshot,
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
