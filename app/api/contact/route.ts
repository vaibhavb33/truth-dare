/**
 * Play Truth & Dare — Contact Form API Route
 * Handles secure submission validation, honeypot spam traps, rate limiting,
 * duplicate deduplication, and email dispatch to borkarvaibhav98@gmail.com.
 */

import { NextRequest, NextResponse } from 'next/server';
import { contactEmailService } from '@/lib/email/contactService';
import { rateLimiter } from '@/lib/security/rateLimiter';

// Duplicate submission tracker (sliding 3-minute window)
const recentSubmissions = new Map<string, number>();
const DUPLICATE_WINDOW_MS = 3 * 60 * 1000;

function cleanupDuplicateCache() {
  const now = Date.now();
  for (const [key, timestamp] of recentSubmissions.entries()) {
    if (now - timestamp > DUPLICATE_WINDOW_MS) {
      recentSubmissions.delete(key);
    }
  }
}

// Basic RFC 5322 compatible email regular expression
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export async function POST(request: NextRequest) {
  try {
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'anonymous-client';
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    // 1. IP-based Rate Limiting (Max 5 submissions per 10 minutes)
    const rateCheck = rateLimiter.check(`contact:${clientIp}`, 5, 10 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many messages sent. Please wait a few minutes before trying again.',
        },
        { status: 429 }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Malformed JSON payload.' },
        { status: 400 }
      );
    }

    const { name, email, message, website, hp_field } = body;

    // 2. Honeypot Spam Trap (automated bots populate hidden inputs)
    if (website || hp_field) {
      console.warn(`[ContactAPI] Honeypot triggered from IP: ${clientIp}`);
      // Return 200 to silently trap the bot without tipping it off
      return NextResponse.json({
        success: true,
        message: 'Your message has been received.',
      });
    }

    // 3. Name Validation
    if (typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Please provide your name.' },
        { status: 400 }
      );
    }
    const cleanName = name.trim();
    if (cleanName.length < 2 || cleanName.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Name must be between 2 and 100 characters.' },
        { status: 400 }
      );
    }
    if (/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(cleanName)) {
      return NextResponse.json(
        { success: false, error: 'Invalid characters in name.' },
        { status: 400 }
      );
    }

    // 4. Email Validation
    if (typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }
    const cleanEmail = email.trim();
    if (cleanEmail.length < 5 || cleanEmail.length > 254 || !EMAIL_REGEX.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address (e.g. name@example.com).' },
        { status: 400 }
      );
    }

    // 5. Message Validation
    if (typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { success: false, error: 'Please enter a message.' },
        { status: 400 }
      );
    }
    const cleanMessage = message.trim();
    if (cleanMessage.length < 5) {
      return NextResponse.json(
        { success: false, error: 'Message must be at least 5 characters long.' },
        { status: 400 }
      );
    }
    if (cleanMessage.length > 5000) {
      return NextResponse.json(
        { success: false, error: 'Message must be less than 5000 characters.' },
        { status: 400 }
      );
    }

    // 6. Duplicate Submission Protection
    cleanupDuplicateCache();
    const duplicateKey = `${cleanEmail.toLowerCase()}::${cleanMessage.toLowerCase()}`;
    if (recentSubmissions.has(duplicateKey)) {
      return NextResponse.json(
        {
          success: false,
          error: 'You have already submitted this message. Please wait a few minutes before submitting again.',
        },
        { status: 429 }
      );
    }

    const timestampIso = new Date().toISOString();

    // 7. Dispatch Email through Resend
    const result = await contactEmailService.sendContactNotification({
      name: cleanName,
      email: cleanEmail,
      message: cleanMessage,
      timestampIso,
      ip: clientIp,
      userAgent,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to dispatch email. Please try again shortly.',
        },
        { status: 502 }
      );
    }

    // Register duplicate lock
    recentSubmissions.set(duplicateKey, Date.now());

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your message has been sent successfully.',
      messageId: result.messageId,
    });
  } catch (err) {
    console.error('[ContactAPI] Unexpected server error:', err);
    return NextResponse.json(
      { success: false, error: 'An unexpected server error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

