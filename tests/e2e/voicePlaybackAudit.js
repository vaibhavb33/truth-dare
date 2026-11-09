const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, '../../project-docs/39-voice-repair/screenshots');

async function runAudit() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  console.log('Launching browser for Voice Playback Audit...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });

  // 1. Desktop Audit (1280x800)
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

  // Test 1: Question Library with compact voice controls
  console.log('Testing /en/questions...');
  await page.goto('http://localhost:3000/en/questions', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // Capture Question Library
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-desktop-questions-vault.png'), fullPage: false });
  console.log('Saved 01-desktop-questions-vault.png');

  // Find first compact voice button and click
  const firstVoiceBtn = page.locator('button[aria-label*="Listen"]').first();
  if (await firstVoiceBtn.isVisible()) {
    console.log('Found compact voice button in vault, clicking...');
    await firstVoiceBtn.click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-desktop-compact-playing.png'), fullPage: false });
    console.log('Saved 02-desktop-compact-playing.png');
  }

  // Test 2: Truth or Dare Interactive Game Card
  console.log('Testing /en/truth-or-dare...');
  await page.goto('http://localhost:3000/en/truth-or-dare', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  const launchBtn = page.locator('[data-testid="launch-game-btn"]').first();
  await launchBtn.scrollIntoViewIfNeeded();
  await launchBtn.click();
  await page.waitForTimeout(600);

  // Use the front face "Listen to Truth" button directly!
  const listenTruthFrontBtn = page.locator('button[title*="Listen to Truth"], button[aria-label*="Listen to Truth"]').first();
  if (await listenTruthFrontBtn.isVisible()) {
    console.log('Found front-face "Listen to Truth" button! Clicking...');
    await listenTruthFrontBtn.click();
    await page.waitForTimeout(1000);

    // Card has flipped and is now playing question audio!
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-desktop-card-active-playback.png'), fullPage: false });
    console.log('Saved 03-desktop-card-active-playback.png');

    // Test Pause button
    const pauseBtn = page.locator('button[aria-label*="Pause"], button[title*="Pause"]').first();
    if (await pauseBtn.isVisible()) {
      await pauseBtn.click();
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03b-desktop-card-paused.png'), fullPage: false });
      console.log('Saved 03b-desktop-card-paused.png');

      // Test Resume button
      const resumeBtn = page.locator('button[aria-label*="Resume"], button[title*="Resume"]').first();
      if (await resumeBtn.isVisible()) {
        await resumeBtn.click();
        await page.waitForTimeout(300);
        console.log('Resumed speech successfully.');
      }
    }
  }

  await desktopContext.close();

  // 2. Hindi Locale Audit (/hi/truth-or-dare)
  console.log('\n--- 2. Hindi Locale Audit (/hi/truth-or-dare) ---');
  const hindiContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const hindiPage = await hindiContext.newPage();

  await hindiPage.goto('http://localhost:3000/hi/truth-or-dare', { waitUntil: 'networkidle' });
  await hindiPage.waitForTimeout(600);

  const hindiLaunch = hindiPage.locator('[data-testid="launch-game-btn"]').first();
  await hindiLaunch.scrollIntoViewIfNeeded();
  await hindiLaunch.click();
  await hindiPage.waitForTimeout(600);

  const hindiListenFrontBtn = hindiPage.locator('button:has-text("सुनें"), button[title*="सुनें"]').first();
  if (await hindiListenFrontBtn.isVisible()) {
    console.log('Found Hindi "सुनें" button! Clicking...');
    await hindiListenFrontBtn.click();
    await hindiPage.waitForTimeout(1000);

    await hindiPage.screenshot({ path: path.join(SCREENSHOT_DIR, '04-desktop-hindi-playing.png'), fullPage: false });
    console.log('Saved 04-desktop-hindi-playing.png');
  }

  await hindiContext.close();

  // 3. Mobile Viewport Audit (390x844 - iPhone 14)
  console.log('\n--- 3. Mobile Viewport (390x844) ---');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileContext.newPage();

  await mobilePage.goto('http://localhost:3000/en/truth-or-dare', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(600);

  const mobileLaunch = mobilePage.locator('[data-testid="launch-game-btn"]').first();
  await mobileLaunch.scrollIntoViewIfNeeded();
  await mobileLaunch.click();
  await mobilePage.waitForTimeout(600);

  const mobileListenBtn = mobilePage.locator('button[title*="Listen to Truth"], button[aria-label*="Listen to Truth"]').first();
  if (await mobileListenBtn.isVisible()) {
    await mobileListenBtn.click();
    await mobilePage.waitForTimeout(1000);
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '05-mobile-english-playing.png'), fullPage: false });
    console.log('Saved 05-mobile-english-playing.png');
  }

  // Mobile Hindi
  await mobilePage.goto('http://localhost:3000/hi/truth-or-dare', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(600);

  const mobileHindiLaunch = mobilePage.locator('[data-testid="launch-game-btn"]').first();
  await mobileHindiLaunch.scrollIntoViewIfNeeded();
  await mobileHindiLaunch.click();
  await mobilePage.waitForTimeout(600);

  const mobileHindiListen = mobilePage.locator('button:has-text("सुनें"), button[title*="सुनें"]').first();
  if (await mobileHindiListen.isVisible()) {
    await mobileHindiListen.click();
    await mobilePage.waitForTimeout(1000);
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '06-mobile-hindi-playing.png'), fullPage: false });
    console.log('Saved 06-mobile-hindi-playing.png');
  }

  await mobileContext.close();
  await browser.close();

  console.log('\nAudit complete! All screenshots saved to:', SCREENSHOT_DIR);
}

runAudit().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
