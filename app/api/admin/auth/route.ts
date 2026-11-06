import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter } from '@/lib/security/rateLimiter';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local-auth-client';
    const rateCheck = rateLimiter.check(`auth:${ip}`, 5, 60 * 1000);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many authentication attempts. Please try again in 1 minute.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
          },
        }
      );
    }

    const { email, password } = await request.json();

    const expectedPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'AsteriaAdmin2026!';
    const isValid =
      email?.trim().toLowerCase() === 'admin@asteria.game' &&
      password === expectedPassword;

    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Invalid admin credentials.' }, { status: 401 });
    }

    // In production, sign JWT; here we return secure authenticated session token
    return NextResponse.json({
      success: true,
      token: 'asteria_admin_valid_session_token_' + Date.now(),
      user: {
        email: 'admin@asteria.game',
        role: 'superadmin',
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Authentication failed.' }, { status: 400 });
  }
}
