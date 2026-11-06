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
    return { languages };
  }

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
      alternates: makeAlternates('/'),
    },
    {
      url: `${baseUrl}/games`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
      alternates: makeAlternates('/games'),
    },
    {
      url: `${baseUrl}/games/truth-or-dare`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.95,
      alternates: makeAlternates('/games/truth-or-dare'),
    },
    {
      url: `${baseUrl}/games/spin-the-bottle`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: makeAlternates('/games/spin-the-bottle'),
    },
    {
      url: `${baseUrl}/games/never-have-i-ever`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: makeAlternates('/games/never-have-i-ever'),
    },
    {
      url: `${baseUrl}/games/would-you-rather`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: makeAlternates('/games/would-you-rather'),
    },
    {
      url: `${baseUrl}/games/most-likely-to`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
      alternates: makeAlternates('/games/most-likely-to'),
    },
    {
      url: `${baseUrl}/games/this-or-that`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
      alternates: makeAlternates('/games/this-or-that'),
    },
    {
      url: `${baseUrl}/questions`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
      alternates: makeAlternates('/questions'),
    },
    {
      url: `${baseUrl}/custom`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: makeAlternates('/custom'),
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: makeAlternates('/blog'),
    },
    {
      url: `${baseUrl}/blog/official-truth-or-dare-rules`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
      alternates: makeAlternates('/blog/official-truth-or-dare-rules'),
    },
    {
      url: `${baseUrl}/blog/50-best-dares-over-facetime`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
      alternates: makeAlternates('/blog/50-best-dares-over-facetime'),
    },
    {
      url: `${baseUrl}/blog/clean-icebreakers-for-work`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
      alternates: makeAlternates('/blog/clean-icebreakers-for-work'),
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
      alternates: makeAlternates('/about'),
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
      alternates: makeAlternates('/contact'),
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
      alternates: makeAlternates('/privacy'),
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
      alternates: makeAlternates('/terms'),
    },
  ];

  return routes;
}
