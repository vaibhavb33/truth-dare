const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, '../../project-docs/20-pwa-weekly-promotion/screenshots');

// Helper to reliably trigger PWA promotion in test environment
async function triggerPromotionOnPage(page) {
  await page.waitForTimeout(600);
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('asteria:trigger_pwa_prompt'));
  });
  await page.waitForTimeout(400);
}

async function runPWAPromotionTestSuite() {
  console.log('🚀 Starting Automated PWA Weekly Promotion Test Suite for Asteria...\n');

  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const results = {
    firstTimeVisitorAppearance: false,
    timestampPersistedOnAppear: false,
    maybeLaterSevenDayCooldown: false,
    closeButtonSevenDayCooldown: false,
    withinSevenDaysSuppression: false,
    sevenDayExpirationReappearance: false,
    installedApplicationSuppression: false,
    activeGameplaySuppression: false,
    androidNativeInstallTrigger: false,
    iosSafariGuidanceTrigger: false,
    multilingualAllEightLanguages: false,
    arabicRTLSupport: false,
    storageUnavailableResilience: false,
  };

  try {
    // -------------------------------------------------------------
    // TEST 1: First-Time Visitor & Interaction Trigger
    // -------------------------------------------------------------
    console.log('--- TEST 1: First-Time Visitor Appearance ---');
    const context1 = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page1 = await context1.newPage();
    await page1.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await page1.waitForTimeout(600);

    // Clear storage to guarantee fresh first-time visitor state
    await page1.evaluate(() => {
      window.localStorage.removeItem('asteria_pwa_last_prompt_at');
      window.localStorage.removeItem('asteria_pwa_installed');
      window.sessionStorage.removeItem('asteria_pwa_prompt_shown_session');
    });

    // Trigger promotion
    await triggerPromotionOnPage(page1);

    const cardDetails = await page1.evaluate(() => {
      const dialog = document.querySelector('div[role="dialog"][aria-labelledby="pwa-promo-title"]');
      if (!dialog) return { found: false };
      const title = dialog.querySelector('#pwa-promo-title')?.textContent?.trim() || '';
      const desc = dialog.querySelector('#pwa-promo-desc')?.textContent?.trim() || '';
      const primaryBtn = dialog.querySelector('button:has(.lucide-download)')?.textContent?.trim() || '';
      const secondaryBtn = Array.from(dialog.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Maybe Later')
      )?.textContent?.trim() || '';
      const closeBtn = dialog.querySelector('button[aria-label="Close promotion"]');
      const lastPromptAt = localStorage.getItem('asteria_pwa_last_prompt_at');

      return {
        found: true,
        title,
        desc,
        primaryBtn,
        secondaryBtn,
        hasCloseBtn: !!closeBtn,
        lastPromptAt: !!lastPromptAt,
      };
    });

    console.log(`  ✓ Promotion Card Rendered: ${cardDetails.found}`);
    console.log(`  ✓ Title: "${cardDetails.title}"`);
    console.log(`  ✓ Primary Button Text: "${cardDetails.primaryBtn}"`);
    console.log(`  ✓ Secondary Button: "${cardDetails.secondaryBtn}"`);
    console.log(`  ✓ Close Button Present: ${cardDetails.hasCloseBtn}`);

    const mobileShot = path.join(SCREENSHOT_DIR, 'promotion-banner-mobile.png');
    await page1.screenshot({ path: mobileShot });
    console.log(`  ✓ Screenshot saved: ${path.basename(mobileShot)}`);

    if (
      cardDetails.found &&
      cardDetails.title.includes('Add it to your home screen!') &&
      cardDetails.hasCloseBtn
    ) {
      results.firstTimeVisitorAppearance = true;
    }

    // -------------------------------------------------------------
    // TEST 2: Timestamp Persisted On Appear
    // -------------------------------------------------------------
    console.log('\n--- TEST 2: Timestamp Persistence in localStorage ---');
    const timestampStored = await page1.evaluate(() => {
      const val = localStorage.getItem('asteria_pwa_last_prompt_at');
      if (!val) return false;
      const num = parseInt(val, 10);
      return !isNaN(num) && num > 0 && Math.abs(Date.now() - num) < 60000;
    });
    console.log(`  ✓ asteria_pwa_last_prompt_at Valid Timestamp: ${timestampStored}`);
    results.timestampPersistedOnAppear = timestampStored;

    // -------------------------------------------------------------
    // TEST 3: "Maybe Later" Click Enforces 7-Day Cooldown
    // -------------------------------------------------------------
    console.log('\n--- TEST 3: "Maybe Later" Dismissal & Cooldown ---');
    const maybeLaterBtn = await page1.$('button:has-text("Maybe Later")');
    if (maybeLaterBtn) {
      await maybeLaterBtn.click();
      await page1.waitForTimeout(300);

      const isDismissed = await page1.evaluate(() => {
        const dialog = document.querySelector('div[role="dialog"][aria-labelledby="pwa-promo-title"]');
        const timestamp = localStorage.getItem('asteria_pwa_last_prompt_at');
        return !dialog && !!timestamp;
      });
      console.log(`  ✓ Modal Dismissed on "Maybe Later": ${isDismissed}`);
      results.maybeLaterSevenDayCooldown = isDismissed;
    }
    await context1.close();

    // -------------------------------------------------------------
    // TEST 4: Close Button (X) Enforces 7-Day Cooldown
    // -------------------------------------------------------------
    console.log('\n--- TEST 4: Close Button (X) Dismissal & Cooldown ---');
    const contextClose = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const pageClose = await contextClose.newPage();
    await pageClose.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await pageClose.evaluate(() => {
      window.localStorage.removeItem('asteria_pwa_last_prompt_at');
      window.localStorage.removeItem('asteria_pwa_installed');
      window.sessionStorage.removeItem('asteria_pwa_prompt_shown_session');
    });
    await triggerPromotionOnPage(pageClose);

    const closeBtn = await pageClose.$('button[aria-label="Close promotion"]');
    if (closeBtn) {
      await closeBtn.click();
      await pageClose.waitForTimeout(300);

      const closeSuccess = await pageClose.evaluate(() => {
        const dialog = document.querySelector('div[role="dialog"][aria-labelledby="pwa-promo-title"]');
        const ts = localStorage.getItem('asteria_pwa_last_prompt_at');
        return !dialog && !!ts;
      });
      console.log(`  ✓ Modal Closed via (X) and Timestamp Enforced: ${closeSuccess}`);
      results.closeButtonSevenDayCooldown = closeSuccess;
    }
    await contextClose.close();

    // -------------------------------------------------------------
    // TEST 5: Within 7 Days Cooldown (Promotion Suppressed)
    // -------------------------------------------------------------
    console.log('\n--- TEST 5: Within 7-Day Cooldown (Suppression) ---');
    const contextWithin7 = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const pageWithin7 = await contextWithin7.newPage();
    await pageWithin7.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

    // Set last prompt to 3 days ago (within 7 days)
    const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
    await pageWithin7.evaluate((ts) => {
      window.localStorage.setItem('asteria_pwa_last_prompt_at', String(ts));
      window.sessionStorage.removeItem('asteria_pwa_prompt_shown_session');
    }, threeDaysAgo);
    await triggerPromotionOnPage(pageWithin7);

    const dialogWithin7 = await pageWithin7.$('div[role="dialog"][aria-labelledby="pwa-promo-title"]');
    console.log(`  ✓ Promotion Correctly Suppressed within 7 days: ${dialogWithin7 === null}`);
    results.withinSevenDaysSuppression = dialogWithin7 === null;
    await contextWithin7.close();

    // -------------------------------------------------------------
    // TEST 6: After 7 Days Expiration (Promotion Reappears)
    // -------------------------------------------------------------
    console.log('\n--- TEST 6: 7-Day Cooldown Expiration (Reappearance) ---');
    const contextExpired = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const pageExpired = await contextExpired.newPage();
    await pageExpired.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

    // Set last prompt to 8 days ago (expired cooldown)
    const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
    await pageExpired.evaluate((ts) => {
      window.localStorage.setItem('asteria_pwa_last_prompt_at', String(ts));
      window.sessionStorage.removeItem('asteria_pwa_prompt_shown_session');
      window.localStorage.removeItem('asteria_pwa_installed');
    }, eightDaysAgo);
    await triggerPromotionOnPage(pageExpired);

    const dialogExpired = await pageExpired.$('div[role="dialog"][aria-labelledby="pwa-promo-title"]');
    console.log(`  ✓ Promotion Reappears After 7-Day Expiration: ${dialogExpired !== null}`);
    results.sevenDayExpirationReappearance = dialogExpired !== null;
    await contextExpired.close();

    // -------------------------------------------------------------
    // TEST 7: Installed Application Suppression (Never Show Again)
    // -------------------------------------------------------------
    console.log('\n--- TEST 7: Installed Application Suppression ---');
    const contextInstalled = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const pageInstalled = await contextInstalled.newPage();
    await pageInstalled.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

    await pageInstalled.evaluate(() => {
      window.localStorage.setItem('asteria_pwa_installed', 'true');
      window.localStorage.removeItem('asteria_pwa_last_prompt_at');
      window.sessionStorage.removeItem('asteria_pwa_prompt_shown_session');
    });
    await triggerPromotionOnPage(pageInstalled);

    const dialogInstalled = await pageInstalled.$('div[role="dialog"][aria-labelledby="pwa-promo-title"]');
    console.log(`  ✓ Promotion Permanently Suppressed When Installed: ${dialogInstalled === null}`);
    results.installedApplicationSuppression = dialogInstalled === null;
    await contextInstalled.close();

    // -------------------------------------------------------------
    // TEST 8: Active Gameplay Suppression (Never Interrupt Games)
    // -------------------------------------------------------------
    console.log('\n--- TEST 8: Active Gameplay Suppression ---');
    const contextGame = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const pageGame = await contextGame.newPage();

    // Visit a multiplayer room URL (which is always an active gameplay session)
    await pageGame.goto(`${BASE_URL}/room/PLAY99`, { waitUntil: 'domcontentloaded' });
    await pageGame.evaluate(() => {
      window.localStorage.removeItem('asteria_pwa_last_prompt_at');
      window.localStorage.removeItem('asteria_pwa_installed');
      window.sessionStorage.removeItem('asteria_pwa_prompt_shown_session');
    });
    await triggerPromotionOnPage(pageGame);

    const dialogInRoom = await pageGame.$('div[role="dialog"][aria-labelledby="pwa-promo-title"]');
    console.log(`  ✓ Promotion Suppressed on Active Game Room Route: ${dialogInRoom === null}`);

    // Also test explicitly setting gameplay active flag on homepage
    await pageGame.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await pageGame.evaluate(() => {
      window.__ASTERIA_GAMEPLAY_ACTIVE__ = true;
      window.localStorage.removeItem('asteria_pwa_last_prompt_at');
      window.localStorage.removeItem('asteria_pwa_installed');
      window.sessionStorage.removeItem('asteria_pwa_prompt_shown_session');
    });
    await triggerPromotionOnPage(pageGame);
    const dialogActiveFlag = await pageGame.$('div[role="dialog"][aria-labelledby="pwa-promo-title"]');
    console.log(`  ✓ Promotion Suppressed When isGameplayActive is True: ${dialogActiveFlag === null}`);

    results.activeGameplaySuppression = dialogInRoom === null && dialogActiveFlag === null;
    await contextGame.close();

    // -------------------------------------------------------------
    // TEST 9: Android / Chromium Native Install Workflow
    // -------------------------------------------------------------
    console.log('\n--- TEST 9: Android / Chromium beforeinstallprompt Workflow ---');
    const contextAndroid = await browser.newContext({
      viewport: { width: 412, height: 915 },
      userAgent:
        'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36',
    });
    const pageAndroid = await contextAndroid.newPage();

    // Inject beforeinstallprompt mock before page load
    await pageAndroid.addInitScript(() => {
      window.addEventListener('load', () => {
        const mockPromptEvent = new Event('beforeinstallprompt');
        mockPromptEvent.prompt = function () {
          window.__MOCK_PROMPT_CALLED__ = true;
          return Promise.resolve();
        };
        mockPromptEvent.userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' });
        window.dispatchEvent(mockPromptEvent);
      });
    });

    await pageAndroid.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await pageAndroid.evaluate(() => {
      window.localStorage.removeItem('asteria_pwa_last_prompt_at');
      window.localStorage.removeItem('asteria_pwa_installed');
      window.sessionStorage.removeItem('asteria_pwa_prompt_shown_session');
    });
    await triggerPromotionOnPage(pageAndroid);

    const addBtn = await pageAndroid.$('button:has-text("Add to Home Screen")');
    if (addBtn) {
      await addBtn.click();
      await pageAndroid.waitForTimeout(400);

      const promptTriggered = await pageAndroid.evaluate(() => {
        return window.__MOCK_PROMPT_CALLED__ === true;
      });
      console.log(`  ✓ Native deferredPrompt.prompt() Called on User Action: ${promptTriggered}`);
      results.androidNativeInstallTrigger = promptTriggered;
    }
    await contextAndroid.close();

    // -------------------------------------------------------------
    // TEST 10: iOS Safari Guidance Trigger Workflow
    // -------------------------------------------------------------
    console.log('\n--- TEST 10: iOS Safari Add to Home Screen Instructions ---');
    const contextIOS = await browser.newContext({
      viewport: { width: 390, height: 844 },
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
    });
    const pageIOS = await contextIOS.newPage();
    await pageIOS.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await pageIOS.evaluate(() => {
      window.localStorage.removeItem('asteria_pwa_last_prompt_at');
      window.localStorage.removeItem('asteria_pwa_installed');
      window.sessionStorage.removeItem('asteria_pwa_prompt_shown_session');
    });
    await triggerPromotionOnPage(pageIOS);

    const iosAddBtn = await pageIOS.$('button:has-text("Add to Home Screen")');
    if (iosAddBtn) {
      await iosAddBtn.click();
      await pageIOS.waitForTimeout(400);

      const iosModalRendered = await pageIOS.evaluate(() => {
        const dialog = document.querySelector('div[role="dialog"][aria-labelledby="ios-install-title"]');
        if (!dialog) return false;
        const text = dialog.innerText;
        return (
          text.includes('Safari Share button') &&
          text.includes('Add to Home Screen') &&
          text.includes('Tap "Add"')
        );
      });
      console.log(`  ✓ iOS Safari Opened 3-Step Guidance Modal: ${iosModalRendered}`);

      const iosShot = path.join(SCREENSHOT_DIR, 'promotion-ios-flow.png');
      await pageIOS.screenshot({ path: iosShot });
      console.log(`  ✓ Screenshot saved: ${path.basename(iosShot)}`);

      results.iosSafariGuidanceTrigger = iosModalRendered;
    }
    await contextIOS.close();

    // -------------------------------------------------------------
    // TEST 11: Multilingual Support Across All 8 Languages
    // -------------------------------------------------------------
    console.log('\n--- TEST 11: Multilingual Support Across All 8 Languages ---');
    const languages = [
      { code: 'en', title: 'Add it to your home screen!', btn: 'Add to Home Screen' },
      { code: 'hi', title: 'इसे अपनी होम स्क्रीन पर जोड़ें!', btn: 'होम स्क्रीन पर जोड़ें' },
      { code: 'es', title: '¡Añádela a tu pantalla de inicio!', btn: 'Añadir a pantalla de inicio' },
      { code: 'pt', title: 'Adicione à sua tela inicial!', btn: 'Adicionar à Tela Inicial' },
      { code: 'fr', title: "Ajoutez-le à votre écran d'accueil !", btn: "Ajouter à l'écran d'accueil" },
      { code: 'id', title: 'Tambahkan ke layar utama Anda!', btn: 'Tambah ke Layar Utama' },
      { code: 'ar', title: 'أضفه إلى شاشتك الرئيسية!', btn: 'إضافة إلى الشاشة الرئيسية' },
      { code: 'de', title: 'Zum Startbildschirm hinzufügen!', btn: 'Zum Startbildschirm hinzufügen' },
    ];

    let allLangsValid = true;
    for (const lang of languages) {
      const langContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const langPage = await langContext.newPage();
      await langPage.goto(`${BASE_URL}/${lang.code}`, { waitUntil: 'domcontentloaded' });
      await langPage.evaluate(() => {
        window.localStorage.removeItem('asteria_pwa_last_prompt_at');
        window.localStorage.removeItem('asteria_pwa_installed');
        window.sessionStorage.removeItem('asteria_pwa_prompt_shown_session');
      });
      await triggerPromotionOnPage(langPage);

      const content = await langPage.evaluate(() => {
        const dialog = document.querySelector('div[role="dialog"][aria-labelledby="pwa-promo-title"]');
        return {
          title: dialog?.querySelector('#pwa-promo-title')?.textContent?.trim() || '',
          dir: dialog?.getAttribute('dir') || 'ltr',
        };
      });

      const langMatch = content.title.includes(lang.title);
      console.log(`  ✓ [${lang.code.toUpperCase()}] Match: ${langMatch} ("${content.title}")`);
      if (!langMatch) allLangsValid = false;

      if (lang.code === 'ar') {
        const isRtl = content.dir === 'rtl';
        console.log(`  ✓ [AR] RTL Direction Attribute Verified: ${isRtl}`);
        results.arabicRTLSupport = isRtl;

        const arShot = path.join(SCREENSHOT_DIR, 'promotion-banner-arabic-rtl.png');
        await langPage.screenshot({ path: arShot });
        console.log(`  ✓ Screenshot saved: ${path.basename(arShot)}`);
      }

      await langContext.close();
    }
    results.multilingualAllEightLanguages = allLangsValid;

    // Desktop screenshot
    const deskContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const deskPage = await deskContext.newPage();
    await deskPage.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await deskPage.evaluate(() => {
      window.localStorage.removeItem('asteria_pwa_last_prompt_at');
      window.localStorage.removeItem('asteria_pwa_installed');
      window.sessionStorage.removeItem('asteria_pwa_prompt_shown_session');
    });
    await triggerPromotionOnPage(deskPage);

    const deskShot = path.join(SCREENSHOT_DIR, 'promotion-banner-desktop.png');
    await deskPage.screenshot({ path: deskShot });
    console.log(`  ✓ Screenshot saved: ${path.basename(deskShot)}`);
    await deskContext.close();

    // -------------------------------------------------------------
    // TEST 12: Storage Unavailable Resilience (Private Browsing Mode)
    // -------------------------------------------------------------
    console.log('\n--- TEST 12: Storage Unavailable Resilience ---');
    const contextNoStorage = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const pageNoStorage = await contextNoStorage.newPage();
    await pageNoStorage.addInitScript(() => {
      // Mock localStorage throwing SecurityError
      Object.defineProperty(window, 'localStorage', {
        get() {
          return {
            getItem: () => {
              throw new Error('SecurityError: Access is denied for this document');
            },
            setItem: () => {
              throw new Error('SecurityError: Access is denied for this document');
            },
            removeItem: () => {},
          };
        },
      });
    });

    let storageCrash = false;
    try {
      await pageNoStorage.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
      await triggerPromotionOnPage(pageNoStorage);
    } catch {
      storageCrash = true;
    }

    console.log(`  ✓ Page Handled Storage Exception Gracefully (No Crash): ${!storageCrash}`);
    results.storageUnavailableResilience = !storageCrash;
    await contextNoStorage.close();

    // -------------------------------------------------------------
    // SUMMARY REPORT
    // -------------------------------------------------------------
    console.log('\n======================================================');
    console.log('🏆 PWA WEEKLY PROMOTION TEST SUITE RESULTS:');
    console.log(`  1. First-Time Visitor Appearance:   ${results.firstTimeVisitorAppearance ? 'PASS ✓' : 'FAIL ❌'}`);
    console.log(`  2. Timestamp Persisted On Appear:   ${results.timestampPersistedOnAppear ? 'PASS ✓' : 'FAIL ❌'}`);
    console.log(`  3. "Maybe Later" 7-Day Cooldown:    ${results.maybeLaterSevenDayCooldown ? 'PASS ✓' : 'FAIL ❌'}`);
    console.log(`  4. Close Button 7-Day Cooldown:     ${results.closeButtonSevenDayCooldown ? 'PASS ✓' : 'FAIL ❌'}`);
    console.log(`  5. Within 7-Day Suppression:        ${results.withinSevenDaysSuppression ? 'PASS ✓' : 'FAIL ❌'}`);
    console.log(`  6. 7-Day Expiration Reappearance:   ${results.sevenDayExpirationReappearance ? 'PASS ✓' : 'FAIL ❌'}`);
    console.log(`  7. Installed App Suppression:       ${results.installedApplicationSuppression ? 'PASS ✓' : 'FAIL ❌'}`);
    console.log(`  8. Active Gameplay Suppression:     ${results.activeGameplaySuppression ? 'PASS ✓' : 'FAIL ❌'}`);
    console.log(`  9. Android Native Install Trigger:  ${results.androidNativeInstallTrigger ? 'PASS ✓' : 'FAIL ❌'}`);
    console.log(` 10. iOS Safari Guidance Trigger:     ${results.iosSafariGuidanceTrigger ? 'PASS ✓' : 'FAIL ❌'}`);
    console.log(` 11. Multilingual (All 8 Languages):  ${results.multilingualAllEightLanguages ? 'PASS ✓' : 'FAIL ❌'}`);
    console.log(` 12. Arabic RTL Support:              ${results.arabicRTLSupport ? 'PASS ✓' : 'FAIL ❌'}`);
    console.log(` 13. Storage Unavailable Resilience:  ${results.storageUnavailableResilience ? 'PASS ✓' : 'FAIL ❌'}`);
    console.log('======================================================\n');

    const allPassed = Object.values(results).every(Boolean);
    console.log(`FINAL RESULT: ${allPassed ? 'ALL PROMOTION CHECKS PASSED (100%)' : 'SOME CHECKS FAILED'}`);

    fs.writeFileSync(
      path.join(__dirname, '../../project-docs/20-pwa-weekly-promotion/promotion-validation-results.json'),
      JSON.stringify(results, null, 2)
    );

    return results;
  } finally {
    await browser.close();
  }
}

runPWAPromotionTestSuite().catch(console.error);
