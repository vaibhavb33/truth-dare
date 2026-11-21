import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { renderContactEmail } from '@/lib/email/templates/contactNotification';
import { contactEmailService, ContactEmailService } from '@/lib/email/contactService';
import { POST } from '@/app/api/contact/route';

describe('Contact Form & Resend Email Integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Email Template Renderer', () => {
    it('renders branded HTML and plaintext with visitor details and timestamp', () => {
      const rendered = renderContactEmail({
        name: 'Jordan Smith',
        email: 'jordan@example.com',
        message: 'I love this party game! Can you add a College Dorm category?',
        timestampIso: '2026-11-21T14:30:00.000Z',
        ip: '192.168.1.100',
      });

      expect(rendered.subject).toBe('[Play Truth & Dare] New Contact Form Message from Jordan Smith');
      
      // HTML assertions
      expect(rendered.html).toContain('Play Truth &amp; Dare');
      expect(rendered.html).toContain('Jordan Smith');
      expect(rendered.html).toContain('jordan@example.com');
      expect(rendered.html).toContain('College Dorm category');
      expect(rendered.html).toContain('mailto:jordan@example.com');
      expect(rendered.html).toContain('192.168.1.100');

      // Plaintext assertions
      expect(rendered.text).toContain('Jordan Smith');
      expect(rendered.text).toContain('jordan@example.com');
      expect(rendered.text).toContain('College Dorm category');
      expect(rendered.text).toContain('https://playtruthndare.com/contact');
    });

    it('sanitizes malicious HTML injection in visitor name and message', () => {
      const rendered = renderContactEmail({
        name: '<script>alert("hacked")</script>',
        email: 'attacker@example.com',
        message: 'Malicious <b>payload</b> with <img src=x onerror=alert(1)> and line 1\nline 2',
        timestampIso: new Date().toISOString(),
      });

      expect(rendered.html).not.toContain('<script>');
      expect(rendered.html).toContain('&lt;script&gt;alert(&quot;hacked&quot;)&lt;/script&gt;');
      expect(rendered.html).toContain('&lt;img src=x onerror=alert(1)&gt;');
      expect(rendered.html).toContain('line 1<br/>line 2');
    });
  });

  describe('2. Contact Email Service Configuration & Defaults', () => {
    it('defaults recipient email to borkarvaibhav98@gmail.com', () => {
      const originalEnv = process.env.CONTACT_EMAIL;
      delete process.env.CONTACT_EMAIL;

      const service = new ContactEmailService();
      expect(service.getDestinationEmail()).toBe('borkarvaibhav98@gmail.com');

      if (originalEnv) process.env.CONTACT_EMAIL = originalEnv;
    });

    it('respects custom CONTACT_EMAIL environment variable when set', () => {
      const originalEnv = process.env.CONTACT_EMAIL;
      process.env.CONTACT_EMAIL = 'custom-support@playtruthndare.com';

      const service = new ContactEmailService();
      expect(service.getDestinationEmail()).toBe('custom-support@playtruthndare.com');

      if (originalEnv) {
        process.env.CONTACT_EMAIL = originalEnv;
      } else {
        delete process.env.CONTACT_EMAIL;
      }
    });

    it('returns mocked success when RESEND_API_KEY is not defined', async () => {
      const originalKey = process.env.RESEND_API_KEY;
      delete process.env.RESEND_API_KEY;

      const result = await contactEmailService.sendContactNotification({
        name: 'Alex Player',
        email: 'alex@example.com',
        message: 'Great 3D flip card animations on mobile!',
      });

      expect(result.success).toBe(true);
      expect(result.mocked).toBe(true);
      expect(result.messageId).toContain('mock-');

      if (originalKey) process.env.RESEND_API_KEY = originalKey;
    });

    it('dispatches to Resend API when RESEND_API_KEY is set', async () => {
      const originalKey = process.env.RESEND_API_KEY;
      process.env.RESEND_API_KEY = 're_test_fake_api_key_1234567890';

      const mockSend = vi.fn().mockResolvedValue({
        data: { id: 'resend-msg-abc123xyz' },
        error: null,
      });

      // @ts-expect-error accessing private for unit mock
      contactEmailService.resendClient = {
        emails: { send: mockSend },
      } as unknown as import('resend').Resend;
      // @ts-expect-error accessing private for unit mock
      contactEmailService.apiKey = process.env.RESEND_API_KEY;

      const result = await contactEmailService.sendContactNotification({
        name: 'Resend Tester',
        email: 'tester@example.com',
        message: 'Testing official Resend dispatch.',
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('resend-msg-abc123xyz');
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'borkarvaibhav98@gmail.com',
          replyTo: 'tester@example.com',
          subject: '[Play Truth & Dare] New Contact Form Message from Resend Tester',
        })
      );

      if (originalKey) {
        process.env.RESEND_API_KEY = originalKey;
      } else {
        delete process.env.RESEND_API_KEY;
      }
    });

    it('handles Resend API error responses gracefully', async () => {
      const originalKey = process.env.RESEND_API_KEY;
      process.env.RESEND_API_KEY = 're_test_fake_api_key_1234567890';

      const mockSend = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Domain playtruthndare.com is not verified.' },
      });

      // @ts-expect-error accessing private for unit mock
      contactEmailService.resendClient = {
        emails: { send: mockSend },
      } as unknown as import('resend').Resend;
      // @ts-expect-error accessing private for unit mock
      contactEmailService.apiKey = process.env.RESEND_API_KEY;

      const result = await contactEmailService.sendContactNotification({
        name: 'Fail Tester',
        email: 'fail@example.com',
        message: 'This dispatch should fail.',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Domain playtruthndare.com is not verified');

      if (originalKey) {
        process.env.RESEND_API_KEY = originalKey;
      } else {
        delete process.env.RESEND_API_KEY;
      }
    });
  });

  describe('3. API Route POST /api/contact', () => {
    function createRequest(body: unknown, headers: Record<string, string> = {}): NextRequest {
      const req = new Request('https://playtruthndare.com/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': `10.0.0.${Math.floor(Math.random() * 200) + 1}`,
          ...headers,
        },
        body: typeof body === 'string' ? body : JSON.stringify(body),
      });
      return new NextRequest(req);
    }

    it('accepts valid contact submission and returns 200', async () => {
      const req = createRequest({
        name: 'Taylor Swift',
        email: 'taylor@example.com',
        message: 'We played this at our party and everyone loved it! Keep it up.',
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.message).toContain('successfully');
    });

    it('rejects submissions with missing or empty name', async () => {
      const req = createRequest({
        name: '   ',
        email: 'valid@example.com',
        message: 'A valid message here.',
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toContain('name');
    });

    it('rejects submissions with invalid email addresses', async () => {
      const invalidEmails = [
        '',
        'notanemail',
        '@nodomain.com',
        'missing-at-sign.com',
        'spaces in@email.com',
      ];

      for (const email of invalidEmails) {
        const req = createRequest({
          name: 'Player',
          email,
          message: 'Checking email validation.',
        });

        const res = await POST(req);
        const json = await res.json();

        expect(res.status).toBe(400);
        expect(json.success).toBe(false);
        expect(json.error).toContain('email');
      }
    });

    it('rejects submissions with too short message', async () => {
      const req = createRequest({
        name: 'Player',
        email: 'valid@example.com',
        message: 'Hi', // < 5 chars
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toContain('at least 5 characters');
    });

    it('silently traps spam bots via honeypot field', async () => {
      const req = createRequest({
        name: 'Spam Bot 3000',
        email: 'bot@spamnetwork.com',
        message: 'Buy cheap watches and crypto now!',
        website: 'https://spam-link.ru', // Honeypot populated!
      });

      const res = await POST(req);
      const json = await res.json();

      // Returns 200 so bot thinks it succeeded, but message is dropped
      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
    });

    it('prevents duplicate submissions within short time window', async () => {
      const uniqueSuffix = Date.now().toString();
      const payload = {
        name: 'Duplicate Tester',
        email: `dup-${uniqueSuffix}@example.com`,
        message: `This is a unique test message ${uniqueSuffix}`,
      };

      // First submission succeeds
      const req1 = createRequest(payload, { 'x-forwarded-for': '192.168.99.1' });
      const res1 = await POST(req1);
      expect(res1.status).toBe(200);

      // Second identical submission within 3 minutes fails
      const req2 = createRequest(payload, { 'x-forwarded-for': '192.168.99.1' });
      const res2 = await POST(req2);
      const json2 = await res2.json();

      expect(res2.status).toBe(429);
      expect(json2.success).toBe(false);
      expect(json2.error).toContain('already submitted');
    });

    it('handles malformed JSON payloads gracefully', async () => {
      const req = createRequest('{ malformed json !! }');
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toContain('Malformed JSON');
    });

    it('returns 502 when email service delivery fails', async () => {
      vi.spyOn(contactEmailService, 'sendContactNotification').mockResolvedValueOnce({
        success: false,
        error: 'SMTP upstream gateway timeout',
      });

      const req = createRequest({
        name: 'Failure Test',
        email: 'fail@example.com',
        message: 'This should trigger 502 status response.',
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(502);
      expect(json.success).toBe(false);
      expect(json.error).toContain('SMTP upstream gateway timeout');
    });
  });
});
