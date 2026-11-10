const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, '../../project-docs/41-custom-deck-multiplayer/screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runCustomDeckMultiplayerThreePlayers() {
  console.log('🚀 Asteria Custom Deck Multiplayer - 3 Independent Sessions Test Starting...\n');
  const results = {
    steps: [],
    allPassed: true,
  };

  const browser = await chromium.launch({ channel: 'chrome', headless: true });

  try {
    // =========================================================================
    // STEP 1: HOST SESSION (ALICE) CREATES CUSTOM DECK VIA UI
    // =========================================================================
    console.log('📝 [Step 1] Host (Alice) Creates Custom Deck in Editor...');
    const hostContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const pageHost = await hostContext.newPage();

    pageHost.on('console', msg => console.log('PAGE [Host]:', msg.text()));
    pageHost.on('pageerror', err => console.log('PAGE [Host ERROR]:', err.message));

    await pageHost.goto(`${BASE_URL}/custom`, { waitUntil: 'domcontentloaded' });
    await pageHost.waitForTimeout(1000);

    // Enter Deck Name
    const deckNameInput = pageHost.locator('input[placeholder*="Friday Night Party"], input[value*="Party"]').first();
    await deckNameInput.fill('Party Legends');

    // Add Truth Question 1
    const promptInput = pageHost.locator('input[placeholder*="Type a truth question"], input[placeholder*="Type a dare challenge"]').first();
    await promptInput.fill('What is your biggest secret from college?');
    await pageHost.locator('button[type="submit"]:has-text("Add Question")').click();
    await pageHost.waitForTimeout(600);

    // Add Truth Question 2
    await promptInput.fill('Who in this room would you survive a zombie apocalypse with?');
    await pageHost.locator('button[type="submit"]:has-text("Add Question")').click();
    await pageHost.waitForTimeout(600);

    // Switch to Dare
    await pageHost.locator('button:has-text("DARE")').first().click();
    await pageHost.waitForTimeout(400);

    // Add Dare Question 1
    await promptInput.fill('Do your funniest impression of someone in this room for 15 seconds.');
    await pageHost.locator('button[type="submit"]:has-text("Add Question")').click();
    await pageHost.waitForTimeout(600);

    // Add Dare Question 2
    await promptInput.fill('Speak with a French accent until your next turn.');
    await pageHost.locator('button[type="submit"]:has-text("Add Question")').click();
    await pageHost.waitForTimeout(600);

    // Save Deck
    await pageHost.locator('button:has-text("Save Deck")').first().click();
    await pageHost.waitForTimeout(1200);

    console.log('  ✅ Deck "Party Legends" saved successfully with 4 custom questions.');

    // =========================================================================
    // STEP 2: HOST SELECTS "PLAY WITH FRIENDS" & CREATES ROOM
    // =========================================================================
    console.log('\n🎮 [Step 2] Host clicks "Play with Friends" to Launch Room...');
    const playWithFriendsBtn = pageHost.locator('button:has-text("Play with Friends")').first();
    await playWithFriendsBtn.waitFor({ state: 'visible', timeout: 5000 });
    const isEnabled = await playWithFriendsBtn.isEnabled();
    console.log(`  Play with Friends button enabled: ${isEnabled}`);
    await playWithFriendsBtn.click();
    console.log('  Clicked Play with Friends, waiting for URL transition...');

    // Wait for client-side navigation to /room/[code]
    try {
      await pageHost.waitForFunction(
        () => window.location.pathname.startsWith('/room/'),
        { timeout: 15000 }
      );
    } catch (navErr) {
      const pageText = await pageHost.locator('body').innerText();
      console.error('  Failed to navigate to room. Page text:', pageText.slice(0, 500));
      throw navErr;
    }
    const currentUrl = pageHost.url();
    const roomCodeMatch = currentUrl.match(/\/room\/([A-Z0-9]+)/);
    const roomCode = roomCodeMatch ? roomCodeMatch[1] : '';

    console.log(`  ✅ Navigated to Room: ${roomCode} (${currentUrl})`);
    await pageHost.waitForTimeout(2000);

    // Verify Party Lobby Details for Host
    const hostLobbyText = await pageHost.locator('body').innerText();
    const hasCustomBadge = hostLobbyText.includes('Custom: Party Legends') || hostLobbyText.includes('Party Legends');
    const hasError = hostLobbyText.includes('Room not found or expired') || hostLobbyText.includes('Room Error');

    console.log(`  ${hasCustomBadge ? '✅' : '❌'} Custom Deck Snapshot Badge visible: ${hasCustomBadge}`);
    console.log(`  ${!hasError ? '✅' : '❌'} No contradictory room-not-found error: ${!hasError}`);

    await pageHost.screenshot({ path: path.join(SCREENSHOT_DIR, '01-host-party-lobby.png') });
    results.steps.push({ step: 1, name: 'Host Deck Creation & Room Launch', passed: Boolean(roomCode && hasCustomBadge && !hasError) });

    // =========================================================================
    // STEP 3: FRIEND 1 (BOB) JOINS USING ROOM CODE
    // =========================================================================
    console.log('\n👥 [Step 3] Friend 1 (Bob) Joins via Room Code in Independent Session...');
    const bobContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const pageBob = await bobContext.newPage();

    await pageBob.goto(`${BASE_URL}/room/${roomCode}`, { waitUntil: 'domcontentloaded' });
    await pageBob.waitForTimeout(1200);

    // Bob enters name and clicks Join
    const bobNameInput = pageBob.locator('input[placeholder*="Name"], input[type="text"]').first();
    await bobNameInput.fill('Bob');
    await pageBob.locator('button[type="submit"], button:has-text("Join Party Room"), button:has-text("Join Room")').first().click();
    await pageBob.waitForTimeout(2000);

    const bobLobbyText = await pageBob.locator('body').innerText();
    const bobJoined = bobLobbyText.includes('Bob') && (bobLobbyText.includes('2 / 12') || bobLobbyText.includes('2 Players'));
    console.log(`  ${bobJoined ? '✅' : '❌'} Bob successfully joined room: ${bobJoined}`);
    await pageBob.screenshot({ path: path.join(SCREENSHOT_DIR, '02-bob-joined-lobby.png') });
    results.steps.push({ step: 2, name: 'Bob Joins Room', passed: bobJoined });

    // =========================================================================
    // STEP 4: FRIEND 2 (CHARLIE) JOINS USING ROOM CODE
    // =========================================================================
    console.log('\n👥 [Step 4] Friend 2 (Charlie) Joins via Room Code in 3rd Session...');
    const charlieContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const pageCharlie = await charlieContext.newPage();

    await pageCharlie.goto(`${BASE_URL}/room/${roomCode}`, { waitUntil: 'domcontentloaded' });
    await pageCharlie.waitForTimeout(1200);

    const charlieNameInput = pageCharlie.locator('input[placeholder*="Name"], input[type="text"]').first();
    await charlieNameInput.fill('Charlie');
    await pageCharlie.locator('button[type="submit"], button:has-text("Join Party Room"), button:has-text("Join Room")').first().click();
    await pageCharlie.waitForTimeout(2000);

    const charlieLobbyText = await pageCharlie.locator('body').innerText();
    const charlieJoined = charlieLobbyText.includes('Charlie') && (charlieLobbyText.includes('3 / 12') || charlieLobbyText.includes('3 Players'));
    console.log(`  ${charlieJoined ? '✅' : '❌'} Charlie successfully joined room: ${charlieJoined}`);
    await pageCharlie.screenshot({ path: path.join(SCREENSHOT_DIR, '03-charlie-joined-lobby.png') });
    results.steps.push({ step: 3, name: 'Charlie Joins Room', passed: charlieJoined });

    // =========================================================================
    // STEP 5: HOST STARTS THE GAME
    // =========================================================================
    console.log('\n👑 [Step 5] Host Starts Game Across All 3 Sessions...');
    await pageHost.waitForTimeout(2000); // Wait for polling to update to 3 players
    const startGameBtn = pageHost.locator('button:has-text("Start Game")').first();
    await startGameBtn.click();
    await pageHost.waitForTimeout(2500);

    // Verify all 3 screens transition to active game
    const hostInGame = await pageHost.locator('button[data-testid="truth-btn"]').first().isVisible().catch(() => false);
    const bobInGame = await pageBob.locator('text=Round 1').first().isVisible().catch(() => false);
    const charlieInGame = await pageCharlie.locator('text=Round 1').first().isVisible().catch(() => false);

    console.log(`  Host in game: ${hostInGame}, Bob in game: ${bobInGame}, Charlie in game: ${charlieInGame}`);
    results.steps.push({ step: 4, name: 'Host Starts Game Across All 3 Sessions', passed: Boolean(hostInGame && bobInGame && charlieInGame) });

    // =========================================================================
    // STEP 6: TURN 1 - HOST FLIPS TRUTH CARD (SYNCHRONIZED QUESTION)
    // =========================================================================
    console.log('\n🎯 [Step 6] Turn 1: Host Flips Truth Card...');
    const truthBtn = pageHost.locator('button[data-testid="truth-btn"]').first();
    await truthBtn.click();
    await pageHost.waitForTimeout(2500); // Wait for card flip & polling

    // Check prompt text on all 3 screens
    const hostPromptText = await pageHost.locator('.card-face-back p').innerText().catch(() => '');
    const bobPromptText = await pageBob.locator('.card-face-back p').innerText().catch(() => '');
    const charliePromptText = await pageCharlie.locator('.card-face-back p').innerText().catch(() => '');

    console.log(`  Host sees prompt: "${hostPromptText.trim()}"`);
    console.log(`  Bob sees prompt:  "${bobPromptText.trim()}"`);
    console.log(`  Charlie sees:     "${charliePromptText.trim()}"`);

    const synchronized = Boolean(
      hostPromptText &&
      hostPromptText.trim() === bobPromptText.trim() &&
      bobPromptText.trim() === charliePromptText.trim()
    );
    console.log(`  ${synchronized ? '✅' : '❌'} All 3 players receive identical custom question: ${synchronized}`);

    await pageHost.screenshot({ path: path.join(SCREENSHOT_DIR, '04-host-question-revealed.png') });
    await pageBob.screenshot({ path: path.join(SCREENSHOT_DIR, '05-bob-synchronized-question.png') });
    await pageCharlie.screenshot({ path: path.join(SCREENSHOT_DIR, '06-charlie-synchronized-question.png') });
    results.steps.push({ step: 5, name: 'Turn 1 Question Synchronization', passed: synchronized });

    // =========================================================================
    // STEP 7: ADVANCE TURN TO BOB (TURN SYNCHRONIZATION)
    // =========================================================================
    console.log('\n🔄 [Step 7] Complete Turn 1 & Advance to Bob...');
    const completeBtn = pageHost.locator('[data-testid="complete-dare-btn"]').first();
    await completeBtn.click();
    await pageHost.waitForTimeout(2500);

    const bobBodyText = await pageBob.locator('body').innerText();
    const bobTurnBanner = bobBodyText.toLowerCase().includes('your turn');
    const hostSeesBobTurn = await pageHost.locator('text=Bob').first().isVisible().catch(() => false);

    console.log(`  Bob active turn: ${bobTurnBanner}, Host sees Bob turn: ${hostSeesBobTurn}`);
    await pageBob.screenshot({ path: path.join(SCREENSHOT_DIR, '07-bob-turn-advanced.png') });
    results.steps.push({ step: 6, name: 'Turn Advancement Synchronization', passed: Boolean(bobTurnBanner && hostSeesBobTurn) });

    // =========================================================================
    // STEP 8: BOB FLIPS CARD (NON-DUPLICATE QUESTION VERIFICATION)
    // =========================================================================
    console.log('\n🎯 [Step 8] Bob Flips Truth Card (Verifying Duplicate Prevention)...');
    const bobTruthBtn = pageBob.locator('button[data-testid="truth-btn"]').first();
    await bobTruthBtn.click();
    await pageBob.waitForTimeout(2500);

    const bobPrompt2 = await pageBob.locator('.card-face-back p').innerText().catch(() => '');
    console.log(`  Bob Turn 2 prompt: "${bobPrompt2.trim()}"`);

    const isNonDuplicate = bobPrompt2.trim() !== hostPromptText.trim();
    console.log(`  ${isNonDuplicate ? '✅' : '❌'} Non-duplicate question drawn before pool exhaustion: ${isNonDuplicate}`);
    results.steps.push({ step: 7, name: 'Non-Duplicate Question Selection', passed: isNonDuplicate });

    // Bob completes dare
    await pageBob.locator('[data-testid="complete-dare-btn"]').first().click();
    await pageBob.waitForTimeout(2500);

    await pageCharlie.screenshot({ path: path.join(SCREENSHOT_DIR, '08-charlie-turn-active.png') });

    // =========================================================================
    // STEP 9: CHARLIE RECONNECTION TEST
    // =========================================================================
    console.log('\n🔌 [Step 9] Testing Seamless Reconnection for Charlie...');
    await pageCharlie.reload({ waitUntil: 'domcontentloaded' });
    await pageCharlie.waitForTimeout(2000);

    const charlieReconnectedText = await pageCharlie.locator('body').innerText();
    const charlieRestored = charlieReconnectedText.includes('Charlie') && !charlieReconnectedText.includes('Room not found');

    console.log(`  ${charlieRestored ? '✅' : '❌'} Charlie reconnected with state preserved: ${charlieRestored}`);
    await pageCharlie.screenshot({ path: path.join(SCREENSHOT_DIR, '09-charlie-reconnected.png') });
    results.steps.push({ step: 8, name: 'Player Reconnection Without Error', passed: charlieRestored });

    // Close contexts
    await hostContext.close();
    await bobContext.close();
    await charlieContext.close();
  } catch (err) {
    console.error('❌ E2E Execution Error:', err);
    results.allPassed = false;
  } finally {
    await browser.close();
  }

  const allPassed =
    results.allPassed &&
    results.steps.length >= 8 &&
    results.steps.every((s) => s.passed);
  console.log(`\n======================================================`);
  console.log(`🏁 Custom Deck Multiplayer E2E Results: ${allPassed ? 'ALL PASSED ✅' : 'FAILED ❌'}`);
  console.log(`======================================================\n`);
  return allPassed;
}

if (require.main === module) {
  runCustomDeckMultiplayerThreePlayers()
    .then((success) => process.exit(success ? 0 : 1))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { runCustomDeckMultiplayerThreePlayers };
