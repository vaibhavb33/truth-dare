/**
 * Asteria Web Speech API Text-to-Speech Engine
 * Standardized cross-browser speech service supporting 8 international languages,
 * pause/resume, rate adjustment, voice selection, and zero-leak lifecycle management.
 */

import { SupportedLanguageCode } from '@/types';

export interface VoiceState {
  isSupported: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  currentText: string | null;
  currentLanguage: string | null;
  rate: number;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  error: string | null;
}

export type VoiceStateListener = (state: VoiceState) => void;

// Canonical BCP-47 language targets for Asteria's 8 supported languages
export const LANGUAGE_LOCALE_MAP: Record<SupportedLanguageCode, { bcp47: string; fallbackPrefix: string; label: string }> = {
  en: { bcp47: 'en-US', fallbackPrefix: 'en', label: 'English (US)' },
  hi: { bcp47: 'hi-IN', fallbackPrefix: 'hi', label: 'हिन्दी (India)' },
  es: { bcp47: 'es-ES', fallbackPrefix: 'es', label: 'Español (Spain)' },
  pt: { bcp47: 'pt-BR', fallbackPrefix: 'pt', label: 'Português (Brasil)' },
  fr: { bcp47: 'fr-FR', fallbackPrefix: 'fr', label: 'Français (France)' },
  id: { bcp47: 'id-ID', fallbackPrefix: 'id', label: 'Bahasa Indonesia' },
  ar: { bcp47: 'ar-SA', fallbackPrefix: 'ar', label: 'العربية (Saudi Arabia)' },
  de: { bcp47: 'de-DE', fallbackPrefix: 'de', label: 'Deutsch (Germany)' },
};

export class SpeechService {
  private static instance: SpeechService | null = null;
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private activeUtterance: SpeechSynthesisUtterance | null = null; // GC reference shield
  private listeners: Set<VoiceStateListener> = new Set();
  private isVoicesLoaded: boolean = false;
  private currentRate: number = 1.0;
  private currentVoice: SpeechSynthesisVoice | null = null;
  private state: VoiceState;

  private constructor() {
    const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

    // Load persisted rate
    let savedRate = 1.0;
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      try {
        const storedRate = window.localStorage.getItem('asteria_voice_rate');
        if (storedRate) {
          const parsed = parseFloat(storedRate);
          if (!isNaN(parsed) && parsed >= 0.5 && parsed <= 2.0) {
            savedRate = parsed;
          }
        }
      } catch {}
    }
    this.currentRate = savedRate;

    this.state = {
      isSupported,
      isPlaying: false,
      isPaused: false,
      currentText: null,
      currentLanguage: null,
      rate: this.currentRate,
      availableVoices: [],
      selectedVoice: null,
      error: isSupported ? null : 'Web Speech API is not supported in this browser.',
    };

    if (isSupported) {
      this.synth = window.speechSynthesis;
      this.loadVoices();

      // Chrome, Edge, and Safari load voices asynchronously
      if (typeof window.speechSynthesis !== 'undefined' && 'onvoiceschanged' in window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.loadVoices();
        };
      }

      // Cleanup on page unload or visibility hide
      if (typeof window.addEventListener === 'function') {
        window.addEventListener('beforeunload', () => this.stop());
        window.addEventListener('pagehide', () => this.stop());
      }
    }
  }

  public static getInstance(): SpeechService {
    if (!SpeechService.instance) {
      SpeechService.instance = new SpeechService();
    }
    return SpeechService.instance;
  }

  private loadVoices() {
    if (!this.synth) return;
    try {
      const voices = this.synth.getVoices();
      if (voices && voices.length > 0) {
        this.voices = voices;
        this.isVoicesLoaded = true;
        this.notifyState();
      }
    } catch (e) {
      console.warn('Error loading speechSynthesis voices:', e);
    }
  }

  public getState(): VoiceState {
    return { ...this.state };
  }

  public subscribe(listener: VoiceStateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyState(partial?: Partial<VoiceState>) {
    if (partial) {
      this.state = { ...this.state, ...partial };
    } else {
      this.state = {
        ...this.state,
        isPlaying: this.synth ? this.synth.speaking && !this.synth.paused : false,
        isPaused: this.synth ? this.synth.paused : false,
        availableVoices: this.voices,
        selectedVoice: this.currentVoice,
        rate: this.currentRate,
      };
    }
    const current = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(current);
      } catch (err) {
        console.error('Error in VoiceStateListener:', err);
      }
    });
  }

  /**
   * Find matching voices for a supported language code.
   * Collects all voices strictly within the language family, sorting exact BCP-47 targets first.
   * Enforces Rule: Never return an unrelated voice silently.
   */
  public getVoicesForLanguage(langCode: SupportedLanguageCode | string): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    if (!this.isVoicesLoaded || this.voices.length === 0) {
      this.loadVoices();
    }

    const mapping = LANGUAGE_LOCALE_MAP[langCode as SupportedLanguageCode];
    const targetBcp47 = mapping ? mapping.bcp47.toLowerCase() : langCode.toLowerCase();
    const targetPrefix = mapping ? mapping.fallbackPrefix.toLowerCase() : langCode.split('-')[0].toLowerCase();

    // 1. Collect all voices strictly matching the language prefix (e.g. 'ar', 'hi', 'es')
    const familyVoices = this.voices.filter((v) => {
      const vLang = v.lang.toLowerCase().replace('_', '-');
      const vPrefix = vLang.split('-')[0];
      return vPrefix === targetPrefix;
    });

    // 2. Sort exact target dialect (e.g. 'ar-SA', 'es-ES') and default flags to the top
    return familyVoices.sort((a, b) => {
      const aLang = a.lang.toLowerCase().replace('_', '-');
      const bLang = b.lang.toLowerCase().replace('_', '-');
      const aExact = aLang === targetBcp47 ? 1 : 0;
      const bExact = bLang === targetBcp47 ? 1 : 0;
      if (bExact !== aExact) return bExact - aExact;

      const aDefault = a.default ? 1 : 0;
      const bDefault = b.default ? 1 : 0;
      return bDefault - aDefault;
    });
  }

  /**
   * Selects the closest available matching voice.
   * If no voice exists for the target language, returns null (NO silent unrelated fallback).
   */
  public getBestVoiceForLanguage(langCode: SupportedLanguageCode | string): SpeechSynthesisVoice | null {
    const matching = this.getVoicesForLanguage(langCode);
    if (matching.length === 0) return null;

    // Prefer native/default voice if flagged
    const defaultVoice = matching.find((v) => v.default);
    if (defaultVoice) return defaultVoice;

    // Prefer high quality / enhanced / natural online voices when present
    const naturalVoice = matching.find((v) => /natural|premium|enhanced|google|siri/i.test(v.name));
    if (naturalVoice) return naturalVoice;

    return matching[0];
  }

  /**
   * Set speaking speed (rate) between 0.5x and 2.0x
   */
  public setRate(rate: number) {
    const clamped = Math.max(0.5, Math.min(2.0, rate));
    this.currentRate = clamped;
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      try {
        window.localStorage.setItem('asteria_voice_rate', clamped.toString());
      } catch {}
    }
    this.notifyState({ rate: clamped });
  }

  public getRate(): number {
    return this.currentRate;
  }

  /**
   * Set preferred voice manually
   */
  public setVoice(voice: SpeechSynthesisVoice | null) {
    this.currentVoice = voice;
    this.notifyState({ selectedVoice: voice });
  }

  /**
   * Speak a question or statement.
   * Strictly respects:
   * 1. No automatic playback without user action.
   * 2. Stop previous speech before new speech.
   * 3. Select closest matching voice; never use unrelated voice silently.
   */
  public speak(params: {
    text: string;
    language: SupportedLanguageCode | string;
    rate?: number;
    voice?: SpeechSynthesisVoice;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: string) => void;
  }): { success: boolean; error?: string } {
    if (!this.synth) {
      return { success: false, error: 'Web Speech API is not supported on this browser.' };
    }

    const cleanText = params.text.trim();
    if (!cleanText) {
      return { success: false, error: 'Cannot speak an empty prompt.' };
    }

    // Stop any in-flight playback first
    this.stop();

    // Determine matching voice
    const voiceToUse = params.voice || this.currentVoice || this.getBestVoiceForLanguage(params.language);

    if (!voiceToUse) {
      const mapping = LANGUAGE_LOCALE_MAP[params.language as SupportedLanguageCode];
      const langLabel = mapping ? mapping.label : params.language;
      const errorMsg = `No native speech voice is available for ${langLabel} on this browser/device.`;
      this.notifyState({
        error: errorMsg,
        isPlaying: false,
        isPaused: false,
      });
      params.onError?.(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      const targetRate = params.rate ?? this.currentRate;

      utterance.voice = voiceToUse;
      utterance.lang = voiceToUse.lang;
      utterance.rate = targetRate;
      utterance.pitch = 1.0;

      // Keep active reference to shield from aggressive Chromium garbage collection
      this.activeUtterance = utterance;

      utterance.onstart = () => {
        this.notifyState({
          isPlaying: true,
          isPaused: false,
          currentText: cleanText,
          currentLanguage: params.language,
          error: null,
        });
        params.onStart?.();
      };

      utterance.onend = () => {
        this.activeUtterance = null;
        this.notifyState({
          isPlaying: false,
          isPaused: false,
          currentText: null,
          currentLanguage: null,
        });
        params.onEnd?.();
      };

      utterance.onerror = (event) => {
        // 'canceled' or 'interrupted' is expected when user clicks stop
        if (event.error === 'canceled' || event.error === 'interrupted') {
          this.activeUtterance = null;
          this.notifyState({
            isPlaying: false,
            isPaused: false,
            currentText: null,
            currentLanguage: null,
          });
          return;
        }

        this.activeUtterance = null;
        const errMsg = `Speech synthesis error: ${event.error}`;
        this.notifyState({
          isPlaying: false,
          isPaused: false,
          error: errMsg,
        });
        params.onError?.(errMsg);
      };

      utterance.onpause = () => {
        this.notifyState({
          isPlaying: false,
          isPaused: true,
        });
      };

      utterance.onresume = () => {
        this.notifyState({
          isPlaying: true,
          isPaused: false,
        });
      };

      this.synth.speak(utterance);
      return { success: true };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unknown speech synthesis error';
      this.notifyState({
        isPlaying: false,
        isPaused: false,
        error: errMsg,
      });
      params.onError?.(errMsg);
      return { success: false, error: errMsg };
    }
  }

  /**
   * Pause speech where supported
   */
  public pause(): boolean {
    if (!this.synth) return false;
    try {
      if (this.synth.speaking && !this.synth.paused) {
        this.synth.pause();
        this.notifyState({ isPaused: true, isPlaying: false });
        return true;
      }
    } catch (e) {
      console.warn('Speech pause error:', e);
    }
    return false;
  }

  /**
   * Resume speech where supported
   */
  public resume(): boolean {
    if (!this.synth) return false;
    try {
      if (this.synth.paused) {
        this.synth.resume();
        this.notifyState({ isPaused: false, isPlaying: true });
        return true;
      }
    } catch (e) {
      console.warn('Speech resume error:', e);
    }
    return false;
  }

  /**
   * Stop speech immediately and reset utterance
   */
  public stop() {
    if (!this.synth) return;
    try {
      this.synth.cancel();
      this.activeUtterance = null;
      this.notifyState({
        isPlaying: false,
        isPaused: false,
        currentText: null,
        currentLanguage: null,
      });
    } catch (e) {
      console.warn('Speech cancel error:', e);
    }
  }
}

// Global exported singleton
export const speechService = SpeechService.getInstance();
