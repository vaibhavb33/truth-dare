import { NextRequest, NextResponse } from 'next/server';
import { roomEngine } from '@/lib/multiplayer/roomEngine';
import { rateLimiter } from '@/lib/security/rateLimiter';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local-room-client';
    const rateCheck = rateLimiter.check(`join-room:${ip}`, 40, 60 * 1000); // 40 joins per minute

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, code: 'PERMISSION_DENIED', error: 'Too many join attempts. Please slow down.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { roomCode, playerName, playerId, sessionToken } = body;

    if (!roomCode) {
      return NextResponse.json(
        { success: false, code: 'INVALID_ROOM_CODE', error: 'Room code is required.' },
        { status: 400 }
      );
    }

    const result = roomEngine.joinRoom({
      roomCode,
      playerName: playerName || 'Player',
      playerId,
      sessionToken,
    });

    if (!result.success) {
      const httpStatus =
        result.code === 'ROOM_NOT_FOUND'
          ? 404
          : result.code === 'ROOM_EXPIRED' || result.code === 'ROOM_CLOSED'
          ? 410
          : result.code === 'ROOM_FULL'
          ? 409
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
      playerId: result.playerId,
      sessionToken: result.sessionToken,
      room: result.room,
    });
  } catch {
    return NextResponse.json(
      { success: false, code: 'NETWORK_UNAVAILABLE', error: 'Failed to join room.' },
      { status: 400 }
    );
  }
}
