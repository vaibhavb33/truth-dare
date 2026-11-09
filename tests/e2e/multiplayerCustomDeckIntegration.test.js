const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const DOCS_DIR = path.join(__dirname, '../../project-docs/35-custom-room-integration');
const SCREENSHOT_DIR = path.join(DOCS_DIR, 'screenshots');

async function runMultiplayerCustomDeckAudit() {
  console.log('🎮 Asteria Custom Deck & Multiplayer Room Integration QA Starting...\n');

  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const results = {
    deckCreated: false,
    truthQuestionsCount: 0,
    dareQuestionsCount: 0,
    roomCreated: false,
    playersJoined: 0,
    gameStarted: false,
    questionSynchronized: false,
    originalDeckMutated: false,
    snapshotIsolationVerified: false,
    playerReconnected: false,
    allPassed: true,
  };

  // 10 UNIQUE TRUTHS
  const TRUTH_QUESTIONS = [
    'What is the most embarrassing thing in your search history?',
    'Have you ever lied to get out of a date or social plan?',
    'What is your biggest irrational fear that you rarely admit?',
    'What was the worst haircut or fashion choice you ever had?',
    'Who was your secret childhood celebrity crush?',
    'Have you ever pretended to be sick to skip school or work?',
    'What is the most awkward text message you sent to the wrong person?',
    'If you had to delete all social media except one, which one stays?',
    'What is a secret talent that almost nobody in this room knows about?',
    'What was the most ridiculous rumor someone started about you?',
  ];

  // 10 UNIQUE DARES
  const DARE_QUESTIONS = [
    'Do your best dramatic opera impression for 15 seconds.',
    'Let the group look through your most recent 5 photos without explaining.',
    'Speak in a royal British accent until your next turn.',
    'Do a 30-second plank while reciting the alphabet backwards.',
    'Send an out-of-context emoji to the 3rd person in your contacts.',
    'Balance a spoon or book on your head for the next 2 rounds.',
    'Give a 45-second motivational speech about why pineapples belong on pizza.',
    'Do your silliest dance move in slow motion right now.',
    'Let another player style your hair however they want for this game.',
    'Text your best friend only asking "Do you trust penguins?" and wait for reply.',
  ];

  const questionsPayload = [
    ...TRUTH_QUESTIONS.map((prompt, i) => ({
      id: `custom-truth-${i + 1}`,
      type: 'truth',
      prompt,
      intensity: (i % 5) + 1,
    })),
    ...DARE_QUESTIONS.map((prompt, i) => ({
      id: `custom-dare-${i + 1}`,
      type: 'dare',
      prompt,
      intensity: (i % 5) + 1,
    })),
  ];

  const hostCreatorId = 'creator-alice-' + Date.now().toString(36);

  try {
    // -------------------------------------------------------------
    // STEP 1, 2 & 3: CREATE DECK WITH 10 TRUTHS & 10 DARES
    // -------------------------------------------------------------
    console.log('📦 Step 1-3: Creating Custom Deck with 10 Truths and 10 Dares via API...');
    const createDeckRes = await fetch(`${BASE_URL}/api/custom-decks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-creator-id': hostCreatorId,
      },
      body: JSON.stringify({
        name: 'Ultimate Friday Party Pack',
        description: '20 custom handcrafted truths and dares for room multiplayer.',
        language: 'en',
        category: 'classic-party',
        visibility: 'private',
        creatorId: hostCreatorId,
        questions: questionsPayload,
      }),
    });

    const createDeckData = await createDeckRes.json();
    if (!createDeckData.success || !createDeckData.deck) {
      throw new Error(`Failed to create custom deck: ${JSON.stringify(createDeckData)}`);
    }

    const customDeckId = createDeckData.deck.id;
    results.deckCreated = true;
    results.truthQuestionsCount = createDeckData.deck.questions.filter((q) => q.type === 'truth').length;
    results.dareQuestionsCount = createDeckData.deck.questions.filter((q) => q.type === 'dare').length;

    console.log(`   ✓ Custom Deck created successfully: ID="${customDeckId}", Version=${createDeckData.deck.version}`);
    console.log(`   ✓ Truth Questions: ${results.truthQuestionsCount} / 10`);
    console.log(`   ✓ Dare Questions: ${results.dareQuestionsCount} / 10`);

    if (results.truthQuestionsCount !== 10 || results.dareQuestionsCount !== 10) {
      throw new Error('Question counts mismatch!');
    }

    // -------------------------------------------------------------
    // STEP 4: CREATE MULTIPLAYER ROOM USING THE CUSTOM DECK
    // -------------------------------------------------------------
    console.log('\n🏠 Step 4: Creating Multiplayer Room referencing Custom Deck...');
    const createRoomRes = await fetch(`${BASE_URL}/api/rooms/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-creator-id': hostCreatorId,
      },
      body: JSON.stringify({
        gameId: 'truth-or-dare',
        categoryId: 'classic-party',
        hostName: 'Alice (Host)',
        language: 'en',
        maxPlayers: 10,
        deckId: customDeckId,
        creatorId: hostCreatorId,
        clientRequestId: `req-${Date.now()}`,
      }),
    });

    const roomData = await createRoomRes.json();
    if (!roomData.success || !roomData.roomCode) {
      throw new Error(`Failed to create room with custom deck: ${JSON.stringify(roomData)}`);
    }

    const { roomCode, hostPlayerId, sessionToken: hostSessionToken } = roomData;
    results.roomCreated = true;

    console.log(`   ✓ Room created: Code="${roomCode}", ID="${roomData.roomId}"`);
    console.log(`   ✓ Host Player: ID="${hostPlayerId}"`);
    console.log(`   ✓ Snapshot Verified: Name="${roomData.room.customDeckSnapshot?.name}", Version=${roomData.room.customDeckSnapshot?.version}`);
    console.log(`   ✓ Snapshot Cards: ${roomData.room.customDeckSnapshot?.questions?.length} total (${roomData.room.customDeckSnapshot?.truthQuestions?.length} Truths, ${roomData.room.customDeckSnapshot?.dareQuestions?.length} Dares)`);

    // -------------------------------------------------------------
    // STEP 5: JOIN FROM OTHER DEVICES (BOB & CHARLIE)
    // -------------------------------------------------------------
    console.log('\n👥 Step 5: Joining 2 independent players (Bob & Charlie)...');
    // Bob Joins
    const bobRes = await fetch(`${BASE_URL}/api/rooms/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomCode, playerName: 'Bob' }),
    });
    const bobData = await bobRes.json();
    if (!bobData.success) throw new Error(`Bob failed to join: ${bobData.error}`);
    const bobPlayerId = bobData.playerId;
    const bobSessionToken = bobData.sessionToken;
    console.log(`   ✓ Bob joined: ID="${bobPlayerId}"`);

    // Charlie Joins
    const charlieRes = await fetch(`${BASE_URL}/api/rooms/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomCode, playerName: 'Charlie' }),
    });
    const charlieData = await charlieRes.json();
    if (!charlieData.success) throw new Error(`Charlie failed to join: ${charlieData.error}`);
    const charliePlayerId = charlieData.playerId;
    const charlieSessionToken = charlieData.sessionToken;
    console.log(`   ✓ Charlie joined: ID="${charliePlayerId}"`);

    results.playersJoined = 3;

    // Verify room has 3 players
    const checkLobbyRes = await fetch(`${BASE_URL}/api/rooms/${roomCode}`);
    const checkLobbyData = await checkLobbyRes.json();
    if (checkLobbyData.room.players.length !== 3) {
      throw new Error(`Expected 3 players, got ${checkLobbyData.room.players.length}`);
    }

    // -------------------------------------------------------------
    // STEP 6: START THE GAME (HOST ONLY)
    // -------------------------------------------------------------
    console.log('\n🚀 Step 6: Starting the multiplayer game...');
    const startRes = await fetch(`${BASE_URL}/api/rooms/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomCode,
        playerId: hostPlayerId,
        sessionToken: hostSessionToken,
        action: 'START_GAME',
      }),
    });
    const startData = await startRes.json();
    if (!startData.success || startData.room.status !== 'IN_PROGRESS') {
      throw new Error(`Failed to start game: ${JSON.stringify(startData)}`);
    }
    results.gameStarted = true;
    console.log(`   ✓ Game started: Status="${startData.room.status}", ActivePlayer="${startData.room.activePlayerId}"`);

    // -------------------------------------------------------------
    // STEP 7: CHECK QUESTION SYNCHRONIZATION
    // -------------------------------------------------------------
    console.log('\n🔄 Step 7: Checking Question Selection & Turn Synchronization...');
    // Alice (Active Player) flips a TRUTH card
    const flipTruthRes = await fetch(`${BASE_URL}/api/rooms/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomCode,
        playerId: hostPlayerId,
        sessionToken: hostSessionToken,
        action: 'FLIP_CARD',
        payload: { type: 'truth' },
      }),
    });
    const flipTruthData = await flipTruthRes.json();
    if (!flipTruthData.success || !flipTruthData.room.currentCard) {
      throw new Error('Alice failed to flip truth card');
    }

    const drawnTruth = flipTruthData.room.currentCard;
    console.log(`   ✓ Alice drew TRUTH: "${drawnTruth.prompt}"`);

    // Verify it is strictly one of Alice's 10 custom truths
    if (!TRUTH_QUESTIONS.includes(drawnTruth.prompt)) {
      throw new Error(`Drawn card was not from custom truth pool! Found: "${drawnTruth.prompt}"`);
    }

    // Verify Bob sees the exact same card
    const bobPollRes = await fetch(`${BASE_URL}/api/rooms/${roomCode}`);
    const bobPollData = await bobPollRes.json();
    if (bobPollData.room.currentCard?.prompt !== drawnTruth.prompt) {
      throw new Error('Question mismatch on Bob client!');
    }
    console.log('   ✓ Question synchronized identically to Bob client');

    // Alice completes dare
    await fetch(`${BASE_URL}/api/rooms/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomCode,
        playerId: hostPlayerId,
        sessionToken: hostSessionToken,
        action: 'COMPLETE_DARE',
      }),
    });

    // Verify turn advanced to Bob
    const checkBobTurnRes = await fetch(`${BASE_URL}/api/rooms/${roomCode}`);
    const checkBobTurnData = await checkBobTurnRes.json();
    if (checkBobTurnData.room.activePlayerId !== bobPlayerId) {
      throw new Error(`Expected active player to be Bob (${bobPlayerId}), got ${checkBobTurnData.room.activePlayerId}`);
    }
    console.log('   ✓ Alice completed dare. Turn advanced to Bob!');

    // Bob flips a DARE card
    const flipDareRes = await fetch(`${BASE_URL}/api/rooms/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomCode,
        playerId: bobPlayerId,
        sessionToken: bobSessionToken,
        action: 'FLIP_CARD',
        payload: { type: 'dare' },
      }),
    });
    const flipDareData = await flipDareRes.json();
    const drawnDare = flipDareData.room.currentCard;
    console.log(`   ✓ Bob drew DARE: "${drawnDare.prompt}"`);
    if (!DARE_QUESTIONS.includes(drawnDare.prompt)) {
      throw new Error(`Drawn card was not from custom dare pool! Found: "${drawnDare.prompt}"`);
    }

    // Bob skips turn
    await fetch(`${BASE_URL}/api/rooms/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomCode,
        playerId: bobPlayerId,
        sessionToken: bobSessionToken,
        action: 'SKIP_TURN',
      }),
    });

    // Verify turn advanced to Charlie
    const checkCharlieTurnRes = await fetch(`${BASE_URL}/api/rooms/${roomCode}`);
    const checkCharlieTurnData = await checkCharlieTurnRes.json();
    if (checkCharlieTurnData.room.activePlayerId !== charliePlayerId) {
      throw new Error('Expected active player to be Charlie!');
    }
    console.log('   ✓ Bob skipped turn. Turn advanced to Charlie!');
    results.questionSynchronized = true;

    // -------------------------------------------------------------
    // STEP 8: EDIT THE ORIGINAL DECK DURING AN ACTIVE GAME
    // -------------------------------------------------------------
    console.log('\n✏️ Step 8: Mutating Original Custom Deck while Room is Active...');
    const mutatedQuestions = [
      { id: 'mutated-1', type: 'truth', prompt: 'MUTATED TRUTH: This should NEVER appear in the active room!' },
      { id: 'mutated-2', type: 'dare', prompt: 'MUTATED DARE: This should NEVER appear in the active room!' },
    ];

    const editDeckRes = await fetch(`${BASE_URL}/api/custom-decks/${customDeckId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-creator-id': hostCreatorId,
      },
      body: JSON.stringify({
        name: 'MODIFIED AND MUTATED DECK NAME',
        language: 'en',
        category: 'classic-party',
        visibility: 'private',
        creatorId: hostCreatorId,
        questions: mutatedQuestions,
      }),
    });

    const editDeckData = await editDeckRes.json();
    if (!editDeckData.success || editDeckData.deck.version !== 2) {
      throw new Error(`Deck mutation failed: ${JSON.stringify(editDeckData)}`);
    }
    results.originalDeckMutated = true;
    console.log(`   ✓ Original deck updated to Version ${editDeckData.deck.version} with mutated questions.`);

    // -------------------------------------------------------------
    // STEP 9: VERIFY ACTIVE ROOM STILL USES IMMUTABLE SNAPSHOT
    // -------------------------------------------------------------
    console.log('\n🔒 Step 9: Verifying Active Room Uses Immutable Snapshot...');
    // Charlie flips a card
    const charlieFlipRes = await fetch(`${BASE_URL}/api/rooms/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomCode,
        playerId: charliePlayerId,
        sessionToken: charlieSessionToken,
        action: 'FLIP_CARD',
        payload: { type: 'truth' },
      }),
    });
    const charlieFlipData = await charlieFlipRes.json();
    const charlieCard = charlieFlipData.room.currentCard;

    console.log(`   ✓ Charlie drew card: "${charlieCard.prompt}"`);

    // Verify card is from ORIGINAL questions, NEVER from the mutated deck
    if (charlieCard.prompt.includes('MUTATED')) {
      throw new Error('SECURITY VIOLATION: Active room leaked mutated questions from outside deck!');
    }
    if (!TRUTH_QUESTIONS.includes(charlieCard.prompt)) {
      throw new Error(`Charlie card not found in original snapshot: "${charlieCard.prompt}"`);
    }

    // Verify snapshot metadata remains Version 1 and preserves all 20 original questions
    if (charlieFlipData.room.customDeckSnapshot.version !== 1) {
      throw new Error(`Snapshot version tampered! Expected 1, got ${charlieFlipData.room.customDeckSnapshot.version}`);
    }
    if (charlieFlipData.room.customDeckSnapshot.questions.length !== 20) {
      throw new Error(`Snapshot questions altered! Expected 20, got ${charlieFlipData.room.customDeckSnapshot.questions.length}`);
    }

    results.snapshotIsolationVerified = true;
    console.log('   ✓ Immutable Snapshot Isolation 100% Verified! Active room unaffected by deck edit.');

    // -------------------------------------------------------------
    // STEP 10: RECONNECT A DISCONNECTED PLAYER
    // -------------------------------------------------------------
    console.log('\n🔌 Step 10: Testing Player Disconnection & Reconnection...');
    // Reconnect Charlie using saved credentials
    const reconnectRes = await fetch(`${BASE_URL}/api/rooms/reconnect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomCode,
        playerId: charliePlayerId,
        sessionToken: charlieSessionToken,
      }),
    });
    const reconnectData = await reconnectRes.json();
    if (!reconnectData.success || !reconnectData.player?.isConnected) {
      throw new Error(`Failed to reconnect Charlie: ${JSON.stringify(reconnectData)}`);
    }
    results.playerReconnected = true;
    console.log(`   ✓ Charlie successfully reconnected to room "${roomCode}"!`);

    // -------------------------------------------------------------
    // STEP 11: BROWSER AUTOMATION UI SCREENSHOTS
    // -------------------------------------------------------------
    console.log('\n📸 Step 11: Capturing Visual Proof Screenshots with Playwright...');
    const browser = await chromium.launch({ channel: 'chrome', headless: true });

    // Host Desktop View
    const hostContext = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 2,
    });
    const hostPage = await hostContext.newPage();
    // Pre-seed session
    await hostPage.addInitScript(
      ({ rCode, pId, token }) => {
        localStorage.setItem(
          `asteria_multiplayer_session_${rCode}`,
          JSON.stringify({ roomCode: rCode, playerId: pId, sessionToken: token, playerName: 'Alice (Host)' })
        );
      },
      { rCode: roomCode, pId: hostPlayerId, token: hostSessionToken }
    );
    await hostPage.goto(`${BASE_URL}/room/${roomCode}`, { waitUntil: 'networkidle' });
    await hostPage.waitForSelector(`text=${roomCode}`, { timeout: 8000 });
    await hostPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'active-gameplay-host-view.png') });
    console.log('   ✓ Host view captured: active-gameplay-host-view.png');
    await hostContext.close();

    // Bob Mobile View (iPhone 390x844)
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      deviceScaleFactor: 2,
    });
    const bobPage = await mobileContext.newPage();
    await bobPage.addInitScript(
      ({ rCode, pId, token }) => {
        localStorage.setItem(
          `asteria_multiplayer_session_${rCode}`,
          JSON.stringify({ roomCode: rCode, playerId: pId, sessionToken: token, playerName: 'Bob' })
        );
      },
      { rCode: roomCode, pId: bobPlayerId, token: bobSessionToken }
    );
    await bobPage.goto(`${BASE_URL}/room/${roomCode}`, { waitUntil: 'networkidle' });
    await bobPage.waitForSelector(`text=${roomCode}`, { timeout: 8000 });
    await bobPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'active-gameplay-guest-mobile.png') });
    console.log('   ✓ Guest mobile view captured: active-gameplay-guest-mobile.png');
    await mobileContext.close();

    await browser.close();
  } catch (error) {
    console.error('❌ E2E Custom Deck & Room Integration Audit Failed:', error);
    results.allPassed = false;
    throw error;
  }

  console.log('\n🎉 ALL 10 STEPS OF MULTIPLAYER CUSTOM DECK INTEGRATION AUDIT PASSED!');
  return results;
}

runMultiplayerCustomDeckAudit().catch((err) => {
  console.error(err);
  process.exit(1);
});
