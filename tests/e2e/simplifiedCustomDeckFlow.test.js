const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, '../../project-docs/37-custom-deck-simplification/screenshots');

async function runSimplifiedCustomDeckAudit() {
  console.log('🚀 Asteria Simplified Custom Deck E2E QA Starting...\n');
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const results = {
    workflow: [],
    allPassed: true,
  };

  try {
    // ========================================================
    // 1. DESKTOP WORKFLOW & INITIAL STATE (1440x900)
    // ========================================================
    console.log('🖥️ [1/6] Auditing Desktop Simplified Deck Editor View...');
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    await page.goto(`${BASE_URL}/custom`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    // Verify Advanced Settings are collapsed by default (Phase 2)
    const categorySelectVisible = await page.locator('select:has-text("Classic Party")').isVisible();
    const isAdvancedCollapsed = !categorySelectVisible;
    console.log(`   ✓ Advanced Settings collapsed by default: ${isAdvancedCollapsed ? 'PASS' : 'FAIL'}`);
    if (!isAdvancedCollapsed) results.allPassed = false;

    // Verify Add Question button is disabled when input is empty (Phase 3 & Problem 4 Fix)
    const addQuestionBtn = page.locator('button:has-text("Add Question")').first();
    const isAddDisabledInitially = await addQuestionBtn.isDisabled();
    console.log(`   ✓ Add Question button disabled with empty input: ${isAddDisabledInitially ? 'PASS' : 'FAIL'}`);
    if (!isAddDisabledInitially) results.allPassed = false;

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-simplified-deck-editor-desktop.png') });
    console.log('   ✓ Screenshot captured: 01-simplified-deck-editor-desktop.png');

    // ========================================================
    // 2. WORKFLOW STEP 1 & 2: NAME & ADD TRUTH QUESTION
    // ========================================================
    console.log('\n✍️ [2/6] Testing Step 1-4: Deck Name & Adding Truths/Dares...');

    // Set custom deck name
    const deckNameInput = page.locator('input[placeholder*="Friday Night Party"], input[placeholder*="e.g."]').first();
    await deckNameInput.fill('Ultra Fun Friday Pack');
    await page.waitForTimeout(200);

    // Select TRUTH (should be selected by default, click to test)
    const truthTypeBtn = page.locator('button:has-text("TRUTH")').first();
    await truthTypeBtn.click();

    // Type Truth question
    const questionInput = page.locator('input[placeholder*="truth question"], input[placeholder*="dare challenge"]').first();
    await questionInput.fill('What is the funniest thing you have ever purchased online while half asleep?');

    // Button should now be enabled!
    const isAddEnabledWithText = !(await addQuestionBtn.isDisabled());
    console.log(`   ✓ Add Question button enabled after typing: ${isAddEnabledWithText ? 'PASS' : 'FAIL'}`);
    if (!isAddEnabledWithText) results.allPassed = false;

    // Click Add Question
    await addQuestionBtn.click();
    await page.waitForTimeout(400);

    // Verify input cleared and success notice displayed
    const inputValAfterAdd = await questionInput.inputValue();
    const inputCleared = inputValAfterAdd === '';
    const successNoticeVisible = await page.locator('text=Truth added!').isVisible();
    console.log(`   ✓ Input cleared: ${inputCleared ? 'PASS' : 'FAIL'}, Success message: ${successNoticeVisible ? 'PASS' : 'FAIL'}`);
    if (!inputCleared) results.allPassed = false;

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-question-editor-add-truth.png') });

    // Select DARE and add a Dare question
    const dareTypeBtn = page.locator('button:has-text("DARE")').first();
    await dareTypeBtn.click();
    await page.waitForTimeout(200);

    await questionInput.fill('Attempt to juggle three items chosen by the person on your right for 30 seconds.');
    await addQuestionBtn.click();
    await page.waitForTimeout(400);

    const dareSuccessVisible = await page.locator('text=Dare added!').isVisible();
    console.log(`   ✓ Dare added with success notice: ${dareSuccessVisible ? 'PASS' : 'FAIL'}`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-question-editor-add-dare.png') });

    // ========================================================
    // 3. EDIT & DELETE QUESTIONS (PHASE 4)
    // ========================================================
    console.log('\n✏️ [3/6] Testing Question List, Inline Edit, and Delete...');

    // Check Question Cards
    const questionCardsCount = await page.locator('button[title="Edit Question"]').count();
    console.log(`   ✓ Question Cards in deck: ${questionCardsCount} cards`);
    if (questionCardsCount < 2) results.allPassed = false;

    // Test Edit on the newly added question
    const targetCard = page.locator('div').filter({ hasText: 'funniest thing' }).filter({ has: page.locator('button[title="Edit Question"]') }).last();
    const editBtn = targetCard.locator('button[title="Edit Question"]').first();
    await editBtn.click();
    await page.waitForTimeout(300);

    const editInput = page.locator('input[value*="funniest thing"]').first();
    await editInput.fill('What is the weirdest habit you have when you are completely alone?');
    const saveEditBtn = page.locator('button:has-text("Save Changes")').first();
    await saveEditBtn.click();
    await page.waitForTimeout(300);

    const editedCardVisible = await page.locator('text=weirdest habit you have').isVisible();
    console.log(`   ✓ Inline question edit saved: ${editedCardVisible ? 'PASS' : 'FAIL'}`);
    if (!editedCardVisible) results.allPassed = false;

    // Test Delete by adding a dummy question and deleting it
    await dareTypeBtn.click();
    await questionInput.fill('Dummy question to test delete functionality.');
    await addQuestionBtn.click();
    await page.waitForTimeout(400);

    const deleteBtn = page.locator('button[title="Delete Question"]').last();
    await deleteBtn.click();
    await page.waitForTimeout(300);

    const dummyGone = !(await page.locator('text=Dummy question to test delete').isVisible());
    console.log(`   ✓ Question deletion verified: ${dummyGone ? 'PASS' : 'FAIL'}`);
    if (!dummyGone) results.allPassed = false;

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-question-card-list.png') });

    // ========================================================
    // 4. ADVANCED SETTINGS COLLAPSIBLE TEST
    // ========================================================
    console.log('\n⚙️ [4/6] Testing Advanced Settings Expand / Collapse...');
    const advancedToggleBtn = page.locator('button:has-text("Advanced Settings")').first();
    await advancedToggleBtn.click();
    await page.waitForTimeout(300);

    const descInput = page.locator('input[placeholder*="optional note or theme"]').first();
    const isDescVisible = await descInput.isVisible();
    console.log(`   ✓ Advanced Settings expanded: ${isDescVisible ? 'PASS' : 'FAIL'}`);
    if (isDescVisible) {
      await descInput.fill('High-energy party deck for college friends.');
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-advanced-settings-expanded.png') });

    // ========================================================
    // 5. SAVE DECK & PERSISTENCE TEST (PHASE 5)
    // ========================================================
    console.log('\n💾 [5/6] Testing Save Deck and Server Persistence...');
    const saveDeckBtn = page.locator('button:has-text("Save Deck")').first();
    await saveDeckBtn.click();
    await page.waitForTimeout(800);

    const saveSuccessBadge = await page.locator('text=Deck Saved Successfully!').isVisible();
    console.log(`   ✓ Deck Save success notification: ${saveSuccessBadge ? 'PASS' : 'FAIL'}`);
    if (!saveSuccessBadge) results.allPassed = false;

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-save-deck-success.png') });

    // Reload page to verify persistence (deckStorage + draft)
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    const reloadedDeckName = await page.locator('input[value="Ultra Fun Friday Pack"]').isVisible();
    const reloadedQuestion = await page.locator('text=weirdest habit you have').isVisible();
    console.log(`   ✓ Data persisted across page reload: Deck="${reloadedDeckName}", Questions="${reloadedQuestion}"`);
    if (!reloadedDeckName || !reloadedQuestion) results.allPassed = false;

    // Test Save Deck & Play Button (Phase 5)
    const saveAndPlayBtn = page.locator('button:has-text("Save Deck & Play")').first();
    await saveAndPlayBtn.click();
    await page.waitForTimeout(800);

    const isPassAndPlayActive = await page.locator('text=Pass & Play Setup').isVisible();
    console.log(`   ✓ Save Deck & Play transitioned directly to gameplay: ${isPassAndPlayActive ? 'PASS' : 'FAIL'}`);
    if (!isPassAndPlayActive) results.allPassed = false;

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-save-and-play-transition.png') });

    // Verify My Decks tab
    const myDecksTab = page.locator('button:has-text("My Decks")').first();
    await myDecksTab.click();
    await page.waitForTimeout(500);

    const savedDeckInLibrary = await page.locator('text=Ultra Fun Friday Pack').isVisible();
    console.log(`   ✓ Saved Deck visible in My Decks library: ${savedDeckInLibrary ? 'PASS' : 'FAIL'}`);
    if (!savedDeckInLibrary) results.allPassed = false;

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09-my-decks-library.png') });

    await context.close();

    // ========================================================
    // 6. MOBILE RESPONSIVE TEST (390x844)
    // ========================================================
    console.log('\n📱 [6/6] Testing Mobile Single-Column Responsive View (390x844)...');
    const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const mobilePage = await mobileContext.newPage();

    await mobilePage.goto(`${BASE_URL}/custom`, { waitUntil: 'domcontentloaded' });
    await mobilePage.waitForTimeout(600);

    // Check horizontal scrollbar
    const overflow = await mobilePage.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    console.log(`   ✓ Mobile horizontal overflow: ${overflow ? 'FAIL' : 'NONE (PASS)'}`);
    if (overflow) results.allPassed = false;

    // Verify single-column layout and readable inputs
    const mobileDeckName = mobilePage.locator('input[placeholder*="Friday Night Party"], input[placeholder*="e.g."]').first();
    const isMobileInputVisible = await mobileDeckName.isVisible();
    console.log(`   ✓ Mobile input render: ${isMobileInputVisible ? 'PASS' : 'FAIL'}`);
    if (!isMobileInputVisible) results.allPassed = false;

    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '08-mobile-simplified-deck-editor.png') });

    await mobileContext.close();
  } catch (err) {
    console.error('Simplified Custom Deck test failure:', err);
    results.allPassed = false;
  } finally {
    await browser.close();
  }

  console.log('\n======================================================');
  console.log(`🎯 SIMPLIFIED CUSTOM DECK E2E RESULT: ${results.allPassed ? 'ALL AUDIT CHECKS PASSED' : 'FAILURES DETECTED'}`);
  console.log('======================================================\n');
  return results;
}

runSimplifiedCustomDeckAudit().then((res) => {
  if (!res.allPassed) {
    process.exit(1);
  }
  process.exit(0);
});
