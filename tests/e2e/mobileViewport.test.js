// Automated Mobile Viewport Regression Suite
// Tests 320px, 360px, 375px, 390px, 414px, 430px, 768px viewports
const { chromium } = require('playwright');

const VIEWPORTS = [
  { name: 'iPhone SE (1st gen) / Compact', width: 320, height: 568 },
  { name: 'Galaxy S8 / Android Compact', width: 360, height: 640 },
  { name: 'iPhone SE (3rd gen) / Mini', width: 375, height: 667 },
  { name: 'iPhone 13 / 14 / 15 Standard', width: 390, height: 844 },
  { name: 'iPhone XR / 11 / Plus', width: 414, height: 896 },
  { name: 'iPhone 14 / 15 Pro Max', width: 430, height: 932 },
  { name: 'iPad Mini / Tablet Portrait', width: 768, height: 1024 },
];

const PAGES_TO_TEST = [
  { name: 'Homepage (EN)', path: '/en' },
  { name: 'Truth or Dare Setup (EN)', path: '/en/truth-or-dare' },
  { name: 'Games Directory (EN)', path: '/en/games' },
  { name: 'Questions Browser (EN)', path: '/en/questions' },
  { name: 'Custom Deck (EN)', path: '/en/custom' },
  { name: 'Arabic RTL Truth or Dare', path: '/ar/truth-or-dare' },
  { name: 'Hindi Truth or Dare', path: '/hi/truth-or-dare' },
];

async function runMobileAudit() {
  console.log('🚀 Starting Comprehensive Mobile Viewport Regression Testing...');
  const browser = await chromium.launch({ channel: 'chrome' });
  const results = [];

  for (const vp of VIEWPORTS) {
    console.log(`\n📱 Testing Viewport: ${vp.width}x${vp.height} (${vp.name})`);
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    });

    for (const target of PAGES_TO_TEST) {
      const url = `http://localhost:3000${target.path}`;
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(500);

        // 1. Check for horizontal overflow
        const overflow = await page.evaluate(() => {
          const docWidth = document.documentElement.scrollWidth;
          const winWidth = window.innerWidth;
          const bodyWidth = document.body.scrollWidth;
          const hasHorizontalScroll = docWidth > winWidth + 1 || bodyWidth > winWidth + 1;

          // Find offending elements if any
          const offending = [];
          if (hasHorizontalScroll) {
            const all = document.querySelectorAll('*');
            for (const el of all) {
              const rect = el.getBoundingClientRect();
              if (rect.right > winWidth + 1) {
                offending.push({
                  tag: el.tagName,
                  className: el.className ? String(el.className).substring(0, 50) : '',
                  right: rect.right,
                  overflowAmount: rect.right - winWidth,
                });
                if (offending.length >= 3) break;
              }
            }
          }

          return {
            hasHorizontalScroll,
            docWidth,
            winWidth,
            offending,
          };
        });

        // 2. Check for button clipping & tap target accessibility
        const buttonMetrics = await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button, a.btn, [role="button"]'));
          let minWidth = 9999;
          let minHeight = 9999;
          let clippedCount = 0;

          for (const btn of buttons) {
            const rect = btn.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              if (rect.width < minWidth) minWidth = rect.width;
              if (rect.height < minHeight) minHeight = rect.height;
              // Check if button is clipped outside screen
              if (rect.left < 0 || rect.right > window.innerWidth) {
                clippedCount++;
              }
            }
          }

          return {
            totalButtons: buttons.length,
            minWidth: minWidth === 9999 ? 0 : Math.round(minWidth),
            minHeight: minHeight === 9999 ? 0 : Math.round(minHeight),
            clippedCount,
          };
        });

        // 3. Check for text mirroring or transform issues
        const transformAudit = await page.evaluate(() => {
          const transformed = document.querySelectorAll('[style*="transform"], [class*="rotate"], [class*="scale"]');
          let hasMirroredText = false;
          for (const el of transformed) {
            const style = window.getComputedStyle(el);
            const matrix = style.transform;
            if (matrix && matrix.includes('-1')) {
              // Check if backface-visibility is properly set
              if (style.backfaceVisibility !== 'hidden') {
                hasMirroredText = true;
              }
            }
          }
          return { hasMirroredText };
        });

        const pass = !overflow.hasHorizontalScroll && buttonMetrics.clippedCount === 0 && !transformAudit.hasMirroredText;

        results.push({
          viewport: `${vp.width}x${vp.height}`,
          viewportName: vp.name,
          page: target.name,
          path: target.path,
          hasHorizontalScroll: overflow.hasHorizontalScroll,
          scrollWidth: overflow.docWidth,
          innerWidth: overflow.winWidth,
          clippedButtons: buttonMetrics.clippedCount,
          hasMirroredText: transformAudit.hasMirroredText,
          status: pass ? 'PASS' : 'FAIL',
        });

        console.log(`  [${pass ? '✓ PASS' : '✗ FAIL'}] ${target.name} (w: ${overflow.docWidth}/${overflow.winWidth}px, clipped: ${buttonMetrics.clippedCount})`);
      } catch (err) {
        results.push({
          viewport: `${vp.width}x${vp.height}`,
          viewportName: vp.name,
          page: target.name,
          path: target.path,
          status: 'FAIL',
          error: err.message,
        });
        console.log(`  [✗ ERROR] ${target.name}: ${err.message}`);
      }
    }
    await page.close();
  }

  await browser.close();

  const total = results.length;
  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;

  console.log(`\n========================================`);
  console.log(`📱 MOBILE VIEWPORT AUDIT COMPLETE`);
  console.log(`Total Checks: ${total} | Passed: ${passed} | Failed: ${failed}`);
  console.log(`Pass Rate: ${((passed / total) * 100).toFixed(1)}%`);
  console.log(`========================================\n`);

  return { results, passed, failed, total };
}

runMobileAudit().then((res) => {
  if (res.failed > 0) {
    console.error('Mobile audit detected failures!');
    process.exit(1);
  }
  process.exit(0);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});

