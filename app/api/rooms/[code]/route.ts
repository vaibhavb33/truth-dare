import { NextRequest, NextResponse } from 'next/server';
import { roomEngine } from '@/lib/multiplayer/roomEngine';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const lookup = roomEngine.getRoomWithStatus(code);

  if (!lookup.room) {
    const status = lookup.code === 'ROOM_EXPIRED' || lookup.code === 'ROOM_CLOSED' ? 410 : 404;
    return NextResponse.json(
      {
        success: false,
        code: lookup.code || 'ROOM_NOT_FOUND',
        error: lookup.error || 'Room not found. Please verify the 6-character room code.',
      },
      { status }
    );
  }

  return NextResponse.json({
    success: true,
    room: lookup.room,
  });
}
