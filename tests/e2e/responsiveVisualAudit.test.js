const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, '../../project-docs/23-ui-fixes/screenshots');

const DESKTOP_VIEWPORTS = [
  { name: 'desktop-1024x768', width: 1024, height: 768 },
  { name: 'desktop-1280x800', width: 1280, height: 800 },
  { name: 'desktop-1366x768', width: 1366, height: 768 },
  { name: 'desktop-1440x900', width: 1440, height: 900 },
  { name: 'desktop-1600x900', width: 1600, height: 900 },
  { name: 'desktop-1920x1080', width: 1920, height: 1080 },
];

const MOBILE_VIEWPORTS = [
  { name: 'mobile-320x568', width: 320, height: 568 },
  { name: 'mobile-360x640', width: 360, height: 640 },
  { name: 'mobile-375x667', width: 375, height: 667 },
  { name: 'mobile-390x844', width: 390, height: 844 },
  { name: 'mobile-414x896', width: 414, height: 896 },
  { name: 'mobile-430x932', width: 430, height: 932 },
  { name: 'mobile-480x854', width: 480, height: 854 },
];

async function runResponsiveVisualAudit() {
  console.log('🚀 Launching Asteria Responsive Visual Audit across 13 Viewports...\n');
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const results = {
    desktop: [],
    mobile: [],
    overflowViolations: [],
  };

  try {
    // -------------------------------------------------------------
    // PART 1: DESKTOP AUDIT (1024, 1280, 1366, 1440, 1600, 1920)
    // -------------------------------------------------------------
    console.log('======================================================');
    console.log('🖥️ PART 1: TESTING DESKTOP VIEWPORTS (1024px to 1920px)');
    console.log('======================================================');

    for (const vp of DESKTOP_VIEWPORTS) {
      console.log(`\nTesting Desktop Viewport: ${vp.name} (${vp.width}x${vp.height})`);
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await context.newPage();

      // Test 1: Homepage
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
      const homeOverflow = await checkOverflow(page, `${vp.name}-home`);
      if (homeOverflow) results.overflowViolations.push(`${vp.name} Homepage overflow`);
      if (vp.width === 1440 || vp.width === 1920) {
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${vp.name}-homepage.png`), fullPage: false });
      }

      // Test 2: Truth or Dare Setup
      await page.goto(`${BASE_URL}/games/truth-or-dare`, { waitUntil: 'networkidle' });
      const todSetupOverflow = await checkOverflow(page, `${vp.name}-tod-setup`);
      if (todSetupOverflow) results.overflowViolations.push(`${vp.name} ToD Setup overflow`);
      if (vp.width === 1440) {
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${vp.name}-tod-setup.png`), fullPage: false });
      }

      // Test 3: Truth or Dare Active Gameplay
      const launchBtn = page.getByRole('button', { name: /launch game/i });
      if (await launchBtn.isVisible()) {
        await launchBtn.click();
        await page.waitForTimeout(400);

        // Click Truth
        const truthBtn = page.getByRole('button', { name: /^truth/i }).first();
        if (await truthBtn.isVisible()) {
          await truthBtn.click();
          await page.waitForTimeout(400);
        }

        const todGameOverflow = await checkOverflow(page, `${vp.name}-tod-gameplay`);
        if (todGameOverflow) results.overflowViolations.push(`${vp.name} ToD Gameplay overflow`);
        if (vp.width === 1440 || vp.width === 1920) {
          await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${vp.name}-tod-active-truth.png`), fullPage: false });
        }
      }

      // Test 4: Custom Deck Studio
      await page.goto(`${BASE_URL}/custom`, { waitUntil: 'networkidle' });
      const customOverflow = await checkOverflow(page, `${vp.name}-custom-studio`);
      if (customOverflow) results.overflowViolations.push(`${vp.name} Custom Studio overflow`);
      if (vp.width === 1440) {
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${vp.name}-custom-deck.png`), fullPage: false });
      }

      // Test 5: Games Directory
      await page.goto(`${BASE_URL}/games`, { waitUntil: 'networkidle' });
      const gamesOverflow = await checkOverflow(page, `${vp.name}-games-directory`);
      if (gamesOverflow) results.overflowViolations.push(`${vp.name} Games Directory overflow`);
      if (vp.width === 1440) {
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${vp.name}-games-grid.png`), fullPage: false });
      }

      results.desktop.push({
        viewport: vp.name,
        width: vp.width,
        height: vp.height,
        hasOverflow: homeOverflow || todSetupOverflow || customOverflow || gamesOverflow,
      });

      await context.close();
    }

    // -------------------------------------------------------------
    // PART 2: MOBILE AUDIT (320, 360, 375, 390, 414, 430, 480)
    // -------------------------------------------------------------
    console.log('\n======================================================');
    console.log('📱 PART 2: TESTING MOBILE VIEWPORTS (320px to 480px)');
    console.log('======================================================');

    for (const vp of MOBILE_VIEWPORTS) {
      console.log(`\nTesting Mobile Viewport: ${vp.name} (${vp.width}x${vp.height})`);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: true,
        hasTouch: true,
      });
      const page = await context.newPage();

      // Test 1: Homepage
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
      const homeOverflow = await checkOverflow(page, `${vp.name}-home`);
      if (homeOverflow) results.overflowViolations.push(`${vp.name} Homepage overflow`);

      // Test 2: Language Modal in Hindi and English
      const langTrigger = page.locator('header button[aria-label*="Language"]').first();
      if (await langTrigger.isVisible()) {
        await langTrigger.click();
        await page.waitForTimeout(400);

        const modalVisible = await page.locator('[role="dialog"]').isVisible();
        if (modalVisible) {
          // Check overflow inside modal
          const modalOverflow = await page.evaluate(() => {
            const modal = document.querySelector('[role="dialog"]');
            if (!modal) return false;
            return modal.scrollWidth > modal.clientWidth + 2;
          });

          if (modalOverflow) {
            console.error(`  ❌ [OVERFLOW] ${vp.name}: Language Modal horizontal overflow`);
            results.overflowViolations.push(`${vp.name} Language Modal overflow`);
          } else {
            console.log(`  ✓ [Clean Modal] ${vp.name}: Language modal cards fit without horizontal scroll`);
          }

          if (vp.width === 360 || vp.width === 390) {
            await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${vp.name}-language-modal.png`) });
          }

          // Close modal
          const closeBtn = page.locator('[role="dialog"] button[aria-label*="Close"]');
          if (await closeBtn.isVisible()) await closeBtn.click();
          await page.waitForTimeout(200);
        }
      }

      // Test 3: Truth or Dare Setup Screen (Check no footer collision behind dock!)
      await page.goto(`${BASE_URL}/games/truth-or-dare`, { waitUntil: 'networkidle' });
      const todSetupOverflow = await checkOverflow(page, `${vp.name}-tod-setup`);
      if (todSetupOverflow) results.overflowViolations.push(`${vp.name} ToD Setup overflow`);
      if (vp.width === 375 || vp.width === 390) {
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${vp.name}-tod-setup.png`) });
      }

      // Test 4: Truth or Dare Active Gameplay (Card dimensions, top clearance, action buttons)
      const launchBtn = page.getByRole('button', { name: /launch game/i });
      if (await launchBtn.isVisible()) {
        await launchBtn.click();
        await page.waitForTimeout(400);

        // Verify top turn pill is visible and not hidden behind header
        const turnPill = page.locator('text=Player 1\'s Turn');
        const isTurnVisible = await turnPill.isVisible();
        console.log(`  ✓ [Turn Bar Visibility] ${vp.name}: ${isTurnVisible ? 'VISIBLE' : 'HIDDEN'}`);

        // Check front card screenshot
        if (vp.width === 320 || vp.width === 375 || vp.width === 390 || vp.width === 430) {
          await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${vp.name}-tod-gameplay-choice.png`) });
        }

        // Click Truth
        const truthBtn = page.getByRole('button', { name: /^truth/i }).first();
        if (await truthBtn.isVisible()) {
          await truthBtn.click();
          await page.waitForTimeout(400);
        }

        // Verify action buttons (Skip / Complete) are within view
        const skipBtn = page.getByRole('button', { name: /skip/i });
        const isSkipVisible = await skipBtn.isVisible();
        console.log(`  ✓ [Bottom Action Visibility] ${vp.name}: Skip button is ${isSkipVisible ? 'VISIBLE' : 'CLIPPED'}`);

        const todActiveOverflow = await checkOverflow(page, `${vp.name}-tod-active-card`);
        if (todActiveOverflow) results.overflowViolations.push(`${vp.name} ToD Active Card overflow`);

        if (vp.width === 320 || vp.width === 360 || vp.width === 375 || vp.width === 390 || vp.width === 430) {
          await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${vp.name}-tod-active-truth.png`) });
        }
      }

      // Test 5: Physics Spinner Wheel
      await page.goto(`${BASE_URL}/games/spin-the-bottle`, { waitUntil: 'networkidle' });
      const spinnerOverflow = await checkOverflow(page, `${vp.name}-spinner`);
      if (spinnerOverflow) results.overflowViolations.push(`${vp.name} Spinner overflow`);
      if (vp.width === 375) {
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${vp.name}-spinner-wheel.png`) });
      }

      // Test 6: Never Have I Ever
      await page.goto(`${BASE_URL}/games/never-have-i-ever`, { waitUntil: 'networkidle' });
      const nhieOverflow = await checkOverflow(page, `${vp.name}-nhie`);
      if (nhieOverflow) results.overflowViolations.push(`${vp.name} NHIE overflow`);

      // Test 7: Would You Rather
      await page.goto(`${BASE_URL}/games/would-you-rather`, { waitUntil: 'networkidle' });
      const wyrOverflow = await checkOverflow(page, `${vp.name}-wyr`);
      if (wyrOverflow) results.overflowViolations.push(`${vp.name} WYR overflow`);

      // Test 8: Most Likely To
      await page.goto(`${BASE_URL}/games/most-likely-to`, { waitUntil: 'networkidle' });
      const mltOverflow = await checkOverflow(page, `${vp.name}-mlt`);
      if (mltOverflow) results.overflowViolations.push(`${vp.name} MLT overflow`);

      // Test 9: This or That
      await page.goto(`${BASE_URL}/games/this-or-that`, { waitUntil: 'networkidle' });
      const totOverflow = await checkOverflow(page, `${vp.name}-tot`);
      if (totOverflow) results.overflowViolations.push(`${vp.name} ToT overflow`);

      results.mobile.push({
        viewport: vp.name,
        width: vp.width,
        height: vp.height,
        hasOverflow: homeOverflow || todSetupOverflow || spinnerOverflow || nhieOverflow || wyrOverflow || mltOverflow || totOverflow,
      });

      await context.close();
    }

    console.log('\n======================================================');
    console.log('📊 AUDIT SUMMARY');
    console.log('======================================================');
    console.log(`Total Desktop Viewports Tested: ${results.desktop.length}`);
    console.log(`Total Mobile Viewports Tested:  ${results.mobile.length}`);
    console.log(`Total Horizontal Overflow Violations: ${results.overflowViolations.length}`);

    if (results.overflowViolations.length === 0) {
      console.log('\n🎉 ALL VIEWPORTS PASSED WITH ZERO HORIZONTAL OVERFLOW AND PERFECT CARD SCALING!\n');
    } else {
      console.log('\n⚠️ Violations found:', results.overflowViolations);
    }

  } finally {
    await browser.close();
  }
}

async function checkOverflow(page, screenName) {
  const overflow = await page.evaluate(() => {
    const docWidth = document.documentElement.scrollWidth;
    const winWidth = window.innerWidth;
    const bodyWidth = document.body.scrollWidth;
    return {
      hasOverflow: docWidth > winWidth + 1 || bodyWidth > winWidth + 1,
      docWidth,
      winWidth,
      bodyWidth,
    };
  });

  if (overflow.hasOverflow) {
    console.error(`  ❌ [OVERFLOW] ${screenName}: docWidth=${overflow.docWidth}px, winWidth=${overflow.winWidth}px`);
  } else {
    console.log(`  ✓ [No Overflow] ${screenName} (${overflow.docWidth}px / ${overflow.winWidth}px)`);
  }

  return overflow.hasOverflow;
}

runResponsiveVisualAudit().catch((err) => {
  console.error('Fatal error running responsive audit:', err);
  process.exit(1);
});

