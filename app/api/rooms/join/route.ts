import { NextRequest, NextResponse } from 'next/server';
import { roomEngine } from '@/lib/multiplayer/roomEngine';
import { rateLimiter } from '@/lib/security/rateLimiter';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local-room-client';
    const rateCheck = rateLimiter.check(`join-room:${ip}`, 30, 60 * 1000); // 30 joins per minute

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many join attempts. Please slow down.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { roomCode, playerName, playerId, sessionToken } = body;

    if (!roomCode) {
      return NextResponse.json({ success: false, error: 'Room code is required.' }, { status: 400 });
    }

    const result = roomEngine.joinRoom({
      roomCode,
      playerName: playerName || 'Player',
      playerId,
      sessionToken,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      roomCode: result.room?.roomCode,
      playerId: result.playerId,
      sessionToken: result.sessionToken,
      room: result.room,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to join room.' }, { status: 400 });
  }
}

