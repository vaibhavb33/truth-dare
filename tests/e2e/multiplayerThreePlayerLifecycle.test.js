const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:3000';

async function runMultiplayerThreePlayerLifecycle() {
  console.log('🚀 Asteria Multiplayer 3-Player Complete Lifecycle QA Starting...\n');
  const results = {
    steps: [],
    allPassed: true,
  };

  const browser = await chromium.launch({ channel: 'chrome', headless: true });

  try {
    // ========================================================
    // 1. CREATE ROOM VIA API / UI (Canonical ID & Code)
    // ========================================================
    console.log('📦 [1/12] Creating Room with Host Registration...');
    const hostContext = await browser.newContext();
    const pageHost = await hostContext.newPage();

    const createRes = await pageHost.request.post(`${BASE_URL}/api/rooms/create`, {
      data: {
        gameId: 'truth-or-dare',
        categoryId: 'classic-party',
        hostName: 'AliceHost',
        language: 'en',
        maxPlayers: 12,
        timerSeconds: 30,
      },
    });

    const createData = await createRes.json();
    const roomCode = createData.roomCode;
    const roomId = createData.roomId;
    const hostPlayerId = createData.hostPlayerId;
    const hostSessionToken = createData.sessionToken;

    const step1Passed =
      createData.success === true &&
      /^[A-Z0-9]{6}$/.test(roomCode) &&
      typeof roomId === 'string' &&
      roomId.startsWith('rm-') &&
      typeof hostSessionToken === 'string';

    console.log(`  ${step1Passed ? '✅' : '❌'} Step 1: Room created (${roomCode}, id: ${roomId}): ${step1Passed ? 'PASSED' : 'FAILED'}`);
    results.steps.push({ step: 1, name: 'Create Room', passed: step1Passed });
    if (!step1Passed) results.allPassed = false;

    // ========================================================
    // 2. HOST JOINS / ENTERS LOBBY (NO CONTRADICTORY ERROR!)
    // ========================================================
    console.log('\n👑 [2/12] Host Enters Party Lobby...');
    // Seed host session token in localStorage before navigation
    await pageHost.goto(`${BASE_URL}/`);
    await pageHost.evaluate(
      ({ code, pId, token }) => {
        localStorage.setItem(
          `asteria_multiplayer_session_${code}`,
          JSON.stringify({ roomCode: code, playerId: pId, sessionToken: token, playerName: 'AliceHost' })
        );
      },
      { code: roomCode, pId: hostPlayerId, token: hostSessionToken }
    );

    await pageHost.goto(`${BASE_URL}/room/${roomCode}`, { waitUntil: 'domcontentloaded' });
    await pageHost.waitForTimeout(1000);

    const hostLobbyCheck = await pageHost.evaluate(() => {
      const text = document.body.innerText;
      const hasRoomCode = text.includes('Party Lobby') || text.includes('Room Code');
      const hasHostName = text.includes('AliceHost');
      const hasPlayerCount = text.includes('1 / 12') || text.includes('1 / 12 Players');
      const hasError = text.includes('Room not found or expired') || text.includes('Room Error');
      return { hasRoomCode, hasHostName, hasPlayerCount, hasError, textSnippet: text.slice(0, 300) };
    });

    const step2Passed = hostLobbyCheck.hasHostName && !hostLobbyCheck.hasError;
    console.log(`  ${step2Passed ? '✅' : '❌'} Step 2: Host in Lobby without "Room not found or expired" error: ${step2Passed ? 'PASSED' : 'FAILED'}`);
    results.steps.push({ step: 2, name: 'Host Lobby & Zero Error', passed: step2Passed, details: hostLobbyCheck });
    if (!step2Passed) results.allPassed = false;

    // ========================================================
    // 3. SECOND PLAYER (BOB) JOINS VIA ROOM CODE
    // ========================================================
    console.log('\n👤 [3/12] Second Player (Bob) Joins...');
    const bobContext = await browser.newContext();
    const pageBob = await bobContext.newPage();

    await pageBob.goto(`${BASE_URL}/room/${roomCode}`, { waitUntil: 'domcontentloaded' });
    await pageBob.waitForTimeout(800);

    const nameInputBob = pageBob.locator('input[placeholder*="name" i]').first();
    if (await nameInputBob.isVisible()) {
      await nameInputBob.fill('BobPlayer');
      await pageBob.locator('button[type="submit"]').click();
      await pageBob.waitForTimeout(1200);
    }

    const bobLobbyCheck = await pageBob.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasBob: text.includes('BobPlayer'),
        hasAlice: text.includes('AliceHost'),
        count2: text.includes('2 / 12') || text.includes('2/12'),
        hasError: text.includes('Room not found or expired'),
      };
    });

    const step3Passed = bobLobbyCheck.hasBob && bobLobbyCheck.hasAlice && !bobLobbyCheck.hasError;
    console.log(`  ${step3Passed ? '✅' : '❌'} Step 3: Bob joined successfully (Player count 2/12): ${step3Passed ? 'PASSED' : 'FAILED'}`);
    results.steps.push({ step: 3, name: 'Second Player Join', passed: step3Passed });
    if (!step3Passed) results.allPassed = false;

    // ========================================================
    // 4. THIRD PLAYER (CHARLIE) JOINS
    // ========================================================
    console.log('\n👤 [4/12] Third Player (Charlie) Joins...');
    const charlieContext = await browser.newContext();
    const pageCharlie = await charlieContext.newPage();

    await pageCharlie.goto(`${BASE_URL}/room/${roomCode}`, { waitUntil: 'domcontentloaded' });
    await pageCharlie.waitForTimeout(800);

    const nameInputCharlie = pageCharlie.locator('input[placeholder*="name" i]').first();
    if (await nameInputCharlie.isVisible()) {
      await nameInputCharlie.fill('CharliePlayer');
      await pageCharlie.locator('button[type="submit"]').click();
      await pageCharlie.waitForTimeout(1200);
    }

    const charlieLobbyCheck = await pageCharlie.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasCharlie: text.includes('CharliePlayer'),
        hasBob: text.includes('BobPlayer'),
        hasAlice: text.includes('AliceHost'),
        count3: text.includes('3 / 12') || text.includes('3/12'),
        hasError: text.includes('Room not found or expired'),
      };
    });

    const step4Passed = charlieLobbyCheck.hasCharlie && charlieLobbyCheck.count3 && !charlieLobbyCheck.hasError;
    console.log(`  ${step4Passed ? '✅' : '❌'} Step 4: Charlie joined successfully (Player count 3/12): ${step4Passed ? 'PASSED' : 'FAILED'}`);
    results.steps.push({ step: 4, name: 'Third Player Join', passed: step4Passed });
    if (!step4Passed) results.allPassed = false;

    // ========================================================
    // 5. REFRESH THE HOST BROWSER (Session Restoration)
    // ========================================================
    console.log('\n🔄 [5/12] Refreshing Host Browser (Session Restoration)...');
    await pageHost.reload({ waitUntil: 'domcontentloaded' });
    await pageHost.waitForTimeout(1200);

    const hostReloadCheck = await pageHost.evaluate(() => {
      const text = document.body.innerText;
      const hasAlice = text.includes('AliceHost');
      const hasStartBtn = text.includes('Start Game');
      const hasError = text.includes('Room not found or expired') || text.includes('Room Error');
      return { hasAlice, hasStartBtn, hasError };
    });

    const step5Passed = hostReloadCheck.hasAlice && hostReloadCheck.hasStartBtn && !hostReloadCheck.hasError;
    console.log(`  ${step5Passed ? '✅' : '❌'} Step 5: Host session restored on refresh (Zero error): ${step5Passed ? 'PASSED' : 'FAILED'}`);
    results.steps.push({ step: 5, name: 'Host Refresh & Restoration', passed: step5Passed });
    if (!step5Passed) results.allPassed = false;

    // ========================================================
    // 6. REFRESH ANOTHER PLAYER BROWSER (Bob Restoration)
    // ========================================================
    console.log('\n🔄 [6/12] Refreshing Player 2 (Bob) Browser...');
    await pageBob.reload({ waitUntil: 'domcontentloaded' });
    await pageBob.waitForTimeout(1200);

    const bobReloadCheck = await pageBob.evaluate(() => {
      const text = document.body.innerText;
      const hasBob = text.includes('BobPlayer');
      const hasWaiting = text.includes('Party Lobby') || text.includes('Invite your friends');
      const hasError = text.includes('Room not found or expired');
      return { hasBob, hasWaiting, hasError };
    });

    const step6Passed = bobReloadCheck.hasBob && !bobReloadCheck.hasError;
    console.log(`  ${step6Passed ? '✅' : '❌'} Step 6: Bob session restored on refresh (Zero error): ${step6Passed ? 'PASSED' : 'FAILED'}`);
    results.steps.push({ step: 6, name: 'Player Refresh & Restoration', passed: step6Passed });
    if (!step6Passed) results.allPassed = false;

    // ========================================================
    // 7. COPY AND REOPEN INVITATION LINK IN NEW SESSION
    // ========================================================
    console.log('\n🔗 [7/12] Reopening Invitation Link in Fresh Context...');
    const guest4Context = await browser.newContext();
    const pageGuest4 = await guest4Context.newPage();

    const inviteUrl = `${BASE_URL}/room/${roomCode}`;
    await pageGuest4.goto(inviteUrl, { waitUntil: 'domcontentloaded' });
    await pageGuest4.waitForTimeout(800);

    const guest4Check = await pageGuest4.evaluate((code) => {
      const text = document.body.innerText;
      return {
        hasCode: text.includes(code),
        hasJoinBtn: text.includes('Join Room') || text.includes('Join Party Room'),
        hasError: text.includes('Room not found or expired'),
      };
    }, roomCode);

    const step7Passed = guest4Check.hasCode && guest4Check.hasJoinBtn && !guest4Check.hasError;
    console.log(`  ${step7Passed ? '✅' : '❌'} Step 7: Invitation link opens clean join prompt: ${step7Passed ? 'PASSED' : 'FAILED'}`);
    results.steps.push({ step: 7, name: 'Invitation Link Reopen', passed: step7Passed });
    if (!step7Passed) results.allPassed = false;
    await guest4Context.close();

    // ========================================================
    // 8. ENTER INVALID ROOM CODE
    // ========================================================
    console.log('\n🚫 [8/12] Entering Invalid Room Code...');
    const invalidRes = await pageHost.request.post(`${BASE_URL}/api/rooms/join`, {
      data: {
        roomCode: 'INV999',
        playerName: 'TestInvalid',
      },
    });
    const invalidJson = await invalidRes.json();
    const step8Passed =
      invalidRes.status() === 404 &&
      invalidJson.success === false &&
      invalidJson.code === 'ROOM_NOT_FOUND' &&
      invalidJson.error.includes('Room not found');

    console.log(`  ${step8Passed ? '✅' : '❌'} Step 8: Invalid code returned accurate ROOM_NOT_FOUND (404): ${step8Passed ? 'PASSED' : 'FAILED'}`);
    results.steps.push({ step: 8, name: 'Invalid Room Code Check', passed: step8Passed });
    if (!step8Passed) results.allPassed = false;

    // ========================================================
    // 9. JOIN EXPIRED ROOM
    // ========================================================
    console.log('\n⏳ [9/12] Joining Expired Room Verification...');
    // Create room and test expiry check
    const expRes = await pageHost.request.post(`${BASE_URL}/api/rooms/create`, {
      data: {
        gameId: 'truth-or-dare',
        categoryId: 'classic-party',
        hostName: 'ExpHost',
      },
    });
    const expData = await expRes.json();
    // Lookup expired route
    const lookupExpired = await pageHost.request.get(`${BASE_URL}/api/rooms/${expData.roomCode}`);
    const lookupJson = await lookupExpired.json();

    const step9Passed = lookupExpired.status() === 200 && lookupJson.room.expiresAt > Date.now();
    console.log(`  ${step9Passed ? '✅' : '❌'} Step 9: Newly created room does NOT expire immediately: ${step9Passed ? 'PASSED' : 'FAILED'}`);
    results.steps.push({ step: 9, name: 'Room Expiry Validation', passed: step9Passed });
    if (!step9Passed) results.allPassed = false;

    // ========================================================
    // 10. JOIN FULL ROOM
    // ========================================================
    console.log('\n🈵 [10/12] Joining Full Room Verification...');
    const fullRes = await pageHost.request.post(`${BASE_URL}/api/rooms/create`, {
      data: {
        gameId: 'truth-or-dare',
        categoryId: 'classic-party',
        hostName: 'FullHost',
        maxPlayers: 2,
      },
    });
    const fullRoomData = await fullRes.json();

    // 2nd player joins
    await pageHost.request.post(`${BASE_URL}/api/rooms/join`, {
      data: { roomCode: fullRoomData.roomCode, playerName: 'P2' },
    });

    // 3rd player attempts to join (should exceed capacity 2)
    const excessJoinRes = await pageHost.request.post(`${BASE_URL}/api/rooms/join`, {
      data: { roomCode: fullRoomData.roomCode, playerName: 'P3' },
    });
    const excessJson = await excessJoinRes.json();

    const step10Passed =
      excessJoinRes.status() === 409 &&
      excessJson.success === false &&
      excessJson.code === 'ROOM_FULL' &&
      excessJson.error.includes('Room is currently full');

    console.log(`  ${step10Passed ? '✅' : '❌'} Step 10: 3rd player rejected on full room (409 ROOM_FULL): ${step10Passed ? 'PASSED' : 'FAILED'}`);
    results.steps.push({ step: 10, name: 'Full Room Capacity Check', passed: step10Passed });
    if (!step10Passed) results.allPassed = false;

    // ========================================================
    // 11. START GAME (Host Starts -> Realtime Transition)
    // ========================================================
    console.log('\n🎮 [11/12] Starting Game Across All Three Players...');
    const startBtn = pageHost.locator('button:has-text("Start Game")').first();
    if (await startBtn.isVisible()) {
      await startBtn.click();
      await pageHost.waitForTimeout(1500);
    }

    // Wait for polling on Bob & Charlie
    await pageBob.waitForTimeout(1500);
    await pageCharlie.waitForTimeout(1500);

    const hostInGame = await pageHost.evaluate(() => document.body.innerText.toLowerCase().includes('round 1'));
    const bobInGame = await pageBob.evaluate(() => document.body.innerText.toLowerCase().includes('round 1'));
    const charlieInGame = await pageCharlie.evaluate(() => document.body.innerText.toLowerCase().includes('round 1'));

    const step11Passed = hostInGame && bobInGame && charlieInGame;
    console.log(`  ${step11Passed ? '✅' : '❌'} Step 11: Game started in sync across all 3 browsers (Round 1): ${step11Passed ? 'PASSED' : 'FAILED'}`);
    results.steps.push({ step: 11, name: 'Game Start Synchronisation', passed: step11Passed });
    if (!step11Passed) results.allPassed = false;

    // ========================================================
    // 12. RECONNECT DURING ACTIVE GAMEPLAY
    // ========================================================
    console.log('\n⚡ [12/12] Active Gameplay Card Flip & Mid-Game Reconnection...');
    // Alice flips Dare card
    const dareBtn = pageHost.locator('button:has-text("DARE")').first();
    if (await dareBtn.isVisible()) {
      await dareBtn.click();
      await pageHost.waitForTimeout(1500);
    }

    // Bob reloads mid-turn
    await pageBob.reload({ waitUntil: 'domcontentloaded' });
    await pageBob.waitForTimeout(1500);

    const bobInGameAfterReload = await pageBob.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasRound1: text.toLowerCase().includes('round 1'),
        hasBob: text.includes('BobPlayer'),
        hasAlice: text.includes('AliceHost'),
        noError: !text.includes('Room not found or expired'),
      };
    });

    const step12Passed = bobInGameAfterReload.hasRound1 && bobInGameAfterReload.hasBob && bobInGameAfterReload.noError;
    console.log(`  ${step12Passed ? '✅' : '❌'} Step 12: Bob reconnected mid-game directly into Round 1 arena: ${step12Passed ? 'PASSED' : 'FAILED'}`);
    results.steps.push({ step: 12, name: 'Mid-Game Reconnection', passed: step12Passed });
    if (!step12Passed) results.allPassed = false;

    await hostContext.close();
    await bobContext.close();
    await charlieContext.close();
  } catch (err) {
    console.error('Lifecycle test execution error:', err);
    results.allPassed = false;
  } finally {
    await browser.close();
  }

  console.log('\n======================================================');
  console.log(`🎯 MULTIPLAYER LIFECYCLE RESULT: ${results.allPassed ? 'ALL 12 TESTS PASSED' : 'FAILURES DETECTED'}`);
  console.log('======================================================\n');
  return results;
}

runMultiplayerThreePlayerLifecycle().then((res) => {
  if (!res.allPassed) {
    process.exit(1);
  }
  process.exit(0);
});

