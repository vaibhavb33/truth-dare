/**
 * Asteria Mock / Offline Neural Voice Provider
 * Generates valid, standards-compliant RIFF/WAV audio buffers for unit testing,
 * CI/CD pipelines, and local development environments without requiring paid external API credentials.
 */

import { SupportedLanguageCode } from '@/types';
import { IVoiceProvider, VoiceMetadata, VoiceSynthesisRequest, VoiceSynthesisResult } from './types';
import { NEURAL_VOICE_CATALOG } from './voiceCatalog';

export class MockNeuralProvider implements IVoiceProvider {
  public readonly name = 'mock';

  public isAvailable(): boolean {
    return true; // Always available for local development & fallback testing
  }

  /**
   * Generates a valid 24kHz 16-bit Mono PCM RIFF WAV audio buffer
   * containing a natural melodic party chime tone matching the question's duration.
   */
  public async synthesize(request: VoiceSynthesisRequest): Promise<VoiceSynthesisResult> {
    const langCode = (request.language?.split('-')[0] || 'en') as SupportedLanguageCode;
    const config = NEURAL_VOICE_CATALOG[langCode] || NEURAL_VOICE_CATALOG.en;
    const voiceId = request.voiceId || `mock-neural-${langCode}`;

    // Approximate duration: ~60ms per character, clamped between 1.0s and 4.0s
    const textLength = request.text.length;
    const durationSeconds = Math.max(1.0, Math.min(4.0, (textLength * 0.05) / (request.rate || 1.0)));

    const sampleRate = 24000;
    const numSamples = Math.floor(sampleRate * durationSeconds);
    const byteRate = sampleRate * 2; // 16-bit mono = 2 bytes per sample
    const blockAlign = 2;
    const dataSize = numSamples * 2;
    const headerSize = 44;
    const totalSize = headerSize + dataSize;

    const buffer = Buffer.alloc(totalSize);

    // 1. RIFF Chunk Descriptor
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(totalSize - 8, 4);
    buffer.write('WAVE', 8);

    // 2. "fmt " Sub-chunk
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
    buffer.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
    buffer.writeUInt16LE(1, 22); // NumChannels (1 = Mono)
    buffer.writeUInt32LE(sampleRate, 24); // SampleRate
    buffer.writeUInt32LE(byteRate, 28); // ByteRate
    buffer.writeUInt16LE(blockAlign, 32); // BlockAlign
    buffer.writeUInt16LE(16, 34); // BitsPerSample

    // 3. "data" Sub-chunk
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);

    // 4. Generate melodic sine waves (gentle pleasant tone: 440Hz -> 554Hz -> 659Hz)
    const baseFreq = langCode === 'hi' ? 392 : 440; // G4 for Hindi, A4 for others
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      // Exponential decay envelope for warmth
      const envelope = Math.exp(-1.5 * (t / durationSeconds));
      // Subtle two-tone harmonic
      const sampleValue =
        (Math.sin(2 * Math.PI * baseFreq * t) * 0.6 + Math.sin(2 * Math.PI * baseFreq * 1.5 * t) * 0.4) *
        envelope;
      const int16Sample = Math.max(-32767, Math.min(32767, Math.floor(sampleValue * 16000)));
      buffer.writeInt16LE(int16Sample, headerSize + i * 2);
    }

    return {
      audioBuffer: buffer,
      audioBase64: buffer.toString('base64'),
      mimeType: 'audio/wav',
      providerName: 'mock',
      voiceId,
      cached: false,
      durationEstimateMs: Math.round(durationSeconds * 1000),
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
        id: `mock-neural-${lang}`,
        name: `Neural AI (${c.nativeName})`,
        languageCode: lang,
        gender: c.defaultGender,
        provider: 'mock',
        quality: 'neural',
        description: 'Simulated Neural HD Voice for testing',
      });
    }
    return list;
  }

  public getDefaultVoiceForLanguage(language: SupportedLanguageCode | string): VoiceMetadata | null {
    const langCode = (language.split('-')[0] || 'en') as SupportedLanguageCode;
    const c = NEURAL_VOICE_CATALOG[langCode] || NEURAL_VOICE_CATALOG.en;
    return {
      id: `mock-neural-${langCode}`,
      name: `Neural AI (${c.nativeName})`,
      languageCode: langCode,
      gender: c.defaultGender,
      provider: 'mock',
      quality: 'neural',
    };
  }
}

