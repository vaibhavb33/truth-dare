import { describe, it, expect } from 'vitest';
import sitemap from '@/app/sitemap';
import robots from '@/app/robots';

describe('SEO Architecture & Indexability Validation', () => {
  it('generates a valid sitemap with all 18 canonical routes', () => {
    const sitemapData = sitemap();

    expect(Array.isArray(sitemapData)).toBe(true);
    expect(sitemapData.length).toBe(18);

    const urls = sitemapData.map((entry) => entry.url);
    expect(urls).toContain('https://truthordarequiz.com');
    expect(urls).toContain('https://truthordarequiz.com/games/truth-or-dare');
    expect(urls).toContain('https://truthordarequiz.com/games/spin-the-bottle');
    expect(urls).toContain('https://truthordarequiz.com/games/never-have-i-ever');
    expect(urls).toContain('https://truthordarequiz.com/games/would-you-rather');
    expect(urls).toContain('https://truthordarequiz.com/games/most-likely-to');
    expect(urls).toContain('https://truthordarequiz.com/games/this-or-that');
    expect(urls).toContain('https://truthordarequiz.com/questions');
    expect(urls).toContain('https://truthordarequiz.com/blog');

    // Verify all priorities are valid between 0.0 and 1.0
    sitemapData.forEach((entry) => {
      expect(entry.priority).toBeGreaterThanOrEqual(0);
      expect(entry.priority).toBeLessThanOrEqual(1.0);
    });
  });

  it('generates RFC-compliant robots.txt directives', () => {
    const robotsData = robots();

    expect(robotsData.rules).toBeDefined();
    expect(robotsData.sitemap).toBe('https://truthordarequiz.com/sitemap.xml');

    const rules = Array.isArray(robotsData.rules) ? robotsData.rules : [robotsData.rules];
    const wildcardRule = rules.find((r) => r.userAgent === '*');

    expect(wildcardRule).toBeDefined();
    expect(wildcardRule?.allow).toBe('/');
    expect(wildcardRule?.disallow).toEqual(['/admin', '/admin/', '/api/', '/room/']);
  });
});

