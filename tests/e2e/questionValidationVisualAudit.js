const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function runAudit() {
  const screenshotsDir = path.join(process.cwd(), 'project-docs/38-question-validation/screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  console.log('1. Navigating to Custom Deck page...');
  await page.goto('http://localhost:3000/en/custom', { waitUntil: 'networkidle' });

  // 1. Initial State: Empty input, button disabled, ZERO red error banner!
  const attentionBanner = page.locator('text=Attention');
  const bannerCount = await attentionBanner.count();
  console.log(`Initial attention banners count: ${bannerCount} (must be 0)`);
  if (bannerCount !== 0) {
    throw new Error('Initial page load contains an error banner!');
  }

  const addBtn = page.getByRole('button', { name: /Add Question/i });
  const isAddDisabledInitial = await addBtn.isDisabled();
  console.log(`Add Question button initial disabled state: ${isAddDisabledInitial} (must be true)`);
  if (!isAddDisabledInitial) {
    throw new Error('Add Question button should be disabled when input is empty!');
  }

  await page.screenshot({
    path: path.join(screenshotsDir, '01-initial-empty-state.png'),
    fullPage: false,
  });
  console.log('Captured: 01-initial-empty-state.png');

  // 2. Spaces Only Input: "   "
  console.log('2. Testing spaces-only input ("   ")...');
  const questionInput = page.getByPlaceholder(/Type a truth question/i);
  await questionInput.fill('   ');
  await page.waitForTimeout(300);

  const isAddDisabledSpaces = await addBtn.isDisabled();
  const spacesError = page.locator('text=Your question cannot contain only spaces.');
  const hasSpacesError = await spacesError.isVisible();
  console.log(`Add button disabled on spaces: ${isAddDisabledSpaces}, Spaces error visible: ${hasSpacesError}`);

  await page.screenshot({
    path: path.join(screenshotsDir, '02-inline-error-spaces.png'),
    fullPage: false,
  });
  console.log('Captured: 02-inline-error-spaces.png');

  // 3. Clear Input: Error clears immediately
  console.log('3. Testing error clear on empty...');
  await questionInput.fill('');
  await page.waitForTimeout(200);
  const spacesErrorCleared = !(await spacesError.isVisible());
  console.log(`Spaces error cleared on empty: ${spacesErrorCleared}`);

  // 4. Input Exceeding 250 characters (251 chars)
  console.log('4. Testing input exceeding 250 characters...');
  const text251 = 'This is a very long truth question designed to exceed the maximum limit of two hundred and fifty characters. Let us keep typing to guarantee that the prompt boundary is fully surpassed: '.padEnd(251, 'X');
  await questionInput.fill(text251);
  await page.waitForTimeout(300);

  const isAddDisabledTooLong = await addBtn.isDisabled();
  const tooLongError = page.locator('text=Maximum 250 characters allowed.');
  const hasTooLongError = await tooLongError.isVisible();
  console.log(`Add button disabled on >250 chars: ${isAddDisabledTooLong}, Too long error visible: ${hasTooLongError}`);

  await page.screenshot({
    path: path.join(screenshotsDir, '03-inline-error-too-long.png'),
    fullPage: false,
  });
  console.log('Captured: 03-inline-error-too-long.png');

  // 5. Valid 1-character Question: "A"
  console.log('5. Testing 1-character valid question ("A")...');
  await questionInput.fill('A');
  await page.waitForTimeout(200);
  const isAddEnabled1Char = !(await addBtn.isDisabled());
  console.log(`Add button enabled on 1-char input: ${isAddEnabled1Char}`);

  await page.screenshot({
    path: path.join(screenshotsDir, '04-valid-input-1char.png'),
    fullPage: false,
  });
  console.log('Captured: 04-valid-input-1char.png');

  // 6. Valid Hindi Devanagari Question
  console.log('6. Adding a valid Hindi question...');
  const hindiPrompt = 'क्या आपने कभी किसी दोस्त का कोई बड़ा राज छुपाया है?';
  await questionInput.fill(hindiPrompt);
  await page.waitForTimeout(200);

  await addBtn.click();
  await page.waitForTimeout(500);

  // Verify success behavior:
  // - Input cleared
  // - Success message visible
  // - Question appears in list
  const inputValueAfterAdd = await questionInput.inputValue();
  const successBadge = page.locator('role=status');
  const hasSuccessBadge = await successBadge.isVisible();
  const successText = await successBadge.textContent();
  const newQuestionCard = page.locator(`text=${hindiPrompt}`);
  const hasNewQuestion = await newQuestionCard.isVisible();

  console.log(`Input cleared: ${inputValueAfterAdd === ''}`);
  console.log(`Success badge visible: ${hasSuccessBadge} (${successText})`);
  console.log(`New question visible in deck: ${hasNewQuestion}`);

  await page.screenshot({
    path: path.join(screenshotsDir, '05-success-question-added.png'),
    fullPage: false,
  });
  console.log('Captured: 05-success-question-added.png');

  // 7. Duplicate Question Attempt
  console.log('7. Testing duplicate question attempt...');
  await questionInput.fill(hindiPrompt);
  await page.waitForTimeout(300);

  const isAddDisabledDuplicate = await addBtn.isDisabled();
  const duplicateError = page.locator('text=This question is already in your deck.');
  const hasDuplicateError = await duplicateError.isVisible();
  console.log(`Add button disabled on duplicate: ${isAddDisabledDuplicate}, Duplicate error visible: ${hasDuplicateError}`);

  await page.screenshot({
    path: path.join(screenshotsDir, '06-inline-error-duplicate.png'),
    fullPage: false,
  });
  console.log('Captured: 06-inline-error-duplicate.png');

  // 8. Clear and Save Deck
  console.log('8. Testing Save Deck...');
  await questionInput.fill('');
  await page.waitForTimeout(200);

  const saveDeckBtn = page.getByRole('button', { name: /Save Deck/i }).first();
  await saveDeckBtn.click();
  await page.waitForTimeout(500);

  const saveSuccessBadge = page.locator('text=Deck Saved');
  const hasSavedNotice = await saveSuccessBadge.isVisible();
  console.log(`Deck saved successfully: ${hasSavedNotice}`);

  await page.screenshot({
    path: path.join(screenshotsDir, '07-save-deck-success.png'),
    fullPage: false,
  });
  console.log('Captured: 07-save-deck-success.png');

  // 9. Mobile Viewport (iPhone 14: 390x844)
  console.log('9. Testing Mobile Viewport (390x844)...');
  await page.setViewportSize({ width: 390, height: 844 });
  await questionInput.fill('   ');
  await page.waitForTimeout(300);

  await page.screenshot({
    path: path.join(screenshotsDir, '08-mobile-validation-viewport.png'),
    fullPage: false,
  });
  console.log('Captured: 08-mobile-validation-viewport.png');

  await browser.close();
  console.log('All visual audit screenshots captured successfully!');
}

runAudit().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
