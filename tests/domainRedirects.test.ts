import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '../middleware';

function createMockRequest(url: string, headers: Record<string, string> = {}) {
  return new NextRequest(url, {
    headers: new Headers(headers),
  });
}

describe('Domain Migration & 301 Redirect Middleware', () => {
  it('redirects www.playtruthndare.com to canonical apex playtruthndare.com with 301 (no redirect chain)', () => {
    const req = createMockRequest('http://www.playtruthndare.com/games/truth-or-dare', {
      host: 'www.playtruthndare.com',
    });
    const res = middleware(req);
    expect(res.status).toBe(301);
    expect(res.headers.get('location')).toBe('https://playtruthndare.com/games/truth-or-dare');
    expect(res.headers.get('cache-control')).toContain('public');
    expect(res.headers.get('cache-control')).toContain('max-age=31536000');
  });

  it('redirects legacy domain truthordarequiz.com to playtruthndare.com preserving path and query', () => {
    const req = createMockRequest('http://truthordarequiz.com/questions?category=couples&page=2', {
      host: 'truthordarequiz.com',
    });
    const res = middleware(req);
    expect(res.status).toBe(301);
    expect(res.headers.get('location')).toBe('https://playtruthndare.com/questions?category=couples&page=2');
  });

  it('redirects legacy domain truthordarequiz.com preserving localized routes', () => {
    const req = createMockRequest('http://truthordarequiz.com/es/games/spin-the-bottle', {
      host: 'truthordarequiz.com',
    });
    const res = middleware(req);
    expect(res.status).toBe(301);
    expect(res.headers.get('location')).toBe('https://playtruthndare.com/es/games/spin-the-bottle');
  });

  it('redirects legacy domain asteria.games and vercel preview to playtruthndare.com', () => {
    const req1 = createMockRequest('http://asteria.games/room/ABCD', {
      host: 'asteria.games',
    });
    const res1 = middleware(req1);
    expect(res1.status).toBe(301);
    expect(res1.headers.get('location')).toBe('https://playtruthndare.com/room/ABCD');

    const req2 = createMockRequest('http://asteria-games.vercel.app/blog/clean-icebreakers-for-work', {
      host: 'asteria-games.vercel.app',
    });
    const res2 = middleware(req2);
    expect(res2.status).toBe(301);
    expect(res2.headers.get('location')).toBe('https://playtruthndare.com/blog/clean-icebreakers-for-work');
  });

  it('redirects HTTP to HTTPS on canonical host playtruthndare.com', () => {
    const req = createMockRequest('http://playtruthndare.com/games', {
      host: 'playtruthndare.com',
      'x-forwarded-proto': 'http',
    });
    const res = middleware(req);
    expect(res.status).toBe(301);
    expect(res.headers.get('location')).toBe('https://playtruthndare.com/games');
  });

  it('does NOT redirect when already on https://playtruthndare.com (prevents redirect loop)', () => {
    const req = createMockRequest('https://playtruthndare.com/games', {
      host: 'playtruthndare.com',
      'x-forwarded-proto': 'https',
    });
    const res = middleware(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });

  it('does NOT redirect on localhost during development or testing', () => {
    const req = createMockRequest('http://localhost:3000/games', {
      host: 'localhost:3000',
    });
    const res = middleware(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });

  it('preserves URL encoded query strings and complex paths', () => {
    const req = createMockRequest('http://truthordarequiz.com/questions?search=spicy%20dares&lang=en', {
      host: 'truthordarequiz.com',
    });
    const res = middleware(req);
    expect(res.status).toBe(301);
    expect(res.headers.get('location')).toBe('https://playtruthndare.com/questions?search=spicy%20dares&lang=en');
  });
});
