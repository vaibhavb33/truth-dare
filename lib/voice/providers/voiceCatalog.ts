/**
 * Asteria Neural Voice Catalog & SSML Prosody Configurations
 * Maps all 8 supported internationalization languages to optimal neural voice identifiers
 * and conversational SSML templates.
 */

import { SupportedLanguageCode } from '@/types';
import { VoiceMetadata } from './types';

export interface LanguageVoiceConfig {
  bcp47: string;
  nativeName: string;
  defaultGender: 'FEMALE' | 'MALE';
  google: {
    primaryVoice: string;
    secondaryVoice: string;
    ssmlGender: 'FEMALE' | 'MALE';
  };
  azure: {
    primaryVoice: string;
    secondaryVoice: string;
  };
  elevenlabs: {
    voiceId: string;
    modelId: string;
  };
  conversationalPauseMs: number;
}

export const NEURAL_VOICE_CATALOG: Record<SupportedLanguageCode, LanguageVoiceConfig> = {
  en: {
    bcp47: 'en-US',
    nativeName: 'English',
    defaultGender: 'FEMALE',
    google: {
      primaryVoice: 'en-US-Neural2-F',
      secondaryVoice: 'en-US-Journey-F',
      ssmlGender: 'FEMALE',
    },
    azure: {
      primaryVoice: 'en-US-JennyNeural',
      secondaryVoice: 'en-US-GuyNeural',
    },
    elevenlabs: {
      voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel
      modelId: 'eleven_multilingual_v2',
    },
    conversationalPauseMs: 250,
  },
  hi: {
    bcp47: 'hi-IN',
    nativeName: 'हिन्दी',
    defaultGender: 'FEMALE',
    google: {
      primaryVoice: 'hi-IN-Neural2-A',
      secondaryVoice: 'hi-IN-Neural2-D',
      ssmlGender: 'FEMALE',
    },
    azure: {
      primaryVoice: 'hi-IN-SwaraNeural',
      secondaryVoice: 'hi-IN-MadhurNeural',
    },
    elevenlabs: {
      voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam / Multilingual
      modelId: 'eleven_multilingual_v2',
    },
    conversationalPauseMs: 300,
  },
  es: {
    bcp47: 'es-ES',
    nativeName: 'Español',
    defaultGender: 'FEMALE',
    google: {
      primaryVoice: 'es-ES-Neural2-A',
      secondaryVoice: 'es-ES-Neural2-F',
      ssmlGender: 'FEMALE',
    },
    azure: {
      primaryVoice: 'es-ES-ElviraNeural',
      secondaryVoice: 'es-ES-AlvaroNeural',
    },
    elevenlabs: {
      voiceId: 'EXAVITQu4vr4xnSDxMaL', // Bella
      modelId: 'eleven_multilingual_v2',
    },
    conversationalPauseMs: 250,
  },
  pt: {
    bcp47: 'pt-BR',
    nativeName: 'Português',
    defaultGender: 'FEMALE',
    google: {
      primaryVoice: 'pt-BR-Neural2-A',
      secondaryVoice: 'pt-BR-Neural2-B',
      ssmlGender: 'FEMALE',
    },
    azure: {
      primaryVoice: 'pt-BR-FranciscaNeural',
      secondaryVoice: 'pt-BR-AntonioNeural',
    },
    elevenlabs: {
      voiceId: 'MF3mGyEYCl7XYWbV9V6O', // Elli
      modelId: 'eleven_multilingual_v2',
    },
    conversationalPauseMs: 250,
  },
  fr: {
    bcp47: 'fr-FR',
    nativeName: 'Français',
    defaultGender: 'FEMALE',
    google: {
      primaryVoice: 'fr-FR-Neural2-A',
      secondaryVoice: 'fr-FR-Neural2-B',
      ssmlGender: 'FEMALE',
    },
    azure: {
      primaryVoice: 'fr-FR-DeniseNeural',
      secondaryVoice: 'fr-FR-HenriNeural',
    },
    elevenlabs: {
      voiceId: 'ErXwobaYiN019PkySvjV', // Antoni
      modelId: 'eleven_multilingual_v2',
    },
    conversationalPauseMs: 250,
  },
  id: {
    bcp47: 'id-ID',
    nativeName: 'Bahasa Indonesia',
    defaultGender: 'FEMALE',
    google: {
      primaryVoice: 'id-ID-Neural2-A',
      secondaryVoice: 'id-ID-Wavenet-A',
      ssmlGender: 'FEMALE',
    },
    azure: {
      primaryVoice: 'id-ID-GadisNeural',
      secondaryVoice: 'id-ID-ArdiNeural',
    },
    elevenlabs: {
      voiceId: 'yoZ06aMxZJJ28mfd3POQ', // Sam
      modelId: 'eleven_multilingual_v2',
    },
    conversationalPauseMs: 250,
  },
  ar: {
    bcp47: 'ar-XA',
    nativeName: 'العربية',
    defaultGender: 'FEMALE',
    google: {
      primaryVoice: 'ar-XA-Neural2-A',
      secondaryVoice: 'ar-XA-Neural2-B',
      ssmlGender: 'FEMALE',
    },
    azure: {
      primaryVoice: 'ar-SA-ZariyahNeural',
      secondaryVoice: 'ar-SA-HamedNeural',
    },
    elevenlabs: {
      voiceId: 'ThT5KcBeYPX3keUQqHPh', // Dorothy
      modelId: 'eleven_multilingual_v2',
    },
    conversationalPauseMs: 300,
  },
  de: {
    bcp47: 'de-DE',
    nativeName: 'Deutsch',
    defaultGender: 'FEMALE',
    google: {
      primaryVoice: 'de-DE-Neural2-F',
      secondaryVoice: 'de-DE-Neural2-B',
      ssmlGender: 'FEMALE',
    },
    azure: {
      primaryVoice: 'de-DE-KatjaNeural',
      secondaryVoice: 'de-DE-ConradNeural',
    },
    elevenlabs: {
      voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold
      modelId: 'eleven_multilingual_v2',
    },
    conversationalPauseMs: 250,
  },
};

/**
 * Build SSML payload for conversational game pacing and clear pronunciation.
 * Introduces micro-pauses after colons/dashes and clamps rate to conversational bounds.
 */
export function buildConversationalSSML(text: string, language: SupportedLanguageCode, rate: number = 1.0): string {
  const config = NEURAL_VOICE_CATALOG[language] || NEURAL_VOICE_CATALOG.en;
  const clampedRate = Math.max(0.75, Math.min(1.5, rate));
  const ratePercentage = Math.round(clampedRate * 100);

  // Clean XML special characters
  const cleanText = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  // Insert natural SSML micro-pauses after Truth: or Dare: prefixes or question marks
  const pacedText = cleanText
    .replace(/^(Truth|Dare|सच|साहस|Verdad|Reto|Verdade|Desafio|Vérité|Action|Kebenaran|Tantangan|حقيقة|جرأة|Wahrheit|Pflicht):/i, `$1:<break time="${config.conversationalPauseMs}ms"/>`)
    .replace(/(\?|!|।)/g, `$1<break time="200ms"/>`);

  return `<speak><prosody rate="${ratePercentage}%">${pacedText}</prosody></speak>`;
}

