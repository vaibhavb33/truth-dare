// Comprehensive Multilingual E2E Verification Suite
// Tests all 8 languages: en, hi, es, pt, fr, id, ar, de
const { chromium } = require('playwright');

const LANGUAGES = [
  {
    code: 'en',
    name: 'English',
    expectedTitleSnippet: 'Truth or Dare',
    expectedBtnSnippet: 'Start Game',
    isRTL: false,
  },
  {
    code: 'hi',
    name: 'Hindi',
    expectedTitleSnippet: 'ट्रुथ या डेयर',
    expectedBtnSnippet: 'गेम शुरू करें',
    scriptRegex: /[\u0900-\u097F]/, // Devanagari block
    isRTL: false,
  },
  {
    code: 'es',
    name: 'Spanish',
    expectedTitleSnippet: 'Verdad o Reto',
    expectedBtnSnippet: 'Comenzar Partida',
    isRTL: false,
  },
  {
    code: 'pt',
    name: 'Portuguese',
    expectedTitleSnippet: 'Verdade ou Desafio',
    expectedBtnSnippet: 'Iniciar Jogo',
    isRTL: false,
  },
  {
    code: 'fr',
    name: 'French',
    expectedTitleSnippet: 'Action ou Vérité',
    expectedBtnSnippet: 'Démarrer la Partie',
    isRTL: false,
  },
  {
    code: 'id',
    name: 'Indonesian',
    expectedTitleSnippet: 'Truth or Dare',
    expectedBtnSnippet: 'Mulai Game',
    isRTL: false,
  },
  {
    code: 'ar',
    name: 'Arabic',
    expectedTitleSnippet: 'صراحة أم جرأة',
    expectedBtnSnippet: 'بدء اللعبة',
    scriptRegex: /[\u0600-\u06FF]/, // Arabic block
    isRTL: true,
  },
  {
    code: 'de',
    name: 'German',
    expectedTitleSnippet: 'Wahrheit oder Pflicht',
    expectedBtnSnippet: 'Spiel Starten',
    isRTL: false,
  },
];

async function runMultilingualQA() {
  console.log('🌐 Starting Automated Multilingual E2E Verification Suite...');
  const browser = await chromium.launch({ channel: 'chrome' });
  const results = [];

  function record(langCode, check, status, details = '') {
    results.push({ langCode, check, status, details });
    console.log(`  [${status === 'PASS' ? '✓ PASS' : '✗ FAIL'}] [${langCode.toUpperCase()}] ${check}: ${details}`);
  }

  for (const lang of LANGUAGES) {
    console.log(`\n--- Testing Language: ${lang.name} (${lang.code}) ---`);
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const url = `http://localhost:3000/${lang.code}/truth-or-dare`;

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(600);

      // 1. Check HTML lang and dir attributes
      const htmlAttrs = await page.evaluate(() => ({
        lang: document.documentElement.lang,
        dir: document.documentElement.dir || 'ltr',
      }));

      const langAttrPass = htmlAttrs.lang === lang.code;
      const dirAttrPass = lang.isRTL ? htmlAttrs.dir === 'rtl' : htmlAttrs.dir === 'ltr';
      record(lang.code, 'HTML lang attribute', langAttrPass ? 'PASS' : 'FAIL', `lang="${htmlAttrs.lang}"`);
      record(lang.code, 'RTL / LTR dir attribute', dirAttrPass ? 'PASS' : 'FAIL', `dir="${htmlAttrs.dir}"`);

      // 2. Check UI Translation Strings
      const pageText = await page.evaluate(() => document.body.innerText);
      const hasTitle = pageText.includes(lang.expectedTitleSnippet);
      const hasBtn = pageText.includes(lang.expectedBtnSnippet);
      record(lang.code, 'Interface Translation (Title & CTA)', hasTitle && hasBtn ? 'PASS' : 'FAIL', `Title: "${lang.expectedTitleSnippet}", CTA: "${lang.expectedBtnSnippet}"`);

      // 3. Start Game and Draw a Question
      const startBtn = await page.locator(`button:has-text("${lang.expectedBtnSnippet}")`);
      if (await startBtn.isVisible()) {
        await startBtn.click();
        await page.waitForTimeout(600);

        // Click Truth or Dare button in this language
        const choiceBtns = await page.$$('button:has-text("TRUTH"), button:has-text("DARE")');
        if (choiceBtns.length > 0) {
          await choiceBtns[0].click();
          await page.waitForTimeout(800);

          const promptText = await page.evaluate(() => {
            const p = document.querySelector('p.font-bold');
            return p ? p.innerText : '';
          });

          let scriptPass = promptText.length > 5;
          if (lang.scriptRegex) {
            scriptPass = scriptPass && lang.scriptRegex.test(promptText);
          }

          record(
            lang.code,
            'Native-Language Question Generation',
            scriptPass ? 'PASS' : 'FAIL',
            `Drawn: "${promptText.substring(0, 45)}..."`
          );
        }
      }

    } catch (err) {
      record(lang.code, 'Language Route Accessibility', 'FAIL', err.message);
    } finally {
      await page.close();
    }
  }

  // Language Selector Switcher Test
  console.log('\n--- Testing Language Selector Dropdown Interaction ---');
  const testPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  try {
    await testPage.goto('http://localhost:3000/en/truth-or-dare', { waitUntil: 'domcontentloaded' });
    await testPage.waitForTimeout(500);

    // Open language selector
    const langTrigger = await testPage.$('button[aria-label*="Select Language"], button:has-text("🇬🇧")');
    if (langTrigger) {
      await langTrigger.click();
      await testPage.waitForTimeout(400);

      // Click Hindi
      const hiOption = await testPage.$('button:has-text("हिन्दी")');
      if (hiOption) {
        await hiOption.click();
        await testPage.waitForTimeout(1000);

        const currentUrl = testPage.url();
        const switched = currentUrl.includes('/hi/truth-or-dare');
        record('Selector', 'Language Dropdown Navigation & URL Switch', switched ? 'PASS' : 'FAIL', `Switched to: ${currentUrl}`);
      } else {
        record('Selector', 'Hindi Option in Dropdown', 'FAIL', 'Option not found');
      }
    } else {
      record('Selector', 'Language Selector Button', 'FAIL', 'Trigger not found');
    }
  } catch (err) {
    record('Selector', 'Language Selector Test', 'FAIL', err.message);
  } finally {
    await testPage.close();
    await browser.close();
  }

  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  console.log(`\n========================================`);
  console.log(`🌐 MULTILINGUAL E2E QA COMPLETE`);
  console.log(`Total Checks: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log(`Pass Rate: ${((passed / results.length) * 100).toFixed(1)}%`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runMultilingualQA();
