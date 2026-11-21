# Play Truth & Dare — Contact Us Form & Email Notification Integration

**Domain:** `https://playtruthndare.com/contact`  
**Target Recipient:** `borkarvaibhav98@gmail.com`  
**Email Service Provider:** Resend  
**Date:** November 2026  
**Status:** COMPLETE & VERIFIED  

---

## 1. Architecture Overview

```
┌─────────────────────────────────┐
│   https://playtruthndare.com    │
│        /contact Page            │
│   (ContactFormClient.tsx)       │
└───────────────┬─────────────────┘
                │ POST /api/contact (JSON)
                │ { name, email, message, website (honeypot) }
                ▼
┌─────────────────────────────────┐
│   Next.js API Route             │
│   (app/api/contact/route.ts)    │
│   - Honeypot Bot Trap Check     │
│   - RFC 5322 Email Validation   │
│   - IP-based Sliding Rate Limit │
│   - Duplicate Hash Deduplication│
└───────────────┬─────────────────┘
                │
                ▼
┌─────────────────────────────────┐
│   Email Dispatch Service        │
│   (lib/email/contactService.ts) │
│   - Resend SDK Integration      │
│   - Brand HTML & Plaintext      │
│   - Reply-To Visitor Header     │
└───────────────┬─────────────────┘
                │
                ▼
┌─────────────────────────────────┐
│       Resend API / SMTP         │
│               │                 │
│               ▼                 │
│    borkarvaibhav98@gmail.com    │
└─────────────────────────────────┘
```

---

## 2. Environment Variables Configuration

Set these variables in your hosting environment (e.g. Vercel Project Settings > Environment Variables) and locally in `.env.local`:

| Variable Name | Required | Default Value | Description |
|---|---|---|---|
| `RESEND_API_KEY` | **Yes (Prod)** | `""` | Official API key from [resend.com](https://resend.com). When not set, the service safely logs a warning and returns mock success for dev/testing. |
| `CONTACT_EMAIL` | Optional | `borkarvaibhav98@gmail.com` | Destination inbox for all customer inquiries and prompt suggestions. |
| `CONTACT_FROM_EMAIL` | Optional | `Play Truth & Dare <onboarding@resend.dev>` | Outgoing sender address. Once `playtruthndare.com` is verified in Resend Domains, update to `Play Truth & Dare <notifications@playtruthndare.com>`. |

---

## 3. Server-Side Spam & Abuse Protection

1. **Honeypot Spam Trap:**
   - Form renders an invisible `<input name="website" tabIndex="-1" style="display:none" aria-hidden="true" />`.
   - Legitimate human visitors cannot see or focus this field.
   - Automated bots automatically fill it. When populated, the API immediately returns HTTP 200 without dispatching an email or alerting the bot.
2. **Sliding-Window Rate Limiting:**
   - Enforces a maximum of **5 submissions per 10 minutes** per IP address via `lib/security/rateLimiter.ts`.
   - Returns HTTP 429 (`Too many messages sent. Please wait a few minutes before trying again.`) when exceeded.
3. **Duplicate Submission Deduplication:**
   - Hashes `cleanEmail + '::' + cleanMessage` with an in-memory sliding 3-minute lock.
   - Prevents duplicate clicks, network retries, or repetitive spam submissions from firing multiple emails.
4. **Input Length & Script Sanitization:**
   - Name: 2–100 chars, rejects `<script>` injection tags.
   - Email: RFC 5322 regex match, 5–254 chars.
   - Message: 5–5000 chars.
   - All dynamic strings escaped against HTML injection before rendering into email markup.

---

## 4. Email Notification Features

- **Subject:** `[Play Truth & Dare] New Contact Form Message from {Visitor Name}`
- **Reply-To Header:** Set directly to the visitor's email address. Hitting "Reply" in Gmail replies immediately to the user.
- **Branded HTML Template:** Matches the Play Truth & Dare dark-mode gaming aesthetic (`#0A0418` dark background, `#150C2C` elevated card, `#8B5CF6` brand purple accents, rounded borders).
- **Embedded Details:**
  - Visitor Name
  - Visitor Email (clickable mailto)
  - Submission Timestamp (Formatted UTC date string + ISO)
  - Full Message text with preserved line breaks
  - Visitor Client IP & User Agent (for technical context)
  - Direct Action Button: "Reply Directly to {Visitor Name}"
- **Plaintext Alternative:** Multi-line plaintext version included in all outgoing messages for email clients with HTML disabled.

---

## 5. Verification & Test Suite

All 15 automated integration tests in [`tests/contactUs.test.ts`](../../tests/contactUs.test.ts) pass:
- [x] Branded HTML and plaintext rendering.
- [x] HTML sanitization of script tags and malicious attributes.
- [x] Default recipient is `borkarvaibhav98@gmail.com`.
- [x] Custom `CONTACT_EMAIL` override.
- [x] Mocked graceful behavior when `RESEND_API_KEY` is not configured.
- [x] Resend API dispatch when `RESEND_API_KEY` is set.
- [x] Resend API error handling and upstream failure surfacing (HTTP 502).
- [x] Valid submissions (HTTP 200).
- [x] Missing / invalid name validation (HTTP 400).
- [x] Invalid email format validation (HTTP 400).
- [x] Too short message validation (HTTP 400).
- [x] Honeypot spam trap detection.
- [x] Duplicate submission rejection (HTTP 429).
- [x] Malformed JSON payload handling (HTTP 400).
- [x] Full test suite (22 files, 222 tests) passes.
- [x] Production build (`npm run build`) compiles cleanly (185/185 routes).

