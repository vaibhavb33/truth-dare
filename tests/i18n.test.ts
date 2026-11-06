import { describe, it, expect } from 'vitest';
import { ALL_LOCALES, SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/lib/i18n/config';
import { getTranslations, dictionaries } from '@/lib/i18n/translations';
import { getLocalizedAlternates } from '@/lib/i18n/seo';

describe('Asteria Internationalisation & Multilingual Engine', () => {
  it('supports all 8 required languages with exact names and codes', () => {
    expect(ALL_LOCALES).toEqual(['en', 'hi', 'es', 'pt', 'fr', 'id', 'ar', 'de']);

    expect(SUPPORTED_LOCALES.en.nativeName).toBe('English');
    expect(SUPPORTED_LOCALES.hi.nativeName).toBe('हिन्दी');
    expect(SUPPORTED_LOCALES.es.nativeName).toBe('Español');
    expect(SUPPORTED_LOCALES.pt.nativeName).toBe('Português');
    expect(SUPPORTED_LOCALES.fr.nativeName).toBe('Français');
    expect(SUPPORTED_LOCALES.id.nativeName).toBe('Bahasa Indonesia');
    expect(SUPPORTED_LOCALES.ar.nativeName).toBe('العربية');
    expect(SUPPORTED_LOCALES.de.nativeName).toBe('Deutsch');
  });

  it('correctly configures Arabic as RTL and all others as LTR', () => {
    expect(SUPPORTED_LOCALES.ar.dir).toBe('rtl');

    const ltrLocales = ALL_LOCALES.filter((l) => l !== 'ar');
    ltrLocales.forEach((code) => {
      expect(SUPPORTED_LOCALES[code].dir).toBe('ltr');
    });
  });

  it('contains complete, non-empty translation dictionaries for all 8 languages', () => {
    ALL_LOCALES.forEach((locale) => {
      const dict = getTranslations(locale);
      expect(dict).toBeDefined();

      // Navigation
      expect(dict.nav.allGames.length).toBeGreaterThan(0);
      expect(dict.nav.truthOrDare.length).toBeGreaterThan(0);
      expect(dict.nav.spinnerWheel.length).toBeGreaterThan(0);
      expect(dict.nav.customDeck.length).toBeGreaterThan(0);
      expect(dict.nav.questionLibrary.length).toBeGreaterThan(0);
      expect(dict.nav.roomCode.length).toBeGreaterThan(0);

      // Home & Core
      expect(dict.home.heroTitle.length).toBeGreaterThan(0);
      expect(dict.home.heroSubtitle.length).toBeGreaterThan(0);
      expect(dict.home.quickPlay.length).toBeGreaterThan(0);
      expect(dict.home.joinRoomTitle.length).toBeGreaterThan(0);

      // Game Setup & Turn
      expect(dict.game.truth.length).toBeGreaterThan(0);
      expect(dict.game.dare.length).toBeGreaterThan(0);
      expect(dict.game.playerTurn.length).toBeGreaterThan(0);
      expect(dict.game.launchGame.length).toBeGreaterThan(0);
      expect(dict.game.skipQuestion.length).toBeGreaterThan(0);

      // Categories
      expect(dict.categories.classicParty.name.length).toBeGreaterThan(0);
      expect(dict.categories.couplesFlirty.name.length).toBeGreaterThan(0);
      expect(dict.categories.spicy18.name.length).toBeGreaterThan(0);

      // Games List
      expect(dict.gamesList.truthOrDare.name.length).toBeGreaterThan(0);
      expect(dict.gamesList.spinTheBottle.name.length).toBeGreaterThan(0);
      expect(dict.gamesList.neverHaveIEver.name.length).toBeGreaterThan(0);
      expect(dict.gamesList.wouldYouRather.name.length).toBeGreaterThan(0);
      expect(dict.gamesList.mostLikelyTo.name.length).toBeGreaterThan(0);
      expect(dict.gamesList.thisOrThat.name.length).toBeGreaterThan(0);
    });
  });

  it('generates correct reciprocal hreflang and self-referencing canonical tags', () => {
    const alternates = getLocalizedAlternates('/truth-or-dare', 'es');

    // Self-referencing canonical for Spanish
    expect(alternates.canonical).toBe('https://truthordarequiz.com/es/truth-or-dare');

    // Reciprocal hreflang for all 8 languages
    ALL_LOCALES.forEach((loc) => {
      expect(alternates.languages[loc]).toBe(`https://truthordarequiz.com/${loc}/truth-or-dare`);
    });

    // x-default points to default fallback
    expect(alternates.languages['x-default']).toBe('https://truthordarequiz.com/truth-or-dare');
  });

  it('defaults to English when an unsupported locale is requested', () => {
    // @ts-expect-error Testing invalid locale
    const fallback = getTranslations('xx');
    expect(fallback).toEqual(dictionaries.en);
  });
});
