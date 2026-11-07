# Weekly Add to Home Screen Promotional Feature Specification
**Feature:** Recurring 7-Day Progressive Web App (PWA) Promotion  
**Component:** `components/pwa/PWAPromotionModal.tsx`  
**Hook Controller:** `lib/pwa/usePWAPromotion.ts`  
**Translations:** `lib/i18n/pwaPromotionTranslations.ts`  
**Platform:** Asteria Party Gaming Platform (`https://truthordarequiz.com`)  

---

## 1. Executive Summary

The Add to Home Screen promotional feature encourages eligible visitors to install Asteria as a standalone app on their mobile or desktop devices. It provides zero-latency access, fullscreen immersion, and offline pass-and-play gameplay without being intrusive.

### Core Tenets:
1. **Real Installation Workflow:** Triggers actual native browser installation prompts (`beforeinstallprompt`) on Chromium/Android and step-by-step guidance on iOS Safari.
2. **Strict 7-Day Cooldown:** After being displayed or dismissed ("Maybe Later", Close button, Escape, backdrop), the promotion goes silent for at least 7 days (604,800,000 ms).
3. **Gameplay Protection (Zero Interruptions):** Under no circumstance is the promotional card displayed while a user is actively playing a game or participating in a multiplayer room.
4. **Permanent Installed Suppression:** Once the application is confirmed installed, reminders cease permanently.
5. **Full Multilingual Localization:** Seamlessly translated across 8 languages with full RTL layout support for Arabic.

---

## 2. Visual Architecture & Design System

The promotional card conforms to Asteria's signature cosmic dark aesthetic:

- **Surface Base:** Deep navy `#0D0D1F` with a soft purple border `border-brand-500/30` and glowing ambient light circles.
- **Brand Identity:** High-density rounded badge featuring the Asteria vector sparkle star and a purple-to-cyan gradient container.
- **Badge Tag:** Top highlight `🚀 Love our website?` in brand purple.
- **Headline:** Bold, unclipped display typography `Add it to your home screen!`.
- **Subtext:** Informative copy: `Get quick access to Truth or Dare, Spinner and all your favourite games.`.
- **Buttons:**
  - **Primary CTA:** `Add to Home Screen` with download icon and vibrant purple-to-indigo gradient.
  - **Secondary CTA:** `Maybe Later` subtle text button with keyboard focus ring.
  - **Close Button:** Floating `(X)` close icon with aria-label in the top corner.

### Mobile & Desktop Responsive Layout:
- **Mobile (< 640px):** Elegant bottom floating card with subtle backdrop blur, respecting safe areas (`pb-[calc(1.25rem+env(safe-area-inset-bottom))]`).
- **Desktop (>= 640px):** Floating bottom-right action widget (`w-[420px]`) that avoids obscuring main website navigation.

---

## 3. Component Hierarchy & Data Flow

```
+-------------------------------------------------------------+
|                      app/layout.tsx                         |
|                             |                               |
|                     <LanguageProvider>                      |
|                             |                               |
|                    <PWARegistration />                      |
|                       /            \                        |
|                      v              v                       |
|           <PWAPromotionModal />    <IOSInstallModal />      |
+-------------------------------------------------------------+
               |                               |
               | (Captures prompt / triggers)  |
               v                               v
    +----------------------+       +-----------------------+
    |  usePWAPromotion()   |       |       usePWA()        |
    |  - 7-day cooldown    |       |  - beforeinstallprompt|
    |  - gameplay check    |       |  - standalone check   |
    |  - storage handling  |       |  - appinstalled event |
    +----------------------+       +-----------------------+
```

---

## 4. Accessibility & Safe Interaction Rules

- **Role:** `role="dialog"`, with `aria-labelledby="pwa-promo-title"` and `aria-describedby="pwa-promo-desc"`.
- **Keyboard Navigation:** Escape key dismisses the dialog and activates the 7-day cooldown timer.
- **Reduced Motion:** Adheres to user OS preferences (`motion-reduce:transition-none`).
- **Storage Safety:** Wrapped in robust `try/catch` fallbacks to support incognito/private modes without throwing `SecurityError`.

