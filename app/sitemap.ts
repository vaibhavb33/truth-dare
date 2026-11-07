import type { MetadataRoute } from 'next';
import { ALL_LOCALES } from '@/lib/i18n/config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://truthordarequiz.com';
  const now = new Date();

  function makeAlternates(subpath: string) {
    const clean = subpath === '/' ? '' : subpath;
    const languages: Record<string, string> = {};
    ALL_LOCALES.forEach((loc) => {
      languages[loc] = `${baseUrl}/${loc}${clean}`;
    });
    languages['x-default'] = `${baseUrl}${clean || '/'}`;
    return { languages };
  }

  const baseSubpaths = [
    { path: '/', priority: 1.0, freq: 'daily' as const },
    { path: '/games', priority: 0.9, freq: 'daily' as const },
    { path: '/games/truth-or-dare', priority: 0.95, freq: 'daily' as const },
    { path: '/games/spin-the-bottle', priority: 0.9, freq: 'weekly' as const },
    { path: '/games/never-have-i-ever', priority: 0.9, freq: 'weekly' as const },
    { path: '/games/would-you-rather', priority: 0.9, freq: 'weekly' as const },
    { path: '/games/most-likely-to', priority: 0.85, freq: 'weekly' as const },
    { path: '/games/this-or-that', priority: 0.85, freq: 'weekly' as const },
    { path: '/questions', priority: 0.85, freq: 'weekly' as const },
    { path: '/custom', priority: 0.8, freq: 'monthly' as const },
    { path: '/blog', priority: 0.8, freq: 'weekly' as const },
    { path: '/blog/official-truth-or-dare-rules', priority: 0.75, freq: 'monthly' as const },
    { path: '/blog/50-best-dares-over-facetime', priority: 0.75, freq: 'monthly' as const },
    { path: '/blog/clean-icebreakers-for-work', priority: 0.75, freq: 'monthly' as const },
    { path: '/about', priority: 0.5, freq: 'monthly' as const },
    { path: '/contact', priority: 0.5, freq: 'monthly' as const },
    { path: '/privacy', priority: 0.3, freq: 'yearly' as const },
    { path: '/terms', priority: 0.3, freq: 'yearly' as const },
  ];

  const routes: MetadataRoute.Sitemap = [];

  // Canonical routes with full hreflang alternates for all 8 supported languages + x-default
  baseSubpaths.forEach(({ path, priority, freq }) => {
    routes.push({
      url: `${baseUrl}${path === '/' ? '' : path}`,
      lastModified: now,
      changeFrequency: freq,
      priority,
      alternates: makeAlternates(path),
    });
  });

  return routes;
}
