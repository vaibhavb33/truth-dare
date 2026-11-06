// Comprehensive Technical SEO Automated Audit Suite
const http = require('http');

function fetchRawHtml(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${urlPath}`, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, html: data }));
    }).on('error', reject);
  });
}

const LOCALES = ['en', 'hi', 'es', 'pt', 'fr', 'id', 'ar', 'de'];

async function runTechnicalSeoAudit() {
  console.log('🔍 Starting Comprehensive Technical SEO Automated Audit...');
  const results = [];

  function record(page, check, status, details = '') {
    results.push({ page, check, status, details });
    console.log(`  [${status === 'PASS' ? '✓ PASS' : '✗ FAIL'}] [${page}] ${check}: ${details}`);
  }

  // 1. Audit /robots.txt
  console.log('\n--- 1. Testing /robots.txt ---');
  try {
    const robots = await fetchRawHtml('/robots.txt');
    record('robots.txt', 'HTTP Status 200', robots.statusCode === 200 ? 'PASS' : 'FAIL', `Status: ${robots.statusCode}`);
    record('robots.txt', 'User-Agent Directive', /User-agent:/i.test(robots.html) ? 'PASS' : 'FAIL', 'Found User-agent');
    record('robots.txt', 'Sitemap Reference', robots.html.includes('sitemap.xml') ? 'PASS' : 'FAIL', 'Points to sitemap.xml');
    record('robots.txt', 'Admin Disallow Rule', robots.html.includes('Disallow: /admin') ? 'PASS' : 'FAIL', 'Protected /admin');
  } catch (err) {
    record('robots.txt', 'Fetch robots.txt', 'FAIL', err.message);
  }

  // 2. Audit /sitemap.xml
  console.log('\n--- 2. Testing /sitemap.xml ---');
  try {
    const sitemap = await fetchRawHtml('/sitemap.xml');
    record('sitemap.xml', 'HTTP Status 200', sitemap.statusCode === 200 ? 'PASS' : 'FAIL', `Status: ${sitemap.statusCode}`);
    record('sitemap.xml', 'Valid XML Structure', sitemap.html.includes('<?xml') || sitemap.html.includes('<urlset') || sitemap.html.includes('<sitemapindex') ? 'PASS' : 'FAIL', 'XML root element present');

    // Check localized routes presence in sitemap
    for (const loc of LOCALES) {
      const hasLocale = sitemap.html.includes(`/${loc}`);
      record('sitemap.xml', `Locale /${loc} inclusion`, hasLocale ? 'PASS' : 'FAIL', `Includes /${loc}`);
    }
  } catch (err) {
    record('sitemap.xml', 'Fetch sitemap.xml', 'FAIL', err.message);
  }

  // 3. Audit Localized Landing Pages (SSR, Metadata, Canonicals, Hreflangs, Schemas)
  console.log('\n--- 3. Testing Localized Pages (SSR & On-Page SEO) ---');
  for (const loc of LOCALES) {
    const pagePath = `/${loc}`;
    try {
      const res = await fetchRawHtml(pagePath);
      record(pagePath, 'HTTP 200 OK', res.statusCode === 200 ? 'PASS' : 'FAIL', `Status: ${res.statusCode}`);

      const html = res.html;

      // Canonical check: Root apex for EN homepage or /{loc} for others
      const canonicalMatch = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/i);
      const canonical = canonicalMatch ? canonicalMatch[1] : '';
      const hasCanonical = canonical.includes('truthordarequiz.com') && (loc === 'en' ? (canonical === 'https://truthordarequiz.com' || canonical.includes('/en')) : canonical.includes(loc));
      record(pagePath, 'Canonical URL', hasCanonical ? 'PASS' : 'FAIL', `Canonical: ${canonical}`);

      // Hreflang check: should have alternates
      const hreflangs = [];
      const hreflangRegex = /<link[^>]*hreflang="([^"]*)"[^>]*href="([^"]*)"/gi;
      let match;
      while ((match = hreflangRegex.exec(html)) !== null) {
        hreflangs.push(match[1]);
      }
      const hasHreflangs = hreflangs.length >= 8;
      record(pagePath, 'Hreflang Alternates', hasHreflangs ? 'PASS' : 'FAIL', `Found ${hreflangs.length} hreflang tags`);

      // Title Tag
      const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
      const title = titleMatch ? titleMatch[1] : '';
      const validTitle = title.length > 10;
      record(pagePath, 'Title Tag Quality', validTitle ? 'PASS' : 'FAIL', `"${title.substring(0, 50)}..."`);

      // Meta Description
      const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/i);
      const desc = descMatch ? descMatch[1] : '';
      const validDesc = desc.length > 25;
      record(pagePath, 'Meta Description Quality', validDesc ? 'PASS' : 'FAIL', `"${desc.substring(0, 60)}..."`);

      // Robots directive: Ensure NO accidental noindex
      const noindexMatch = html.match(/<meta[^>]*content="[^"]*noindex[^"]*"/i);
      record(pagePath, 'Indexable Directive (No noindex)', !noindexMatch ? 'PASS' : 'FAIL', 'Page is indexable');

      // Structured Data (JSON-LD)
      const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
      let validSchemas = 0;
      if (jsonLdMatch) {
        for (const block of jsonLdMatch) {
          const rawJson = block.replace(/<script[^>]*type="application\/ld\+json"[^>]*>/i, '').replace(/<\/script>/i, '');
          try {
            JSON.parse(rawJson);
            validSchemas++;
          } catch {}
        }
      }
      record(pagePath, 'Schema.org JSON-LD Structured Data', validSchemas >= 1 ? 'PASS' : 'FAIL', `Found ${validSchemas} valid schema blocks`);

      // Server-Side Rendering (SSR) Accessibility
      const hasSSRHeading = html.includes('<h1');
      record(pagePath, 'Server-Side Rendering (SSR)', hasSSRHeading ? 'PASS' : 'FAIL', 'HTML payload contains pre-rendered <h1>');

    } catch (err) {
      record(pagePath, 'Page Audit', 'FAIL', err.message);
    }
  }

  // 4. Audit Truth or Dare Game Landing Page
  console.log('\n--- 4. Testing Core Game Page (/en/truth-or-dare) ---');
  try {
    const res = await fetchRawHtml('/en/truth-or-dare');
    record('/en/truth-or-dare', 'HTTP 200 OK', res.statusCode === 200 ? 'PASS' : 'FAIL', `Status: ${res.statusCode}`);
    const canonicalMatch = res.html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/i);
    const hasCanonical = canonicalMatch && canonicalMatch[1].includes('/en/truth-or-dare');
    record('/en/truth-or-dare', 'Canonical URL', hasCanonical ? 'PASS' : 'FAIL', `Canonical: ${canonicalMatch ? canonicalMatch[1] : 'none'}`);
  } catch (err) {
    record('/en/truth-or-dare', 'Game Page Audit', 'FAIL', err.message);
  }

  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  console.log(`\n========================================`);
  console.log(`🔍 TECHNICAL SEO AUDIT COMPLETE`);
  console.log(`Total Checks: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log(`Pass Rate: ${((passed / results.length) * 100).toFixed(1)}%`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runTechnicalSeoAudit();
