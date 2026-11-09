/**
 * Asteria Voice Audio Cache & Privacy Enforcement Engine
 * - LRU memory caching for standard questions to minimize API spend and latency.
 * - Strict Privacy Boundary: Custom user-created questions are NEVER cached or shared.
 * - Rate limiting to prevent API exhaustion.
 */

import crypto from 'crypto';
import { VoiceSynthesisResult } from '../providers/types';

interface CachedAudioEntry {
  audioBuffer: Buffer;
  audioBase64: string;
  mimeType: 'audio/mpeg' | 'audio/wav' | 'audio/ogg';
  providerName: string;
  voiceId: string;
  createdAt: number;
}

export class VoiceCache {
  private static instance: VoiceCache | null = null;
  private cache: Map<string, CachedAudioEntry> = new Map();
  private maxEntries: number = 300; // ~15MB memory ceiling
  private ipRateLimits: Map<string, { count: number; resetAt: number }> = new Map();

  private constructor() {}

  public static getInstance(): VoiceCache {
    if (!VoiceCache.instance) {
      VoiceCache.instance = new VoiceCache();
    }
    return VoiceCache.instance;
  }

  /**
   * Generates a deterministic hash key for standard questions.
   */
  public generateKey(params: {
    text: string;
    language: string;
    rate?: number;
    voiceId?: string;
    provider?: string;
  }): string {
    const normalized = `${params.text.trim().toLowerCase()}|${params.language.toLowerCase()}|${(params.rate || 1.0).toFixed(2)}|${params.voiceId || 'default'}|${params.provider || 'default'}`;
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }

  /**
   * Retrieve cached audio for standard public questions.
   * If isCustom is true, always returns null (enforcing strict privacy).
   */
  public get(key: string, isCustom?: boolean): VoiceSynthesisResult | null {
    if (isCustom) return null; // Never retrieve private questions from cache

    const entry = this.cache.get(key);
    if (!entry) return null;

    // Refresh LRU order
    this.cache.delete(key);
    this.cache.set(key, entry);

    return {
      audioBuffer: entry.audioBuffer,
      audioBase64: entry.audioBase64,
      mimeType: entry.mimeType,
      providerName: entry.providerName,
      voiceId: entry.voiceId,
      cached: true,
    };
  }

  /**
   * Store synthesized audio for standard public questions.
   * Strict Privacy Rule: User-created questions (isCustom: true) are REJECTED.
   */
  public set(key: string, result: VoiceSynthesisResult, isCustom?: boolean): void {
    if (isCustom) {
      // PRIVACY ENFORCEMENT: Never store user-created custom questions in public/shared cache
      return;
    }

    // Evict oldest if capacity reached
    if (this.cache.size >= this.maxEntries) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      audioBuffer: result.audioBuffer,
      audioBase64: result.audioBase64,
      mimeType: result.mimeType,
      providerName: result.providerName,
      voiceId: result.voiceId,
      createdAt: Date.now(),
    });
  }

  /**
   * Check IP rate limits (max 30 requests per minute)
   */
  public checkRateLimit(ip: string, maxRequests: number = 30, windowMs: number = 60000): {
    allowed: boolean;
    remaining: number;
    resetInSeconds: number;
  } {
    const now = Date.now();
    const clientLimit = this.ipRateLimits.get(ip);

    if (!clientLimit || now > clientLimit.resetAt) {
      this.ipRateLimits.set(ip, { count: 1, resetAt: now + windowMs });
      return { allowed: true, remaining: maxRequests - 1, resetInSeconds: Math.ceil(windowMs / 1000) };
    }

    if (clientLimit.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetInSeconds: Math.max(1, Math.ceil((clientLimit.resetAt - now) / 1000)),
      };
    }

    clientLimit.count += 1;
    return {
      allowed: true,
      remaining: maxRequests - clientLimit.count,
      resetInSeconds: Math.ceil((clientLimit.resetAt - now) / 1000),
    };
  }

  public clear(): void {
    this.cache.clear();
    this.ipRateLimits.clear();
  }

  public size(): number {
    return this.cache.size;
  }
}

export const voiceCache = VoiceCache.getInstance();

