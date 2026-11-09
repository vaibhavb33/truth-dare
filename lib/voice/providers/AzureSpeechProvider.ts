/**
 * Microsoft Azure AI Speech Neural Provider
 * Connects to Azure Cognitive Services REST API.
 */

import { SupportedLanguageCode } from '@/types';
import { IVoiceProvider, VoiceMetadata, VoiceSynthesisRequest, VoiceSynthesisResult } from './types';
import { NEURAL_VOICE_CATALOG } from './voiceCatalog';

export class AzureSpeechProvider implements IVoiceProvider {
  public readonly name = 'azure';
  private apiKey: string | null = null;
  private region: string = 'eastus';

  constructor(apiKey?: string, region?: string) {
    this.apiKey = apiKey || process.env.AZURE_SPEECH_KEY || null;
    this.region = region || process.env.AZURE_SPEECH_REGION || 'eastus';
  }

  public isAvailable(): boolean {
    return !!this.apiKey && this.apiKey.length > 5;
  }

  public async synthesize(request: VoiceSynthesisRequest): Promise<VoiceSynthesisResult> {
    if (!this.isAvailable()) {
      throw new Error('Azure Speech API key is not configured.');
    }

    const langCode = (request.language?.split('-')[0] || 'en') as SupportedLanguageCode;
    const config = NEURAL_VOICE_CATALOG[langCode] || NEURAL_VOICE_CATALOG.en;
    const voiceId = request.voiceId || config.azure.primaryVoice;

    const ratePercent = Math.round(((request.rate || 1.0) - 1.0) * 100);
    const rateStr = ratePercent >= 0 ? `+${ratePercent}%` : `${ratePercent}%`;

    const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${config.bcp47}">
      <voice name="${voiceId}">
        <prosody rate="${rateStr}">${request.text}</prosody>
      </voice>
    </speak>`;

    const endpoint = `https://${this.region}.tts.speech.microsoft.com/cognitiveservices/v1`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': this.apiKey!,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
        'User-Agent': 'AsteriaPartyGame',
      },
      body: ssml,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Azure Speech API error (${response.status}): ${errText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    return {
      audioBuffer,
      audioBase64: audioBuffer.toString('base64'),
      mimeType: 'audio/mpeg',
      providerName: 'azure',
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
        id: c.azure.primaryVoice,
        name: `${c.azure.primaryVoice} (${c.nativeName})`,
        languageCode: lang,
        gender: c.defaultGender,
        provider: 'azure',
        quality: 'neural',
      });
    }
    return list;
  }

  public getDefaultVoiceForLanguage(language: SupportedLanguageCode | string): VoiceMetadata | null {
    const langCode = (language.split('-')[0] || 'en') as SupportedLanguageCode;
    const c = NEURAL_VOICE_CATALOG[langCode] || NEURAL_VOICE_CATALOG.en;
    return {
      id: c.azure.primaryVoice,
      name: `${c.azure.primaryVoice} (${c.nativeName})`,
      languageCode: langCode,
      gender: c.defaultGender,
      provider: 'azure',
      quality: 'neural',
    };
  }
}

