import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  speechService,
  SpeechService,
  LANGUAGE_LOCALE_MAP,
} from '@/lib/voice/speechService';
import { dictionaries, getTranslations } from '@/lib/i18n/translations';
import { ALL_LOCALES } from '@/lib/i18n/config';
import { SupportedLanguageCode } from '@/types';

// Mock speech synthesis voice structure
function createMockVoice(name: string, lang: string, isDefault = false): SpeechSynthesisVoice {
  return {
    name,
    lang,
    default: isDefault,
    localService: true,
    voiceURI: `${name}-${lang}`,
  };
}

describe('SpeechService (Web Speech API Engine)', () => {
  let mockSynth: any;
  let mockVoices: SpeechSynthesisVoice[];

  beforeEach(() => {
    mockVoices = [
      createMockVoice('Google US English', 'en-US', true),
      createMockVoice('Samantha', 'en-US'),
      createMockVoice('Daniel (UK)', 'en-GB'),
      createMockVoice('Google हिन्दी', 'hi-IN', true),
      createMockVoice('Lekha (India)', 'hi-IN'),
      createMockVoice('Monica (Spain)', 'es-ES', true),
      createMockVoice('Paulina (Mexico)', 'es-MX'),
      createMockVoice('Luciana (Brazil)', 'pt-BR', true),
      createMockVoice('Joana (Portugal)', 'pt-PT'),
      createMockVoice('Thomas (France)', 'fr-FR', true),
      createMockVoice('Damayanti (Indonesia)', 'id-ID', true),
      createMockVoice('Tarik (Saudi Arabia)', 'ar-SA', true),
      createMockVoice('Maged (Egypt)', 'ar-EG'),
      createMockVoice('Anna (Germany)', 'de-DE', true),
    ];

    mockSynth = {
      speaking: false,
      paused: false,
      pending: false,
      getVoices: vi.fn(() => mockVoices),
      speak: vi.fn((utterance: any) => {
        mockSynth.speaking = true;
        mockSynth.paused = false;
        // Trigger onstart asynchronously
        setTimeout(() => utterance.onstart?.(), 0);
      }),
      cancel: vi.fn(() => {
        mockSynth.speaking = false;
        mockSynth.paused = false;
      }),
      pause: vi.fn(() => {
        if (mockSynth.speaking) {
          mockSynth.paused = true;
          mockSynth.speaking = false;
        }
      }),
      resume: vi.fn(() => {
        if (mockSynth.paused) {
          mockSynth.paused = false;
          mockSynth.speaking = true;
        }
      }),
      onvoiceschanged: null,
    };

    // Attach to global window
    (global as any).window = (global as any).window || {};
    (global as any).window.speechSynthesis = mockSynth;
    (global as any).window.SpeechSynthesisUtterance = class {
      text: string;
      lang: string = 'en-US';
      voice: any = null;
      rate: number = 1.0;
      pitch: number = 1.0;
      volume: number = 1.0;
      onstart: any = null;
      onend: any = null;
      onerror: any = null;
      onpause: any = null;
      onresume: any = null;
      constructor(text: string) {
        this.text = text;
      }
    };

    // Re-initialize internal synth reference in singleton
    (speechService as any).synth = mockSynth;
    (speechService as any).voices = mockVoices;
    (speechService as any).isVoicesLoaded = true;
  });

  afterEach(() => {
    speechService.stop();
    vi.clearAllMocks();
  });

  it('correctly maps all 8 languages to standardized BCP-47 targets', () => {
    expect(LANGUAGE_LOCALE_MAP.en.bcp47).toBe('en-US');
    expect(LANGUAGE_LOCALE_MAP.hi.bcp47).toBe('hi-IN');
    expect(LANGUAGE_LOCALE_MAP.es.bcp47).toBe('es-ES');
    expect(LANGUAGE_LOCALE_MAP.pt.bcp47).toBe('pt-BR');
    expect(LANGUAGE_LOCALE_MAP.fr.bcp47).toBe('fr-FR');
    expect(LANGUAGE_LOCALE_MAP.id.bcp47).toBe('id-ID');
    expect(LANGUAGE_LOCALE_MAP.ar.bcp47).toBe('ar-SA');
    expect(LANGUAGE_LOCALE_MAP.de.bcp47).toBe('de-DE');
  });

  it('accurately resolves matching voices for each language and prioritizes native matches', () => {
    const hindiVoices = speechService.getVoicesForLanguage('hi');
    expect(hindiVoices.length).toBe(2);
    expect(hindiVoices.every((v) => v.lang.startsWith('hi'))).toBe(true);

    const bestHindi = speechService.getBestVoiceForLanguage('hi');
    expect(bestHindi?.name).toBe('Google हिन्दी');

    const arabicVoices = speechService.getVoicesForLanguage('ar');
    expect(arabicVoices.length).toBe(2);
    expect(arabicVoices.every((v) => v.lang.startsWith('ar'))).toBe(true);

    const bestArabic = speechService.getBestVoiceForLanguage('ar');
    expect(bestArabic?.name).toBe('Tarik (Saudi Arabia)');
  });

  it('enforces STRICT rule: Never use an unrelated voice silently if matching voice is missing', () => {
    // Empty out Hindi voices from mock
    (speechService as any).voices = mockVoices.filter((v) => !v.lang.startsWith('hi'));

    const hindiVoices = speechService.getVoicesForLanguage('hi');
    expect(hindiVoices).toEqual([]);

    const bestVoice = speechService.getBestVoiceForLanguage('hi');
    expect(bestVoice).toBeNull();

    // Speaking Hindi when no Hindi voice exists must fail with clear error rather than using English voice
    const result = speechService.speak({
      text: 'आपकी सबसे बड़ी कमजोरी क्या है?',
      language: 'hi',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('No native speech voice is available');
    expect(mockSynth.speak).not.toHaveBeenCalled();
  });

  it('stops in-flight speech before starting a new speech utterance', () => {
    speechService.speak({
      text: 'First question being read',
      language: 'en',
    });

    expect(mockSynth.cancel).toHaveBeenCalledTimes(1);
    expect(mockSynth.speak).toHaveBeenCalledTimes(1);

    speechService.speak({
      text: 'Second question being read immediately after',
      language: 'en',
    });

    expect(mockSynth.cancel).toHaveBeenCalledTimes(2);
    expect(mockSynth.speak).toHaveBeenCalledTimes(2);
  });

  it('supports pause and resume operations where supported', () => {
    speechService.speak({
      text: 'A long challenge that can be paused',
      language: 'en',
    });

    mockSynth.speaking = true;
    mockSynth.paused = false;

    const paused = speechService.pause();
    expect(paused).toBe(true);
    expect(mockSynth.pause).toHaveBeenCalled();

    const resumed = speechService.resume();
    expect(resumed).toBe(true);
    expect(mockSynth.resume).toHaveBeenCalled();
  });

  it('allows rate adjustment and clamps within [0.5, 2.0] range', () => {
    speechService.setRate(1.25);
    expect(speechService.getRate()).toBe(1.25);

    // Over upper bound -> clamped to 2.0
    speechService.setRate(5.0);
    expect(speechService.getRate()).toBe(2.0);

    // Under lower bound -> clamped to 0.5
    speechService.setRate(0.1);
    expect(speechService.getRate()).toBe(0.5);
  });

  it('verifies 100% dictionary completeness for voice controls in all 8 languages', () => {
    for (const lang of ALL_LOCALES) {
      const dict = getTranslations(lang);
      expect(dict.voice).toBeDefined();

      expect(dict.voice.listenTruth.length, `${lang}.voice.listenTruth`).toBeGreaterThan(0);
      expect(dict.voice.listenDare.length, `${lang}.voice.listenDare`).toBeGreaterThan(0);
      expect(dict.voice.listenQuestion.length, `${lang}.voice.listenQuestion`).toBeGreaterThan(0);
      expect(dict.voice.play.length, `${lang}.voice.play`).toBeGreaterThan(0);
      expect(dict.voice.pause.length, `${lang}.voice.pause`).toBeGreaterThan(0);
      expect(dict.voice.resume.length, `${lang}.voice.resume`).toBeGreaterThan(0);
      expect(dict.voice.stop.length, `${lang}.voice.stop`).toBeGreaterThan(0);
      expect(dict.voice.speed.length, `${lang}.voice.speed`).toBeGreaterThan(0);
      expect(dict.voice.selectVoice.length, `${lang}.voice.selectVoice`).toBeGreaterThan(0);
      expect(dict.voice.defaultVoice.length, `${lang}.voice.defaultVoice`).toBeGreaterThan(0);
      expect(dict.voice.voiceUnavailable.length, `${lang}.voice.voiceUnavailable`).toBeGreaterThan(0);
      expect(dict.voice.voiceUnavailableDesc.length, `${lang}.voice.voiceUnavailableDesc`).toBeGreaterThan(0);
    }
  });
});
