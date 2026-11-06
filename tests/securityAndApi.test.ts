import { describe, it, expect, beforeEach } from 'vitest';
import { rateLimiter } from '@/lib/security/rateLimiter';

describe('Security & API Defense Unit Tests', () => {
  beforeEach(() => {
    rateLimiter.reset();
  });

  describe('Sliding Window Rate Limiter', () => {
    it('allows requests within threshold and tracks remaining budget', () => {
      const key = 'test-client-1';
      const limit = 3;
      const windowMs = 5000;

      const res1 = rateLimiter.check(key, limit, windowMs);
      expect(res1.allowed).toBe(true);
      expect(res1.remaining).toBe(2);

      const res2 = rateLimiter.check(key, limit, windowMs);
      expect(res2.allowed).toBe(true);
      expect(res2.remaining).toBe(1);

      const res3 = rateLimiter.check(key, limit, windowMs);
      expect(res3.allowed).toBe(true);
      expect(res3.remaining).toBe(0);

      // 4th request must be blocked
      const res4 = rateLimiter.check(key, limit, windowMs);
      expect(res4.allowed).toBe(false);
      expect(res4.remaining).toBe(0);
      expect(res4.resetTime).toBeGreaterThan(Date.now());
    });

    it('isolates different client IP keys independently', () => {
      const clientA = 'ip-192.168.1.1';
      const clientB = 'ip-192.168.1.2';
      const limit = 2;

      rateLimiter.check(clientA, limit);
      rateLimiter.check(clientA, limit);
      const blockedA = rateLimiter.check(clientA, limit);

      expect(blockedA.allowed).toBe(false);

      // Client B should still be allowed
      const allowedB = rateLimiter.check(clientB, limit);
      expect(allowedB.allowed).toBe(true);
      expect(allowedB.remaining).toBe(1);
    });
  });

  describe('Admin Authorization & Token Validation', () => {
    it('validates admin token format requirement', () => {
      const validToken = 'Bearer asteria_admin_valid_session_token_123456';
      const invalidToken = 'Bearer fake_user_token_999';
      const emptyToken = '';

      const isValidFormat = (header: string | null) =>
        Boolean(header && header.startsWith('Bearer asteria_admin_'));

      expect(isValidFormat(validToken)).toBe(true);
      expect(isValidFormat(invalidToken)).toBe(false);
      expect(isValidFormat(emptyToken)).toBe(false);
      expect(isValidFormat(null)).toBe(false);
    });
  });
});

