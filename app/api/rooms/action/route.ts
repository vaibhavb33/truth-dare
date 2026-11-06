import { NextRequest, NextResponse } from 'next/server';
import { roomEngine } from '@/lib/multiplayer/roomEngine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roomCode, playerId, action, payload } = body;

    if (!roomCode || !playerId || !action) {
      return NextResponse.json({ success: false, error: 'Missing required parameters.' }, { status: 400 });
    }

    const result = roomEngine.dispatchAction({
      roomCode,
      playerId,
      action,
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

