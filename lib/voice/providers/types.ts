/**
 * Asteria Neural Voice Engine: Provider Interface Types
 * Reusable, provider-agnostic Text-to-Speech contract for Google Cloud TTS,
 * Microsoft Azure AI Speech, ElevenLabs, and Local/Mock Neural synthesis.
 */

import { SupportedLanguageCode } from '@/types';

export interface VoiceMetadata {
  id: string;
  name: string;
  languageCode: SupportedLanguageCode | string;
  gender: 'MALE' | 'FEMALE' | 'NEUTRAL';
  provider: 'google' | 'azure' | 'elevenlabs' | 'mock';
  quality: 'neural' | 'standard';
  description?: string;
}

export interface VoiceSynthesisRequest {
  text: string;
  language: SupportedLanguageCode | string;
  rate?: number; // 0.5 to 2.0 (default: 1.0)
  pitch?: number; // -4.0 to 4.0 (default: 0.0)
  voiceId?: string;
  isCustom?: boolean; // If true, question is private; must NOT be stored in public caches
}

export interface VoiceSynthesisResult {
  audioBuffer: Buffer;
  audioBase64: string;
  mimeType: 'audio/mpeg' | 'audio/wav' | 'audio/ogg';
  providerName: string;
  voiceId: string;
  cached: boolean;
  durationEstimateMs?: number;
}

export interface IVoiceProvider {
  readonly name: string;
  isAvailable(): boolean;
  synthesize(request: VoiceSynthesisRequest): Promise<VoiceSynthesisResult>;
  getAvailableVoices(language?: SupportedLanguageCode | string): VoiceMetadata[];
  getDefaultVoiceForLanguage(language: SupportedLanguageCode | string): VoiceMetadata | null;
}

