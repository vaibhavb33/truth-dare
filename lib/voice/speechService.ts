/**
 * Asteria Unified Hybrid Speech Engine
 * Next-generation audio system combining:
 * 1. Primary: Server-authoritative Neural TTS (Google Cloud Neural2 / Azure / ElevenLabs)
 * 2. Fallback: High-grade client-side Web Speech API (window.speechSynthesis)
 *
 * Provides natural conversational speech for Truth and Dare, Custom Decks, and Multiplayer.
 * Enforces strict lifecycle rules: single playback, no unsolicited audio, pause/resume, and zero memory leaks.
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
  // Neural AI voice metadata
  engine: 'neural' | 'browser';
  isNeuralAvailable: boolean;
  providerName: string;
}

export type VoiceStateListener = (state: VoiceState) => void;

export interface SpeakParams {
  text: string;
  language: SupportedLanguageCode | string;
  rate?: number;
  voice?: SpeechSynthesisVoice;
  voiceId?: string;
  isCustom?: boolean; // Flag private user deck questions to bypass public cache
  forceBrowser?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

// Canonical BCP-47 language targets for Asteria's 8 supported languages
export const LANGUAGE_LOCALE_MAP: Record<
  SupportedLanguageCode,
  { bcp47: string; fallbackPrefix: string; label: string }
> = {
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
  public isNeuralEnabled: boolean =
    typeof window !== 'undefined' &&
    typeof process !== 'undefined' &&
    !process.env.VITEST;
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private activeUtterance: SpeechSynthesisUtterance | null = null; // GC reference shield
  private audioElement: HTMLAudioElement | null = null; // HTML5 Audio for neural playback
  private activeAudioUrl: string | null = null; // Object URL to revoke
  private activeAbortController: AbortController | null = null;
  private listeners: Set<VoiceStateListener> = new Set();
  private isVoicesLoaded: boolean = false;
  private currentRate: number = 1.0;
  private currentVoice: SpeechSynthesisVoice | null = null;
  private state: VoiceState;

  private constructor() {
    const isBrowserSynthSupported =
      typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

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
      isSupported: isBrowserSynthSupported || typeof window !== 'undefined',
      isPlaying: false,
      isPaused: false,
      currentText: null,
      currentLanguage: null,
      rate: this.currentRate,
      availableVoices: [],
      selectedVoice: null,
      error: null,
      engine: 'neural',
      isNeuralAvailable: true,
      providerName: 'Neural AI',
    };

    if (typeof window !== 'undefined') {
      if (isBrowserSynthSupported) {
        this.synth = window.speechSynthesis;
        this.loadVoices();

        if ('onvoiceschanged' in window.speechSynthesis) {
          window.speechSynthesis.onvoiceschanged = () => {
            this.loadVoices();
          };
        }
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
      const isAudioPlaying = this.audioElement
        ? !this.audioElement.paused && !this.audioElement.ended
        : false;
      const isSynthPlaying = this.synth ? this.synth.speaking && !this.synth.paused : false;

      this.state = {
        ...this.state,
        isPlaying: isAudioPlaying || isSynthPlaying,
        isPaused: this.audioElement ? this.audioElement.paused && this.audioElement.currentTime > 0 : this.synth ? this.synth.paused : false,
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
   * Find matching browser voices for fallback mode.
   */
  public getVoicesForLanguage(langCode: SupportedLanguageCode | string): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    if (!this.isVoicesLoaded || this.voices.length === 0) {
      this.loadVoices();
    }

    const mapping = LANGUAGE_LOCALE_MAP[langCode as SupportedLanguageCode];
    const targetBcp47 = mapping ? mapping.bcp47.toLowerCase() : langCode.toLowerCase();
    const targetPrefix = mapping ? mapping.fallbackPrefix.toLowerCase() : langCode.split('-')[0].toLowerCase();

    const familyVoices = this.voices.filter((v) => {
      const vLang = v.lang.toLowerCase().replace('_', '-');
      const vPrefix = vLang.split('-')[0];
      return vPrefix === targetPrefix;
    });

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

  public getBestVoiceForLanguage(langCode: SupportedLanguageCode | string): SpeechSynthesisVoice | null {
    const matching = this.getVoicesForLanguage(langCode);
    if (matching.length === 0) return null;

    const defaultVoice = matching.find((v) => v.default);
    if (defaultVoice) return defaultVoice;

    const naturalVoice = matching.find((v) => /natural|premium|enhanced|google|siri/i.test(v.name));
    if (naturalVoice) return naturalVoice;

    return matching[0];
  }

  public setRate(rate: number) {
    const clamped = Math.max(0.5, Math.min(2.0, rate));
    this.currentRate = clamped;

    if (this.audioElement) {
      this.audioElement.playbackRate = clamped;
    }

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

  public setVoice(voice: SpeechSynthesisVoice | null) {
    this.currentVoice = voice;
    this.notifyState({ selectedVoice: voice });
  }

  public setNeuralEnabled(enabled: boolean) {
    this.isNeuralEnabled = enabled;
    this.notifyState({ isNeuralAvailable: enabled, engine: enabled ? 'neural' : 'browser' });
  }

  /**
   * Primary Entry Point: Speak Question
   * 1. Attempts Server Neural TTS (/api/voice/synthesize)
   * 2. Automatically falls back to Web Speech API if neural fails or forceBrowser is set
   */
  public speak(params: SpeakParams): { success: boolean; error?: string } {
    const cleanText = params.text.trim();
    if (!cleanText) {
      return { success: false, error: 'Cannot speak an empty prompt.' };
    }

    // Stop any in-flight playback first (Rule: never overlap audio)
    this.stop();

    const targetRate = params.rate ?? this.currentRate;

    // If browser fallback is explicitly requested or neural disabled (e.g. test runner)
    if (params.forceBrowser || !this.isNeuralEnabled) {
      return this.speakWithBrowserFallback({ ...params, text: cleanText, rate: targetRate });
    }

    // Initiate Neural Speech Synthesis
    this.speakWithNeuralTTS({
      ...params,
      text: cleanText,
      rate: targetRate,
    });

    return { success: true };
  }

  /**
   * Neural TTS via Server-Authoritative API
   */
  private async speakWithNeuralTTS(params: SpeakParams) {
    this.activeAbortController = new AbortController();

    try {
      this.notifyState({
        isPlaying: true,
        isPaused: false,
        currentText: params.text,
        currentLanguage: params.language,
        engine: 'neural',
        error: null,
      });

      params.onStart?.();

      const response = await fetch('/api/voice/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: params.text,
          language: params.language,
          rate: params.rate ?? this.currentRate,
          voiceId: params.voiceId,
          isCustom: params.isCustom,
        }),
        signal: this.activeAbortController.signal,
      });

      if (!response.ok) {
        throw new Error(`Neural synthesis server returned ${response.status}`);
      }

      const providerHeader = response.headers.get('X-Asteria-Voice-Provider') || 'neural';
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      this.activeAudioUrl = audioUrl;

      if (!this.audioElement) {
        this.audioElement = new Audio();
      }

      const audio = this.audioElement;
      audio.src = audioUrl;
      audio.playbackRate = params.rate ?? this.currentRate;

      audio.onplay = () => {
        this.notifyState({
          isPlaying: true,
          isPaused: false,
          currentText: params.text,
          currentLanguage: params.language,
          engine: 'neural',
          providerName: providerHeader,
          error: null,
        });
      };

      audio.onpause = () => {
        if (!audio.ended) {
          this.notifyState({ isPlaying: false, isPaused: true });
        }
      };

      audio.onended = () => {
        this.cleanupAudio();
        this.notifyState({
          isPlaying: false,
          isPaused: false,
          currentText: null,
          currentLanguage: null,
        });
        params.onEnd?.();
      };

      audio.onerror = (e) => {
        console.warn('Neural audio playback error, falling back to browser speech:', e);
        this.cleanupAudio();
        this.speakWithBrowserFallback(params);
      };

      await audio.play();
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        // User stopped audio deliberately
        return;
      }
      console.warn('Neural TTS failed, executing graceful browser fallback:', err);
      this.cleanupAudio();
      this.speakWithBrowserFallback(params);
    }
  }

  /**
   * Browser Web Speech API Fallback
   */
  private speakWithBrowserFallback(params: SpeakParams): { success: boolean; error?: string } {
    if (!this.synth) {
      const errMsg = 'Speech synthesis is not supported on this browser or device.';
      this.notifyState({
        isPlaying: false,
        isPaused: false,
        error: errMsg,
        engine: 'browser',
      });
      params.onError?.(errMsg);
      return { success: false, error: errMsg };
    }

    const voiceToUse = params.voice || this.currentVoice || this.getBestVoiceForLanguage(params.language);

    if (!voiceToUse) {
      const mapping = LANGUAGE_LOCALE_MAP[params.language as SupportedLanguageCode];
      const langLabel = mapping ? mapping.label : params.language;
      const errorMsg = `No native speech voice is available for ${langLabel} on this device.`;
      this.notifyState({
        error: errorMsg,
        isPlaying: false,
        isPaused: false,
        engine: 'browser',
      });
      params.onError?.(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      const utterance = new SpeechSynthesisUtterance(params.text);
      const targetRate = params.rate ?? this.currentRate;

      utterance.voice = voiceToUse;
      utterance.lang = voiceToUse.lang;
      utterance.rate = targetRate;
      utterance.pitch = 1.0;

      this.activeUtterance = utterance;

      utterance.onstart = () => {
        this.notifyState({
          isPlaying: true,
          isPaused: false,
          currentText: params.text,
          currentLanguage: params.language,
          engine: 'browser',
          providerName: 'Browser HD',
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
        this.notifyState({ isPlaying: false, isPaused: true });
      };

      utterance.onresume = () => {
        this.notifyState({ isPlaying: true, isPaused: false });
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
   * Pause speech where supported (handles both Neural HTML5 and Browser Synth)
   */
  public pause(): boolean {
    if (this.audioElement && !this.audioElement.paused) {
      this.audioElement.pause();
      this.notifyState({ isPaused: true, isPlaying: false });
      return true;
    }

    if (this.synth && this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
      this.notifyState({ isPaused: true, isPlaying: false });
      return true;
    }

    return false;
  }

  /**
   * Resume speech where supported (handles both Neural HTML5 and Browser Synth)
   */
  public resume(): boolean {
    if (this.audioElement && this.audioElement.paused && this.audioElement.currentTime > 0) {
      this.audioElement.play().catch(console.warn);
      this.notifyState({ isPaused: false, isPlaying: true });
      return true;
    }

    if (this.synth && this.synth.paused) {
      this.synth.resume();
      this.notifyState({ isPaused: false, isPlaying: true });
      return true;
    }

    return false;
  }

  /**
   * Stop speech immediately and reset all audio handles
   */
  public stop() {
    // 1. Abort any in-flight neural fetch
    if (this.activeAbortController) {
      this.activeAbortController.abort();
      this.activeAbortController = null;
    }

    // 2. Stop HTML5 audio
    this.cleanupAudio();

    // 3. Stop browser speech synthesis
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {
        console.warn('Speech cancel error:', e);
      }
    }

    this.activeUtterance = null;
    this.notifyState({
      isPlaying: false,
      isPaused: false,
      currentText: null,
      currentLanguage: null,
    });
  }

  private cleanupAudio() {
    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
      } catch {}
    }
    if (this.activeAudioUrl) {
      try {
        URL.revokeObjectURL(this.activeAudioUrl);
      } catch {}
      this.activeAudioUrl = null;
    }
  }
}

// Global exported singleton
export const speechService = SpeechService.getInstance();
