import { NextRequest, NextResponse } from 'next/server';
import { roomEngine } from '@/lib/multiplayer/roomEngine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roomCode, playerName } = body;

    if (!roomCode) {
      return NextResponse.json({ success: false, error: 'Room code is required.' }, { status: 400 });
    }

    const result = roomEngine.joinRoom({
      roomCode,
      playerName: playerName || 'Player',
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      roomCode: result.room?.roomCode,
      playerId: result.playerId,
      room: result.room,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to join room.' }, { status: 400 });
  }
}

