import { NextRequest, NextResponse } from 'next/server';
import { roomEngine } from '@/lib/multiplayer/roomEngine';
import { rateLimiter } from '@/lib/security/rateLimiter';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local-room-client';
    const rateCheck = rateLimiter.check(`action-room:${ip}`, 120, 60 * 1000); // 120 actions per minute max

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please slow down.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { roomCode, playerId, action, payload, sessionToken } = body;

    if (!roomCode || !playerId || !action) {
      return NextResponse.json({ success: false, error: 'Missing required parameters.' }, { status: 400 });
    }

    const result = roomEngine.dispatchAction({
      roomCode,
      playerId,
      action,
      sessionToken,
      payload,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      room: result.room,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to dispatch action.' }, { status: 400 });
  }
}

