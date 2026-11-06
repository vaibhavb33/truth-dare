import { NextRequest, NextResponse } from 'next/server';
import { roomEngine } from '@/lib/multiplayer/roomEngine';
import { rateLimiter } from '@/lib/security/rateLimiter';
import { GameType, CategoryId } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local-room-client';
    const rateCheck = rateLimiter.check(`create-room:${ip}`, 20, 60 * 1000); // 20 rooms per minute max

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many room creations. Please slow down.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { gameId = 'truth-or-dare', categoryId = 'classic-party', hostName = 'Host', timerSeconds = 30 } = body;

    const { room, hostPlayerId } = roomEngine.createRoom({
      gameId: gameId as GameType,
      categoryId: categoryId as CategoryId,
      hostName,
      timerSeconds,
    });

    return NextResponse.json({
      success: true,
      roomCode: room.roomCode,
      hostPlayerId,
      room,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to create room.' }, { status: 400 });
  }
}
