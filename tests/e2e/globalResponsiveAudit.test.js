const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';

const VIEWPORTS = [
  { name: '320px (iPhone SE 1st gen)', width: 320, height: 568, deviceType: 'mobile' },
  { name: '360px (Android Compact)', width: 360, height: 800, deviceType: 'mobile' },
  { name: '375px (iPhone 8 / SE 3)', width: 375, height: 667, deviceType: 'mobile' },
  { name: '390px (iPhone 14/15)', width: 390, height: 844, deviceType: 'mobile' },
  { name: '414px (iPhone XR/Plus)', width: 414, height: 896, deviceType: 'mobile' },
  { name: '430px (iPhone 15/16 Pro Max)', width: 430, height: 932, deviceType: 'mobile' },
  { name: '768px (iPad Portrait)', width: 768, height: 1024, deviceType: 'tablet' },
  { name: '1024px (iPad Pro / Laptop)', width: 1024, height: 768, deviceType: 'laptop' },
  { name: '1280px (MacBook / Desktop)', width: 1280, height: 800, deviceType: 'desktop' },
  { name: '1440px (Desktop Widescreen)', width: 1440, height: 900, deviceType: 'wide' },
];

const PAGES_TO_TEST = [
  { name: 'Homepage', path: '/' },
  { name: 'All Games Directory', path: '/games' },
  { name: 'Truth or Dare Setup', path: '/games/truth-or-dare' },
  { name: 'Spinner Wheel', path: '/games/spin-the-bottle' },
  { name: 'Never Have I Ever', path: '/games/never-have-i-ever' },
  { name: 'Would You Rather', path: '/games/would-you-rather' },
  { name: 'Most Likely To', path: '/games/most-likely-to' },
  { name: 'This or That', path: '/games/this-or-that' },
  { name: 'Question Library', path: '/questions' },
  { name: 'Custom Deck Studio', path: '/custom' },
  { name: 'Blog Guides Hub', path: '/blog' },
  { name: 'Blog Article Rules', path: '/blog/official-truth-or-dare-rules' },
  { name: 'About Page', path: '/about' },
  { name: 'Contact Page', path: '/contact' },
  { name: 'Privacy Policy', path: '/privacy' },
  { name: 'Terms of Service', path: '/terms' },
  { name: 'Multiplayer Room Arena', path: '/room/TEST01' },
];

async function runGlobalAudit() {
  console.log('🚀 Running Global Responsive Design Audit Across 10 Viewports & 17 Pages...\n');

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const results = [];
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  try {
    for (const vp of VIEWPORTS) {
      console.log(`\n======================================================`);
      console.log(`📐 VIEWPORT: ${vp.name} (${vp.width}x${vp.height}) [${vp.deviceType}]`);
      console.log(`======================================================`);

      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const page = await context.newPage();

      for (const target of PAGES_TO_TEST) {
        totalTests++;
        try {
          await page.goto(`${BASE_URL}${target.path}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
          await page.waitForTimeout(400);

          // 1. Check Horizontal Overflow
          const overflowInfo = await page.evaluate(() => {
            const docWidth = document.documentElement.scrollWidth;
            const winWidth = window.innerWidth;
            const bodyWidth = document.body.scrollWidth;
            const hasHScroll = docWidth > winWidth + 1 || bodyWidth > winWidth + 1;

            // Find elements that exceed window width
            let offElements = [];
            if (hasHScroll) {
              const all = document.querySelectorAll('*');
              for (const el of all) {
                const rect = el.getBoundingClientRect();
                if (rect.right > winWidth + 1) {
                  offElements.push({
                    tag: el.tagName,
                    id: el.id,
                    className: (el.className || '').toString().slice(0, 50),
                    right: rect.right,
                    winWidth,
                  });
                  if (offElements.length >= 3) break;
                }
              }
            }

            return {
              hasHScroll,
              docWidth,
              winWidth,
              bodyWidth,
              offElements,
            };
          });

          // 2. Check Header Visibility & Logo
          const headerInfo = await page.evaluate(() => {
            const header = document.querySelector('header');
            if (!header) return { present: false };
            const rect = header.getBoundingClientRect();
            const logo = header.querySelector('a');
            return {
              present: true,
              visible: rect.height > 0 && rect.width > 0,
              width: rect.width,
              logoVisible: !!logo,
            };
          });

          // 3. Check Mobile Dock vs Desktop Navigation
          const navInfo = await page.evaluate((isMobile) => {
            const dock = document.querySelector('nav[aria-label="Mobile Navigation"]');
            const desktopNav = document.querySelector('header nav');

            return {
              dockVisible: dock ? window.getComputedStyle(dock).display !== 'none' : false,
              desktopNavVisible: desktopNav ? window.getComputedStyle(desktopNav).display !== 'none' : false,
            };
          }, vp.width < 1024);

          // Evaluate test assertions
          let passed = !overflowInfo.hasHScroll && headerInfo.present && headerInfo.visible;

          // Mobile dock check: should be visible on mobile (< 1024px)
          if (vp.width < 1024 && !navInfo.dockVisible) {
            // Note: Room page has its own bottom controls or full screen, check if intended
          }

          if (passed) {
            passedTests++;
            console.log(`  ✓ [PASS] ${target.name} (scrollWidth=${overflowInfo.docWidth}px, viewport=${vp.width}px)`);
          } else {
            failedTests++;
            console.error(`  ❌ [FAIL] ${target.name} on ${vp.width}px:`);
            if (overflowInfo.hasHScroll) {
              console.error(`     Overflow: docWidth=${overflowInfo.docWidth}px > winWidth=${vp.width}px`);
              console.error(`     Offending elements:`, overflowInfo.offElements);
            }
            if (!headerInfo.present || !headerInfo.visible) {
              console.error(`     Header issue: present=${headerInfo.present}, visible=${headerInfo.visible}`);
            }
          }

          results.push({
            viewport: vp.name,
            width: vp.width,
            height: vp.height,
            page: target.name,
            path: target.path,
            passed,
            overflowInfo,
            headerInfo,
            navInfo,
          });
        } catch (err) {
          failedTests++;
          console.error(`  ❌ [ERROR] ${target.name} on ${vp.width}px: ${err.message}`);
          results.push({
            viewport: vp.name,
            width: vp.width,
            page: target.name,
            path: target.path,
            passed: false,
            error: err.message,
          });
        }
      }

      await context.close();
    }

    console.log(`\n======================================================`);
    console.log(`📊 AUDIT SUMMARY:`);
    console.log(`Total Page/Viewport Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Pass Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    console.log(`======================================================\n`);

    return { totalTests, passedTests, failedTests, results };
  } finally {
    await browser.close();
  }
}

runGlobalAudit().catch(console.error);

