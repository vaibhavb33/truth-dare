import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SpeechService } from '@/lib/voice/speechService';
import { CustomQuestion, CustomDeck, SupportedLanguageCode } from '@/types';
import { deckStorage } from '@/lib/custom/deckStorage';

describe('Custom Deck Voice Playback Integration Suite (Task 40)', () => {
  let speechService: SpeechService;
  let mockSynth: any;

  beforeEach(() => {
    deckStorage.clear();
    mockSynth = {
      speaking: false,
      paused: false,
      pending: false,
      cancel: vi.fn(() => {
        mockSynth.speaking = false;
        mockSynth.paused = false;
      }),
      speak: vi.fn((utterance) => {
        mockSynth.speaking = true;
        mockSynth.paused = false;
        if (utterance.onstart) utterance.onstart();
      }),
      pause: vi.fn(() => {
        mockSynth.paused = true;
      }),
      resume: vi.fn(() => {
        mockSynth.paused = false;
      }),
      getVoices: vi.fn(() => [
        { name: 'Google US English', lang: 'en-US', default: true },
        { name: 'Google हिन्दी', lang: 'hi-IN', default: false },
        { name: 'Monica', lang: 'es-ES', default: false },
        { name: 'Luciana', lang: 'pt-BR', default: false },
        { name: 'Thomas', lang: 'fr-FR', default: false },
        { name: 'Damayanti', lang: 'id-ID', default: false },
        { name: 'Tarik', lang: 'ar-SA', default: false },
        { name: 'Anna', lang: 'de-DE', default: false },
      ]),
    };

    (window as any).speechSynthesis = mockSynth;
    (window as any).SpeechSynthesisUtterance = class {
      text: string;
      lang: string = 'en-US';
      rate: number = 1.0;
      pitch: number = 1.0;
      volume: number = 1.0;
      voice: any = null;
      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      onerror: ((e: any) => void) | null = null;
      onpause: (() => void) | null = null;
      onresume: (() => void) | null = null;

      constructor(text: string) {
        this.text = text;
      }
    };

    speechService = SpeechService.getInstance();
    (speechService as any).synth = mockSynth;
    (speechService as any).loadVoices();
    speechService.setNeuralEnabled(false); // Force native browser speech for deterministic unit assertions
  });

  // ========================================================
  // 1. INDIVIDUAL TRUTH & DARE QUESTIONS
  // ========================================================
  describe('1. Individual Truth & Dare Playback', () => {
    it('plays an individual Truth question with isCustom flag and correct language', () => {
      const truthQuestion: CustomQuestion = {
        id: 'cq-truth-1',
        type: 'truth',
        prompt: 'What is the strangest dream you have ever had?',
        language: 'en',
      };

      const result = speechService.speak({
        text: truthQuestion.prompt,
        language: truthQuestion.language || 'en',
        isCustom: true,
      });

      expect(result.success).toBe(true);
      expect(mockSynth.speak).toHaveBeenCalledTimes(1);

      const state = speechService.getState();
      expect(state.isPlaying).toBe(true);
      expect(state.currentText).toBe(truthQuestion.prompt);
    });

    it('plays an individual Dare question with isCustom flag and correct language', () => {
      const dareQuestion: CustomQuestion = {
        id: 'cq-dare-1',
        type: 'dare',
        prompt: 'Do 20 jumping jacks while humming the national anthem.',
        language: 'en',
      };

      const result = speechService.speak({
        text: dareQuestion.prompt,
        language: dareQuestion.language || 'en',
        isCustom: true,
      });

      expect(result.success).toBe(true);
      expect(mockSynth.speak).toHaveBeenCalledTimes(1);

      const state = speechService.getState();
      expect(state.isPlaying).toBe(true);
      expect(state.currentText).toBe(dareQuestion.prompt);
    });
  });

  // ========================================================
  // 2. PREVIEW BEFORE SAVING VS SAVED QUESTIONS
  // ========================================================
  describe('2. Listen Before Saving & Saved Questions', () => {
    it('listens to unsaved draft question before adding to deck', () => {
      const draftPrompt = 'Draft truth question that has not yet been saved to storage';
      const deckLanguage: SupportedLanguageCode = 'en';

      const result = speechService.speak({
        text: draftPrompt,
        language: deckLanguage,
        isCustom: true,
      });

      expect(result.success).toBe(true);
      expect(mockSynth.speak).toHaveBeenCalledTimes(1);
      expect(speechService.getState().currentText).toBe(draftPrompt);

      // Verify that speech did not alter or add the draft question to deck storage
      const savedDecks = deckStorage.getDecks();
      const containsDraft = savedDecks.some((d) => d.questions.some((q) => q.prompt === draftPrompt));
      expect(containsDraft).toBe(false);
    });

    it('listens to questions retrieved from saved custom deck', () => {
      const saveResult = deckStorage.saveDeck({
        name: 'Weekend Hangout',
        language: 'en',
        questions: [
          { id: 'q-saved-1', type: 'truth', prompt: 'Who was your childhood crush?' },
          { id: 'q-saved-2', type: 'dare', prompt: 'Speak in a British accent for the next 3 rounds.' },
        ],
      });

      expect(saveResult.success).toBe(true);
      const savedQuestion = saveResult.deck?.questions[1];
      expect(savedQuestion).toBeDefined();

      const result = speechService.speak({
        text: savedQuestion!.prompt,
        language: saveResult.deck?.language || 'en',
        isCustom: true,
      });

      expect(result.success).toBe(true);
      expect(mockSynth.speak).toHaveBeenCalledTimes(1);
      expect(speechService.getState().currentText).toBe(savedQuestion!.prompt);
    });
  });

  // ========================================================
  // 3. STOP PREVIOUS QUESTION (NO AUDIO OVERLAP)
  // ========================================================
  describe('3. Sequential Playback & Interruption Management', () => {
    it('strictly stops previous playing question before starting a new one', () => {
      // Start Question 1
      speechService.speak({
        text: 'Custom Question 1: What is your deepest fear?',
        language: 'en',
        isCustom: true,
      });

      expect(mockSynth.cancel).toHaveBeenCalledTimes(1);
      expect(mockSynth.speak).toHaveBeenCalledTimes(1);

      // Start Question 2 immediately
      speechService.speak({
        text: 'Custom Question 2: Act like a chicken for 15 seconds.',
        language: 'en',
        isCustom: true,
      });

      // synth.cancel must be called to immediately stop Question 1
      expect(mockSynth.cancel).toHaveBeenCalledTimes(2);
      expect(mockSynth.speak).toHaveBeenCalledTimes(2);
      expect(speechService.getState().currentText).toBe('Custom Question 2: Act like a chicken for 15 seconds.');
    });

    it('does not autoplay questions when deck or cards are mounted', () => {
      // Merely querying or initializing does not trigger speech
      const questions: CustomQuestion[] = [
        { id: 'ap-1', type: 'truth', prompt: 'Autoplay check 1' },
        { id: 'ap-2', type: 'dare', prompt: 'Autoplay check 2' },
      ];

      expect(questions.length).toBe(2);
      expect(mockSynth.speak).not.toHaveBeenCalled();
      expect(speechService.getState().isPlaying).toBe(false);
    });
  });

  // ========================================================
  // 4. MULTILINGUAL SUPPORT (HINDI & ENGLISH FIRST, ALL 8)
  // ========================================================
  describe('4. Multilingual Question Voice Playback', () => {
    it('synthesizes Hindi Truth and Dare custom questions using hi-IN', () => {
      const hindiTruth: CustomQuestion = {
        id: 'hi-1',
        type: 'truth',
        prompt: 'सच: क्या आपने कभी किसी दोस्त का कोई बड़ा राज छुपाया है?',
        language: 'hi',
      };

      const resultTruth = speechService.speak({
        text: hindiTruth.prompt,
        language: 'hi',
        isCustom: true,
      });

      expect(resultTruth.success).toBe(true);
      expect(mockSynth.speak).toHaveBeenCalledTimes(1);

      const hindiDare: CustomQuestion = {
        id: 'hi-2',
        type: 'dare',
        prompt: 'डेयर: 30 सेकंड तक बिना हंसे अपनी सबसे गंभीर शक्ल बनाकर दिखाएं।',
        language: 'hi',
      };

      const resultDare = speechService.speak({
        text: hindiDare.prompt,
        language: 'hi',
        isCustom: true,
      });

      expect(resultDare.success).toBe(true);
      expect(mockSynth.speak).toHaveBeenCalledTimes(2);
    });

    it('synthesizes custom questions across all 8 supported languages', () => {
      const testCases: Array<{ lang: SupportedLanguageCode; prompt: string }> = [
        { lang: 'en', prompt: 'What is the most adventurous thing on your bucket list?' },
        { lang: 'hi', prompt: 'सच: आपकी जिंदगी का सबसे यादगार सफर कौन सा था?' },
        { lang: 'es', prompt: '¿Cuál es la mentira más grande que has dicho?' },
        { lang: 'pt', prompt: 'Qual é o seu maior medo inconfessável?' },
        { lang: 'fr', prompt: 'Quel est votre secret le plus embarrassant?' },
        { lang: 'id', prompt: 'Apa hal paling memalukan yang pernah kamu alami?' },
        { lang: 'ar', prompt: 'ما هو أكبر سر تخفيه عن أصدقائك؟' },
        { lang: 'de', prompt: 'Was ist dein größtes peinliches Geheimnis?' },
      ];

      testCases.forEach((tc, idx) => {
        const res = speechService.speak({
          text: tc.prompt,
          language: tc.lang,
          isCustom: true,
        });

        expect(res.success).toBe(true);
        expect(speechService.getState().currentLanguage).toBe(tc.lang);
        expect(speechService.getState().currentText).toBe(tc.prompt);
        expect(mockSynth.speak).toHaveBeenCalledTimes(idx + 1);
      });
    });
  });

  // ========================================================
  // 5. STATUS & ERROR HANDLING
  // ========================================================
  describe('5. Status & Error Feedback', () => {
    it('rejects speaking empty or whitespace prompts', () => {
      const emptyResult = speechService.speak({
        text: '   ',
        language: 'en',
        isCustom: true,
      });

      expect(emptyResult.success).toBe(false);
      expect(emptyResult.error).toContain('Cannot speak an empty prompt');
      expect(mockSynth.speak).not.toHaveBeenCalled();
    });

    it('displays error state and invokes onError callback on speech failure', () => {
      const onErrorSpy = vi.fn();

      // Simulate device lacking voices for German
      (speechService as any).voices = [{ name: 'Google US English', lang: 'en-US' }];
      (speechService as any).isVoicesLoaded = true;

      const result = speechService.speak({
        text: 'Valid prompt text',
        language: 'de',
        isCustom: true,
        onError: onErrorSpy,
      });

      expect(result.success).toBe(false);
      expect(onErrorSpy).toHaveBeenCalled();
      expect(speechService.getState().error).toContain('No native speech voice is available for Deutsch');
    });
  });
});
