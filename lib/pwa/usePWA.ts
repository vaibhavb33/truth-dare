'use client';

import { useState, useEffect, useCallback } from 'react';
import { sound } from '@/lib/audio/soundSynthesizer';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Detect Standalone / Installed Mode
    const checkInstalled = () => {
      const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
      const isStandaloneNavigator = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      const isStandaloneTWA = document.referrer.startsWith('android-app://');
      const installed = isStandaloneMedia || isStandaloneNavigator || isStandaloneTWA;
      setIsInstalled(installed);
      return installed;
    };

    const alreadyInstalled = checkInstalled();

    // 2. Detect iOS & Safari
    const ua = window.navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    const isSafariBrowser = /WebKit/i.test(ua) && !/CriOS|FxiOS|OPiOS|mercury/i.test(ua) && !/Chrome/i.test(ua);

    setIsIOS(isIOSDevice);
    setIsSafari(isSafariBrowser);

    // On iOS, if not already installed, user is eligible for manual Add to Home Screen
    if (isIOSDevice && !alreadyInstalled) {
      setIsInstallable(true);
    }

    // 3. Listen for Chromium/Edge `beforeinstallprompt` event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent automatic browser mini-infobar prompt
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setIsInstallable(true);
    };

    // 4. Listen for `appinstalled` event
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
      setIsInstalled(true);
      setShowIOSPrompt(false);
      sound.playVictory();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsInstalled(e.matches);
    };
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      }
    };
  }, []);

  // Intentional User Trigger for Installation
  const promptInstall = useCallback(async () => {
    sound.triggerHaptic(15);

    // Case A: iOS Safari - Display step-by-step Add to Home Screen instructions
    if (isIOS) {
      setShowIOSPrompt(true);
      return;
    }

    // Case B: Standard Chromium / Edge / Android PWA Prompt
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    }
  }, [isIOS, deferredPrompt]);

  return {
    isInstallable,
    isInstalled,
    isIOS,
    isSafari,
    showIOSPrompt,
    setShowIOSPrompt,
    promptInstall,
  };
}

