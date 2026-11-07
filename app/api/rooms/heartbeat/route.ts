import { NextRequest, NextResponse } from 'next/server';
import { roomEngine } from '@/lib/multiplayer/roomEngine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roomCode, playerId } = body;

    if (!roomCode || !playerId) {
      return NextResponse.json({ success: false, error: 'Missing roomCode or playerId.' }, { status: 400 });
    }

    const result = roomEngine.heartbeat({
      roomCode,
      playerId,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      room: result.room,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Heartbeat error.' }, { status: 500 });
  }
}

