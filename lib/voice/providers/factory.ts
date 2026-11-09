/**
 * Asteria Voice Provider Factory
 * Resolves the active TTS provider according to environment variables and credentials.
 */

import { IVoiceProvider } from './types';
import { GoogleCloudTTSProvider } from './GoogleCloudTTSProvider';
import { AzureSpeechProvider } from './AzureSpeechProvider';
import { ElevenLabsProvider } from './ElevenLabsProvider';
import { MockNeuralProvider } from './MockNeuralProvider';

let activeProviderInstance: IVoiceProvider | null = null;

export function getVoiceProvider(): IVoiceProvider {
  if (activeProviderInstance) {
    return activeProviderInstance;
  }

  const requestedProvider = (process.env.TTS_PROVIDER || '').toLowerCase();

  // 1. Explicit provider override via TTS_PROVIDER
  if (requestedProvider === 'google') {
    const p = new GoogleCloudTTSProvider();
    if (p.isAvailable()) {
      activeProviderInstance = p;
      return p;
    }
  } else if (requestedProvider === 'azure') {
    const p = new AzureSpeechProvider();
    if (p.isAvailable()) {
      activeProviderInstance = p;
      return p;
    }
  } else if (requestedProvider === 'elevenlabs') {
    const p = new ElevenLabsProvider();
    if (p.isAvailable()) {
      activeProviderInstance = p;
      return p;
    }
  }

  // 2. Automatic credential detection (Priority: Google Cloud Neural2 -> Azure -> ElevenLabs)
  const google = new GoogleCloudTTSProvider();
  if (google.isAvailable()) {
    activeProviderInstance = google;
    return google;
  }

  const azure = new AzureSpeechProvider();
  if (azure.isAvailable()) {
    activeProviderInstance = azure;
    return azure;
  }

  const eleven = new ElevenLabsProvider();
  if (eleven.isAvailable()) {
    activeProviderInstance = eleven;
    return eleven;
  }

  // 3. Fallback to Mock Neural Provider (for local development & automated test suites)
  activeProviderInstance = new MockNeuralProvider();
  return activeProviderInstance;
}

/**
 * Reset factory instance (used by test suites)
 */
export function setVoiceProviderForTesting(provider: IVoiceProvider | null) {
  activeProviderInstance = provider;
}

