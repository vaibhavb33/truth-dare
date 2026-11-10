const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, '../../project-docs/43-party-room-toolbar/screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { width: 320, height: 568, name: '320px (iPhone SE 1st Gen)' },
  { width: 360, height: 640, name: '360px (Galaxy S8 / Android)' },
  { width: 375, height: 667, name: '375px (iPhone SE 2nd / iPhone 8)' },
  { width: 390, height: 844, name: '390px (iPhone 12 / 13 / 14 / 15)' },
  { width: 414, height: 896, name: '414px (iPhone XR / 11 Pro Max)' },
  { width: 430, height: 932, name: '430px (iPhone 14 / 15 Pro Max)' },
  { width: 768, height: 1024, name: '768px (iPad Mini / Tablet Portrait)' },
  { width: 1024, height: 768, name: '1024px (iPad Landscape / Small Laptop)' },
  { width: 1280, height: 800, name: '1280px (Standard Desktop / MacBook)' },
  { width: 1440, height: 900, name: '1440px (Desktop HD Display)' },
];

async function runToolbarAudit() {
  console.log('🚀 QA Audit: Party Room Responsive Toolbar Starting across 10 Viewports...\n');
  const results = {
    viewports: [],
    functionality: {},
    allPassed: true,
  };

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: [
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
    ],
  });

  try {
    // 1. Create a party room with Custom Deck snapshot
    const contextInit = await browser.newContext();
    const pageInit = await contextInit.newPage();
    const createRes = await pageInit.request.post(`${BASE_URL}/api/rooms/create`, {
      data: {
        gameId: 'truth-or-dare',
        categoryId: 'custom',
        hostName: 'HostAlice',
        language: 'en',
        maxPlayers: 8,
        customDeckSnapshot: {
          id: 'qa-deck-snap-01',
          name: 'QA Regression Deck',
          language: 'en',
          questions: [
            { id: 'qa-t1', prompt: 'Question 1', type: 'truth' },
            { id: 'qa-t2', prompt: 'Question 2', type: 'truth' },
            { id: 'qa-d1', prompt: 'Dare 1', type: 'dare' },
            { id: 'qa-d2', prompt: 'Dare 2', type: 'dare' },
          ],
        },
      },
    });

    const createData = await createRes.json();
    const roomCode = createData.roomCode;
    const hostPlayerId = createData.hostPlayerId;
    const hostSessionToken = createData.sessionToken;

    console.log(`🏠 Test Party Room Created: Code=${roomCode}\n`);
    await contextInit.close();

    // 2. Iterate through all 10 viewports
    for (const vp of VIEWPORTS) {
      console.log(`📱 Testing Viewport: ${vp.name} [${vp.width}x${vp.height}]...`);
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await context.newPage();

      // Seed host session & suppress PWA modal
      await page.goto(`${BASE_URL}/`);
      await page.evaluate(
        ({ code, pId, token }) => {
          localStorage.setItem(
            `asteria_multiplayer_session_${code}`,
            JSON.stringify({ roomCode: code, playerId: pId, sessionToken: token, playerName: 'HostAlice' })
          );
          localStorage.setItem('asteria_pwa_installed', 'true');
        },
        { code: roomCode, pId: hostPlayerId, token: hostSessionToken }
      );

      await page.goto(`${BASE_URL}/room/${roomCode}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      // Perform Layout & CSS Audit Checks
      const metrics = await page.evaluate(({ rCode }) => {
        const docWidth = document.documentElement.scrollWidth;
        const winWidth = window.innerWidth;
        const bodyWidth = document.body.scrollWidth;
        const hasHorizontalScroll = docWidth > winWidth + 1 || bodyWidth > winWidth + 1;

        // Title Element Check (Target the currently visible H1 in the active responsive toolbar)
        const titles = Array.from(document.querySelectorAll('h1'));
        const partyTitle = titles.find((t) => {
          const r = t.getBoundingClientRect();
          return r.height > 0 && t.innerText.toUpperCase().includes('PARTY');
        });
        let titleValid = false;
        let titleHeight = 0;
        let titleText = '';
        if (partyTitle) {
          const r = partyTitle.getBoundingClientRect();
          titleHeight = r.height;
          titleText = partyTitle.innerText.trim();
          // Height between 16px and 36px confirms single line (no vertical word wrap like "PARTY\nROOM")
          titleValid = titleHeight >= 16 && titleHeight <= 36 && titleText.length > 0;
        }

        // Room Code Check
        const bodyText = document.body.innerText;
        const hasFullRoomCode = bodyText.includes(rCode);

        // Buttons Check (Bounding boxes must stay inside viewport)
        const buttons = Array.from(document.querySelectorAll('button'));
        const visibleButtons = buttons.filter((b) => {
          const r = b.getBoundingClientRect();
          return r.width > 0 && r.height > 0;
        });

        const buttonsOutsideViewport = visibleButtons.filter((b) => {
          const r = b.getBoundingClientRect();
          return r.right > winWidth + 1 || r.left < -1;
        });

        // Touch Targets Minimum Height Check for visible buttons
        let minButtonHeight = 999;
        visibleButtons.forEach((b) => {
          const r = b.getBoundingClientRect();
          if (r.height < minButtonHeight) {
            minButtonHeight = r.height;
          }
        });

        return {
          docWidth,
          winWidth,
          hasHorizontalScroll,
          titleValid,
          titleHeight,
          titleText,
          hasFullRoomCode,
          buttonsOutsideCount: buttonsOutsideViewport.length,
          minButtonHeight,
        };
      }, { rCode: roomCode });

      const passed =
        !metrics.hasHorizontalScroll &&
        metrics.titleValid &&
        metrics.hasFullRoomCode &&
        metrics.buttonsOutsideCount === 0 &&
        metrics.minButtonHeight >= 32;

      console.log(`  Horizontal Overflow: ${metrics.hasHorizontalScroll ? 'FAILED' : 'NONE (Clean)'}`);
      console.log(`  Title Single Line:   ${metrics.titleValid} ("${metrics.titleText}", height=${Math.round(metrics.titleHeight)}px)`);
      console.log(`  Full Room Code:      ${metrics.hasFullRoomCode}`);
      console.log(`  Buttons in Viewport: ${metrics.buttonsOutsideCount === 0} (outside=${metrics.buttonsOutsideCount})`);
      console.log(`  Min Touch Height:    ${Math.round(metrics.minButtonHeight)}px`);

      // Capture high-res screenshot
      const screenshotPath = path.join(SCREENSHOT_DIR, `toolbar-${vp.width}px.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });

      results.viewports.push({
        viewport: `${vp.width}px`,
        name: vp.name,
        passed,
        metrics,
        screenshot: `screenshots/toolbar-${vp.width}px.png`,
      });

      // If testing 375px, verify interactive button functionality (Phase 5)
      if (vp.width === 375) {
        console.log('\n  ⚡ Verifying Interactive Controls Functionality on 375px:');

        // 1. QR Button
        const qrBtn = page.locator('button[title*="QR"], button[aria-label*="QR"]').first();
        await qrBtn.click();
        await page.waitForTimeout(500);
        const qrModalVisible = await page.locator('text=Scan with any phone camera').first().isVisible().catch(() => false);
        console.log(`    - QR Code Modal opens: ${qrModalVisible}`);
        results.functionality.qrModal = qrModalVisible;

        // Close QR Modal
        await page.locator('button[aria-label*="close"], button[aria-label*="Close"]').first().click().catch(() => {});
        await page.waitForTimeout(400);

        // 2. Settings Button
        const settingsBtn = page.locator('button[title="Lobby Settings"], button[aria-label="Lobby Settings"]').first();
        if (await settingsBtn.isVisible()) {
          await settingsBtn.click();
          await page.waitForTimeout(500);
          const settingsModalVisible = await page.locator('text=Room Settings').first().isVisible().catch(() => false);
          console.log(`    - Lobby Settings Modal opens: ${settingsModalVisible}`);
          results.functionality.settingsModal = settingsModalVisible;
          await page.locator('button:has-text("Save Settings")').first().click().catch(() => {});
          await page.waitForTimeout(400);
        }

        // 3. Copy Button
        const copyBtn = page.locator('button:has-text("Copy")').first();
        if (await copyBtn.isVisible()) {
          await copyBtn.click();
          await page.waitForTimeout(400);
          const copyFeedbackVisible = await page.locator(':has-text("Copied")').first().isVisible().catch(() => false);
          console.log(`    - Copy button triggers feedback: ${copyFeedbackVisible}`);
          results.functionality.copyButton = copyFeedbackVisible;
        }

        // 4. Back / Leave Button
        const backBtn = page.locator('button[title="Leave Room"], button[aria-label="Leave Room"]').first();
        if (await backBtn.isVisible()) {
          await backBtn.click();
          await page.waitForTimeout(500);
          const leaveModalVisible = await page.locator('text=Leave Party Room?').first().isVisible().catch(() => false);
          console.log(`    - Back button triggers Leave Room confirmation: ${leaveModalVisible}`);
          results.functionality.leaveModal = leaveModalVisible;
          await page.locator('button:has-text("Cancel")').first().click().catch(() => {});
        }
      }

      await context.close();
    }
  } catch (err) {
    console.error('❌ Toolbar Audit Error:', err);
    results.allPassed = false;
  } finally {
    await browser.close();
  }

  const allPassed =
    results.allPassed &&
    results.viewports.every((v) => v.passed) &&
    results.functionality.qrModal &&
    results.functionality.settingsModal &&
    results.functionality.copyButton &&
    results.functionality.leaveModal;

  console.log('\n======================================================');
  console.log(`🏁 Toolbar QA Audit Results: ${allPassed ? 'ALL 10 VIEWPORTS & ACTIONS PASSED ✅' : 'SOME FAILED ❌'}`);
  console.log('======================================================\n');
  return { allPassed, results };
}

if (require.main === module) {
  runToolbarAudit()
    .then((res) => process.exit(res.allPassed ? 0 : 1))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { runToolbarAudit };
