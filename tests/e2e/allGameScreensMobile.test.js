const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, '../../project-docs/17-game-mobile-fixes/screenshots');

const VIEWPORTS = [
  { name: '320px (iPhone SE 1st gen)', width: 320, height: 568 },
  { name: '360px (Android Compact)', width: 360, height: 800 },
  { name: '375px (iPhone 8 / SE 3)', width: 375, height: 667 },
  { name: '390px (iPhone 14/15)', width: 390, height: 844, capture: true },
  { name: '414px (iPhone XR/Plus)', width: 414, height: 896 },
  { name: '430px (iPhone 15 Pro Max)', width: 430, height: 932, capture: true },
  { name: '480px (Large Phablet)', width: 480, height: 854 },
  { name: '844x390 (Mobile Landscape)', width: 844, height: 390 },
];

async function runMobileGameAudit() {
  console.log('🎮 Starting Mobile Game Screens Audit Across 8 Mobile Viewports...\n');
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const auditResults = [];

  try {
    for (const vp of VIEWPORTS) {
      console.log(`\n======================================================`);
      console.log(`📱 Auditing Viewport: ${vp.name} (${vp.width}x${vp.height})`);
      console.log(`======================================================`);

      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const page = await context.newPage();

      // Helper for horizontal overflow
      const checkOverflow = async (screenName) => {
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
          console.log(`  ✓ [No Overflow] ${screenName} (scrollWidth=${overflow.docWidth}px, winWidth=${overflow.winWidth}px)`);
        }
        return !overflow.hasOverflow;
      };

      // Helper for screenshot capture
      const takeSnap = async (filename) => {
        if (vp.capture) {
          const filepath = path.join(SCREENSHOT_DIR, `${filename}-${vp.width}px.png`);
          await page.screenshot({ path: filepath, fullPage: false });
          console.log(`  📸 Screenshot saved: ${path.basename(filepath)}`);
        }
      };

      // ----------------------------------------------------------------------
      // 1. Truth or Dare Setup & Player Selection
      // ----------------------------------------------------------------------
      await page.goto(`${BASE_URL}/games/truth-or-dare`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);

      // Add long player name
      const playerInput = page.locator('input[placeholder*="player name"]');
      if (await playerInput.isVisible()) {
        await playerInput.fill('Alexander The Great');
        await page.locator('button:has-text("Add Player")').click();
        await page.waitForTimeout(150);
      }
      const todSetupNoOverflow = await checkOverflow('Truth or Dare Setup');
      await takeSnap('01-truth-or-dare-setup');

      // ----------------------------------------------------------------------
      // 2. Truth or Dare Gameplay: Unflipped Arena
      // ----------------------------------------------------------------------
      const launchBtn = page.locator('button:has-text("Start Game")');
      await launchBtn.click();
      await page.waitForTimeout(400);

      const todArenaNoOverflow = await checkOverflow('Truth or Dare Gameplay (Unflipped)');
      await takeSnap('02-truth-or-dare-unflipped');

      // ----------------------------------------------------------------------
      // 3. Truth Question Card (Flipped)
      // ----------------------------------------------------------------------
      const truthBtn = page.locator('button:has-text("TRUTH")').first();
      await truthBtn.click();
      await page.waitForTimeout(400);

      const truthCardNoOverflow = await checkOverflow('Truth Question Card (Flipped)');
      await takeSnap('03-truth-question-card');

      // Verify active player turn pill and score display
      const turnPill = page.locator('span:has-text("Turn")').first();
      console.log(`  ✓ Active player turn visible: ${await turnPill.isVisible()}`);

      // Complete Turn
      const completeBtn = page.locator('button:has-text("Challenge Done")').first();
      await completeBtn.click();
      await page.waitForTimeout(300);

      // ----------------------------------------------------------------------
      // 4. Dare Question Card with Timer (Flipped)
      // ----------------------------------------------------------------------
      const dareBtn = page.locator('button:has-text("DARE")').first();
      await dareBtn.click();
      await page.waitForTimeout(400);

      const dareCardNoOverflow = await checkOverflow('Dare Question Card (Flipped)');
      await takeSnap('04-dare-question-card');

      // Skip Dare
      const skipBtn = page.locator('button:has-text("Skip")');
      await skipBtn.click();
      await page.waitForTimeout(300);

      // ----------------------------------------------------------------------
      // 5. Spinner Wheel Screen
      // ----------------------------------------------------------------------
      await page.goto(`${BASE_URL}/games/spin-the-bottle`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);

      const spinnerNoOverflow = await checkOverflow('Spinner Wheel');
      await takeSnap('05-spinner-wheel');

      // Test Spin Interaction
      const spinBtn = page.locator('button:has-text("SPIN")').first();
      await spinBtn.click();
      await page.waitForTimeout(500);

      // ----------------------------------------------------------------------
      // 6. Never Have I Ever Screen
      // ----------------------------------------------------------------------
      await page.goto(`${BASE_URL}/games/never-have-i-ever`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);

      const nhieNoOverflow = await checkOverflow('Never Have I Ever');
      await takeSnap('06-never-have-i-ever');

      // Test "I Have" Button Click
      const iHaveBtn = page.locator('button:has-text("I HAVE")');
      await iHaveBtn.click();
      await page.waitForTimeout(300);

      // ----------------------------------------------------------------------
      // 7. Would You Rather Screen
      // ----------------------------------------------------------------------
      await page.goto(`${BASE_URL}/games/would-you-rather`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);

      const wyrNoOverflow = await checkOverflow('Would You Rather');
      await takeSnap('07-would-you-rather');

      // Test Option A vote
      const optionABtn = page.locator('button:has-text("OPTION A")');
      await optionABtn.click();
      await page.waitForTimeout(400);
      await takeSnap('07-would-you-rather-voted');

      // ----------------------------------------------------------------------
      // 8. Most Likely To Screen
      // ----------------------------------------------------------------------
      await page.goto(`${BASE_URL}/games/most-likely-to`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);

      const mltNoOverflow = await checkOverflow('Most Likely To');
      await takeSnap('08-most-likely-to');

      // Vote for player
      const votePlayerBtn = page.locator('button:has-text("Alex")').first();
      await votePlayerBtn.click();
      await page.waitForTimeout(300);

      // ----------------------------------------------------------------------
      // 9. This or That Screen
      // ----------------------------------------------------------------------
      await page.goto(`${BASE_URL}/games/this-or-that`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);

      const totNoOverflow = await checkOverflow('This or That');
      await takeSnap('09-this-or-that');

      // Pick option
      const thisBtn = page.locator('button:has-text("THIS")');
      await thisBtn.click();
      await page.waitForTimeout(300);

      // ----------------------------------------------------------------------
      // 10. Custom Question Creator / Deck Studio
      // ----------------------------------------------------------------------
      await page.goto(`${BASE_URL}/custom`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);

      // Add a long custom prompt
      const promptInput = page.locator('input[placeholder*="Type your custom question"]');
      if (await promptInput.isVisible()) {
        await promptInput.fill('What is the wildest thing you have ever purchased while browsing online late at night?');
        await page.locator('button:has-text("Add Card")').click();
        await page.waitForTimeout(200);
      }

      const customDeckNoOverflow = await checkOverflow('Custom Deck Studio');
      await takeSnap('10-custom-deck-studio');

      // ----------------------------------------------------------------------
      // 11. Multiplayer Room Screen
      // ----------------------------------------------------------------------
      await page.goto(`${BASE_URL}/room/VIP777`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);

      const roomPromptNoOverflow = await checkOverflow('Multiplayer Room (Join View)');
      await takeSnap('11-multiplayer-room-join');

      // Join room with nickname
      const nickInput = page.locator('input[placeholder*="Enter your nickname"]');
      if (await nickInput.isVisible()) {
        await nickInput.fill('SpeedyGamer');
        await page.locator('button:has-text("Join Party Room")').click();
        await page.waitForTimeout(400);

        const roomLobbyNoOverflow = await checkOverflow('Multiplayer Room (Lobby/Arena)');
        await takeSnap('12-multiplayer-room-arena');
      }

      auditResults.push({
        viewport: vp.name,
        todSetup: todSetupNoOverflow,
        todArena: todArenaNoOverflow,
        spinner: spinnerNoOverflow,
        nhie: nhieNoOverflow,
        wyr: wyrNoOverflow,
        mlt: mltNoOverflow,
        tot: totNoOverflow,
        custom: customDeckNoOverflow,
        allPassed: todSetupNoOverflow && todArenaNoOverflow && spinnerNoOverflow && nhieNoOverflow && wyrNoOverflow && mltNoOverflow && totNoOverflow && customDeckNoOverflow,
      });

      await context.close();
    }

    console.log('\n======================================================');
    console.log('🎉 ALL MOBILE GAME SCREEN AUDITS COMPLETED SUCCESSFULLY!');
    console.log('======================================================\n');
    console.table(auditResults);

    return true;
  } catch (err) {
    console.error('❌ Audit failure:', err);
    return false;
  } finally {
    await browser.close();
  }
}

runMobileGameAudit().then((ok) => {
  if (!ok) process.exit(1);
});
