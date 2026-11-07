# Multilingual SEO, Hreflang & Indexability Specification

## 1. Multilingual Search Engine Optimization Core Principles
Asteria implements enterprise international SEO best practices per Google Search Central specifications:
1. **Self-Referencing Canonicals**: Every language variation canonicalizes to its own absolute localized URL.
2. **100% Reciprocal Hreflang Alternates**: Every page lists all 8 supported languages as alternate versions. No dangling or one-way alternate links exist.
3. **`x-default` Fallback**: The `x-default` hreflang points to the international root URL (`https://truthordarequiz.com/...`) for users whose language/region is not explicitly targeted.
4. **No Geo-IP Forcing**: We never redirect search engine crawlers (such as Googlebot-Image or Googlebot) based on request IP headers. Crawlers can index all 8 localized URL sets without geo-blocking barriers.

---

## 2. Reciprocal Hreflang Architecture (`lib/i18n/seo.ts`)
The `getLocalizedAlternates(subpath, currentLocale)` helper dynamically generates the exact `alternates` metadata object for Next.js App Router:

```typescript
export function getLocalizedAlternates(subpath: string, currentLocale: Locale = DEFAULT_LOCALE) {
  const cleanPath = subpath === '/' ? '' : subpath.startsWith('/') ? subpath : `/${subpath}`;

  const languageAlternates: Record<string, string> = {};
  ALL_LOCALES.forEach((loc) => {
    languageAlternates[loc] = `${SITE_URL}/${loc}${cleanPath}`;
  });
  languageAlternates['x-default'] = `${SITE_URL}${cleanPath || '/'}`;

  const canonicalUrl =
    currentLocale === DEFAULT_LOCALE && cleanPath === ''
      ? SITE_URL
      : `${SITE_URL}/${currentLocale}${cleanPath}`;

  return {
    canonical: canonicalUrl,
    languages: languageAlternates,
  };
}
```

### Rendered HTML `<head>` Example (e.g. `/es/games/truth-or-dare`):
```html
<link rel="canonical" href="https://truthordarequiz.com/es/games/truth-or-dare" />
<link rel="alternate" hreflang="en" href="https://truthordarequiz.com/en/games/truth-or-dare" />
<link rel="alternate" hreflang="hi" href="https://truthordarequiz.com/hi/games/truth-or-dare" />
<link rel="alternate" hreflang="es" href="https://truthordarequiz.com/es/games/truth-or-dare" />
<link rel="alternate" hreflang="pt" href="https://truthordarequiz.com/pt/games/truth-or-dare" />
<link rel="alternate" hreflang="fr" href="https://truthordarequiz.com/fr/games/truth-or-dare" />
<link rel="alternate" hreflang="id" href="https://truthordarequiz.com/id/games/truth-or-dare" />
<link rel="alternate" hreflang="ar" href="https://truthordarequiz.com/ar/games/truth-or-dare" />
<link rel="alternate" hreflang="de" href="https://truthordarequiz.com/de/games/truth-or-dare" />
<link rel="alternate" hreflang="x-default" href="https://truthordarequiz.com/games/truth-or-dare" />
```

---

## 3. Multilingual Sitemap Generation (`app/sitemap.ts`)
Asteria's sitemap implements Google's recommended multilingual format with XML `xhtml:link` child elements:
- All 18 primary application routes are declared.
- Each entry contains a complete `alternates.languages` dictionary mapping all 8 language URLs + `x-default`.
- Priority is allocated proportionally:
  - Homepage: `1.0`
  - Core Games: `0.95`
  - Party Games & Directory: `0.85 - 0.9`
  - Blog & Guides: `0.75 - 0.8`
  - Support & Legal: `0.3 - 0.5`

---

## 4. Robots.txt Directives (`app/robots.ts`)
```typescript
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://truthordarequiz.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/', '/room/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```
- Fully indexable root and all `/[locale]/` routes.
- Real-time ephemeral multiplayer rooms (`/room/[code]`) and internal API endpoints (`/api/`) are explicitly disallowed to prevent index bloat.

---

## 5. Automated Validation & Test Coverage
- Verified in `tests/seoAndSitemap.test.ts` (18 canonical routes, priority bounds, RFC robots.txt directives).
- Verified in `tests/multilingualGlobal.test.ts` (100% reciprocal alternates across all 8 languages for every canonical subpath).

