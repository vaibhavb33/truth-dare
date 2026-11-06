/**
 * In-memory sliding window rate limiter
 * Protects critical API endpoints from brute-force and request flooding.
 */

interface RateLimitRecord {
  timestamps: number[];
}

class RateLimiter {
  private records: Map<string, RateLimitRecord> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Run garbage collection every 5 minutes
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
      if (this.cleanupInterval.unref) {
        this.cleanupInterval.unref();
      }
    }
  }

  /**
   * Check if a request from an identifier is allowed under the rate limit
   * @param key IP address or user identifier
   * @param limit Maximum allowed requests within window
   * @param windowMs Time window in milliseconds
   */
  public check(key: string, limit: number = 60, windowMs: number = 60 * 1000): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  } {
    const now = Date.now();
    const windowStart = now - windowMs;

    let record = this.records.get(key);
    if (!record) {
      record = { timestamps: [] };
      this.records.set(key, record);
    }

    // Filter out timestamps outside the active window
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    if (record.timestamps.length >= limit) {
      const oldestInWindow = record.timestamps[0];
      const resetTime = oldestInWindow + windowMs;
      return {
        allowed: false,
        remaining: 0,
        resetTime,
      };
    }

    record.timestamps.push(now);
    return {
      allowed: true,
      remaining: limit - record.timestamps.length,
      resetTime: now + windowMs,
    };
  }

  /**
   * Garbage collect expired entries
   */
  public cleanup(maxAgeMs: number = 10 * 60 * 1000) {
    const threshold = Date.now() - maxAgeMs;
    for (const [key, record] of this.records.entries()) {
      record.timestamps = record.timestamps.filter((ts) => ts > threshold);
      if (record.timestamps.length === 0) {
        this.records.delete(key);
      }
    }
  }

  /**
   * Reset limiter (useful in test suites)
   */
  public reset() {
    this.records.clear();
  }
}

export const rateLimiter = new RateLimiter();

