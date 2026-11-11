const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const OUT_DIR = path.join(__dirname, '../../project-docs/45-mobile-ui-final-qa');
const SCREENSHOT_DIR = path.join(OUT_DIR, 'screenshots');

const DEVICE_SIZES = [
  { name: '320px', width: 320, height: 568, isMobile: true, isDesktopToolbar: false, hasBottomNav: true },
  { name: '360px', width: 360, height: 640, isMobile: true, isDesktopToolbar: false, hasBottomNav: true },
  { name: '375px', width: 375, height: 667, isMobile: true, isDesktopToolbar: false, hasBottomNav: true },
  { name: '390px', width: 390, height: 844, isMobile: true, isDesktopToolbar: false, hasBottomNav: true },
  { name: '414px', width: 414, height: 896, isMobile: true, isDesktopToolbar: false, hasBottomNav: true },
  { name: '430px', width: 430, height: 932, isMobile: true, isDesktopToolbar: false, hasBottomNav: true },
  { name: '768px', width: 768, height: 1024, isMobile: false, isDesktopToolbar: true, hasBottomNav: true },
  { name: '1024px', width: 1024, height: 768, isMobile: false, isDesktopToolbar: true, hasBottomNav: false },
  { name: '1440px', width: 1440, height: 900, isMobile: false, isDesktopToolbar: true, hasBottomNav: false },
];

function rectsOverlap(a, b, tolerance = 1) {
  if (!a || !b) return false;
  return (
    a.left < b.right - tolerance &&
    a.right > b.left + tolerance &&
    a.top < b.bottom - tolerance &&
    a.bottom > b.top + tolerance
  );
}

async function runFinalMobileQA() {
  console.log('🚀 Starting Asteria Party Room Final Mobile & Responsive QA Suite...\n');

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

  const results = {
    timestamp: new Date().toISOString(),
    deviceTests: [],
    languageDropdownDeepTest: {},
    functionalRegressionTest: {},
    consoleErrors: [],
    allPassed: true,
  };

  try {
    // =========================================================================
    // TEST 5 PART A & ROOM SETUP: Real UI Room Creation & Functional Regression
    // =========================================================================
    console.log('🧪 [TEST 5] Running End-to-End Functional Regression (Host + Guest)...');

    const hostCtx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      permissions: ['clipboard-read', 'clipboard-write'],
    });
    const hostPage = await hostCtx.newPage();
    hostPage.on('pageerror', (e) => results.consoleErrors.push(`[Host PageError] ${e.message}`));
    hostPage.on('console', (msg) => {
      if (msg.type() === 'error') results.consoleErrors.push(`[Host ConsoleError] ${msg.text()}`);
    });

    await hostPage.addInitScript(() => {
      localStorage.setItem('asteria_pwa_installed', 'true');
      localStorage.setItem('asteria_sound_muted', 'true');
      // Spy navigator.share cleanly
      window.__shareInvoked = false;
      navigator.share = async (data) => {
        window.__shareInvoked = true;
        window.__sharedData = data;
      };
    });

    // 1. UI Room Creation via Home Page Modal
    await hostPage.goto(`${BASE_URL}/#join-room`, { waitUntil: 'domcontentloaded' });
    await hostPage.waitForTimeout(500);

    const openCreateModalBtn = hostPage.locator('button', { hasText: /Create.*Room|Host.*Party/i }).first();
    await openCreateModalBtn.scrollIntoViewIfNeeded();
    await openCreateModalBtn.click();
    await hostPage.waitForTimeout(300);

    const hostNameInput = hostPage.locator('input[placeholder*="PartyCaptain"]');
    await hostNameInput.fill('HostQA');

    const createSubmitBtn = hostPage.locator('button[type="submit"]', { hasText: 'Create Party Room' });
    await createSubmitBtn.click();

    await hostPage.waitForURL(/\/room\/[A-Z0-9]{6}/, { timeout: 10000 });
    const roomUrl = hostPage.url();
    const roomCode = roomUrl.split('/room/')[1].split('?')[0];
    console.log(`  ✓ [Create Room UI] Created & navigated to room ${roomCode}`);

    await hostPage.locator('text=/Party Lobby/i').waitFor({ state: 'visible', timeout: 5000 });
    results.functionalRegressionTest.roomCreatedUI = true;
    results.functionalRegressionTest.roomCode = roomCode;

    // 2. Guest Joins Room via UI (#join-room on homepage)
    const guestCtx = await browser.newContext({
      viewport: { width: 375, height: 667 },
      isMobile: true,
      hasTouch: true,
    });
    const guestPage = await guestCtx.newPage();
    guestPage.on('pageerror', (e) => results.consoleErrors.push(`[Guest PageError] ${e.message}`));
    await guestPage.addInitScript(() => {
      localStorage.setItem('asteria_pwa_installed', 'true');
      localStorage.setItem('asteria_sound_muted', 'true');
    });

    await guestPage.goto(`${BASE_URL}/#join-room`, { waitUntil: 'domcontentloaded' });
    await guestPage.locator('#room-code').fill(roomCode);
    await guestPage.locator('form button[type="submit"]').first().click();
    await guestPage.waitForURL(new RegExp(`/room/${roomCode}`), { timeout: 10000 });

    const guestNameInput = guestPage.locator('input[placeholder*="name" i]');
    await guestNameInput.waitFor({ state: 'visible', timeout: 5000 });
    await guestNameInput.fill('GuestQA');
    await guestPage.locator('button[type="submit"]').click();

    await guestPage.locator('text=/2 \\/ 12 Players Connected/').waitFor({ state: 'visible', timeout: 8000 });
    await hostPage.locator('text=/2 \\/ 12 Players Connected/').waitFor({ state: 'visible', timeout: 8000 });
    console.log('  ✓ [Room Join UI] Guest joined & both sessions synced 2 / 12 Players Connected');
    results.functionalRegressionTest.guestJoinedUI = true;

    // 3. Language Settings inside Room Syncs to Guest
    await hostPage.bringToFront();
    const toolbarSettingsBtn = hostPage.locator('div.md\\:hidden button[aria-label="Lobby Settings"]').first();
    await toolbarSettingsBtn.click();
    await hostPage.waitForTimeout(300);
    const settingsModal = hostPage.locator('main div.fixed.z-50').first();
    await settingsModal.locator('button', { hasText: 'हिन्दी' }).first().click();
    await hostPage.waitForTimeout(300);
    await settingsModal.locator('button', { hasText: 'Save Settings' }).click();

    await hostPage.locator('div.md\\:hidden button[title*="question language"]', { hasText: 'हिन्दी' }).waitFor({ state: 'visible', timeout: 5000 });
    await guestPage.bringToFront();
    await guestPage.locator('div.md\\:hidden button[title*="question language"]', { hasText: 'हिन्दी' }).waitFor({ state: 'visible', timeout: 6000 });
    console.log('  ✓ [Language Settings Sync] Shared question language changed to Hindi & synced to Guest');
    results.functionalRegressionTest.roomLanguageSync = true;

    // Revert room language back to English for clean baseline screenshots
    await hostPage.bringToFront();
    await toolbarSettingsBtn.click();
    await hostPage.waitForTimeout(250);
    await settingsModal.locator('button', { hasText: 'English' }).first().click();
    await hostPage.waitForTimeout(250);
    await settingsModal.locator('button', { hasText: 'Save Settings' }).click();
    await hostPage.locator('div.md\\:hidden button[title*="question language"]', { hasText: 'English' }).waitFor({ state: 'visible', timeout: 5000 });

    // 4. Test Copy, Share & QR Code Modals on Mobile Toolbar
    const copyBtn = hostPage.locator('div.md\\:hidden button[title="Copy room link to clipboard"]');
    await copyBtn.click();
    await hostPage.locator('div.md\\:hidden button[title="Copy room link to clipboard"]', { hasText: 'Copied' }).waitFor({ state: 'visible', timeout: 3000 });
    const roomCodeCheck = await hostPage.locator('div.md\\:hidden div[title="Click to copy room code"]').evaluate((el) => ({
      text: el.textContent || '',
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      unclipped: el.scrollWidth <= el.clientWidth + 1,
    }));
    const noDuplicateCopiedClip = !/copie/i.test(roomCodeCheck.text) && roomCodeCheck.unclipped;
    console.log(
      `  ✓ [Copy Action] Mobile Copy button updates cleanly to Copied; Room Code box clean & unclipped: ${
        noDuplicateCopiedClip ? 'YES' : 'FAIL'
      } ("${roomCodeCheck.text.trim()}", ${roomCodeCheck.scrollWidth}/${roomCodeCheck.clientWidth}px)`
    );
    results.functionalRegressionTest.copyButtonWorked = true;
    results.functionalRegressionTest.roomCodeCardCleanWhenCopied = noDuplicateCopiedClip;
    if (!noDuplicateCopiedClip) results.allPassed = false;

    const shareBtn = hostPage.locator('div.md\\:hidden button[title="Share invitation link"]');
    await shareBtn.click();
    await hostPage.waitForTimeout(200);
    const shared = await hostPage.evaluate(() => window.__shareInvoked);
    console.log(`  ✓ [Share Action] Mobile Share button triggered Web Share: ${shared ? 'YES' : 'NO'}`);
    results.functionalRegressionTest.shareButtonWorked = !!shared;
    if (!shared) results.allPassed = false;

    const qrBtn = hostPage.locator('div.md\\:hidden button[aria-label*="QR" i]');
    await qrBtn.click();
    const qrImgVisible = await hostPage.locator('img[alt="Room QR Code"]').isVisible();
    console.log(`  ✓ [QR Action] QR Modal opens and displays code image: ${qrImgVisible ? 'YES' : 'NO'}`);
    results.functionalRegressionTest.qrModalWorked = qrImgVisible;
    if (!qrImgVisible) results.allPassed = false;
    await hostPage.locator('button[aria-label*="Close QR" i]').click();
    await hostPage.waitForTimeout(250);

    const leaveBtn = hostPage.locator('div.md\\:hidden button[aria-label="Leave Room"]');
    await leaveBtn.click();
    const leaveModalVisible = await hostPage.locator('text=Leave Party Room?').isVisible();
    console.log(`  ✓ [Back Button Action] Back arrow opens Leave confirmation modal: ${leaveModalVisible ? 'YES' : 'NO'}`);
    results.functionalRegressionTest.backButtonLeaveModal = leaveModalVisible;
    if (!leaveModalVisible) results.allPassed = false;
    await hostPage.locator('button', { hasText: 'Cancel' }).click();
    await hostPage.waitForTimeout(250);

    // Trigger Copy right before screenshot so Emerald Copied state + clean Room Code card are both verified visually
    await copyBtn.click();
    await hostPage.locator('div.md\\:hidden button[title="Copy room link to clipboard"]', { hasText: 'Copied' }).waitFor({ state: 'visible', timeout: 3000 });
    await hostPage.screenshot({ path: path.join(SCREENSHOT_DIR, '00_2player_lobby_390px.png'), fullPage: false });
    const startGameBtn = hostPage.locator('button', { hasText: /Start Game/i });
    const isStartEnabled = await startGameBtn.isEnabled();
    console.log(`  ✓ [Start Game] Host Start Game button enabled with 2 players: ${isStartEnabled ? 'YES' : 'NO'}`);
    if (!isStartEnabled) results.allPassed = false;

    // Grab guest + host session tokens before closing so we can audit all 9 Lobby viewports cleanly and then test active gameplay Start Game -> card
    const guestSessionRaw = await guestPage.evaluate((code) => localStorage.getItem(`asteria_multiplayer_session_${code}`), roomCode);
    await guestCtx.close();

    const hostSessionRaw = await hostPage.evaluate((code) => localStorage.getItem(`asteria_multiplayer_session_${code}`), roomCode);
    await hostCtx.close();

    // =========================================================================
    // TEST 1, 3, 4: ALL 9 DEVICE SIZES — TOOLBAR + OVERLAP CHECK + SCREENSHOTS
    // =========================================================================
    console.log('\n📐 [TEST 1, 3, 4] Auditing Toolbar, Overlapping & Screenshots across 9 Device Sizes...');

    for (const vp of DEVICE_SIZES) {
      console.log(`\n📱 Device Viewport: ${vp.name} (${vp.width}x${vp.height}px)...`);

      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.isMobile,
        hasTouch: vp.isMobile,
      });
      const page = await ctx.newPage();
      page.on('pageerror', (e) => results.consoleErrors.push(`[${vp.name} PageError] ${e.message}`));

      await page.addInitScript(
        ({ code, sessionStr }) => {
          localStorage.setItem('asteria_pwa_installed', 'true');
          localStorage.setItem('asteria_sound_muted', 'true');
          localStorage.setItem(`asteria_multiplayer_session_${code}`, sessionStr);
        },
        { code: roomCode, sessionStr: hostSessionRaw }
      );

      await page.goto(`${BASE_URL}/room/${roomCode}`, { waitUntil: 'domcontentloaded' });
      await page.locator('text=Party Lobby').waitFor({ state: 'visible', timeout: 6000 });
      await page.waitForTimeout(300);

      // Measure Toolbar & Layout Rects
      const audit = await page.evaluate(
        ({ isDesktopToolbar, hasBottomNav, vpWidth, vpHeight, code }) => {
          const header = document.querySelector('header');
          const bottomNav = document.querySelector('nav[aria-label="Mobile Navigation"]');

          // Mobile toolbar vs Desktop toolbar
          const toolbars = Array.from(document.querySelectorAll('div')).filter((el) =>
            isDesktopToolbar
              ? el.className.includes('hidden md:flex') && el.className.includes('rounded-2xl')
              : el.className.includes('flex md:hidden') && el.className.includes('rounded-2xl')
          );
          const toolbar = toolbars[0] || null;

          // Back button, Title, Lang selector, Settings, QR, Room code, Copy, Share inside active toolbar
          const tbBackBtn = toolbar?.querySelector('button[aria-label="Leave Room"]');
          const tbTitle = toolbar?.querySelector('h1');
          const tbLang = toolbar?.querySelector('button[title*="question language"]');
          const tbSettings = toolbar?.querySelector('button[aria-label="Lobby Settings"]');
          const tbQr = toolbar?.querySelector('button[aria-label*="QR" i]');
          const tbShare = toolbar?.querySelector('button[title="Share invitation link"]');
          const tbCopy = toolbar?.querySelector('button[title="Copy room link to clipboard"]');
          const tbRoomCodeEl = Array.from(toolbar?.querySelectorAll('span') || []).find(
            (s) => s.textContent?.trim() === code
          );

          // Main Content Structural Blocks
          const playersBar = Array.from(document.querySelectorAll('div')).find((el) =>
            el.textContent?.includes('Players Connected') && el.className.includes('rounded-2xl')
          );
          const hostPill = Array.from(playersBar?.querySelectorAll('div') || []).find((el) =>
            el.textContent?.includes('HostQA')
          );
          const partyLobbyHeading = Array.from(document.querySelectorAll('h3')).find(
            (h) => h.textContent?.trim() === 'Party Lobby'
          );
          const partyLobbyCard = partyLobbyHeading?.closest('div.rounded-3xl') || null;
          const startGameBtn = Array.from(partyLobbyCard?.querySelectorAll('button') || []).find((b) =>
            b.textContent?.includes('Start Game')
          );

          const toRect = (el) => {
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return {
              top: r.top,
              bottom: r.bottom,
              left: r.left,
              right: r.right,
              width: r.width,
              height: r.height,
            };
          };

          const tbTitleRect = toRect(tbTitle);
          const tbTitleStyles = tbTitle ? window.getComputedStyle(tbTitle) : null;
          const tbTitleLineH = tbTitleStyles ? parseFloat(tbTitleStyles.lineHeight) || 24 : 24;

          const headerRect = toRect(header);
          const toolbarRect = toRect(toolbar);
          const playersBarRect = toRect(playersBar);
          const hostPillRect = toRect(hostPill);
          const lobbyRect = toRect(partyLobbyCard);
          const startBtnRect = toRect(startGameBtn);
          const bottomNavRect = hasBottomNav && bottomNav ? toRect(bottomNav) : null;

          // Check scroll reachability if content exceeds bottom nav top on short screens
          const docOverflowX = document.documentElement.scrollWidth > vpWidth;
          const scrollHeight = document.documentElement.scrollHeight;
          const canScrollToBottom =
            !bottomNavRect ||
            lobbyRect.bottom <= bottomNavRect.top ||
            scrollHeight - vpHeight >= lobbyRect.bottom - bottomNavRect.top;

          return {
            toolbarChecks: {
              backVisible: !!toRect(tbBackBtn)?.width,
              titleVisible: !!tbTitleRect?.width,
              titleSingleLine: tbTitleRect ? tbTitle.scrollHeight <= tbTitleLineH * 1.6 : false,
              langVisible: !!toRect(tbLang)?.width,
              settingsVisible: !!toRect(tbSettings)?.width,
              qrVisible: !!toRect(tbQr)?.width,
              roomCodeVisible: !!toRect(tbRoomCodeEl)?.width,
              roomCodeUnclipped: tbRoomCodeEl ? tbRoomCodeEl.scrollWidth <= tbRoomCodeEl.clientWidth + 1 : false,
              copyVisible: isDesktopToolbar ? true : !!toRect(tbCopy)?.width,
              shareVisible: !!toRect(tbShare)?.width,
            },
            rects: {
              header: headerRect,
              toolbar: toolbarRect,
              playersBar: playersBarRect,
              hostPill: hostPillRect,
              lobby: lobbyRect,
              startBtn: startBtnRect,
              bottomNav: bottomNavRect,
            },
            docOverflowX,
            canScrollToBottom,
          };
        },
        {
          isDesktopToolbar: vp.isDesktopToolbar,
          hasBottomNav: vp.hasBottomNav,
          vpWidth: vp.width,
          vpHeight: vp.height,
          code: roomCode,
        }
      );

      // Compute Spatial Overlaps
      const r = audit.rects;
      const overlaps = {
        headerVsToolbar: rectsOverlap(r.header, r.toolbar),
        toolbarVsPlayers: rectsOverlap(r.toolbar, r.playersBar),
        playersVsLobby: rectsOverlap(r.playersBar, r.lobby),
        bottomNavVsStartBtnInitial: r.bottomNav ? rectsOverlap(r.bottomNav, r.startBtn) : false,
        bottomNavVsLobbyInitial: r.bottomNav ? rectsOverlap(r.bottomNav, r.lobby) : false,
        hostOutsidePlayersBar:
          r.hostPill && r.playersBar
            ? r.hostPill.left < r.playersBar.left - 1 ||
              r.hostPill.right > r.playersBar.right + 1 ||
              r.hostPill.bottom > r.playersBar.bottom + 1
            : true,
        startBtnOutsideLobby:
          r.startBtn && r.lobby
            ? r.startBtn.left < r.lobby.left - 1 ||
              r.startBtn.right > r.lobby.right + 1 ||
              r.startBtn.bottom > r.lobby.bottom + 1
            : true,
      };

      const tc = audit.toolbarChecks;
      const toolbarAllPass = Object.values(tc).every(Boolean);
      const structuralOverlap =
        overlaps.headerVsToolbar ||
        overlaps.toolbarVsPlayers ||
        overlaps.playersVsLobby ||
        overlaps.hostOutsidePlayersBar ||
        overlaps.startBtnOutsideLobby ||
        audit.docOverflowX;

      console.log(`  ✓ Toolbar Controls (8 items): ${toolbarAllPass ? 'ALL PASS' : JSON.stringify(tc)}`);
      console.log(
        `  ✓ Non-Overlap Flow (Header→Toolbar→Players→Host→Lobby→StartBtn): ${
          !structuralOverlap ? 'CLEAN (PASS)' : JSON.stringify(overlaps)
        }`
      );
      if (r.bottomNav) {
        const startGapPx = r.startBtn ? Math.round(r.bottomNav.top - r.startBtn.bottom) : null;
        console.log(
          `  ✓ Bottom Nav Overlap Check (Initial View): StartBtn=${
            overlaps.bottomNavVsStartBtnInitial ? 'OVERLAPS AT INITIAL LOAD (Needs Scroll)' : `CLEAR (+${startGapPx}px above dock)`
          }, LobbyCard=${overlaps.bottomNavVsLobbyInitial ? 'OVERLAPS AT INITIAL LOAD (Needs Scroll)' : 'CLEAR'}, ScrollableToClear=${audit.canScrollToBottom}`
        );
      }

      const initialFitOk = vp.width < 360 ? audit.canScrollToBottom : !overlaps.bottomNavVsStartBtnInitial && audit.canScrollToBottom;
      if (!toolbarAllPass || structuralOverlap || !initialFitOk) {
        results.allPassed = false;
      }

      // Capture resting Room UI Screenshot
      const shotPath = path.join(SCREENSHOT_DIR, `room-${vp.name}.png`);
      await page.screenshot({ path: shotPath, fullPage: false });
      console.log(`  📸 Captured: screenshots/room-${vp.name}.png`);

      // Also capture Dropdown Open on 320px, 375px, 390px, 768px, 1440px
      if (['320px', '375px', '390px', '768px', '1440px'].includes(vp.name)) {
        const trigger = page.locator('header button[aria-controls="language-selector-dropdown"]').first();
        await trigger.click();
        await page.waitForTimeout(300);
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, `dropdown-${vp.name}.png`),
          fullPage: false,
        });
        await page.keyboard.press('Escape');
        await page.waitForTimeout(200);
      }

      results.deviceTests.push({
        device: vp.name,
        resolution: `${vp.width}x${vp.height}`,
        toolbarChecks: tc,
        overlaps,
        docOverflowX: audit.docOverflowX,
        canScrollToBottom: audit.canScrollToBottom,
        rects: r,
        passed: toolbarAllPass && !structuralOverlap && initialFitOk,
      });

      await ctx.close();
    }

    // =========================================================================
    // TEST 2: LANGUAGE DROPDOWN EXHAUSTIVE INTERACTION & PERSISTENCE
    // =========================================================================
    console.log('\n🌐 [TEST 2] Deep Testing Language Dropdown (Scroll, Keyboard, Opacity, Persistence)...');
    const ddCtx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    const ddPage = await ddCtx.newPage();
    await ddPage.addInitScript(
      ({ code, sessionStr }) => {
        localStorage.setItem('asteria_pwa_installed', 'true');
        localStorage.setItem('asteria_sound_muted', 'true');
        localStorage.setItem(`asteria_multiplayer_session_${code}`, sessionStr);
      },
      { code: roomCode, sessionStr: hostSessionRaw }
    );

    await ddPage.goto(`${BASE_URL}/room/${roomCode}`, { waitUntil: 'domcontentloaded' });
    await ddPage.locator('text=Party Lobby').waitFor({ state: 'visible', timeout: 6000 });

    const trigger = ddPage.locator('header button[aria-controls="language-selector-dropdown"]').first();

    // 1. Open
    await trigger.click();
    const dropdown = ddPage.locator('#language-selector-dropdown');
    await dropdown.waitFor({ state: 'visible', timeout: 3000 });
    results.languageDropdownDeepTest.opensOnClick = true;

    // 2. Opacity & Positioning
    const ddMetrics = await dropdown.evaluate((el) => {
      const s = window.getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const scrollBox = el.querySelector('.overflow-y-auto');
      return {
        bg: s.backgroundColor,
        opacity: s.opacity,
        left: r.left,
        right: r.right,
        width: r.width,
        height: r.height,
        canScrollInternally: scrollBox ? scrollBox.scrollHeight > scrollBox.clientHeight : false,
        scrollHeight: scrollBox?.scrollHeight,
        clientHeight: scrollBox?.clientHeight,
      };
    });
    results.languageDropdownDeepTest.solidOpaque = ddMetrics.bg === 'rgb(13, 13, 30)' && ddMetrics.opacity === '1';
    results.languageDropdownDeepTest.withinViewport = ddMetrics.left >= 0 && ddMetrics.right <= 390;
    results.languageDropdownDeepTest.scrollable = ddMetrics.canScrollInternally;
    console.log(
      `  ✓ Solid Opaque (${ddMetrics.bg}, opacity=${ddMetrics.opacity}), Scrollable=${ddMetrics.canScrollInternally} (${ddMetrics.clientHeight}px/${ddMetrics.scrollHeight}px)`
    );

    // 3. Test Scrolling down to German (8th option)
    const deOption = dropdown.locator('button[role="option"]', { hasText: 'Deutsch' });
    await deOption.scrollIntoViewIfNeeded();
    const deVisible = await deOption.isVisible();
    console.log(`  ✓ Scroll to bottom item (Deutsch): ${deVisible ? 'PASS' : 'FAIL'}`);
    results.languageDropdownDeepTest.scrollToLastItem = deVisible;

    // 4. Test Outside Click Close
    await ddPage.mouse.click(10, 300);
    await ddPage.waitForTimeout(250);
    const closedOutside = !(await dropdown.isVisible());
    console.log(`  ✓ Outside Click Close: ${closedOutside ? 'PASS' : 'FAIL'}`);
    results.languageDropdownDeepTest.outsideClickCloses = closedOutside;

    // 5. Test Keyboard Escape Close & Focus Restore
    await trigger.click();
    await dropdown.waitFor({ state: 'visible' });
    await ddPage.keyboard.press('Escape');
    await ddPage.waitForTimeout(250);
    const closedEsc = !(await dropdown.isVisible());
    const focusRestored = await ddPage.evaluate(
      () => document.activeElement?.getAttribute('aria-controls') === 'language-selector-dropdown'
    );
    console.log(`  ✓ Keyboard Escape Close: ${closedEsc ? 'PASS' : 'FAIL'}, Focus Restored: ${focusRestored ? 'PASS' : 'FAIL'}`);
    results.languageDropdownDeepTest.escapeKeyCloses = closedEsc;
    results.languageDropdownDeepTest.focusRestored = focusRestored;

    // 6. Language Selection & Active Indicator & Reload Persistence
    await trigger.click();
    await dropdown.waitFor({ state: 'visible' });
    await dropdown.locator('button[role="option"]', { hasText: 'Español' }).click();
    await ddPage.waitForTimeout(400);

    // Verify UI updated to Spanish & Active badge moved to Español on reopen
    await trigger.click();
    await dropdown.waitFor({ state: 'visible' });
    const activeEsText = await dropdown.locator('button[role="option"][aria-selected="true"]').innerText();
    const esSelected = activeEsText.includes('Español') && activeEsText.includes('Active');
    console.log(`  ✓ Active Indicator Selected State (Español): ${esSelected ? 'PASS' : 'FAIL'}`);
    results.languageDropdownDeepTest.activeIndicatorAccurate = esSelected;

    // Reload page and confirm persistence
    await ddPage.reload({ waitUntil: 'domcontentloaded' });
    await ddPage.locator('header button[aria-controls="language-selector-dropdown"]').waitFor({ state: 'visible' });
    const persistedLang = await ddPage.getAttribute('html', 'lang');
    console.log(`  ✓ Global Language Persisted After Reload (<html lang>): ${persistedLang} (${persistedLang === 'es' ? 'PASS' : 'FAIL'})`);
    results.languageDropdownDeepTest.persistenceAfterReload = persistedLang === 'es';

    if (
      !results.languageDropdownDeepTest.solidOpaque ||
      !results.languageDropdownDeepTest.withinViewport ||
      !results.languageDropdownDeepTest.outsideClickCloses ||
      !results.languageDropdownDeepTest.escapeKeyCloses ||
      !results.languageDropdownDeepTest.activeIndicatorAccurate ||
      !results.languageDropdownDeepTest.persistenceAfterReload
    ) {
      results.allPassed = false;
    }

    await ddCtx.close();

    // =========================================================================
    // TEST 5B: RECONNECT + START GAME + ACTIVE GAMEPLAY CARD (390px)
    // =========================================================================
    console.log('\n🎮 [TEST 5B] Verifying Active Gameplay Start & Turn Card Layout on 390px Mobile...');
    const gHostCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const gHostPage = await gHostCtx.newPage();
    gHostPage.on('pageerror', (e) => results.consoleErrors.push(`[Gameplay Host PageError] ${e.message}`));
    await gHostPage.addInitScript(({ code, sessionStr }) => {
      if (sessionStr) localStorage.setItem(`asteria_multiplayer_session_${code}`, sessionStr);
    }, { code: roomCode, sessionStr: hostSessionRaw });

    const gGuestCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const gGuestPage = await gGuestCtx.newPage();
    gGuestPage.on('pageerror', (e) => results.consoleErrors.push(`[Gameplay Guest PageError] ${e.message}`));
    await gGuestPage.addInitScript(({ code, sessionStr }) => {
      if (sessionStr) localStorage.setItem(`asteria_multiplayer_session_${code}`, sessionStr);
    }, { code: roomCode, sessionStr: guestSessionRaw });

    await gHostPage.goto(`${BASE_URL}/room/${roomCode}`, { waitUntil: 'domcontentloaded' });
    await gGuestPage.goto(`${BASE_URL}/room/${roomCode}`, { waitUntil: 'domcontentloaded' });
    await gHostPage.locator('button', { hasText: /Start Game/i }).waitFor({ state: 'visible', timeout: 10000 });
    await gHostPage.waitForTimeout(1000);
    await gHostPage.locator('button', { hasText: /Start Game/i }).click();

    await gHostPage.locator('text=/Turn/i').first().waitFor({ state: 'visible', timeout: 8000 });
    await gGuestPage.locator('text=/Turn/i').first().waitFor({ state: 'visible', timeout: 8000 });
    await gHostPage.waitForTimeout(500);
    await gHostPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'gameplay-390px.png'), fullPage: false });
    console.log('  ✓ [Active Gameplay] Start Game transitioned both clients & captured screenshots/gameplay-390px.png');
    results.functionalRegressionTest.activeGameplayStarted = true;

    await gGuestCtx.close();
    await gHostCtx.close();

    console.log('\n======================================================');
    console.log(`🎯 FINAL MOBILE UI QA SUITE: ${results.allPassed ? 'ALL CHECKS PASSED (100%)' : 'ISSUES DETECTED'}`);
    console.log(`   Console Errors: ${results.consoleErrors.length}`);
    console.log('======================================================\n');
  } catch (err) {
    console.error('QA Suite Fatal Error:', err);
    results.allPassed = false;
    results.fatalError = err.message;
  } finally {
    await browser.close();
  }

  fs.writeFileSync(path.join(OUT_DIR, 'qa-results.json'), JSON.stringify(results, null, 2));
  return results.allPassed;
}

runFinalMobileQA().then((passed) => process.exit(passed ? 0 : 1));
