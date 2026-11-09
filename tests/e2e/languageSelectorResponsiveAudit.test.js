const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, '../../project-docs/32-language-selector/screenshots');

const VIEWPORTS = [
  { name: 'mobile-320', width: 320, height: 600, isMobile: true },
  { name: 'mobile-360', width: 360, height: 740, isMobile: true },
  { name: 'mobile-375', width: 375, height: 667, isMobile: true },
  { name: 'mobile-390', width: 390, height: 844, isMobile: true },
  { name: 'mobile-414', width: 414, height: 896, isMobile: true },
  { name: 'mobile-430', width: 430, height: 932, isMobile: true },
  { name: 'tablet-768', width: 768, height: 1024, isMobile: false },
  { name: 'desktop-1024', width: 1024, height: 768, isMobile: false },
  { name: 'desktop-1440', width: 1440, height: 900, isMobile: false },
];

const TEST_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Portuguese', native: 'Português', flag: '🇧🇷' },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
  { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
];

async function runLanguageSelectorAudit() {
  console.log('🚀 Asteria Language Selector Responsive & Functional QA Starting...\n');
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const results = {
    viewports: [],
    languages: [],
    modalPreserved: true,
    allPassed: true,
  };

  try {
    for (const vp of VIEWPORTS) {
      console.log(`📱 Testing Viewport: ${vp.name} (${vp.width}x${vp.height}px)...`);
      const contextOptions = { viewport: { width: vp.width, height: vp.height } };
      if (vp.isMobile) {
        contextOptions.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15';
        contextOptions.isMobile = true;
      }
      const context = await browser.newContext(contextOptions);
      const page = await context.newPage();

      await page.goto(`${BASE_URL}/games/truth-or-dare`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(400);

      // Locate the Game Setup Language Selector specifically
      const selectorBtn = page.locator('[data-testid="game-setup-language-selector"]').first();
      await selectorBtn.waitFor({ state: 'visible', timeout: 5000 });

      // Measure dimensions and layout
      const metrics = await selectorBtn.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        // Check if there is any redundant external label immediately above
        const parent = el.closest('.w-full');
        const prevSibling = parent ? parent.previousElementSibling : null;
        const hasExternalLabel = prevSibling && prevSibling.tagName === 'LABEL';

        // Check if text wraps onto multiple rows inside button
        const isSingleRow = el.scrollHeight <= rect.height + 2;

        return {
          height: rect.height,
          width: rect.width,
          hasExternalLabel: !!hasExternalLabel,
          isSingleRow,
          text: el.innerText.replace(/\n/g, ' '),
        };
      });

      console.log(`  ✓ Selector Dimensions: ${metrics.width.toFixed(1)}px x ${metrics.height.toFixed(1)}px (Compact: ${metrics.height <= 48 ? 'YES' : 'NO'})`);
      console.log(`  ✓ Redundant External Label: ${metrics.hasExternalLabel ? 'DETECTED (FAIL)' : 'REMOVED (PASS)'}`);
      console.log(`  ✓ Single-Row Compact Layout: ${metrics.isSingleRow ? 'YES (PASS)' : 'NO (FAIL)'}`);

      if (metrics.height > 48 || metrics.hasExternalLabel || !metrics.isSingleRow) {
        results.allPassed = false;
      }

      // Capture screenshot of Setup Screen showing Compact Language Selector & Categories
      const setupShot = path.join(SCREENSHOT_DIR, `${vp.name}-setup-selector.png`);
      await page.screenshot({ path: setupShot, fullPage: false });

      // Verify Modal Functionality: Click selector and verify modal opens
      await selectorBtn.click();
      await page.waitForTimeout(300);

      const modal = page.locator('div[role="dialog"]').first();
      const isModalVisible = await modal.isVisible();
      console.log(`  ✓ Language Modal Opened on Click: ${isModalVisible ? 'PASS' : 'FAIL'}`);
      if (!isModalVisible) results.allPassed = false;

      // Capture screenshot of Language Modal
      if (vp.width === 375 || vp.width === 390 || vp.width === 1024) {
        const modalShot = path.join(SCREENSHOT_DIR, `${vp.name}-modal-open.png`);
        await page.screenshot({ path: modalShot, fullPage: false });
      }

      // Close modal using Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);

      results.viewports.push({
        name: vp.name,
        width: vp.width,
        height: metrics.height,
        compact: metrics.height <= 48,
        noExternalLabel: !metrics.hasExternalLabel,
        singleRow: metrics.isSingleRow,
      });

      await context.close();
    }

    // ========================================================
    // TEST ALL 8 SUPPORTED LANGUAGES IN SELECTOR
    // ========================================================
    console.log('\n🌐 Verifying All 8 Supported Languages in Compact Selector (390px Viewport)...');
    const langContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    const langPage = await langContext.newPage();

    for (const l of TEST_LANGUAGES) {
      await langPage.goto(`${BASE_URL}/${l.code}/games/truth-or-dare`, { waitUntil: 'domcontentloaded' });
      await langPage.waitForTimeout(300);

      const selector = langPage.locator('[data-testid="game-setup-language-selector"]').first();
      const isVisible = await selector.isVisible();

      const details = await selector.evaluate((el) => ({
        height: el.getBoundingClientRect().height,
        text: el.innerText.replace(/\n/g, ' '),
      }));

      console.log(`  ✓ [${l.code.toUpperCase()}] ${l.flag} ${l.name}: Visible: ${isVisible}, Native: "${l.native}", Height: ${details.height.toFixed(1)}px`);

      if (!isVisible || details.height > 48) {
        results.allPassed = false;
      }

      const lShot = path.join(SCREENSHOT_DIR, `lang-${l.code}-compact.png`);
      await langPage.screenshot({ path: lShot, fullPage: false });

      results.languages.push({
        code: l.code,
        name: l.name,
        native: l.native,
        height: details.height,
        pass: isVisible && details.height <= 48,
      });
    }

    // Modal Language Selection Verification: Select Hindi from Modal, verify route updates
    console.log('\n🔄 Testing Language Modal Selection Interactivity...');
    await langPage.goto(`${BASE_URL}/en/games/truth-or-dare`, { waitUntil: 'domcontentloaded' });
    const enSelector = langPage.locator('button[aria-haspopup="dialog"]').filter({ hasText: /English/i }).first();
    await enSelector.click();
    await langPage.waitForTimeout(300);

    const hiOption = langPage.locator('button').filter({ hasText: /हिन्दी/i }).first();
    await hiOption.click();
    await langPage.waitForTimeout(600);

    const currentUrl = langPage.url();
    const isHindiRoute = currentUrl.includes('/hi/');
    console.log(`  ✓ Selected Hindi: URL changed to ${currentUrl} (Localized URL: ${isHindiRoute ? 'PASS' : 'FAIL'})`);
    if (!isHindiRoute) results.allPassed = false;

    await langContext.close();

    console.log('\n======================================================');
    console.log(`🎯 LANGUAGE SELECTOR AUDIT RESULT: ${results.allPassed ? 'ALL TESTS PASSED (100%)' : 'FAILURES DETECTED'}`);
    console.log('======================================================\n');
  } catch (err) {
    console.error('Audit run error:', err);
    results.allPassed = false;
  } finally {
    await browser.close();
  }
}

runLanguageSelectorAudit();
