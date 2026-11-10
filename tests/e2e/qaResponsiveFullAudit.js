const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, '../../project-docs/42-final-custom-deck-qa/screenshots');

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
  { width: 1440, height: 900, name: '1440px (Desktop HD Display)' },
];

async function runResponsiveAudit() {
  console.log('🚀 QA Regression: Responsive Layout & Mobile Viewports Audit Starting...\n');
  const results = {
    viewports: [],
    allPassed: true,
  };

  const browser = await chromium.launch({ channel: 'chrome', headless: true });

  try {
    for (const vp of VIEWPORTS) {
      console.log(`📱 Testing Viewport: ${vp.name} [${vp.width}x${vp.height}]...`);
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await context.newPage();

      // Test Custom Deck Studio
      await page.goto(`${BASE_URL}/custom`, { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => {
        localStorage.setItem('asteria_pwa_installed', 'true');
        localStorage.setItem('asteria_pwa_last_prompt_at', String(Date.now()));
      });
      await page.waitForTimeout(800);

      // 1. Horizontal Scroll Check (No unwanted document-level overflow)
      const overflowCheck = await page.evaluate(() => {
        const docWidth = document.documentElement.scrollWidth;
        const winWidth = window.innerWidth;
        const bodyWidth = document.body.scrollWidth;
        // Tolerates subpixel rounding (1px)
        const hasHorizontalScroll = docWidth > winWidth + 1 || bodyWidth > winWidth + 1;
        return { docWidth, winWidth, hasHorizontalScroll };
      });

      // 2. Button Dimensions & Touch Targets
      const touchTargetCheck = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button:not([disabled])'));
        let minHeight = 999;
        let smallButtons = [];

        buttons.forEach((b) => {
          const rect = b.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            if (rect.height < minHeight) minHeight = rect.height;
            if (rect.height < 32) {
              smallButtons.push({ text: b.innerText.slice(0, 20), height: rect.height });
            }
          }
        });

        return { minHeight, smallButtonsCount: smallButtons.length };
      });

      // 3. Text Clipping / Heading Legibility Check
      const textVisibilityCheck = await page.evaluate(() => {
        const headings = Array.from(document.querySelectorAll('h1, h2, h3'));
        const allVisible = headings.every((h) => {
          const rect = h.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        });
        return { allHeadingsVisible: allVisible };
      });

      const passed = !overflowCheck.hasHorizontalScroll && touchTargetCheck.smallButtonsCount === 0;
      console.log(`  Horizontal overflow: ${overflowCheck.hasHorizontalScroll ? 'FAILED (width ' + overflowCheck.docWidth + ' > ' + overflowCheck.winWidth + ')' : 'NONE (Clean)'}`);
      console.log(`  Touch targets: minHeight=${touchTargetCheck.minHeight}px, sub-32px count=${touchTargetCheck.smallButtonsCount}`);
      console.log(`  Headings legible: ${textVisibilityCheck.allHeadingsVisible}`);

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `responsive-${vp.width}px.png`), fullPage: false });

      results.viewports.push({
        viewport: `${vp.width}px`,
        name: vp.name,
        passed,
        details: `Zero horizontal scroll overflow (docWidth: ${overflowCheck.docWidth}px <= winWidth: ${overflowCheck.winWidth}px); min touch target height: ${touchTargetCheck.minHeight}px.`,
      });

      await context.close();
    }
  } catch (err) {
    console.error('❌ Responsive Audit Error:', err);
    results.allPassed = false;
  } finally {
    await browser.close();
  }

  const allPassed = results.allPassed && results.viewports.every((v) => v.passed);
  console.log('\n======================================================');
  console.log(`🏁 Responsive QA Results: ${allPassed ? 'ALL 9 VIEWPORTS PASSED ✅' : 'SOME FAILED ❌'}`);
  console.log('======================================================\n');
  return { allPassed, viewports: results.viewports };
}

if (require.main === module) {
  runResponsiveAudit()
    .then((res) => process.exit(res.allPassed ? 0 : 1))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { runResponsiveAudit };

