/**
 * Asteria Gameplay State Tracker
 * Tracks active gameplay sessions across local and multiplayer games
 * to ensure promotional banners or interruptions NEVER interfere with player turns.
 */

declare global {
  interface Window {
    __ASTERIA_GAMEPLAY_ACTIVE__?: boolean;
  }
}

let isGameplayActiveState = false;
const listeners = new Set<(active: boolean) => void>();

export function setGameplayActive(active: boolean): void {
  isGameplayActiveState = active;
  if (typeof window !== 'undefined') {
    window.__ASTERIA_GAMEPLAY_ACTIVE__ = active;
  }
  listeners.forEach((listener) => listener(active));
}

export function isGameplayActive(): boolean {
  if (typeof window === 'undefined') return false;

  // 1. Explicit in-memory / window flag
  if (window.__ASTERIA_GAMEPLAY_ACTIVE__ === true || isGameplayActiveState) {
    return true;
  }

  // 2. Active Multiplayer Room route is always an active gameplay session
  const pathname = window.location.pathname;
  if (pathname.includes('/room/')) {
    return true;
  }

  // 3. Inspect DOM dataset if set by any game view
  if (document.body && document.body.dataset.gameplayActive === 'true') {
    return true;
  }

  return false;
}

export function subscribeGameplayActive(callback: (active: boolean) => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}
