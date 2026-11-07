'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePWA } from './usePWA';
import { isGameplayActive, subscribeGameplayActive } from '@/lib/gameplay/gameplayState';
import { sound } from '@/lib/audio/soundSynthesizer';

export const PWA_STORAGE_KEYS = {
  LAST_PROMPT_AT: 'asteria_pwa_last_prompt_at',
  INSTALLED: 'asteria_pwa_installed',
  SESSION_SHOWN: 'asteria_pwa_prompt_shown_session',
} as const;

export const PWA_PROMOTION_CONFIG = {
  COOLDOWN_DAYS_MS: 7 * 24 * 60 * 60 * 1000, // 7 days = 604,800,000 ms
  INITIAL_DELAY_MS: 30000,                    // 30 seconds
  INTERACTION_GRACE_MS: 1000,                 // 1 second before user interactions trigger prompt
} as const;

// Safe localStorage access wrapper
export function getSafeStorageItem(key: string): string | null {
  try {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setSafeStorageItem(key: string, value: string): void {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, value);
  } catch {
    // Graceful fallback for private/restricted browsing modes
  }
}

export function getSafeSessionItem(key: string): string | null {
  try {
    if (typeof window === 'undefined') return null;
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setSafeSessionItem(key: string, value: string): void {
  try {
    if (typeof window === 'undefined') return;
    window.sessionStorage.setItem(key, value);
  } catch {}
}

/**
 * Checks whether user is eligible for the 7-day recurring PWA installation promotion
 */
export function checkPromotionEligibility(isInstalledState: boolean): boolean {
  if (typeof window === 'undefined') return false;

  // 1. App already installed (standalone mode, recorded install, or PWA hook state)
  if (isInstalledState) return false;
  const storedInstalled = getSafeStorageItem(PWA_STORAGE_KEYS.INSTALLED);
  if (storedInstalled === 'true') return false;

  // Check display-mode standalone
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
    document.referrer.startsWith('android-app://');
  if (isStandalone) {
    setSafeStorageItem(PWA_STORAGE_KEYS.INSTALLED, 'true');
    return false;
  }

  // 2. Prevent showing multiple times within the same browsing session
  const shownThisSession = getSafeSessionItem(PWA_STORAGE_KEYS.SESSION_SHOWN);
  if (shownThisSession === 'true') return false;

  // 3. Check 7-Day Cooldown from persistent storage
  const lastPromptAtStr = getSafeStorageItem(PWA_STORAGE_KEYS.LAST_PROMPT_AT);
  if (lastPromptAtStr) {
    const lastPromptAt = parseInt(lastPromptAtStr, 10);
    if (!isNaN(lastPromptAt)) {
      const timeSinceLastPrompt = Date.now() - lastPromptAt;
      if (timeSinceLastPrompt < PWA_PROMOTION_CONFIG.COOLDOWN_DAYS_MS) {
        // Less than 7 days have passed since previous prompt
        return false;
      }
    }
  }

  // 4. Never interrupt active gameplay or multiplayer rooms
  if (isGameplayActive()) {
    return false;
  }

  return true;
}

export function usePWAPromotion() {
  const pwa = usePWA();
  const [isOpen, setIsOpen] = useState(false);
  const [showDesktopHelp, setShowDesktopHelp] = useState(false);
  const [hasPrompted, setHasPrompted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mountTimeRef = useRef<number>(Date.now());

  // Function to present the promotional banner
  const triggerPromotion = useCallback(() => {
    if (hasPrompted) return;
    if (!checkPromotionEligibility(pwa.isInstalled)) return;

    // Never interrupt active gameplay
    if (isGameplayActive()) return;

    // Save timestamp immediately upon appearing (Rule 2)
    const now = Date.now();
    setSafeStorageItem(PWA_STORAGE_KEYS.LAST_PROMPT_AT, String(now));
    setSafeSessionItem(PWA_STORAGE_KEYS.SESSION_SHOWN, 'true');

    setIsOpen(true);
    setHasPrompted(true);
    sound.playChime();
  }, [hasPrompted, pwa.isInstalled]);

  // Handle Dismissal ("Maybe Later", Close button, Escape, Backdrop)
  const dismissPromotion = useCallback(() => {
    // Record current timestamp to enforce 7-day cooldown (Rule 3 & 4)
    setSafeStorageItem(PWA_STORAGE_KEYS.LAST_PROMPT_AT, String(Date.now()));
    setSafeSessionItem(PWA_STORAGE_KEYS.SESSION_SHOWN, 'true');
    setIsOpen(false);
    setShowDesktopHelp(false);
    sound.triggerHaptic(10);
  }, []);

  // Handle "Add to Home Screen" click (Real PWA workflow)
  const handleInstallClick = useCallback(async () => {
    sound.triggerHaptic(15);

    // Case A: iOS Safari - Launch iOS 3-step guidance modal
    if (pwa.isIOS) {
      setIsOpen(false);
      pwa.setShowIOSPrompt(true);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('asteria:open_ios_install'));
      }
      return;
    }

    // Case B: Chromium / Edge / Android PWA Prompt
    if (pwa.isInstallable && pwa.promptInstall) {
      await pwa.promptInstall();
      setIsOpen(false);
      return;
    }

    // Case C: Desktop Browser without beforeinstallprompt or unsupported browser
    // Display helpful platform instructions instead of a broken button (Rule 7)
    setShowDesktopHelp(true);
  }, [pwa]);

  // Set up one-shot 30-second timer and meaningful interaction listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Fast exit if user is not eligible
    if (!checkPromotionEligibility(pwa.isInstalled)) return;

    mountTimeRef.current = Date.now();

    // 1. One-shot timer: 30 seconds of browsing (Rule 1)
    timerRef.current = setTimeout(() => {
      triggerPromotion();
    }, PWA_PROMOTION_CONFIG.INITIAL_DELAY_MS);

    // 2. Meaningful Interaction Listener
    // If user interacts meaningfully after 5s grace period, trigger promotion
    const handleMeaningfulInteraction = () => {
      const elapsed = Date.now() - mountTimeRef.current;
      if (elapsed >= PWA_PROMOTION_CONFIG.INTERACTION_GRACE_MS) {
        triggerPromotion();
        cleanupListeners();
      }
    };

    const handleCustomTrigger = () => {
      triggerPromotion();
      cleanupListeners();
    };

    const handleScroll = () => {
      if (window.scrollY > 200) {
        handleMeaningfulInteraction();
      }
    };

    const cleanupListeners = () => {
      window.removeEventListener('click', handleMeaningfulInteraction);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('asteria:trigger_pwa_prompt', handleCustomTrigger);
    };

    window.addEventListener('click', handleMeaningfulInteraction, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('asteria:trigger_pwa_prompt', handleCustomTrigger);

    // 3. Subscribe to gameplay state: If game becomes active, close or cancel timer
    const unsubscribeGameplay = subscribeGameplayActive((active) => {
      if (active) {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        setIsOpen(false);
      }
    });

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      cleanupListeners();
      unsubscribeGameplay();
    };
  }, [pwa.isInstalled, triggerPromotion]);

  // Listen for browser `appinstalled` event to permanently stop promotions (Rule 6)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleAppInstalled = () => {
      setSafeStorageItem(PWA_STORAGE_KEYS.INSTALLED, 'true');
      setIsOpen(false);
      setShowDesktopHelp(false);
    };

    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  return {
    isOpen,
    showDesktopHelp,
    dismissPromotion,
    handleInstallClick,
    triggerPromotion,
    isIOS: pwa.isIOS,
    isInstallable: pwa.isInstallable,
    isInstalled: pwa.isInstalled,
    setShowDesktopHelp,
  };
}
