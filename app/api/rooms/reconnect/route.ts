import { NextRequest, NextResponse } from 'next/server';
import { roomEngine } from '@/lib/multiplayer/roomEngine';
import { rateLimiter } from '@/lib/security/rateLimiter';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local-room-client';
    const rateCheck = rateLimiter.check(`reconnect-room:${ip}`, 60, 60 * 1000);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, code: 'PERMISSION_DENIED', error: 'Too many reconnect attempts. Please slow down.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { roomCode, playerId, sessionToken } = body;

    if (!roomCode || !playerId || !sessionToken) {
      return NextResponse.json(
        { success: false, code: 'INVALID_ROOM_CODE', error: 'Missing reconnection credentials.' },
        { status: 400 }
      );
    }

    const result = roomEngine.reconnectPlayer({
      roomCode,
      playerId,
      sessionToken,
    });

    if (!result.success) {
      const httpStatus =
        result.code === 'ROOM_NOT_FOUND'
          ? 404
          : result.code === 'ROOM_EXPIRED'
          ? 410
          : 400;

      return NextResponse.json(
        { success: false, code: result.code, error: result.error },
        { status: httpStatus }
      );
    }

    return NextResponse.json({
      success: true,
      roomId: result.room?.id,
      roomCode: result.room?.roomCode,
      playerId: result.player?.id,
      player: result.player,
      room: result.room,
    });
  } catch {
    return NextResponse.json(
      { success: false, code: 'NETWORK_UNAVAILABLE', error: 'Failed to reconnect.' },
      { status: 400 }
    );
  }
}
