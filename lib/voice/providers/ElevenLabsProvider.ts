/**
 * ElevenLabs Multilingual Neural Provider
 * Connects to ElevenLabs REST API.
 */

import { SupportedLanguageCode } from '@/types';
import { IVoiceProvider, VoiceMetadata, VoiceSynthesisRequest, VoiceSynthesisResult } from './types';
import { NEURAL_VOICE_CATALOG } from './voiceCatalog';

export class ElevenLabsProvider implements IVoiceProvider {
  public readonly name = 'elevenlabs';
  private apiKey: string | null = null;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ELEVENLABS_API_KEY || null;
  }

  public isAvailable(): boolean {
    return !!this.apiKey && this.apiKey.length > 5;
  }

  public async synthesize(request: VoiceSynthesisRequest): Promise<VoiceSynthesisResult> {
    if (!this.isAvailable()) {
      throw new Error('ElevenLabs API key is not configured.');
    }

    const langCode = (request.language?.split('-')[0] || 'en') as SupportedLanguageCode;
    const config = NEURAL_VOICE_CATALOG[langCode] || NEURAL_VOICE_CATALOG.en;
    const voiceId = request.voiceId || config.elevenlabs.voiceId;

    const endpoint = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    const payload = {
      text: request.text,
      model_id: config.elevenlabs.modelId,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'xi-api-key': this.apiKey!,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`ElevenLabs API error (${response.status}): ${errText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    return {
      audioBuffer,
      audioBase64: audioBuffer.toString('base64'),
      mimeType: 'audio/mpeg',
      providerName: 'elevenlabs',
      voiceId,
      cached: false,
    };
  }

  public getAvailableVoices(language?: SupportedLanguageCode | string): VoiceMetadata[] {
    const list: VoiceMetadata[] = [];
    const targets = language
      ? [language.split('-')[0] as SupportedLanguageCode]
      : (Object.keys(NEURAL_VOICE_CATALOG) as SupportedLanguageCode[]);

    for (const lang of targets) {
      const c = NEURAL_VOICE_CATALOG[lang];
      if (!c) continue;
      list.push({
        id: c.elevenlabs.voiceId,
        name: `ElevenLabs ${c.nativeName}`,
        languageCode: lang,
        gender: c.defaultGender,
        provider: 'elevenlabs',
        quality: 'neural',
      });
    }
    return list;
  }

  public getDefaultVoiceForLanguage(language: SupportedLanguageCode | string): VoiceMetadata | null {
    const langCode = (language.split('-')[0] || 'en') as SupportedLanguageCode;
    const c = NEURAL_VOICE_CATALOG[langCode] || NEURAL_VOICE_CATALOG.en;
    return {
      id: c.elevenlabs.voiceId,
      name: `ElevenLabs ${c.nativeName}`,
      languageCode: langCode,
      gender: c.defaultGender,
      provider: 'elevenlabs',
      quality: 'neural',
    };
  }
}

