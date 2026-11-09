import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { getVoiceProvider, setVoiceProviderForTesting } from '@/lib/voice/providers/factory';
import { MockNeuralProvider } from '@/lib/voice/providers/MockNeuralProvider';
import { GoogleCloudTTSProvider } from '@/lib/voice/providers/GoogleCloudTTSProvider';
import { AzureSpeechProvider } from '@/lib/voice/providers/AzureSpeechProvider';
import { ElevenLabsProvider } from '@/lib/voice/providers/ElevenLabsProvider';
import { NEURAL_VOICE_CATALOG, buildConversationalSSML } from '@/lib/voice/providers/voiceCatalog';
import { VoiceCache, voiceCache } from '@/lib/voice/cache/voiceCache';
import { POST, GET } from '@/app/api/voice/synthesize/route';
import { ALL_LOCALES } from '@/lib/i18n/config';
import { SupportedLanguageCode } from '@/types';

describe('Asteria Neural Voice Architecture & Providers', () => {
  beforeEach(() => {
    voiceCache.clear();
    setVoiceProviderForTesting(new MockNeuralProvider());
  });

  describe('1. Voice Catalog & Conversational SSML Optimization', () => {
    it('contains valid neural voice configurations for all 8 supported languages', () => {
      for (const locale of ALL_LOCALES) {
        const config = NEURAL_VOICE_CATALOG[locale];
        expect(config, `Missing neural config for ${locale}`).toBeDefined();
        expect(config.bcp47).toBeTruthy();
        expect(config.google.primaryVoice).toContain('Neural2');
        expect(config.azure.primaryVoice).toContain('Neural');
        expect(config.elevenlabs.voiceId).toBeTruthy();
        expect(config.conversationalPauseMs).toBeGreaterThanOrEqual(200);
      }
    });

    it('optimizes Hindi conversational SSML with Devanagari pauses', () => {
      const ssml = buildConversationalSSML('सच: क्या तुमने कभी किसी से झूठ बोला है?', 'hi', 1.0);
      expect(ssml).toContain('<speak>');
      expect(ssml).toContain('<prosody rate="100%">');
      expect(ssml).toContain('सच:<break time="300ms"/>');
      expect(ssml).toContain('?<break time="200ms"/>');
      expect(ssml).toContain('</speak>');
    });

    it('optimizes English conversational SSML with Truth/Dare pauses', () => {
      const ssml = buildConversationalSSML('Dare: Dance with no music for 30 seconds!', 'en', 1.25);
      expect(ssml).toContain('<prosody rate="125%">');
      expect(ssml).toContain('Dare:<break time="250ms"/>');
      expect(ssml).toContain('!<break time="200ms"/>');
    });

    it('escapes XML special characters in SSML to prevent synthesis injection', () => {
      const ssml = buildConversationalSSML('Truth: Have you ever used <script> & "quotes"?', 'en', 1.0);
      expect(ssml).toContain('&lt;script&gt;');
      expect(ssml).toContain('&amp;');
      expect(ssml).toContain('&quot;quotes&quot;');
      expect(ssml).not.toContain('<script>');
    });
  });

  describe('2. Provider Interface Contracts', () => {
    it('MockNeuralProvider generates valid RIFF/WAV 24kHz audio buffers', async () => {
      const provider = new MockNeuralProvider();
      expect(provider.isAvailable()).toBe(true);

      const result = await provider.synthesize({
        text: 'What is your deepest secret?',
        language: 'en',
        rate: 1.0,
      });

      expect(result.mimeType).toBe('audio/wav');
      expect(result.providerName).toBe('mock');
      expect(result.audioBuffer).toBeInstanceOf(Buffer);
      expect(result.audioBuffer.length).toBeGreaterThan(44);

      // Verify 44-byte standard RIFF WAVE header
      expect(result.audioBuffer.toString('ascii', 0, 4)).toBe('RIFF');
      expect(result.audioBuffer.toString('ascii', 8, 12)).toBe('WAVE');
      expect(result.audioBuffer.toString('ascii', 12, 16)).toBe('fmt ');
      expect(result.audioBuffer.readUInt32LE(24)).toBe(24000); // Sample rate: 24kHz
      expect(result.audioBuffer.toString('ascii', 36, 40)).toBe('data');
    });

    it('GoogleCloudTTSProvider correctly formats REST API payload', () => {
      const provider = new GoogleCloudTTSProvider('dummy_google_key');
      expect(provider.isAvailable()).toBe(true);

      const voices = provider.getAvailableVoices('hi');
      expect(voices.length).toBeGreaterThanOrEqual(2);
      expect(voices[0].id).toBe('hi-IN-Neural2-A');
      expect(voices[1].id).toBe('hi-IN-Neural2-D');
    });

    it('AzureSpeechProvider correctly configures Cognitive Services headers', () => {
      const provider = new AzureSpeechProvider('dummy_azure_key', 'eastus');
      expect(provider.isAvailable()).toBe(true);

      const voices = provider.getAvailableVoices('es');
      expect(voices.length).toBeGreaterThanOrEqual(1);
      expect(voices[0].id).toBe('es-ES-ElviraNeural');
    });

    it('ElevenLabsProvider exposes multilingual voice configurations', () => {
      const provider = new ElevenLabsProvider('dummy_eleven_key');
      expect(provider.isAvailable()).toBe(true);

      const voices = provider.getAvailableVoices('de');
      expect(voices.length).toBeGreaterThanOrEqual(1);
    });

    it('Factory resolves MockNeuralProvider when no cloud API keys are present', () => {
      setVoiceProviderForTesting(null);
      const originalGoogle = process.env.GOOGLE_TTS_API_KEY;
      delete process.env.GOOGLE_TTS_API_KEY;

      const provider = getVoiceProvider();
      expect(provider.name).toBe('mock');

      process.env.GOOGLE_TTS_API_KEY = originalGoogle;
    });
  });

  describe('3. Voice Audio Cache & Privacy Enforcement', () => {
    it('caches standard question synthesis results to avoid duplicate generation', () => {
      const key = voiceCache.generateKey({
        text: 'What is your biggest fear?',
        language: 'en',
        rate: 1.0,
      });

      const mockResult = {
        audioBuffer: Buffer.from('RIFF_MOCK_AUDIO'),
        audioBase64: 'UklGRg==',
        mimeType: 'audio/wav' as const,
        providerName: 'mock',
        voiceId: 'en-US-Neural2-F',
        cached: false,
      };

      voiceCache.set(key, mockResult, false); // Standard question (not custom)

      const cached = voiceCache.get(key, false);
      expect(cached).not.toBeNull();
      expect(cached?.cached).toBe(true);
      expect(cached?.voiceId).toBe('en-US-Neural2-F');
    });

    it('STRICT PRIVACY: NEVER caches private user-created custom deck questions', () => {
      const key = voiceCache.generateKey({
        text: 'Private custom secret question about John Doe',
        language: 'en',
        rate: 1.0,
      });

      const privateResult = {
        audioBuffer: Buffer.from('RIFF_PRIVATE_AUDIO'),
        audioBase64: 'UFJJVkFURS==',
        mimeType: 'audio/wav' as const,
        providerName: 'mock',
        voiceId: 'mock-neural-en',
        cached: false,
      };

      // Attempt to store private question (isCustom: true)
      voiceCache.set(key, privateResult, true);

      // Verify that cache rejected storage
      const cached = voiceCache.get(key, false);
      expect(cached).toBeNull();

      // Verify that querying with isCustom: true also returns null
      const privateQuery = voiceCache.get(key, true);
      expect(privateQuery).toBeNull();
    });

    it('enforces IP rate limiting (30 requests/minute)', () => {
      const testIp = '192.168.1.100';

      for (let i = 0; i < 30; i++) {
        const check = voiceCache.checkRateLimit(testIp, 30, 60000);
        expect(check.allowed).toBe(true);
      }

      // 31st request must be blocked
      const blocked = voiceCache.checkRateLimit(testIp, 30, 60000);
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);
      expect(blocked.resetInSeconds).toBeGreaterThan(0);
    });
  });

  describe('4. Server-Side Voice Synthesis Endpoint (app/api/voice/synthesize)', () => {
    it('synthesizes standard question audio and returns 200 with audio headers', async () => {
      const req = new NextRequest('http://localhost:3000/api/voice/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'सच: तुम्हारा सबसे बड़ा रहस्य क्या है?',
          language: 'hi',
          rate: 1.0,
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toBe('audio/wav');
      expect(res.headers.get('X-Asteria-Voice-Engine')).toBe('neural');
      expect(res.headers.get('X-Asteria-Voice-Provider')).toBe('mock');
      expect(res.headers.get('Cache-Control')).toContain('public');
    });

    it('returns private non-cacheable headers for custom deck questions', async () => {
      const req = new NextRequest('http://localhost:3000/api/voice/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Private custom truth question',
          language: 'en',
          isCustom: true,
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      expect(res.headers.get('Cache-Control')).toContain('no-store');
      expect(res.headers.get('Cache-Control')).toContain('private');
    });

    it('rejects empty prompt with 400 status', async () => {
      const req = new NextRequest('http://localhost:3000/api/voice/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: '   ',
          language: 'en',
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('empty');
      expect(json.fallback).toBe(true);
    });

    it('rejects excessively long prompt (>500 chars) to prevent token abuse', async () => {
      const longPrompt = 'a'.repeat(501);
      const req = new NextRequest('http://localhost:3000/api/voice/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: longPrompt,
          language: 'en',
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('500 characters');
      expect(json.fallback).toBe(true);
    });

    it('GET /api/voice/synthesize returns provider status and voice catalog', async () => {
      const req = new NextRequest('http://localhost:3000/api/voice/synthesize?language=hi');
      const res = await GET(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.provider).toBe('mock');
      expect(json.available).toBe(true);
      expect(json.voices).toBeInstanceOf(Array);
      expect(json.voices.length).toBeGreaterThan(0);
    });
  });
});

