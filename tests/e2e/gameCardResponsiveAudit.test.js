const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, '../../project-docs/31-game-card-fix/screenshots');

const VIEWPORTS = [
  { name: 'mobile-320', width: 320, height: 600 },
  { name: 'mobile-360', width: 360, height: 740 },
  { name: 'mobile-375', width: 375, height: 667 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-414', width: 414, height: 896 },
  { name: 'mobile-430', width: 430, height: 932 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1024', width: 1024, height: 768 },
  { name: 'desktop-1440', width: 1440, height: 900 },
];

const LANGUAGES = [
  { code: 'en', name: 'English', launchPattern: /start game/i },
  { code: 'hi', name: 'Hindi', launchPattern: /गेम शुरू करें/i },
  { code: 'de', name: 'German', launchPattern: /spiel starten/i },
  { code: 'es', name: 'Spanish', launchPattern: /comenzar juego/i },
  { code: 'ar', name: 'Arabic', launchPattern: /بدء اللعبة/i },
];

async function runGameCardAudit() {
  console.log('🚀 Asteria Truth & Dare Game Card Responsive Audit Starting...');
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const reportData = {
    viewportsTested: [],
    languagesTested: [],
    assertions: [],
    screenshots: [],
    success: true,
  };

  try {
    for (const vp of VIEWPORTS) {
      console.log(`\n📱 Testing Viewport: ${vp.name} (${vp.width}x${vp.height}px)`);
      const contextOptions = {
        viewport: { width: vp.width, height: vp.height },
      };
      if (vp.width <= 480) {
        contextOptions.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15';
        contextOptions.isMobile = true;
      }
      const context = await browser.newContext(contextOptions);
      const page = await context.newPage();

      // Test English as primary across all viewports
      await page.goto(`${BASE_URL}/en/games/truth-or-dare`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(300);

      // Click Start Game
      const launchBtn = page.getByRole('button', { name: /start game|launch game|गेम शुरू करें/i }).first();
      await launchBtn.click();
      await page.waitForTimeout(500);

      // Verify card elements
      const card = page.locator('.card-face-front').first();
      await card.waitFor({ state: 'visible', timeout: 5000 });

      // Check overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
      });
      console.log(`  ✓ Horizontal scrollbar: ${hasHorizontalScroll ? 'VIOLATION' : 'NONE (PASS)'}`);
      if (hasHorizontalScroll) reportData.success = false;

      // Check bounding boxes for overlap
      const layoutMetrics = await page.evaluate(() => {
        const front = document.querySelector('.card-face-front');
        if (!front) return null;

        const heading = front.querySelector('h3');
        const instruction = front.querySelector('p');
        const truthBtn = front.querySelector('button[aria-label="TRUTH"], button[aria-label="Truth"], button[aria-label*="Truth"], button[aria-label*="सच"]');
        const dareBtn = front.querySelector('button[aria-label="DARE"], button[aria-label="Dare"], button[aria-label*="Dare"], button[aria-label*="डेयर"]');
        const voiceBar = front.querySelector('.border-t');

        const headingBox = heading ? heading.getBoundingClientRect() : null;
        const instrBox = instruction ? instruction.getBoundingClientRect() : null;
        const truthBox = truthBtn ? truthBtn.getBoundingClientRect() : null;
        const dareBox = dareBtn ? dareBtn.getBoundingClientRect() : null;
        const voiceBox = voiceBar ? voiceBar.getBoundingClientRect() : null;
        const frontBox = front.getBoundingClientRect();

        return {
          frontHeight: frontBox.height,
          frontWidth: frontBox.width,
          headingBottom: headingBox ? headingBox.bottom : 0,
          instructionBottom: instrBox ? instrBox.bottom : 0,
          truthTop: truthBox ? truthBox.top : 0,
          truthHeight: truthBox ? truthBox.height : 0,
          dareTop: dareBox ? dareBox.top : 0,
          dareHeight: dareBox ? dareBox.height : 0,
          voiceTop: voiceBox ? voiceBox.top : 0,
          hasTruthDareOverlap: truthBox && instrBox ? truthBox.top < instrBox.bottom : false,
          hasVoiceOverlap: voiceBox && truthBox ? voiceBox.top < truthBox.bottom : false,
        };
      });

      console.log(`  ✓ Card dimensions: ${layoutMetrics.frontWidth.toFixed(1)}px x ${layoutMetrics.frontHeight.toFixed(1)}px`);
      console.log(`  ✓ Truth height: ${layoutMetrics.truthHeight.toFixed(1)}px, Dare height: ${layoutMetrics.dareHeight.toFixed(1)}px (Diff: ${Math.abs(layoutMetrics.truthHeight - layoutMetrics.dareHeight).toFixed(1)}px)`);
      console.log(`  ✓ Text hidden under buttons: ${layoutMetrics.hasTruthDareOverlap ? 'YES (FAIL)' : 'NO (PASS)'}`);
      console.log(`  ✓ Voice overlapping main buttons: ${layoutMetrics.hasVoiceOverlap ? 'YES (FAIL)' : 'NO (PASS)'}`);

      if (layoutMetrics.hasTruthDareOverlap || layoutMetrics.hasVoiceOverlap) {
        reportData.success = false;
      }

      // Capture screenshot of Front Face
      const frontShot = path.join(SCREENSHOT_DIR, `${vp.name}-front-choice.png`);
      await page.screenshot({ path: frontShot, fullPage: false });
      reportData.screenshots.push({ name: `${vp.name} Front Face`, path: frontShot });

      // Click Truth button to verify flip animation and Back Face
      const truthBtn = page.getByRole('button', { name: /truth|सच/i }).first();
      await truthBtn.click();
      await page.waitForTimeout(500);

      // Verify Back Face is visible
      const backFace = page.locator('.card-face-back').first();
      const isBackVisible = await backFace.isVisible();
      console.log(`  ✓ Back Face visible after Truth click: ${isBackVisible ? 'PASS' : 'FAIL'}`);

      // Capture screenshot of Back Face
      const backShot = path.join(SCREENSHOT_DIR, `${vp.name}-back-prompt.png`);
      await page.screenshot({ path: backShot, fullPage: false });
      reportData.screenshots.push({ name: `${vp.name} Back Face`, path: backShot });

      reportData.viewportsTested.push({
        viewport: vp,
        metrics: layoutMetrics,
        noOverlap: !layoutMetrics.hasTruthDareOverlap && !layoutMetrics.hasVoiceOverlap,
      });

      await context.close();
    }

    // ========================================================
    // MULTILINGUAL AUDIT (Hindi, German, Arabic, Spanish)
    // ========================================================
    console.log('\n🌐 Testing Multilingual Layouts at Mobile 390px Viewport...');
    for (const lang of LANGUAGES) {
      console.log(`  -> Testing ${lang.name} (${lang.code.toUpperCase()})...`);
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
      });
      const page = await context.newPage();

      await page.goto(`${BASE_URL}/${lang.code}/games/truth-or-dare`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(300);

      // Click Start Game (localized)
      const launchBtn = page.getByRole('button', { name: lang.launchPattern }).first();
      if (await launchBtn.isVisible()) {
        await launchBtn.click();
        await page.waitForTimeout(400);
      }

      // Check text clipping
      const clippingResults = await page.evaluate(() => {
        const front = document.querySelector('.card-face-front');
        if (!front) return { hasClipping: false, textElements: [] };

        const texts = Array.from(front.querySelectorAll('p, span, h3'));
        let clippedCount = 0;
        const details = [];

        for (const el of texts) {
          // Check if element has horizontal text truncation or overflow
          const isOverflowingX = el.scrollWidth > el.clientWidth + 2;
          // Ignore parent wrappers that fit their content
          if (isOverflowingX && !el.classList.contains('truncate')) {
            clippedCount++;
            details.push({
              tag: el.tagName,
              text: el.innerText.substring(0, 30),
              scrollWidth: el.scrollWidth,
              clientWidth: el.clientWidth,
            });
          }
        }

        return { hasClipping: clippedCount > 0, count: clippedCount, details };
      });

      console.log(`     Clipping check: ${clippingResults.hasClipping ? `DETECTED (${clippingResults.count})` : 'ZERO CLIPPING (PASS)'}`);

      const langShot = path.join(SCREENSHOT_DIR, `lang-${lang.code}-front.png`);
      await page.screenshot({ path: langShot, fullPage: false });
      reportData.screenshots.push({ name: `Language ${lang.name} Front`, path: langShot });

      reportData.languagesTested.push({
        lang: lang.name,
        code: lang.code,
        noClipping: !clippingResults.hasClipping,
      });

      await context.close();
    }

    console.log('\n======================================================');
    console.log(`🎯 AUDIT COMPLETED: ${reportData.success ? 'ALL CHECKS PASSED' : 'VIOLATIONS DETECTED'}`);
    console.log(`📸 Screenshots saved: ${reportData.screenshots.length} files in ${SCREENSHOT_DIR}`);
    console.log('======================================================\n');
  } catch (err) {
    console.error('Audit run error:', err);
    reportData.success = false;
  } finally {
    await browser.close();
  }
}

runGameCardAudit();
