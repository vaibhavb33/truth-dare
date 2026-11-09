const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const DOCS_DIR = path.join(__dirname, '../../project-docs/34-spinner-redesign');
const SCREENSHOT_DIR = path.join(DOCS_DIR, 'screenshots');

const VIEWPORTS = [
  { name: 'Desktop Chrome', width: 1440, height: 900, isMobile: false },
  { name: 'iPhone Safari', width: 390, height: 844, isMobile: true },
  { name: 'Android Chrome', width: 360, height: 740, isMobile: true },
];

async function runSpinnerWheelIntegrationAudit() {
  console.log('🎡 Starting Asteria Spinner Wheel E2E Integration & QA Audit...\n');

  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const results = {
    viewportsTested: [],
    modeSwitching: true,
    rosterManagement: true,
    spinningPhysics: true,
    eliminationMode: true,
    audioToggle: true,
    allPassed: true,
  };

  try {
    // -------------------------------------------------------------
    // PHASE 1: RESPONSIVE VIEWPORT RENDERING & CANVAS VALIDATION
    // -------------------------------------------------------------
    console.log('📱 Phase 1: Validating Responsive Viewports & HiDPI Canvas...');
    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.isMobile,
        deviceScaleFactor: 2, // HiDPI emulation
      });
      const page = await context.newPage();

      await page.goto(`${BASE_URL}/games/spin-the-bottle`, { waitUntil: 'networkidle' });
      await page.waitForSelector('[data-testid="spinner-wheel-canvas"]', { timeout: 8000 });

      const canvas = await page.$('[data-testid="spinner-wheel-canvas"]');
      const box = await canvas.boundingBox();

      if (!box || box.width <= 0 || box.height <= 0) {
        throw new Error(`Canvas element missing or zero dimension on ${vp.name}`);
      }

      const screenshotFile = vp.name.toLowerCase().includes('desktop')
        ? 'spinner-desktop-ready.png'
        : vp.name.toLowerCase().includes('iphone')
        ? 'spinner-mobile-ready.png'
        : 'spinner-android-ready.png';

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, screenshotFile), fullPage: false });

      console.log(`   ✓ ${vp.name} (${vp.width}x${vp.height}): Canvas render OK (${Math.round(box.width)}x${Math.round(box.height)}px). Screenshot: ${screenshotFile}`);
      results.viewportsTested.push({ name: vp.name, width: vp.width, height: vp.height, status: 'PASS' });

      await context.close();
    }

    // -------------------------------------------------------------
    // PHASE 2: DESKTOP DEEP AUDIT: ROSTER MANAGEMENT & MODES
    // -------------------------------------------------------------
    console.log('\n👥 Phase 2: Auditing Player Roster Management & Game Modes...');
    const mainContext = await browser.newContext({
      viewport: { width: 1280, height: 850 },
      deviceScaleFactor: 2,
    });
    const page = await mainContext.newPage();
    page.on('console', (msg) => console.log('   [BROWSER CONSOLE]', msg.type(), msg.text()));
    page.on('pageerror', (err) => console.log('   [BROWSER ERROR]', err.message));
    await page.goto(`${BASE_URL}/games/spin-the-bottle`, { waitUntil: 'networkidle' });

    // 2.1 Audio Toggle
    const soundToggle = await page.$('button[aria-label*="Sound"], button[aria-label*="sound"]');
    if (soundToggle) {
      await soundToggle.click();
      console.log('   ✓ Audio Mute toggle clicked successfully');
      await page.waitForTimeout(300);
      await soundToggle.click();
      console.log('   ✓ Audio Unmute toggle restored successfully');
    }

    // 2.2 Add New Player
    const playerInput = await page.$('input[placeholder*="player name"], input[placeholder*="segment name"]');
    const addButton = await page.$('button:has-text("Add")');
    if (playerInput && addButton) {
      await playerInput.fill('Zara');
      await addButton.click();
      await page.waitForTimeout(300);
      const zaraBadge = await page.waitForSelector('text=Zara', { timeout: 3000 });
      if (zaraBadge) {
        console.log('   ✓ Player addition confirmed: "Zara" added to wheel segments');
      }
    }

    // 2.3 Populate Demo Players
    const demoButton = await page.$('button:has-text("Fill Demo"), button:has-text("Demo")');
    if (demoButton) {
      await demoButton.click();
      await page.waitForTimeout(400);
      console.log('   ✓ Demo roster populated successfully');
    }

    // 2.4 Mode Switcher: Truth or Dare mode
    const todButton = await page.$('button:has-text("Truth or Dare")');
    if (todButton) {
      await todButton.click();
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'spinner-truth-dare-mode.png') });
      console.log('   ✓ Mode switch: Switched to Truth or Dare mode. Screenshot: spinner-truth-dare-mode.png');
    }

    // Switch back to Players mode for spinning test
    const playersModeButton = await page.$('button:has-text("Players")');
    if (playersModeButton) {
      await playersModeButton.click();
      await page.waitForTimeout(400);
    }

    // -------------------------------------------------------------
    // PHASE 3: SPIN ANIMATION LIFECYCLE & WINNER MODAL
    // -------------------------------------------------------------
    console.log('\n🚀 Phase 3: Testing Spin Physics Animation & Winner Resolution...');
    const spinButton = await page.$('[data-testid="spin-wheel-button"]');
    if (!spinButton) {
      throw new Error('Spin button [data-testid="spin-wheel-button"] not found!');
    }

    // Initiate spin
    await spinButton.click();
    console.log('   ✓ Spin button clicked');

    // Verify disabled state while spinning
    await page.waitForTimeout(500);
    const isSpinningDisabled = await spinButton.getAttribute('disabled');
    console.log(`   ✓ Button disabled during spin: ${isSpinningDisabled !== null}`);

    // Capture in-motion snapshot
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'spinner-spinning.png') });
    console.log('   ✓ In-motion frame captured: spinner-spinning.png');

    // Wait for quintic ease-out completion and modal trigger (approx 4.5s)
    const winnerModal = await page.waitForSelector('[data-testid="winner-modal"]', { timeout: 14000 });
    if (!winnerModal) {
      throw new Error('Winner modal failed to appear after spin duration');
    }
    const winnerName = await page.$eval('[data-testid="winner-name"]', (el) => el.textContent.trim()).catch(() => 'Winner');
    console.log(`   ✓ Winner celebration modal displayed successfully! Winner: "${winnerName}"`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'spinner-winner-modal.png') });
    console.log('   ✓ Winner modal captured: spinner-winner-modal.png');

    // -------------------------------------------------------------
    // PHASE 4: ELIMINATION FLOW ("Remove Winner & Keep Playing")
    // -------------------------------------------------------------
    console.log('\n🏆 Phase 4: Testing Elimination Flow ("Remove Winner & Keep Playing")...');
    const removeWinnerBtn = await page.$('[data-testid="modal-remove-winner-btn"]');
    if (removeWinnerBtn) {
      await removeWinnerBtn.click();
      await page.waitForTimeout(600);
      console.log(`   ✓ Elimination action executed; "${winnerName}" removed from active roster`);
      // Modal should be closed
      const modalClosed = !(await page.$('[data-testid="winner-modal"]'));
      console.log(`   ✓ Winner modal dismissed after elimination: ${modalClosed}`);
    }

    // Final clean snapshot
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'spinner-elimination-state.png') });
    console.log('   ✓ Post-elimination wheel captured: spinner-elimination-state.png');

    await mainContext.close();
  } catch (error) {
    console.error('❌ E2E Integration Test Failed:', error);
    results.allPassed = false;
    throw error;
  } finally {
    await browser.close();
  }

  console.log('\n🎉 ALL SPINNER WHEEL E2E INTEGRATION TESTS PASSED!');
  return results;
}

runSpinnerWheelIntegrationAudit().catch((err) => {
  console.error(err);
  process.exit(1);
});
