'use client';

import React, { useEffect } from 'react';
import { usePWA } from '@/lib/pwa/usePWA';
import { IOSInstallModal } from './IOSInstallModal';

export function PWARegistration() {
  const { showIOSPrompt, setShowIOSPrompt } = usePWA();

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Only register service worker in browser environments
    const registerSW = async () => {
      try {
        // Prevent duplicate service workers by checking existing registrations
        const existingRegistrations = await navigator.serviceWorker.getRegistrations();
        if (existingRegistrations.length > 0) {
          const swActive = existingRegistrations.some(
            (reg) => reg.active && reg.active.scriptURL.endsWith('/sw.js')
          );
          if (swActive) {
            // Already registered and active
            return;
          }
        }

        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.addEventListener('statechange', () => {
              if (
                installingWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                console.log('[PWA] New Asteria content is available; please refresh.');
              }
            });
          }
        });
      } catch (err) {
        console.warn('[PWA] Service worker registration error:', err);
      }
    };

    if (document.readyState === 'complete') {
      registerSW();
    } else {
      window.addEventListener('load', registerSW);
      return () => {
        window.removeEventListener('load', registerSW);
      };
    }
  }, []);

  return (
    <>
      <IOSInstallModal isOpen={showIOSPrompt} onClose={() => setShowIOSPrompt(false)} />
    </>
  );
}

