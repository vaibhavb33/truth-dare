import { NextRequest, NextResponse } from 'next/server';
import { roomEngine } from '@/lib/multiplayer/roomEngine';
import { rateLimiter } from '@/lib/security/rateLimiter';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local-room-client';
    const rateCheck = rateLimiter.check(`reconnect-room:${ip}`, 60, 60 * 1000);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many reconnect attempts. Please slow down.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { roomCode, playerId, sessionToken } = body;

    if (!roomCode || !playerId || !sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Missing reconnection credentials.' },
        { status: 400 }
      );
    }

    const result = roomEngine.reconnectPlayer({
      roomCode,
      playerId,
      sessionToken,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      roomCode: result.room?.roomCode,
      playerId: result.player?.id,
      player: result.player,
      room: result.room,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to reconnect.' }, { status: 400 });
  }
}

