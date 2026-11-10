const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, '../../project-docs/40-custom-deck-voice/screenshots');

async function runAudit() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  console.log('Launching browser for Custom Deck Voice Audit...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });

  // 1. Desktop Viewport (1280x800)
  console.log('\n--- 1. Desktop Viewport (1280x800) ---');
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await desktopContext.newPage();

  // Mock speech synthesis on page to track calls
  await page.addInitScript(() => {
    window.__mockSpeechCalls = [];
    let isSpeaking = false;
    let isPaused = false;
    let currentUtterance = null;

    const mockSynth = {
      get speaking() { return isSpeaking; },
      get paused() { return isPaused; },
      get pending() { return false; },
      onvoiceschanged: null,
      getVoices: () => [
        { name: 'Google US English', lang: 'en-US', default: true },
        { name: 'Google हिन्दी', lang: 'hi-IN', default: false },
        { name: 'Samantha', lang: 'en-US', default: false },
        { name: 'Monica', lang: 'es-ES', default: false },
      ],
      speak: (utterance) => {
        window.__mockSpeechCalls.push({
          text: utterance.text,
          lang: utterance.lang,
          rate: utterance.rate,
        });
        isSpeaking = true;
        isPaused = false;
        currentUtterance = utterance;
        setTimeout(() => {
          if (utterance.onstart) utterance.onstart();
        }, 50);
      },
      cancel: () => {
        isSpeaking = false;
        isPaused = false;
        if (currentUtterance && currentUtterance.onend) {
          currentUtterance.onend();
        }
      },
      pause: () => {
        isPaused = true;
        if (currentUtterance && currentUtterance.onpause) {
          currentUtterance.onpause();
        }
      },
      resume: () => {
        isPaused = false;
        if (currentUtterance && currentUtterance.onresume) {
          currentUtterance.onresume();
        }
      },
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    };
    window.speechSynthesis = mockSynth;
  });

  await page.goto('http://localhost:3000/en/custom', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // Capture Initial Custom Deck Editor
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-custom-deck-initial.png'), fullPage: false });
  console.log('Saved 01-custom-deck-initial.png');

  // Test Requirement 3: Listen before saving (Pre-save preview)
  const questionInput = page.locator('input[placeholder*="Type a truth question"], input[placeholder*="Type a dare challenge"]').first();
  await questionInput.scrollIntoViewIfNeeded();
  await questionInput.fill('What is the funniest rumor you have ever heard about yourself?');
  await page.waitForTimeout(300);

  // Speaker button in input area is now active
  const previewSpeakerBtn = page.locator('[data-testid="preview-question-voice-btn"]').first();
  if (await previewSpeakerBtn.isVisible()) {
    console.log('Found preview speaker button! Clicking to listen before saving...');
    await previewSpeakerBtn.click();
    await page.waitForTimeout(400);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-preview-voice-active.png'), fullPage: false });
    console.log('Saved 02-preview-voice-active.png');
  }

  // Add the question to the deck
  const addBtn = page.locator('button:has-text("Add Question")').first();
  await addBtn.click();
  await page.waitForTimeout(600);

  // Test Requirement 4: Listen to saved question
  const savedSpeakerBtn = page.locator('button[data-testid^="saved-question-voice-"]').first();
  if (await savedSpeakerBtn.isVisible()) {
    console.log('Found saved question speaker button! Clicking to listen...');
    await savedSpeakerBtn.scrollIntoViewIfNeeded();
    await savedSpeakerBtn.click();
    await page.waitForTimeout(400);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-saved-question-playing.png'), fullPage: false });
    console.log('Saved 03-saved-question-playing.png');
  }

  // Test Hindi Custom Deck
  console.log('\n--- 2. Hindi Custom Deck Audit ---');
  await page.goto('http://localhost:3000/hi/custom', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  const hindiQuestionInput = page.locator('input[placeholder*="Type a truth question"], input[placeholder*="Type a dare challenge"], input[type="text"]').last();
  await hindiQuestionInput.scrollIntoViewIfNeeded();
  await hindiQuestionInput.fill('सच: आपका सबसे बड़ा बचपन का डर क्या था?');
  await page.waitForTimeout(300);

  const hindiPreviewSpeaker = page.locator('[data-testid="preview-question-voice-btn"]').first();
  if (await hindiPreviewSpeaker.isVisible()) {
    await hindiPreviewSpeaker.click();
    await page.waitForTimeout(400);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-hindi-preview-playing.png'), fullPage: false });
    console.log('Saved 04-hindi-preview-playing.png');
  }

  await desktopContext.close();

  // 3. Mobile Viewport (390x844 - iPhone 14)
  console.log('\n--- 3. Mobile Viewport (390x844) ---');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileContext.newPage();

  // Mock speech synthesis on mobile page to track calls
  await mobilePage.addInitScript(() => {
    let isSpeaking = false;
    let isPaused = false;
    let currentUtterance = null;

    const mockSynth = {
      get speaking() { return isSpeaking; },
      get paused() { return isPaused; },
      get pending() { return false; },
      onvoiceschanged: null,
      getVoices: () => [
        { name: 'Google US English', lang: 'en-US', default: true },
        { name: 'Google हिन्दी', lang: 'hi-IN', default: false },
        { name: 'Samantha', lang: 'en-US', default: false },
        { name: 'Monica', lang: 'es-ES', default: false },
      ],
      speak: (utterance) => {
        isSpeaking = true;
        isPaused = false;
        currentUtterance = utterance;
        setTimeout(() => {
          if (utterance.onstart) utterance.onstart();
        }, 50);
      },
      cancel: () => {
        isSpeaking = false;
        isPaused = false;
        if (currentUtterance && currentUtterance.onend) {
          currentUtterance.onend();
        }
      },
      pause: () => {
        isPaused = true;
        if (currentUtterance && currentUtterance.onpause) {
          currentUtterance.onpause();
        }
      },
      resume: () => {
        isPaused = false;
        if (currentUtterance && currentUtterance.onresume) {
          currentUtterance.onresume();
        }
      },
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    };
    window.speechSynthesis = mockSynth;
  });

  await mobilePage.goto('http://localhost:3000/en/custom', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(600);

  const mobileInput = mobilePage.locator('input[placeholder*="Type a truth question"], input[placeholder*="Type a dare challenge"]').first();
  await mobileInput.scrollIntoViewIfNeeded();
  await mobileInput.fill('Dare: Speak only in rhyme for the next 2 minutes!');
  await mobilePage.waitForTimeout(300);

  const mobilePreviewBtn = mobilePage.locator('[data-testid="preview-question-voice-btn"]').first();
  if (await mobilePreviewBtn.isVisible()) {
    await mobilePreviewBtn.click();
    await mobilePage.waitForTimeout(400);
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '05-mobile-preview-playing.png'), fullPage: false });
    console.log('Saved 05-mobile-preview-playing.png');
  }

  // Add question on mobile and listen to saved
  const mobileAddBtn = mobilePage.locator('button:has-text("Add Question")').first();
  await mobileAddBtn.click();
  await mobilePage.waitForTimeout(600);

  // Dismiss PWA banner if visible on mobile
  const maybeLater = mobilePage.locator('button:has-text("Maybe Later")').first();
  if (await maybeLater.isVisible()) {
    await maybeLater.click();
    await mobilePage.waitForTimeout(200);
  }

  const mobileSavedVoice = mobilePage.locator('button[data-testid^="saved-question-voice-"]').first();
  if (await mobileSavedVoice.isVisible()) {
    await mobileSavedVoice.scrollIntoViewIfNeeded();
    await mobileSavedVoice.click({ force: true });
    await mobilePage.waitForTimeout(400);
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '06-mobile-saved-playing.png'), fullPage: false });
    console.log('Saved 06-mobile-saved-playing.png');
  }

  await mobileContext.close();
  await browser.close();

  console.log('\nAudit complete! All screenshots saved to:', SCREENSHOT_DIR);
}

runAudit().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
