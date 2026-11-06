'use client';

import confetti from 'canvas-confetti';

export function triggerConfetti() {
  if (typeof window === 'undefined') return;

  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.8 },
      colors: ['#8B5CF6', '#06B6D4', '#FF5C77', '#F59E0B', '#10B981'],
    });
  } catch {
    // Graceful fallback if canvas is blocked
  }
}

