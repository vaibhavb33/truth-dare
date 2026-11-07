const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

const VIEWPORTS = [
  { name: '320px (iPhone SE 1)', width: 320, height: 568 },
  { name: '360px (Android Compact)', width: 360, height: 800 },
  { name: '375px (iPhone 8 / SE 3)', width: 375, height: 667 },
  { name: '390px (iPhone 14/15)', width: 390, height: 844 },
  { name: '414px (iPhone XR/Plus)', width: 414, height: 896 },
  { name: '430px (iPhone 15 Pro Max)', width: 430, height: 932 },
  { name: '768px (iPad Mini)', width: 768, height: 1024 },
  { name: '1024px (iPad Pro / Laptop)', width: 1024, height: 768 },
  { name: '1280px (MacBook Desktop)', width: 1280, height: 800 },
  { name: '1440px (QHD Monitor)', width: 1440, height: 900 },
  { name: '1920px (Full HD 1080p)', width: 1920, height: 1080 },
];

const PAGES_TO_AUDIT = [
  '/',
  '/en/games',
  '/en/games/truth-or-dare',
  '/en/games/spin-the-bottle',
  '/en/games/never-have-i-ever',
  '/en/games/would-you-rather',
  '/en/games/most-likely-to',
  '/en/games/this-or-that',
  '/custom',
  '/questions',
  '/about',
  '/privacy',
  '/terms',
];

async function runComprehensiveFinalQA() {
  console.log('🚀 Asteria Master QA & Regression Test Suite Starting...\n');
  const results = {
    viewports: [],
    adminRemoval: null,
    journeys: {},
    pwa: null,
    allPassed: true,
  };

  const browser = await chromium.launch({ channel: 'chrome', headless: true });

  try {
    // ========================================================
    // 1. RESPONSIVE VIEWPORT AUDIT (11 VIEWPORTS)
    // ========================================================
    console.log('📐 [1/7] Testing 11 Viewports Across Mobile, Tablet & Desktop...');
    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await context.newPage();

      let vpPassed = true;
      const issues = [];

      for (const route of PAGES_TO_AUDIT) {
        try {
          await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
          await page.waitForTimeout(300);

          const overflow = await page.evaluate(() => {
            const docWidth = document.documentElement.scrollWidth;
            const winWidth = window.innerWidth;
            const bodyWidth = document.body.scrollWidth;
            return {
              hasOverflow: docWidth > winWidth + 1 || bodyWidth > winWidth + 1,
              diff: Math.max(docWidth, bodyWidth) - winWidth,
            };
          });

          if (overflow.hasOverflow) {
            vpPassed = false;
            issues.push(`Route ${route}: overflow of ${overflow.diff}px`);
          }
        } catch (err) {
          vpPassed = false;
          issues.push(`Route ${route} load failed: ${err.message}`);
        }
      }

      console.log(`  ${vpPassed ? '✅' : '❌'} Viewport ${vp.name}: ${vpPassed ? '0 overflow issues' : issues.join(', ')}`);
      results.viewports.push({ viewport: vp.name, passed: vpPassed, issues });
      if (!vpPassed) results.allPassed = false;

      await context.close();
    }

    // ========================================================
    // 2. ADMIN PANEL REMOVAL VERIFICATION
    // ========================================================
    console.log('\n🔒 [2/7] Testing Admin Panel Complete Removal...');
    {
      const context = await browser.newContext();
      const page = await context.newPage();

      const adminRoutes = ['/admin', '/admin/login', '/admin/dashboard', '/api/admin'];
      const adminRemovalChecks = [];

      for (const route of adminRoutes) {
        const res = await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
        const status = res.status();
        const content = await page.content();
        const isNotFound = status === 404 || content.includes('404') || content.includes('This page could not be found');
        adminRemovalChecks.push({ route, status, isNotFound });
      }

      // Check header / navigation for admin links
      await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
      const adminNavCount = await page.locator('a[href*="/admin"]').count();

      const adminPassed = adminRemovalChecks.every((c) => c.isNotFound) && adminNavCount === 0;
      console.log(`  ${adminPassed ? '✅' : '❌'} Admin routes inaccessible (404) & 0 nav links: ${adminPassed ? 'CONFIRMED' : 'FAILED'}`);
      results.adminRemoval = { passed: adminPassed, checks: adminRemovalChecks, adminNavCount };
      if (!adminPassed) results.allPassed = false;

      await context.close();
    }

    // ========================================================
    // 3. COMBINED JOURNEYS A & B: LANGUAGE & VOICE
    // ========================================================
    console.log('\n🎙️ [3/7] Testing Combined Voice Journeys (Hindi Truth & English Dare)...');
    {
      const context = await browser.newContext();
      const page = await context.newPage();

      // Journey A: Hindi + Truth Voice
      await page.goto(`${BASE_URL}/hi/games/truth-or-dare`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(600);

      const hasDevanagari = await page.evaluate(() => {
        return /[\u0900-\u097F]/.test(document.body.innerText);
      });

      // Click start game if on setup screen
      const startBtnHi = page.locator('button:has-text("शुरू"), button:has-text("Start")').first();
      if (await startBtnHi.isVisible()) {
        await startBtnHi.click();
        await page.waitForTimeout(600);
      }

      // Check Truth card & voice controls
      const truthBtnHi = page.locator('button:has-text("सच"), button:has-text("TRUTH")').first();
      if (await truthBtnHi.isVisible()) {
        await truthBtnHi.click();
        await page.waitForTimeout(600);
      }

      const voiceControlsHi = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('button')).some((b) => {
          const t = (b.innerText || '').toLowerCase();
          const a = (b.getAttribute('aria-label') || '').toLowerCase();
          return t.includes('सुनें') || t.includes('listen') || a.includes('listen') || a.includes('सुनें');
        });
      });

      const journeyAPassed = hasDevanagari && voiceControlsHi;
      console.log(`  ${journeyAPassed ? '✅' : '❌'} Journey A (Hindi + Truth Voice): ${journeyAPassed ? 'PASSED' : 'FAILED'}`);
      results.journeys.journeyA = { passed: journeyAPassed, hasDevanagari, voiceControlsHi };
      if (!journeyAPassed) results.allPassed = false;

      // Journey B: English + Dare Voice
      await page.goto(`${BASE_URL}/en/games/truth-or-dare`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(600);

      const startBtnEn = page.locator('button:has-text("Start Game")').first();
      if (await startBtnEn.isVisible()) {
        await startBtnEn.click();
        await page.waitForTimeout(600);
      }

      const dareBtnEn = page.locator('button:has-text("DARE")').first();
      let journeyBPassed = false;
      if (await dareBtnEn.isVisible()) {
        await dareBtnEn.click();
        await page.waitForTimeout(600);
        const voiceControlsEn = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('button')).some((b) => {
            const t = (b.innerText || '').toLowerCase();
            const a = (b.getAttribute('aria-label') || '').toLowerCase();
            return t.includes('listen to dare') || a.includes('listen');
          });
        });
        journeyBPassed = voiceControlsEn;
      }

      console.log(`  ${journeyBPassed ? '✅' : '❌'} Journey B (English + Dare Voice): ${journeyBPassed ? 'PASSED' : 'FAILED'}`);
      results.journeys.journeyB = { passed: journeyBPassed };
      if (!journeyBPassed) results.allPassed = false;

      await context.close();
    }

    // ========================================================
    // 4. COMBINED JOURNEY C: MULTIPLAYER + HINDI QUESTIONS
    // ========================================================
    console.log('\n🌐 [4/7] Testing Journey C (Multiplayer + Hindi Questions)...');
    {
      const context = await browser.newContext();
      const page = await context.newPage();

      // Create Hindi room via API
      const createRes = await page.request.post(`${BASE_URL}/api/rooms/create`, {
        data: {
          gameId: 'truth-or-dare',
          categoryId: 'classic-party',
          hostName: 'HindiHost',
          language: 'hi',
        },
      });

      const createJson = await createRes.json();
      let journeyCPassed = createJson.success && createJson.room.language === 'hi';

      if (journeyCPassed) {
        // Guest joins
        const joinRes = await page.request.post(`${BASE_URL}/api/rooms/join`, {
          data: {
            roomCode: createJson.roomCode,
            playerName: 'GuestDost',
          },
        });
        const joinJson = await joinRes.json();
        journeyCPassed = joinJson.success && joinJson.room.players.length === 2;

        // Host flips card
        const flipRes = await page.request.post(`${BASE_URL}/api/rooms/action`, {
          data: {
            roomCode: createJson.roomCode,
            playerId: createJson.hostPlayerId,
            sessionToken: createJson.sessionToken,
            action: 'START_GAME',
          },
        });
        await page.request.post(`${BASE_URL}/api/rooms/action`, {
          data: {
            roomCode: createJson.roomCode,
            playerId: createJson.hostPlayerId,
            sessionToken: createJson.sessionToken,
            action: 'FLIP_CARD',
            payload: { type: 'truth' },
          },
        });

        const roomState = await (await page.request.get(`${BASE_URL}/api/rooms/${createJson.roomCode}`)).json();
        const prompt = roomState.room?.currentCard?.prompt || '';
        journeyCPassed = journeyCPassed && /[\u0900-\u097F]/.test(prompt);
      }

      console.log(`  ${journeyCPassed ? '✅' : '❌'} Journey C (Multiplayer + Hindi Questions): ${journeyCPassed ? 'PASSED' : 'FAILED'}`);
      results.journeys.journeyC = { passed: journeyCPassed };
      if (!journeyCPassed) results.allPassed = false;

      await context.close();
    }

    // ========================================================
    // 5. COMBINED JOURNEYS D & E: CUSTOM DECK + MULTIPLAYER + VOICE
    // ========================================================
    console.log('\n🎴 [5/7] Testing Journeys D & E (Custom Deck Multiplayer & Voice)...');
    {
      const context = await browser.newContext();
      const page = await context.newPage();

      const customSnapshot = {
        id: 'qa-deck-test-01',
        name: 'QA Custom Fun Pack',
        language: 'en',
        questions: [
          { id: 'cq-1', type: 'truth', prompt: 'What is the most ridiculous rumor you ever heard about yourself?' },
          { id: 'cq-2', type: 'dare', prompt: 'Talk like a robot until your next turn arrives.' },
        ],
      };

      // Create room with custom deck snapshot
      const createRes = await page.request.post(`${BASE_URL}/api/rooms/create`, {
        data: {
          gameId: 'truth-or-dare',
          categoryId: 'classic-party',
          hostName: 'CustomHost',
          language: 'en',
          customDeckSnapshot: customSnapshot,
        },
      });

      const createJson = await createRes.json();
      let journeyDPassed = createJson.success && createJson.room.customDeckSnapshot?.name === 'QA Custom Fun Pack';

      if (journeyDPassed) {
        // Host starts and flips card
        await page.request.post(`${BASE_URL}/api/rooms/action`, {
          data: {
            roomCode: createJson.roomCode,
            playerId: createJson.hostPlayerId,
            sessionToken: createJson.sessionToken,
            action: 'START_GAME',
          },
        });

        await page.request.post(`${BASE_URL}/api/rooms/action`, {
          data: {
            roomCode: createJson.roomCode,
            playerId: createJson.hostPlayerId,
            sessionToken: createJson.sessionToken,
            action: 'FLIP_CARD',
            payload: { type: 'truth' },
          },
        });

        const roomState = await (await page.request.get(`${BASE_URL}/api/rooms/${createJson.roomCode}`)).json();
        journeyDPassed = journeyDPassed && roomState.room?.currentCard?.prompt === customSnapshot.questions[0].prompt;
      }

      console.log(`  ${journeyDPassed ? '✅' : '❌'} Journey D (Custom Deck + Multiplayer): ${journeyDPassed ? 'PASSED' : 'FAILED'}`);
      results.journeys.journeyD = { passed: journeyDPassed };
      if (!journeyDPassed) results.allPassed = false;

      // Journey E: Custom Deck + Voice
      await page.goto(`${BASE_URL}/custom`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(600);
      const voiceBtnCount = await page.locator('button[aria-label*="Listen"], button[title*="Listen"]').count();
      const exportBtnCount = await page.locator('button:has-text("Export"), a:has-text("Export")').count();

      const journeyEPassed = voiceBtnCount > 0 && exportBtnCount === 0;
      console.log(`  ${journeyEPassed ? '✅' : '❌'} Journey E (Custom Deck Voice & Zero Export JSON): ${journeyEPassed ? 'PASSED' : 'FAILED'}`);
      results.journeys.journeyE = { passed: journeyEPassed, voiceBtnCount, exportBtnCount };
      if (!journeyEPassed) results.allPassed = false;

      await context.close();
    }

    // ========================================================
    // 6. COMBINED JOURNEY F: ARABIC + RTL LAYOUT
    // ========================================================
    console.log('\n🌍 [6/7] Testing Journey F (Arabic Localization & RTL Layout)...');
    {
      const context = await browser.newContext();
      const page = await context.newPage();

      await page.goto(`${BASE_URL}/ar/`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(500);

      const dir = await page.evaluate(() => document.documentElement.getAttribute('dir'));
      const lang = await page.evaluate(() => document.documentElement.getAttribute('lang'));
      const hasArabic = await page.evaluate(() => /[\u0600-\u06FF]/.test(document.body.innerText));

      const journeyFPassed = dir === 'rtl' && lang === 'ar' && hasArabic;
      console.log(`  ${journeyFPassed ? '✅' : '❌'} Journey F (Arabic RTL Layout): ${journeyFPassed ? 'dir="rtl" confirmed' : 'FAILED'}`);
      results.journeys.journeyF = { passed: journeyFPassed, dir, lang, hasArabic };
      if (!journeyFPassed) results.allPassed = false;

      await context.close();
    }

    // ========================================================
    // 7. COMBINED JOURNEY G: MOBILE + PWA INSTALLATION
    // ========================================================
    console.log('\n📱 [7/7] Testing Journey G (PWA Manifest, Icons & Service Worker)...');
    {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const page = await context.newPage();

      // Check Manifest
      const manifestRes = await page.request.get(`${BASE_URL}/manifest.json`);
      const manifest = await manifestRes.json();

      const manifestValid =
        manifest.name === 'Asteria - Truth or Dare' &&
        manifest.short_name === 'Asteria' &&
        manifest.display === 'standalone' &&
        Array.isArray(manifest.icons) &&
        manifest.icons.some((i) => i.sizes === '192x192') &&
        manifest.icons.some((i) => i.sizes === '512x512');

      // Check Service Worker
      const swRes = await page.request.get(`${BASE_URL}/sw.js`);
      const swText = await swRes.text();
      const swValid = swRes.status() === 200 && swText.includes('CACHE') && swText.includes('install');

      const journeyGPassed = manifestValid && swValid;
      console.log(`  ${journeyGPassed ? '✅' : '❌'} Journey G (PWA Manifest & Service Worker): ${journeyGPassed ? 'PASSED' : 'FAILED'}`);
      results.pwa = { passed: journeyGPassed, manifestValid, swValid };
      if (!journeyGPassed) results.allPassed = false;

      await context.close();
    }
  } catch (err) {
    console.error('Test suite error:', err);
    results.allPassed = false;
  } finally {
    await browser.close();
  }

  console.log('\n======================================================');
  console.log(`🎯 FINAL REGRESSION & INTEGRATION QA RESULT: ${results.allPassed ? 'ALL TESTS PASSED' : 'FAILURES DETECTED'}`);
  console.log('======================================================\n');
  return results;
}

runComprehensiveFinalQA().then((res) => {
  if (!res.allPassed) {
    process.exit(1);
  }
  process.exit(0);
});

