import { NextRequest, NextResponse } from 'next/server';
import { roomEngine } from '@/lib/multiplayer/roomEngine';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const room = roomEngine.getRoom(code);

  if (!room) {
    return NextResponse.json({ success: false, error: 'Room not found or expired.' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    room,
  });
}

