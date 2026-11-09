/**
 * Google Cloud Text-to-Speech Neural2 Provider
 * Connects to Google Cloud REST API for natural WaveNet/Neural2 voice synthesis.
 */

import { SupportedLanguageCode } from '@/types';
import { IVoiceProvider, VoiceMetadata, VoiceSynthesisRequest, VoiceSynthesisResult } from './types';
import { NEURAL_VOICE_CATALOG, buildConversationalSSML } from './voiceCatalog';

export class GoogleCloudTTSProvider implements IVoiceProvider {
  public readonly name = 'google';
  private apiKey: string | null = null;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GOOGLE_TTS_API_KEY || null;
  }

  public isAvailable(): boolean {
    return !!this.apiKey && this.apiKey.length > 5;
  }

  public async synthesize(request: VoiceSynthesisRequest): Promise<VoiceSynthesisResult> {
    if (!this.isAvailable()) {
      throw new Error('Google Cloud TTS API key is not configured.');
    }

    const langCode = (request.language?.split('-')[0] || 'en') as SupportedLanguageCode;
    const config = NEURAL_VOICE_CATALOG[langCode] || NEURAL_VOICE_CATALOG.en;
    const voiceId = request.voiceId || config.google.primaryVoice;
    const ssml = buildConversationalSSML(request.text, langCode, request.rate || 1.0);

    const endpoint = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.apiKey}`;
    const payload = {
      input: { ssml },
      voice: {
        languageCode: config.bcp47,
        name: voiceId,
        ssmlGender: config.google.ssmlGender,
      },
      audioConfig: {
        audioEncoding: 'MP3',
        pitch: request.pitch ?? 0.0,
      },
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Google Cloud TTS API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    if (!data.audioContent) {
      throw new Error('Google Cloud TTS returned no audio content.');
    }

    const audioBuffer = Buffer.from(data.audioContent, 'base64');

    return {
      audioBuffer,
      audioBase64: data.audioContent,
      mimeType: 'audio/mpeg',
      providerName: 'google',
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
      list.push(
        {
          id: c.google.primaryVoice,
          name: `${c.google.primaryVoice} (${c.nativeName})`,
          languageCode: lang,
          gender: c.defaultGender,
          provider: 'google',
          quality: 'neural',
          description: 'Google Neural2 natural voice model',
        },
        {
          id: c.google.secondaryVoice,
          name: `${c.google.secondaryVoice} (${c.nativeName})`,
          languageCode: lang,
          gender: c.defaultGender === 'FEMALE' ? 'MALE' : 'FEMALE',
          provider: 'google',
          quality: 'neural',
          description: 'Google conversational voice model',
        }
      );
    }
    return list;
  }

  public getDefaultVoiceForLanguage(language: SupportedLanguageCode | string): VoiceMetadata | null {
    const langCode = (language.split('-')[0] || 'en') as SupportedLanguageCode;
    const c = NEURAL_VOICE_CATALOG[langCode] || NEURAL_VOICE_CATALOG.en;
    return {
      id: c.google.primaryVoice,
      name: `${c.google.primaryVoice} (${c.nativeName})`,
      languageCode: langCode,
      gender: c.defaultGender,
      provider: 'google',
      quality: 'neural',
    };
  }
}

