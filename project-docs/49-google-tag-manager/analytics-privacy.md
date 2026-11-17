# Play Truth & Dare — Analytics Privacy & Consent Architecture

**Domain:** `https://playtruthndare.com`  
**Container:** `GTM-MNXM9MQK`  
**Date:** November 2026  
**Standards:** GDPR (EU), CCPA/CPRA (California), COPPA (US), Google Consent Mode v2  

---

## 1. Zero-Ads Privacy Commitment

**Play Truth & Dare** operates under a strict "Zero Ads, 100% Free" promise. Because the platform contains no ad networks, behavioral retargeting pixels, or ad trackers:
1. **Advertising Storage Denied by Default:** All advertising-related Consent Mode flags are denied immediately prior to GTM container execution:
   ```javascript
   gtag('consent', 'default', {
     'ad_storage': 'denied',
     'ad_user_data': 'denied',
     'ad_personalization': 'denied',
     'analytics_storage': 'granted',
     'wait_for_update': 500
   });
   ```
2. **No Third-Party Retargeting:** No Facebook Pixel, TikTok Pixel, Pinterest Tag, or advertising SDKs are permitted in the GTM container.

---

## 2. Personally Identifiable Information (PII) Scrubbing Rules

In compliance with Google's Terms of Service and international privacy standards, the analytics dataLayer enforces the following data isolation boundaries:

| Data Category | Handled in Gameplay | Allowed in Analytics dataLayer? | Technical Protection Mechanism |
|---|---|---|---|
| **Question Prompts** | Yes (Custom user questions) | **STRICTLY FORBIDDEN** | Only card counts and card types (`'truth'` / `'dare'`) are emitted |
| **Player Nicknames** | Yes (Local scorekeeping) | **STRICTLY FORBIDDEN** | Only player counts (`slice_count`, `rounds_played`) are emitted |
| **Room Codes** | Yes (6-character codes) | **STRICTLY FORBIDDEN** | Only boolean room creation/join status is emitted |
| **User Email / Phone** | Never requested | **STRICTLY FORBIDDEN** | The platform has zero account registration or email gates |
| **IP Addresses** | Filtered by server | **ANONYMIZED** | GTM / GA4 IP masking is enforced at the network level |
| **Session Secrets** | Kept in `localStorage` | **STRICTLY FORBIDDEN** | Ephemeral tokens are never pushed to `window.dataLayer` |

---

## 3. Cookie & Local Storage Hygiene

- **Functional Cookies Only:** The only cookies set by the application are locale preferences (`playtruthndare_locale` and `asteria_locale` for backward compatibility).
- **LocalStorage Data:** All game state, custom decks, audio synthesizer volumes, and age verification flags remain strictly on the client device.
- **No Cross-Site Tracking:** The application sets zero third-party tracking cookies.

