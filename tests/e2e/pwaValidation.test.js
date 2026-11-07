const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, '../../project-docs/19-pwa/screenshots');

async function runPWAValidation() {
  console.log('🚀 Starting Automated PWA Validation Suite for Asteria...\n');

  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const results = {
    manifest: false,
    icons: false,
    htmlMeta: false,
    serviceWorkerRegistration: false,
    cacheStoragePrecache: false,
    securityBypass: false,
    offlineFallbackScreen: false,
    offlineNetworkSimulation: false,
    iosSupportModal: false,
  };

  try {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();

    // -------------------------------------------------------------
    // TEST 1: Manifest Accessibility & Specification Compliance
    // -------------------------------------------------------------
    console.log('--- TEST 1: Web App Manifest Accessibility & Spec Compliance ---');
    const manifestRes = await page.goto(`${BASE_URL}/manifest.webmanifest`);
    if (manifestRes && manifestRes.status() === 200) {
      const manifestText = await manifestRes.text();
      const manifest = JSON.parse(manifestText);

      const hasCorrectName = manifest.name === 'Asteria - Truth or Dare';
      const hasCorrectShortName = manifest.short_name === 'Asteria';
      const hasStandalone = manifest.display === 'standalone';
      const hasColors = manifest.theme_color === '#0A0A16' && manifest.background_color === '#0A0A16';
      const hasIcons = manifest.icons && manifest.icons.length >= 3;
      const hasMaskable = manifest.icons && manifest.icons.some((i) => i.purpose === 'maskable');

      console.log(`  ✓ Manifest Status 200 OK`);
      console.log(`  ✓ Name: "${manifest.name}"`);
      console.log(`  ✓ Short Name: "${manifest.short_name}"`);
      console.log(`  ✓ Display Mode: "${manifest.display}"`);
      console.log(`  ✓ Theme Color: "${manifest.theme_color}"`);
      console.log(`  ✓ Icons Count: ${manifest.icons.length} (Has maskable: ${hasMaskable})`);

      if (hasCorrectName && hasCorrectShortName && hasStandalone && hasColors && hasIcons && hasMaskable) {
        results.manifest = true;
      }
    } else {
      console.error('  ❌ Manifest could not be retrieved');
    }

    // -------------------------------------------------------------
    // TEST 2: Icon Asset Reachability & Physical Files
    // -------------------------------------------------------------
    console.log('\n--- TEST 2: Icon Assets Reachability ---');
    const iconsToTest = [
      { path: '/icon.svg', minSize: 1000 },
      { path: '/icons/icon-192x192.png', minSize: 15000 },
      { path: '/icons/icon-512x512.png', minSize: 40000 },
      { path: '/icons/icon-maskable-512x512.png', minSize: 30000 },
      { path: '/icons/apple-touch-icon.png', minSize: 15000 },
      { path: '/favicon.png', minSize: 500 },
    ];

    let allIconsValid = true;
    for (const icon of iconsToTest) {
      const res = await page.goto(`${BASE_URL}${icon.path}`);
      const body = await res.body();
      const statusOk = res.status() === 200;
      const sizeOk = body.length >= icon.minSize;
      if (statusOk && sizeOk) {
        console.log(`  ✓ ${icon.path}: 200 OK (${body.length} bytes)`);
      } else {
        console.error(`  ❌ ${icon.path}: status=${res.status()}, size=${body.length} bytes`);
        allIconsValid = false;
      }
    }
    results.icons = allIconsValid;

    // -------------------------------------------------------------
    // TEST 3: HTML Head PWA Metadata
    // -------------------------------------------------------------
    console.log('\n--- TEST 3: HTML Head PWA Metadata Links ---');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

    const htmlMeta = await page.evaluate(() => {
      const manifestLink = document.querySelector('link[rel="manifest"]');
      const appleTouchLink = document.querySelector('link[rel="apple-touch-icon"]');
      const themeColorMeta = document.querySelector('meta[name="theme-color"]');
      const appleCapableMeta = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
      return {
        manifestHref: manifestLink ? manifestLink.getAttribute('href') : null,
        appleTouchHref: appleTouchLink ? appleTouchLink.getAttribute('href') : null,
        themeColor: themeColorMeta ? themeColorMeta.getAttribute('content') : null,
        appleCapable: appleCapableMeta ? appleCapableMeta.getAttribute('content') : null,
      };
    });

    console.log(`  ✓ Manifest Link in HTML: ${htmlMeta.manifestHref}`);
    console.log(`  ✓ Apple Touch Icon in HTML: ${htmlMeta.appleTouchHref}`);
    console.log(`  ✓ Theme Color Meta: ${htmlMeta.themeColor}`);
    console.log(`  ✓ Apple Web App Capable: ${htmlMeta.appleCapable}`);

    if (
      htmlMeta.manifestHref &&
      htmlMeta.appleTouchHref &&
      htmlMeta.themeColor === '#0A0A16' &&
      htmlMeta.appleCapable === 'yes'
    ) {
      results.htmlMeta = true;
    }

    // -------------------------------------------------------------
    // TEST 4: Service Worker Registration & Scope
    // -------------------------------------------------------------
    console.log('\n--- TEST 4: Service Worker Registration & Scope ---');
    // Wait for client-side hydration and SW registration
    await page.waitForTimeout(1500);

    const swInfo = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) {
        return { supported: false, count: 0 };
      }

      // Wait for SW ready if possible
      try {
        await Promise.race([
          navigator.serviceWorker.ready,
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000)),
        ]);
      } catch (e) {}

      const registrations = await navigator.serviceWorker.getRegistrations();
      if (registrations.length === 0) {
        return { supported: true, registered: false, count: 0 };
      }
      const reg = registrations[0];
      return {
        supported: true,
        registered: true,
        scope: reg.scope,
        activeState: reg.active ? reg.active.state : null,
        scriptURL: reg.active ? reg.active.scriptURL : (reg.installing ? reg.installing.scriptURL : null),
        count: registrations.length,
      };
    });

    console.log(`  ✓ Service Worker Supported: ${swInfo.supported}`);
    console.log(`  ✓ Registered Count: ${swInfo.count} (Strict single service worker: ${swInfo.count === 1})`);
    console.log(`  ✓ Service Worker Scope: ${swInfo.scope}`);
    console.log(`  ✓ Script URL: ${swInfo.scriptURL}`);
    console.log(`  ✓ State: ${swInfo.activeState}`);

    if (swInfo.registered && swInfo.count === 1 && swInfo.scope.endsWith('/')) {
      results.serviceWorkerRegistration = true;
    }

    // -------------------------------------------------------------
    // TEST 5: Cache Storage & Application Shell Precache
    // -------------------------------------------------------------
    console.log('\n--- TEST 5: Cache Storage & Shell Precache ---');
    const cacheInfo = await page.evaluate(async () => {
      if (!('caches' in window)) return { supported: false };
      const keys = await caches.keys();
      const shellCache = keys.find((k) => k.startsWith('asteria-shell-'));
      if (!shellCache) return { supported: true, keys, precached: false };

      const cache = await caches.open(shellCache);
      const cachedUrls = (await cache.keys()).map((req) => new URL(req.url).pathname);

      return {
        supported: true,
        keys,
        shellCacheName: shellCache,
        cachedUrls,
        hasOfflinePage: cachedUrls.includes('/offline'),
        hasManifest: cachedUrls.includes('/manifest.webmanifest'),
        hasIcon: cachedUrls.includes('/icon.svg'),
      };
    });

    console.log(`  ✓ Active Cache Keys:`, cacheInfo.keys);
    console.log(`  ✓ Shell Cache Precached Entries: ${cacheInfo.cachedUrls ? cacheInfo.cachedUrls.length : 0}`);
    console.log(`  ✓ Has /offline in Precache: ${cacheInfo.hasOfflinePage}`);
    console.log(`  ✓ Has /manifest.webmanifest in Precache: ${cacheInfo.hasManifest}`);
    console.log(`  ✓ Has /icon.svg in Precache: ${cacheInfo.hasIcon}`);

    if (cacheInfo.hasOfflinePage && cacheInfo.hasManifest && cacheInfo.hasIcon) {
      results.cacheStoragePrecache = true;
    }

    // -------------------------------------------------------------
    // TEST 6: Security & Privacy Cache Bypass (Admin & Multiplayer)
    // -------------------------------------------------------------
    console.log('\n--- TEST 6: Sensitive API Cache Bypass ---');
    const bypassCheck = await page.evaluate(async () => {
      // Simulate attempting to fetch room or admin endpoint
      try {
        await fetch('/api/rooms/TESTCODE', { method: 'GET' });
      } catch (e) {}

      const keys = await caches.keys();
      let leakedInCache = false;
      for (const k of keys) {
        const c = await caches.open(k);
        const entries = await c.keys();
        for (const req of entries) {
          if (req.url.includes('/api/rooms') || req.url.includes('/api/admin')) {
            leakedInCache = true;
          }
        }
      }
      return { leakedInCache };
    });

    console.log(`  ✓ Sensitive API Leaked in Cache Storage: ${bypassCheck.leakedInCache}`);
    if (!bypassCheck.leakedInCache) {
      results.securityBypass = true;
    }

    // -------------------------------------------------------------
    // TEST 7: Dedicated Offline Fallback Screen
    // -------------------------------------------------------------
    console.log('\n--- TEST 7: Dedicated Offline Fallback Screen (/offline) ---');
    await page.goto(`${BASE_URL}/offline`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);

    const offlinePageInfo = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const bodyText = document.body.innerText;
      const retryBtn = document.querySelector('button');
      const localPlayLink = document.querySelector('a[href="/games/truth-or-dare"]');

      return {
        hasRequiredHeading: h1 ? h1.innerText.includes('Asteria is currently offline. Please reconnect to continue playing.') : false,
        h1Text: h1 ? h1.innerText : '',
        hasRetryBtn: !!retryBtn,
        hasLocalPlayLink: !!localPlayLink,
        explainsMultiplayerOffline: bodyText.includes('Online multiplayer rooms and live synchronized screens require internet access'),
      };
    });

    console.log(`  ✓ Headline Matches Required Spec: ${offlinePageInfo.hasRequiredHeading}`);
    console.log(`  ✓ "Try Reconnecting" CTA Present: ${offlinePageInfo.hasRetryBtn}`);
    console.log(`  ✓ Pass & Play Offline Game Link: ${offlinePageInfo.hasLocalPlayLink}`);
    console.log(`  ✓ Multiplayer Offline Disclaimer Present: ${offlinePageInfo.explainsMultiplayerOffline}`);

    const offlineShot = path.join(SCREENSHOT_DIR, 'offline-fallback-screen.png');
    await page.screenshot({ path: offlineShot });
    console.log(`  ✓ Screenshot saved: ${path.basename(offlineShot)}`);

    if (
      offlinePageInfo.hasRequiredHeading &&
      offlinePageInfo.hasRetryBtn &&
      offlinePageInfo.hasLocalPlayLink &&
      offlinePageInfo.explainsMultiplayerOffline
    ) {
      results.offlineFallbackScreen = true;
    }

    // -------------------------------------------------------------
    // TEST 8: Live Offline Network Interception Simulation
    // -------------------------------------------------------------
    console.log('\n--- TEST 8: Live Offline Network Interception Simulation ---');
    try {
      await context.setOffline(true);
      // Navigate to an uncached URL while disconnected
      await page.goto(`${BASE_URL}/uncached-offline-test-route`, { waitUntil: 'domcontentloaded' }).catch(() => {});
      await page.waitForTimeout(500);

      const interceptedHeading = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        return h1 ? h1.innerText : '';
      });

      const successfullyFellBack = interceptedHeading.includes('Asteria is currently offline. Please reconnect to continue playing.');
      console.log(`  ✓ Service Worker Served /offline on Disconnect: ${successfullyFellBack}`);
      if (successfullyFellBack) {
        results.offlineNetworkSimulation = true;
      }
    } catch (e) {
      console.log('  ⚠️ Offline simulation note:', e.message);
    } finally {
      await context.setOffline(false);
    }

    // -------------------------------------------------------------
    // TEST 9: iOS Safari Step-by-Step Install Modal
    // -------------------------------------------------------------
    console.log('\n--- TEST 9: iOS Safari Add to Home Screen Instructions ---');
    await context.close();

    // Create an iOS Safari Context
    const iosContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
    });
    const iosPage = await iosContext.newPage();
    await iosPage.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await iosPage.waitForTimeout(400);

    // Open mobile menu drawer
    const menuBtn = await iosPage.$('button[aria-label="Open navigation menu"]');
    if (menuBtn) {
      await menuBtn.click();
      await iosPage.waitForTimeout(300);

      // Click "Install Asteria App" button
      const installBtn = await iosPage.$('button:has-text("Install Asteria App")');
      if (installBtn) {
        await installBtn.click();
        await iosPage.waitForTimeout(300);

        const iosModalInfo = await iosPage.evaluate(() => {
          const dialog = document.querySelector('div[role="dialog"][aria-labelledby="ios-install-title"]');
          if (!dialog) return { present: false };
          const text = dialog.innerText;
          return {
            present: true,
            hasShareStep: text.includes('Safari Share button'),
            hasAddStep: text.includes('Add to Home Screen'),
            hasConfirmStep: text.includes('Tap "Add" in Top-Right'),
          };
        });

        console.log(`  ✓ iOS Add to Home Screen Modal Portaled: ${iosModalInfo.present}`);
        console.log(`  ✓ Explains Safari Share button: ${iosModalInfo.hasShareStep}`);
        console.log(`  ✓ Explains "Add to Home Screen" option: ${iosModalInfo.hasAddStep}`);
        console.log(`  ✓ Explains "Add" confirmation: ${iosModalInfo.hasConfirmStep}`);

        const iosShot = path.join(SCREENSHOT_DIR, 'ios-install-instructions-modal.png');
        await iosPage.screenshot({ path: iosShot });
        console.log(`  ✓ Screenshot saved: ${path.basename(iosShot)}`);

        if (iosModalInfo.present && iosModalInfo.hasShareStep && iosModalInfo.hasAddStep && iosModalInfo.hasConfirmStep) {
          results.iosSupportModal = true;
        }
      }
    }
    await iosContext.close();

    // -------------------------------------------------------------
    // SUMMARY REPORT
    // -------------------------------------------------------------
    console.log('\n======================================================');
    console.log('🏆 PWA VALIDATION RESULTS SUMMARY:');
    console.log(`  1. Web App Manifest Spec:       ${results.manifest ? 'PASS ✓' : 'FAIL ❌'}`);
    console.log(`  2. Icon Assets Integrity:       ${results.icons ? 'PASS ✓' : 'FAIL ❌'}`);
    console.log(`  3. HTML Head PWA Metadata:      ${results.htmlMeta ? 'PASS ✓' : 'FAIL ❌'}`);
    console.log(`  4. Service Worker Registration: ${results.serviceWorkerRegistration ? 'PASS ✓' : 'FAIL ❌'}`);
    console.log(`  5. App Shell Precache:          ${results.cacheStoragePrecache ? 'PASS ✓' : 'FAIL ❌'}`);
    console.log(`  6. Sensitive API Cache Bypass:  ${results.securityBypass ? 'PASS ✓' : 'FAIL ❌'}`);
    console.log(`  7. Offline Fallback Screen:     ${results.offlineFallbackScreen ? 'PASS ✓' : 'FAIL ❌'}`);
    console.log(`  8. Live Offline SW Intercept:   ${results.offlineNetworkSimulation ? 'PASS ✓' : 'FAIL ❌'}`);
    console.log(`  9. iOS Safari Modal Guidance:   ${results.iosSupportModal ? 'PASS ✓' : 'FAIL ❌'}`);
    console.log('======================================================\n');

    const allPassed = Object.values(results).every(Boolean);
    console.log(`FINAL RESULT: ${allPassed ? 'ALL PWA CHECKS PASSED (100%)' : 'SOME CHECKS FAILED'}`);

    fs.writeFileSync(
      path.join(__dirname, '../../project-docs/19-pwa/pwa-validation-results.json'),
      JSON.stringify(results, null, 2)
    );

    return results;
  } finally {
    await browser.close();
  }
}

runPWAValidation().catch(console.error);

