const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, '../../project-docs/44-language-dropdown-fix/screenshots');

const VIEWPORTS = [
  { name: '01_mobile_320', width: 320, height: 600, isMobile: true },
  { name: '02_mobile_360', width: 360, height: 740, isMobile: true },
  { name: '03_mobile_375', width: 375, height: 667, isMobile: true },
  { name: '04_mobile_390', width: 390, height: 844, isMobile: true },
  { name: '05_mobile_414', width: 414, height: 896, isMobile: true },
  { name: '06_mobile_430', width: 430, height: 932, isMobile: true },
  { name: '07_tablet_768', width: 768, height: 1024, isMobile: false },
  { name: '08_desktop_1024', width: 1024, height: 768, isMobile: false },
  { name: '09_desktop_1280', width: 1280, height: 800, isMobile: false },
  { name: '10_desktop_1440', width: 1440, height: 900, isMobile: false },
];

async function createRoom(page, hostName = 'PartyHost') {
  const res = await page.request.post(`${BASE_URL}/api/rooms/create`, {
    data: {
      gameId: 'truth-or-dare',
      categoryId: 'classic-party',
      hostName,
      language: 'en',
    },
  });
  if (!res.ok()) {
    throw new Error(`Failed to create room: ${res.status()} ${await res.text()}`);
  }
  const data = await res.json();
  return {
    room: data.room,
    roomCode: data.roomCode,
    hostPlayerId: data.hostPlayerId,
    sessionToken: data.sessionToken,
  };
}

async function runAudit() {
  console.log('🚀 Starting Global Language Dropdown Mobile Overlap & Transparency Audit...\n');

  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: [
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
    ],
  });

  const auditReport = {
    viewportsTested: [],
    separationOfConcerns: null,
    allPassed: true,
  };

  try {
    // Set up a room once to test in Party Room context
    const setupPage = await browser.newPage();
    const { roomCode, hostPlayerId, sessionToken } = await createRoom(setupPage, 'PartyHost');
    console.log(`✓ Created test party room: ${roomCode} (Host ID: ${hostPlayerId})`);
    await setupPage.close();

    // ========================================================
    // TEST 1: 10 Viewports in Active Party Room Context
    // ========================================================
    for (const vp of VIEWPORTS) {
      console.log(`\n📱 Auditing Viewport: ${vp.name} (${vp.width}x${vp.height}px)...`);
      const contextOptions = {
        viewport: { width: vp.width, height: vp.height },
      };
      if (vp.isMobile) {
        contextOptions.userAgent =
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
        contextOptions.isMobile = true;
        contextOptions.hasTouch = true;
      }

      const context = await browser.newContext(contextOptions);
      const page = await context.newPage();

      // Suppress PWA promotion modal and inject Host session
      await page.addInitScript(
        ({ code, pid, token }) => {
          localStorage.setItem('asteria_pwa_installed', 'true');
          localStorage.setItem('asteria_sound_muted', 'true');
          localStorage.setItem(
            `asteria_multiplayer_session_${code}`,
            JSON.stringify({ playerId: pid, sessionToken: token })
          );
        },
        { code: roomCode, pid: hostPlayerId, token: sessionToken }
      );

      await page.goto(`${BASE_URL}/room/${roomCode}`, { waitUntil: 'domcontentloaded' });
      // Wait for Party Room reconnect/render
      await page.locator('text=/Party Room|Party Lobby/i').first().waitFor({ state: 'visible', timeout: 4000 }).catch(() => {});

      // Verify Party Room loaded properly
      const hasPartyRoomHeading = await page.locator('text=/Party Room|Party Lobby/i').first().isVisible().catch(() => false);
      console.log(`  ✓ Joined Active Party Room UI: ${hasPartyRoomHeading ? 'YES' : 'NO'}`);

      // Find the Header Language Selector button
      const langTrigger = page.locator('header button[aria-controls="language-selector-dropdown"]').first();
      await langTrigger.waitFor({ state: 'visible', timeout: 5000 });

      // Click to open dropdown
      await langTrigger.click();
      await page.waitForTimeout(400);

      const dropdown = page.locator('#language-selector-dropdown').first();
      const isVisible = await dropdown.isVisible();
      console.log(`  ✓ Dropdown opened in header: ${isVisible ? 'YES' : 'NO'}`);

      if (!isVisible) {
        auditReport.allPassed = false;
        console.error(`  ❌ Dropdown failed to open in ${vp.name}`);
        await context.close();
        continue;
      }

      // Check positioning, portal mount, solid background opacity & bounding box strictly within viewport
      const bounds = await dropdown.evaluate((el, vpWidth) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        const bg = style.backgroundColor;
        const opacity = style.opacity;
        const zIndex = style.zIndex;
        const isPortaled = el.parentElement === document.body;

        // Parse rgb/rgba
        let isOpaque = false;
        if (bg === 'rgb(13, 13, 30)') {
          isOpaque = true;
        } else if (bg.startsWith('rgb(') && !bg.startsWith('rgba(')) {
          isOpaque = true;
        } else if (bg.endsWith(', 1)')) {
          isOpaque = true;
        }

        const docOverflow = document.documentElement.scrollWidth > vpWidth;

        return {
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height,
          bg,
          opacity,
          zIndex,
          isPortaled,
          fitsViewportX: rect.left >= 0 && rect.right <= vpWidth + 1,
          noOverlapLeft: rect.left >= 8,
          noOverlapRight: rect.right <= vpWidth - 8,
          isSolidOpaque: isOpaque && opacity === '1',
          docOverflow,
        };
      }, vp.width);

      console.log(`  ✓ Portal Mounted to <body>: ${bounds.isPortaled ? 'YES (Stacking Trap Free)' : 'NO'}`);
      console.log(
        `  ✓ Dropdown Dimensions: ${bounds.width.toFixed(1)}px x ${bounds.height.toFixed(1)}px | Left: ${bounds.left.toFixed(1)}px, Right: ${bounds.right.toFixed(1)}px`
      );
      console.log(`  ✓ Fully Within Viewport [0, ${vp.width}px]: ${bounds.fitsViewportX ? 'PASS' : 'FAIL'}`);
      console.log(`  ✓ Safe Margins (>= 8px from edges): ${bounds.noOverlapLeft && bounds.noOverlapRight ? 'PASS' : 'FAIL'}`);
      console.log(`  ✓ Solid Opaque Surface (${bounds.bg}, opacity=${bounds.opacity}): ${bounds.isSolidOpaque ? 'PASS (Zero Ghosting)' : 'FAIL'}`);
      console.log(`  ✓ Horizontal Page Overflow: ${bounds.docOverflow ? 'DETECTED (FAIL)' : 'NONE (PASS)'}`);

      if (!bounds.isPortaled || !bounds.fitsViewportX || !bounds.isSolidOpaque || bounds.docOverflow) {
        auditReport.allPassed = false;
      }

      // Capture screenshot of dropdown open
      const dropdownShotPath = path.join(SCREENSHOT_DIR, `${vp.name}_dropdown_open.png`);
      await page.screenshot({ path: dropdownShotPath, fullPage: false });
      console.log(`  📸 Saved screenshot: ${dropdownShotPath}`);

      // Verify all 8 languages appear in the list
      const optionCount = await dropdown.locator('button[role="option"]').count();
      console.log(`  ✓ Language Count: ${optionCount} of 8 languages present: ${optionCount === 8 ? 'PASS' : 'FAIL'}`);
      if (optionCount !== 8) {
        auditReport.allPassed = false;
      }

      // Verify Active Indicator
      const activeOption = dropdown.locator('button[role="option"][aria-selected="true"]').first();
      const hasActive = await activeOption.isVisible();
      const activeText = hasActive ? await activeOption.innerText() : 'none';
      console.log(`  ✓ Active Language Identified: ${activeText.replace(/\n/g, ' ')}`);

      // Test Escape key closes dropdown
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      const isClosedAfterEsc = !(await dropdown.isVisible());
      console.log(`  ✓ Closed via Escape Key: ${isClosedAfterEsc ? 'PASS' : 'FAIL'}`);
      if (!isClosedAfterEsc) auditReport.allPassed = false;

      // Test outside click closes dropdown (reopen then click outside)
      await langTrigger.click();
      await page.waitForTimeout(300);
      await page.mouse.click(10, 200);
      await page.waitForTimeout(300);
      const isClosedAfterOutside = !(await dropdown.isVisible());
      console.log(`  ✓ Closed via Outside Click: ${isClosedAfterOutside ? 'PASS' : 'FAIL'}`);
      if (!isClosedAfterOutside) auditReport.allPassed = false;

      auditReport.viewportsTested.push({
        name: vp.name,
        width: vp.width,
        bounds,
        optionCount,
        isClosedAfterEsc,
        isClosedAfterOutside,
      });

      await context.close();
    }

    // ========================================================
    // TEST 2: Language Switching & RTL (Hindi & Arabic) on Mobile 390px
    // ========================================================
    console.log('\n🌐 Testing Language Switching & RTL Support (390px Mobile)...');
    const testCtx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      isMobile: true,
      hasTouch: true,
    });
    const testPage = await testCtx.newPage();
    await testPage.addInitScript(
      ({ code, pid, token }) => {
        localStorage.setItem('asteria_pwa_installed', 'true');
        localStorage.setItem('asteria_sound_muted', 'true');
        localStorage.setItem(
          `asteria_multiplayer_session_${code}`,
          JSON.stringify({ playerId: pid, sessionToken: token })
        );
      },
      { code: roomCode, pid: hostPlayerId, token: sessionToken }
    );

    await testPage.goto(`${BASE_URL}/room/${roomCode}`, { waitUntil: 'domcontentloaded' });
    await testPage.waitForTimeout(900);

    // 1. Switch to Hindi
    console.log('  → Switching to Hindi...');
    const trigger = testPage.locator('header button[aria-controls="language-selector-dropdown"]').first();
    await trigger.click();
    await testPage.waitForTimeout(300);

    const hiBtn = testPage.locator('#language-selector-dropdown button[role="option"]', { hasText: 'हिन्दी' });
    await hiBtn.click();
    await testPage.waitForTimeout(600);

    // Verify UI translated into Hindi and NO 404 error occurred
    const htmlLang = await testPage.getAttribute('html', 'lang');
    const hiNotFound = await testPage.locator('text=This page could not be found').isVisible().catch(() => false);
    const hiRoomActive = await testPage.locator('text=/Party Lobby|Party Room/i').first().isVisible().catch(() => false);
    console.log(`  ✓ HTML lang attribute: ${htmlLang}`);
    console.log(`  ✓ Party Room Remains Active (No 404 Navigation): ${!hiNotFound && hiRoomActive ? 'PASS' : 'FAIL'}`);
    if (hiNotFound || !hiRoomActive) auditReport.allPassed = false;

    const hiShot = path.join(SCREENSHOT_DIR, 'hindi_party_room_view.png');
    await testPage.screenshot({ path: hiShot, fullPage: false });
    console.log(`  📸 Saved Hindi screenshot: ${hiShot}`);

    // Reopen dropdown to verify Hindi is Active
    await trigger.click();
    await testPage.waitForTimeout(300);
    const hiDropdown = testPage.locator('#language-selector-dropdown').first();
    const hiActive = await hiDropdown.locator('button[role="option"][aria-selected="true"]').innerText();
    console.log(`  ✓ Hindi Active State in Dropdown: ${hiActive.replace(/\n/g, ' ')}`);

    const hiDropdownShot = path.join(SCREENSHOT_DIR, 'hindi_dropdown_open.png');
    await testPage.screenshot({ path: hiDropdownShot, fullPage: false });

    // 2. Switch to Arabic (RTL)
    console.log('\n  → Switching to Arabic (RTL)...');
    const arBtn = testPage.locator('#language-selector-dropdown button[role="option"]', { hasText: 'العربية' });
    await arBtn.click();
    await testPage.waitForTimeout(600);

    const htmlDir = await testPage.getAttribute('html', 'dir');
    const arNotFound = await testPage.locator('text=This page could not be found').isVisible().catch(() => false);
    const arRoomActive = await testPage.locator('text=/Party Lobby|Party Room/i').first().isVisible().catch(() => false);
    console.log(`  ✓ HTML dir attribute: ${htmlDir} (RTL expected)`);
    console.log(`  ✓ Party Room Remains Active in Arabic RTL (No 404): ${!arNotFound && arRoomActive ? 'PASS' : 'FAIL'}`);
    if (arNotFound || !arRoomActive) auditReport.allPassed = false;
    if (htmlDir !== 'rtl') {
      console.error('  ❌ Arabic did not set dir="rtl" on <html>');
      auditReport.allPassed = false;
    }

    // Reopen dropdown in RTL mode and verify positioning
    await trigger.click();
    await testPage.waitForTimeout(300);
    const arDropdown = testPage.locator('#language-selector-dropdown').first();

    const arBounds = await arDropdown.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return {
        left: rect.left,
        right: rect.right,
        width: rect.width,
        fitsViewport: rect.left >= 0 && rect.right <= 390,
      };
    });
    console.log(
      `  ✓ Arabic RTL Dropdown Bounds: Left: ${arBounds.left.toFixed(1)}px, Right: ${arBounds.right.toFixed(1)}px (Fits: ${arBounds.fitsViewport ? 'PASS' : 'FAIL'})`
    );
    if (!arBounds.fitsViewport) auditReport.allPassed = false;

    const arDropdownShot = path.join(SCREENSHOT_DIR, 'arabic_rtl_dropdown_open.png');
    await testPage.screenshot({ path: arDropdownShot, fullPage: false });
    console.log(`  📸 Saved Arabic RTL screenshot: ${arDropdownShot}`);

    // Switch back to English
    const enBtn = testPage.locator('#language-selector-dropdown button[role="option"]', { hasText: 'English' });
    await enBtn.click();
    await testPage.waitForTimeout(600);

    // ========================================================
    // TEST 3: Separation of Concerns Verification
    // Global UI Language vs Room Question Language
    // ========================================================
    console.log('\n🔒 Verifying Global Translation vs Room Question Language Separation...');
    const roomCheckRes = await testPage.request.get(`${BASE_URL}/api/rooms/${roomCode}`);
    const roomCheckData = await roomCheckRes.json();
    const currentRoomLang = roomCheckData.room ? roomCheckData.room.language : null;

    console.log(`  ✓ Original Room Question Language: 'en'`);
    console.log(`  ✓ Room Question Language after UI Language Changes: '${currentRoomLang}'`);
    const isSeparated = currentRoomLang === 'en';
    console.log(`  ✓ Separation Preserved (Room language was NOT corrupted): ${isSeparated ? 'PASS' : 'FAIL'}`);
    if (!isSeparated) auditReport.allPassed = false;
    auditReport.separationOfConcerns = {
      original: 'en',
      afterUIChanges: currentRoomLang,
      passed: isSeparated,
    };

    await testCtx.close();

    // ========================================================
    // SUMMARY
    // ========================================================
    console.log('\n======================================================');
    console.log(`🎯 AUDIT COMPLETE: ${auditReport.allPassed ? 'ALL AUDIT TESTS PASSED (100%)' : 'FAILURES DETECTED'}`);
    console.log('======================================================\n');
  } catch (err) {
    console.error('Audit execution error:', err);
    auditReport.allPassed = false;
  } finally {
    await browser.close();
  }

  fs.writeFileSync(
    path.join(__dirname, '../../project-docs/44-language-dropdown-fix/audit-results.json'),
    JSON.stringify(auditReport, null, 2)
  );

  return auditReport.allPassed;
}

runAudit().then((passed) => {
  process.exit(passed ? 0 : 1);
});
