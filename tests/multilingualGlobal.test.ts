import { describe, it, expect } from 'vitest';
import { ALL_LOCALES, SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/lib/i18n/config';
import { getTranslations, dictionaries } from '@/lib/i18n/translations';
import { questionEngine } from '@/lib/questions/engine';
import { roomEngine } from '@/lib/multiplayer/roomEngine';
import { getLocalizedAlternates } from '@/lib/i18n/seo';
import { SupportedLanguageCode, GameType } from '@/types';

describe('Global Multilingual & Internationalisation Engine (Task 10)', () => {
  const supportedLanguages: SupportedLanguageCode[] = ['en', 'hi', 'es', 'pt', 'fr', 'id', 'ar', 'de'];

  it('supports all 8 official languages with exact ISO 639-1 codes and metadata', () => {
    expect(ALL_LOCALES).toEqual(supportedLanguages);

    expect(SUPPORTED_LOCALES.en.name).toBe('English');
    expect(SUPPORTED_LOCALES.hi.name).toBe('Hindi');
    expect(SUPPORTED_LOCALES.hi.nativeName).toBe('हिन्दी');
    expect(SUPPORTED_LOCALES.es.name).toBe('Spanish');
    expect(SUPPORTED_LOCALES.pt.name).toBe('Portuguese');
    expect(SUPPORTED_LOCALES.fr.name).toBe('French');
    expect(SUPPORTED_LOCALES.id.name).toBe('Indonesian');
    expect(SUPPORTED_LOCALES.ar.name).toBe('Arabic');
    expect(SUPPORTED_LOCALES.ar.nativeName).toBe('العربية');
    expect(SUPPORTED_LOCALES.de.name).toBe('German');
  });

  it('correctly sets text direction: Arabic as RTL and all other 7 languages as LTR', () => {
    expect(SUPPORTED_LOCALES.ar.dir).toBe('rtl');

    const ltrLanguages = supportedLanguages.filter((l) => l !== 'ar');
    for (const lang of ltrLanguages) {
      expect(SUPPORTED_LOCALES[lang].dir).toBe('ltr');
    }
  });

  it('verifies 100% dictionary key parity between English baseline and all 7 translations', () => {
    const enDict = dictionaries.en;

    // Helper to recursively collect all keys with path
    function collectKeys(obj: any, prefix = ''): string[] {
      let keys: string[] = [];
      for (const key of Object.keys(obj)) {
        const val = obj[key];
        const currentPath = prefix ? `${prefix}.${key}` : key;
        if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
          keys = keys.concat(collectKeys(val, currentPath));
        } else {
          keys.push(currentPath);
        }
      }
      return keys;
    }

    const baselineKeys = collectKeys(enDict).sort();

    // Verify key parity for all 8 dictionaries
    for (const lang of supportedLanguages) {
      const targetDict = dictionaries[lang];
      expect(targetDict).toBeDefined();

      const targetKeys = collectKeys(targetDict).sort();
      const missingKeys = baselineKeys.filter((k) => !targetKeys.includes(k));
      const extraKeys = targetKeys.filter((k) => !baselineKeys.includes(k));

      expect(missingKeys, `Missing keys in ${lang} dictionary`).toEqual([]);
      expect(extraKeys, `Unexpected extra keys in ${lang} dictionary`).toEqual([]);

      // Ensure no empty string or undefined translations exist
      for (const keyPath of baselineKeys) {
        const parts = keyPath.split('.');
        let current: any = targetDict;
        for (const p of parts) {
          current = current[p];
        }
        expect(typeof current === 'string', `${lang}.${keyPath} should be a string`).toBe(true);
        expect(current.trim().length, `${lang}.${keyPath} should not be empty`).toBeGreaterThan(0);
      }
    }
  });

  it('provides complete game chrome translations for party games and features in all 8 languages', () => {
    for (const lang of supportedLanguages) {
      const dict = getTranslations(lang);

      // Spinner Wheel
      expect(dict.spinner.spinButton.length).toBeGreaterThan(0);
      expect(dict.spinner.winnerHeading.length).toBeGreaterThan(0);

      // Never Have I Ever
      expect(dict.neverHaveIEver.iHave.length).toBeGreaterThan(0);
      expect(dict.neverHaveIEver.iNever.length).toBeGreaterThan(0);
      expect(dict.neverHaveIEver.nextStatement.length).toBeGreaterThan(0);

      // Would You Rather
      expect(dict.wouldYouRather.nextDilemma.length).toBeGreaterThan(0);
      expect(dict.wouldYouRather.orDivider.length).toBeGreaterThan(0);

      // Most Likely To
      expect(dict.mostLikelyTo.nextPrompt.length).toBeGreaterThan(0);

      // This or That
      expect(dict.thisOrThat.choosePrompt.length).toBeGreaterThan(0);
      expect(dict.thisOrThat.nextRound.length).toBeGreaterThan(0);

      // Custom Deck
      expect(dict.customDeck.title.length).toBeGreaterThan(0);
      expect(dict.customDeck.addCardButton.length).toBeGreaterThan(0);

      // Multiplayer
      expect(dict.multiplayer.title.length).toBeGreaterThan(0);
      expect(dict.multiplayer.lobbyWaiting.length).toBeGreaterThan(0);

      // Static / Legal / Editorial
      expect(dict.about.title.length).toBeGreaterThan(0);
      expect(dict.contact.title.length).toBeGreaterThan(0);
      expect(dict.privacy.title.length).toBeGreaterThan(0);
      expect(dict.terms.title.length).toBeGreaterThan(0);
      expect(dict.blog.title.length).toBeGreaterThan(0);
    }
  });

  it('draws native-language questions for all party games and truth or dare in all 8 languages', () => {
    const games: GameType[] = [
      'truth-or-dare',
      'never-have-i-ever',
      'would-you-rather',
      'most-likely-to',
      'this-or-that',
    ];

    for (const lang of supportedLanguages) {
      for (const game of games) {
        const drawn = questionEngine.drawNextCard({
          gameId: game,
          language: lang,
          drawnCardIds: [],
        });

        expect(drawn.card, `Expected non-null card for game=${game} in lang=${lang}`).toBeDefined();
        expect(drawn.card?.language_code).toBe(lang);

        const promptText = drawn.card?.prompt || drawn.card?.question_text || '';
        expect(promptText.length).toBeGreaterThan(0);

        // Language script verification
        if (lang === 'hi') {
          // Devanagari script range
          expect(/[\u0900-\u097F]/.test(promptText)).toBe(true);
        } else if (lang === 'ar') {
          // Arabic script range
          expect(/[\u0600-\u06FF]/.test(promptText)).toBe(true);
        }
      }
    }
  });

  it('maintains strict room question language selected by host while allowing participant localized UI', () => {
    // 1. Host creates room with language = 'hi' (Hindi)
    const { room: hostRoom, hostPlayerId } = roomEngine.createRoom({
      gameId: 'truth-or-dare',
      categoryId: 'classic-party',
      hostName: 'Arjun',
      language: 'hi',
    });
    expect(hostRoom).toBeDefined();
    expect(hostRoom.language).toBe('hi');
    expect(hostRoom.players[0].name).toBe('Arjun');

    // 2. Start game and flip card in the room
    roomEngine.dispatchAction({
      roomCode: hostRoom.roomCode,
      playerId: hostPlayerId,
      action: 'START_GAME',
    });

    const flipResult = roomEngine.dispatchAction({
      roomCode: hostRoom.roomCode,
      playerId: hostPlayerId,
      action: 'FLIP_CARD',
      payload: { type: 'truth' },
    });

    expect(flipResult.success).toBe(true);
    expect(flipResult.room?.currentCard).toBeDefined();
    expect(flipResult.room?.currentCard?.language_code).toBe('hi');
    // Card prompt must be in Hindi Devanagari
    const cardText = flipResult.room?.currentCard?.prompt || flipResult.room?.currentCard?.question_text || '';
    expect(/[\u0900-\u097F]/.test(cardText)).toBe(true);

    // 3. Spanish participant joins the room
    const joinResult = roomEngine.joinRoom({
      roomCode: hostRoom.roomCode,
      playerName: 'Maria',
    });
    expect(joinResult.success).toBe(true);
    const maria = joinResult.room?.players.find((p) => p.name === 'Maria');
    expect(maria).toBeDefined();

    // 4. Room language remains 'hi' so all players share the exact same question in room language
    const currentRoom = roomEngine.getRoom(hostRoom.roomCode);
    expect(currentRoom?.language).toBe('hi');
    expect(currentRoom?.currentCard?.language_code).toBe('hi');

    // 5. Meanwhile Maria's client interface uses Spanish dictionary
    const mariaDict = getTranslations('es');
    expect(mariaDict.multiplayer.shareRoom).toBe('Compartir Enlace');
    expect(mariaDict.multiplayer.startGame).toBe('Comenzar Juego');
  });

  it('generates correct reciprocal hreflang alternates for all 8 languages and x-default', () => {
    const pages = [
      '/',
      '/games/truth-or-dare',
      '/games/spin-the-bottle',
      '/games/never-have-i-ever',
      '/games/would-you-rather',
      '/games/most-likely-to',
      '/games/this-or-that',
      '/about',
      '/privacy',
      '/terms',
    ];

    for (const page of pages) {
      for (const lang of supportedLanguages) {
        const alternates = getLocalizedAlternates(page, lang);

        // Canonical points to localized URL (or root for default locale)
        const expectedCanonical =
          lang === 'en' && page === '/'
            ? 'https://truthordarequiz.com'
            : `https://truthordarequiz.com/${lang}${page === '/' ? '' : page}`;

        expect(alternates.canonical).toBe(expectedCanonical);

        // Reciprocal alternates for all 8 languages
        for (const targetLang of supportedLanguages) {
          expect(alternates.languages[targetLang]).toBe(
            `https://truthordarequiz.com/${targetLang}${page === '/' ? '' : page}`
          );
        }

        // x-default points to base route
        const expectedDefault =
          page === '/' ? 'https://truthordarequiz.com/' : `https://truthordarequiz.com${page}`;
        expect(alternates.languages['x-default']).toBe(expectedDefault);
      }
    }
  });
});
