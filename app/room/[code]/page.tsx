import React from 'react';
import type { Metadata } from 'next';
import { RoomClient } from './RoomClient';

export const metadata: Metadata = {
  title: 'Multiplayer Party Room | Asteria',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function MultiplayerRoomPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const resolvedParams = await params;
  const roomCode = resolvedParams.code.toUpperCase();

  return <RoomClient roomCode={roomCode} />;
}
