import { describe, it, expect } from 'vitest';
import { metadata as homeMetadata } from '@/app/page';
import { metadata as todMetadata } from '@/app/games/truth-or-dare/page';
import { metadata as questionsMetadata } from '@/app/questions/page';
import { metadata as customMetadata } from '@/app/custom/page';
import { metadata as spinnerMetadata } from '@/app/games/spin-the-bottle/page';
import { metadata as gamesMetadata } from '@/app/games/page';
import { generateLocalizedMetadata, getLocalizedAlternates } from '@/lib/i18n/seo';
import { ALL_LOCALES } from '@/lib/i18n/config';

describe('On-Page SEO Rebranding & Keyword Optimization', () => {
  const BASE_URL = 'https://playtruthndare.com';

  describe('Phase 2 & 3: Page Titles & Meta Descriptions', () => {
    it('optimizes Homepage metadata with primary keywords and branding', () => {
      const title = typeof homeMetadata.title === 'string' ? homeMetadata.title : (homeMetadata.title as any)?.default;
      expect(title).toBe('Truth or Dare Online | Play With Friends Free — Play Truth & Dare');
      expect(homeMetadata.description).toBe(
        'Play Truth or Dare online for free! Challenge friends, create private rooms, enjoy multiplayer games and explore fun Truth and Dare questions.'
      );
      expect((homeMetadata.alternates as any)?.canonical).toBe(BASE_URL);
    });

    it('optimizes Truth or Dare Game Page metadata', () => {
      expect(todMetadata.title).toContain('Play Truth or Dare Online');
      expect(todMetadata.title).toContain('Play Truth & Dare');
      expect(todMetadata.description).toContain('Truth or Dare');
      expect((todMetadata.alternates as any)?.canonical).toBe(`${BASE_URL}/games/truth-or-dare`);
    });

    it('optimizes Questions Library metadata', () => {
      expect(questionsMetadata.title).toContain('Truth or Dare Questions');
      expect(questionsMetadata.title).toContain('Play Truth & Dare');
      expect(questionsMetadata.description).toContain('Truth or Dare questions');
      expect((questionsMetadata.alternates as any)?.canonical).toBe(`${BASE_URL}/questions`);
    });

    it('optimizes Custom Deck Creator metadata', () => {
      expect(customMetadata.title).toContain('Custom Truth or Dare Deck Creator');
      expect(customMetadata.title).toContain('Play Truth & Dare');
      expect((customMetadata.alternates as any)?.canonical).toBe(`${BASE_URL}/custom`);
    });

    it('optimizes Spin the Bottle Online metadata', () => {
      expect(spinnerMetadata.title).toContain('Spin the Bottle Online');
      expect(spinnerMetadata.title).toContain('Play Truth & Dare');
      expect((spinnerMetadata.alternates as any)?.canonical).toBe(`${BASE_URL}/games/spin-the-bottle`);
    });

    it('optimizes Online Party Games Directory metadata', () => {
      expect(gamesMetadata.title).toContain('Online Party Games Directory');
      expect(gamesMetadata.title).toContain('Play Truth & Dare');
      expect((gamesMetadata.alternates as any)?.canonical).toBe(`${BASE_URL}/games`);
    });
  });

  describe('Phase 4: Technical SEO & Hreflang Alternates', () => {
    it('generates reciprocal hreflang tags for all 8 supported languages + x-default', () => {
      const alternates = getLocalizedAlternates('/games/truth-or-dare', 'en');

      expect(alternates.canonical).toBe(`${BASE_URL}/games/truth-or-dare`);
      expect(alternates.languages['x-default']).toBe(`${BASE_URL}/games/truth-or-dare`);

      ALL_LOCALES.forEach((locale) => {
        expect(alternates.languages[locale]).toBe(`${BASE_URL}/${locale}/games/truth-or-dare`);
      });
    });

    it('generates culturally adapted localized homepage metadata across all locales', () => {
      ALL_LOCALES.forEach((locale) => {
        const localizedMeta = generateLocalizedMetadata({ locale, subpath: '/' });
        expect(localizedMeta.title).toBeDefined();
        expect(localizedMeta.description).toBeDefined();
        expect((localizedMeta.alternates as any)?.canonical).toBeDefined();

        if (locale === 'en') {
          expect(localizedMeta.title).toBe('Truth or Dare Online | Play With Friends Free — Play Truth & Dare');
        } else {
          expect(localizedMeta.title).toContain('Play Truth & Dare');
        }
      });
    });
  });
});

