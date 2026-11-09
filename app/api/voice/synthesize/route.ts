/**
 * Asteria Voice Synthesis API Endpoint
 * POST /api/voice/synthesize
 * Synthesizes natural neural speech with server-authoritative credentials,
 * LRU caching for standard questions, strict custom question privacy, and rate limiting.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getVoiceProvider } from '@/lib/voice/providers/factory';
import { voiceCache } from '@/lib/voice/cache/voiceCache';
import { SupportedLanguageCode } from '@/types';
import { NEURAL_VOICE_CATALOG } from '@/lib/voice/providers/voiceCatalog';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

    // 1. IP Rate Limiting (30 requests / minute)
    const rateLimit = voiceCache.checkRateLimit(ip, 30, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Voice synthesis rate limit exceeded. Please wait a moment.',
          fallback: true,
          retryAfter: rateLimit.resetInSeconds,
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimit.resetInSeconds.toString(),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body.text !== 'string') {
      return NextResponse.json({ error: 'Invalid payload. "text" is required.', fallback: true }, { status: 400 });
    }

    const rawText = body.text.trim();
    if (!rawText) {
      return NextResponse.json({ error: 'Text cannot be empty.', fallback: true }, { status: 400 });
    }

    // Guard: Prevent excessive token burn on malicious / runaway inputs
    if (rawText.length > 500) {
      return NextResponse.json(
        { error: 'Text exceeds maximum limit of 500 characters.', fallback: true },
        { status: 400 }
      );
    }

    const rawLang = (body.language || 'en').toString().toLowerCase().split('-')[0] as SupportedLanguageCode;
    const language = NEURAL_VOICE_CATALOG[rawLang] ? rawLang : 'en';
    const rate = typeof body.rate === 'number' ? Math.max(0.5, Math.min(2.0, body.rate)) : 1.0;
    const voiceId = typeof body.voiceId === 'string' ? body.voiceId : undefined;
    const isCustom = Boolean(body.isCustom);

    const provider = getVoiceProvider();

    // 2. Cache Lookup for Standard Public Questions
    const cacheKey = voiceCache.generateKey({
      text: rawText,
      language,
      rate,
      voiceId,
      provider: provider.name,
    });

    const cachedResult = voiceCache.get(cacheKey, isCustom);
    if (cachedResult) {
      return new Response(new Uint8Array(cachedResult.audioBuffer), {
        status: 200,
        headers: {
          'Content-Type': cachedResult.mimeType,
          'Content-Length': cachedResult.audioBuffer.length.toString(),
          'Cache-Control': 'public, max-age=604800, immutable',
          'X-Asteria-Voice-Engine': 'neural',
          'X-Asteria-Voice-Provider': cachedResult.providerName,
          'X-Asteria-Voice-Cached': 'true',
          'X-Asteria-Voice-Id': cachedResult.voiceId,
        },
      });
    }

    // 3. Provider Synthesis
    const result = await provider.synthesize({
      text: rawText,
      language,
      rate,
      voiceId,
      isCustom,
    });

    // 4. Cache Store (Custom deck questions are strictly bypassed by VoiceCache)
    voiceCache.set(cacheKey, result, isCustom);

    // 5. Construct Streaming Response
    const cacheControlHeader = isCustom
      ? 'private, no-cache, no-store, must-revalidate'
      : 'public, max-age=604800, immutable';

    return new Response(new Uint8Array(result.audioBuffer), {
      status: 200,
      headers: {
        'Content-Type': result.mimeType,
        'Content-Length': result.audioBuffer.length.toString(),
        'Cache-Control': cacheControlHeader,
        'X-Asteria-Voice-Engine': 'neural',
        'X-Asteria-Voice-Provider': result.providerName,
        'X-Asteria-Voice-Cached': 'false',
        'X-Asteria-Voice-Id': result.voiceId,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown synthesis failure';
    console.error('[/api/voice/synthesize] Error:', message);

    return NextResponse.json(
      {
        error: message,
        fallback: true,
      },
      { status: 503 }
    );
  }
}

/**
 * GET /api/voice/synthesize
 * Returns available neural voices and status.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const lang = url.searchParams.get('language') || undefined;
  const provider = getVoiceProvider();

  return NextResponse.json({
    provider: provider.name,
    available: provider.isAvailable(),
    voices: provider.getAvailableVoices(lang),
  });
}
