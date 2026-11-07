# Asteria Localized URL & Route Architecture Map

## 1. URL Architecture Principles
1. **Language Segment**: Every international route features a standard two-letter ISO 639-1 prefix (`/en/`, `/hi/`, `/es/`, `/pt/`, `/fr/`, `/id/`, `/ar/`, `/de/`).
2. **Backward Compatibility**: Base URLs without locale prefixes (e.g. `/games/truth-or-dare`) act as canonical default routes with self-referencing and reciprocal hreflang links pointing to their localized variants.
3. **No Dynamic Query Parameters**: Clean path segments are used exclusively instead of query strings (`?lang=es`) to optimize search engine crawling and CDN caching.

---

## 2. Global URL Mapping Table

| Route Concept | Canonical Base URL | English (`en`) | Hindi (`hi`) | Spanish (`es`) | Portuguese (`pt`) | French (`fr`) | Indonesian (`id`) | Arabic (`ar`) | German (`de`) |
|---|---|---|---|---|---|---|---|---|---|
| **Homepage** | `/` | `/en` | `/hi` | `/es` | `/pt` | `/fr` | `/id` | `/ar` | `/de` |
| **All Games Hub** | `/games` | `/en/games` | `/hi/games` | `/es/games` | `/pt/games` | `/fr/games` | `/id/games` | `/ar/games` | `/de/games` |
| **Truth or Dare** | `/games/truth-or-dare` | `/en/games/truth-or-dare` | `/hi/games/truth-or-dare` | `/es/games/truth-or-dare` | `/pt/games/truth-or-dare` | `/fr/games/truth-or-dare` | `/id/games/truth-or-dare` | `/ar/games/truth-or-dare` | `/de/games/truth-or-dare` |
| **Spinner Wheel** | `/games/spin-the-bottle` | `/en/games/spin-the-bottle` | `/hi/games/spin-the-bottle` | `/es/games/spin-the-bottle` | `/pt/games/spin-the-bottle` | `/fr/games/spin-the-bottle` | `/id/games/spin-the-bottle` | `/ar/games/spin-the-bottle` | `/de/games/spin-the-bottle` |
| **Never Have I Ever** | `/games/never-have-i-ever` | `/en/games/never-have-i-ever` | `/hi/games/never-have-i-ever` | `/es/games/never-have-i-ever` | `/pt/games/never-have-i-ever` | `/fr/games/never-have-i-ever` | `/id/games/never-have-i-ever` | `/ar/games/never-have-i-ever` | `/de/games/never-have-i-ever` |
| **Would You Rather** | `/games/would-you-rather` | `/en/games/would-you-rather` | `/hi/games/would-you-rather` | `/es/games/would-you-rather` | `/pt/games/would-you-rather` | `/fr/games/would-you-rather` | `/id/games/would-you-rather` | `/ar/games/would-you-rather` | `/de/games/would-you-rather` |
| **Most Likely To** | `/games/most-likely-to` | `/en/games/most-likely-to` | `/hi/games/most-likely-to` | `/es/games/most-likely-to` | `/pt/games/most-likely-to` | `/fr/games/most-likely-to` | `/id/games/most-likely-to` | `/ar/games/most-likely-to` | `/de/games/most-likely-to` |
| **This or That** | `/games/this-or-that` | `/en/games/this-or-that` | `/hi/games/this-or-that` | `/es/games/this-or-that` | `/pt/games/this-or-that` | `/fr/games/this-or-that` | `/id/games/this-or-that` | `/ar/games/this-or-that` | `/de/games/this-or-that` |
| **Questions Directory** | `/questions` | `/en/questions` | `/hi/questions` | `/es/questions` | `/pt/questions` | `/fr/questions` | `/id/questions` | `/ar/questions` | `/de/questions` |
| **Custom Deck Studio** | `/custom` | `/en/custom` | `/hi/custom` | `/es/custom` | `/pt/custom` | `/fr/custom` | `/id/custom` | `/ar/custom` | `/de/custom` |
| **About Asteria** | `/about` | `/en/about` | `/hi/about` | `/es/about` | `/pt/about` | `/fr/about` | `/id/about` | `/ar/about` | `/de/about` |
| **Contact & Support** | `/contact` | `/en/contact` | `/hi/contact` | `/es/contact` | `/pt/contact` | `/fr/contact` | `/id/contact` | `/ar/contact` | `/de/contact` |
| **Privacy Policy** | `/privacy` | `/en/privacy` | `/hi/privacy` | `/es/privacy` | `/pt/privacy` | `/fr/privacy` | `/id/privacy` | `/ar/privacy` | `/de/privacy` |
| **Terms of Service** | `/terms` | `/en/terms` | `/hi/terms` | `/es/terms` | `/pt/terms` | `/fr/terms` | `/id/terms` | `/ar/terms` | `/de/terms` |
| **Blog Index** | `/blog` | `/en/blog` | `/hi/blog` | `/es/blog` | `/pt/blog` | `/fr/blog` | `/id/blog` | `/ar/blog` | `/de/blog` |
| **Rules Article** | `/blog/official-truth-or-dare-rules` | `/en/blog/official-truth-or-dare-rules` | `/hi/blog/official-truth-or-dare-rules` | `/es/blog/official-truth-or-dare-rules` | `/pt/blog/official-truth-or-dare-rules` | `/fr/blog/official-truth-or-dare-rules` | `/id/blog/official-truth-or-dare-rules` | `/ar/blog/official-truth-or-dare-rules` | `/de/blog/official-truth-or-dare-rules` |
| **FaceTime Dares** | `/blog/50-best-dares-over-facetime` | `/en/blog/50-best-dares-over-facetime` | `/hi/blog/50-best-dares-over-facetime` | `/es/blog/50-best-dares-over-facetime` | `/pt/blog/50-best-dares-over-facetime` | `/fr/blog/50-best-dares-over-facetime` | `/id/blog/50-best-dares-over-facetime` | `/ar/blog/50-best-dares-over-facetime` | `/de/blog/50-best-dares-over-facetime` |
| **Clean Icebreakers** | `/blog/clean-icebreakers-for-work` | `/en/blog/clean-icebreakers-for-work` | `/hi/blog/clean-icebreakers-for-work` | `/es/blog/clean-icebreakers-for-work` | `/pt/blog/clean-icebreakers-for-work` | `/fr/blog/clean-icebreakers-for-work` | `/id/blog/clean-icebreakers-for-work` | `/ar/blog/clean-icebreakers-for-work` | `/de/blog/clean-icebreakers-for-work` |

---

## 3. Dynamic Route Generation (`generateStaticParams`)
All localized routes under `app/[locale]/` define `generateStaticParams()` returning:
```typescript
export async function generateStaticParams() {
  return ALL_LOCALES.map((locale) => ({ locale }));
}
```
For blog articles under `app/[locale]/blog/[slug]/page.tsx`, params combine all 8 locales with all 3 published article slugs:
```typescript
export async function generateStaticParams() {
  const slugs = [
    'official-truth-or-dare-rules',
    '50-best-dares-over-facetime',
    'clean-icebreakers-for-work',
  ];
  const params: { locale: string; slug: string }[] = [];
  ALL_LOCALES.forEach((locale) => {
    slugs.forEach((slug) => {
      params.push({ locale, slug });
    });
  });
  return params;
}
```
This guarantees 100% pre-rendered SSG across the entire site matrix (180 static HTML pages).
