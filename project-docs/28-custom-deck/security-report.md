# Asteria Custom Deck Security & Content Safety Report

> **Document Version:** 1.0.0  
> **Status:** Production-Ready  
> **Security Audit Date:** 2026-11-07  
> **Classification:** Security Controls & Content Safety Specification  

---

## 1. Executive Summary

User-generated content (UGC) introduces unique security, safety, and legal risks. Asteria incorporates defense-in-depth measures to prevent dangerous stunts, illegal acts, non-consensual interactions, identity hijacking, unauthorized deck mutation, and cross-site scripting (XSS).

---

## 2. Threat Analysis & Security Controls Matrix

| Threat ID | Threat Vector | Target Impact | Asteria Defense Mechanism | Test Status |
|-----------|---------------|---------------|---------------------------|:-----------:|
| **SEC-01** | **Dangerous Stunt UGC** | User authors dare commanding self-harm, swallowing poisons, or playing with fire | Multi-lingual regex scanner in `validateQuestionSafety()` blocks physical harm, hazardous chemicals, and fire hazards before cards can be saved. | **PASSED** (`tests/customDecks.test.ts`) |
| **SEC-02** | **Illegal Criminal Activity** | User inputs dare prompting drunk driving, theft, or property vandalism | Category `illegal_activity` scans for criminal patterns across 8 supported languages, immediately rejecting the submission. | **PASSED** (`tests/customDecks.test.ts`) |
| **SEC-03** | **Non-Consensual Interaction** | Dare demands non-consensual physical contact or distributing private intimate media | Category `non_consensual` scans for consent violations, unauthorized photo distribution, and harassment. | **PASSED** (`tests/customDecks.test.ts`) |
| **SEC-04** | **Deck Hijacking & Tampering** | Attacker attempts to overwrite or delete another user's custom deck | `deckStorage` and `/api/custom-decks/[id]` verify that the incoming `creatorId` matches `deck.creatorId`. Unauthorized requests are blocked. | **PASSED** (`tests/customDecks.test.ts`) |
| **SEC-05** | **Private Deck Leakage** | External users scraping or reading private party decks | Private decks are strictly restricted to the creator's browser and authorized room participants via room snapshots. | **PASSED** (`/api/custom-decks` RLS & Route Handlers) |
| **SEC-06** | **Stored XSS Injection** | User embeds `<script>` or `<img onerror=...>` in question prompt or deck name | Input sanitization strips dangerous tags and characters before storage and rendering. React's automatic JSX escaping prevents DOM injection. | **PASSED** (`tests/customDecks.test.ts`) |
| **SEC-07** | **Denial of Service Flooding** | Attacker floods `/api/custom-decks` with rapid creation requests | Sliding window rate limiter enforces max 30 creations/min and 60 fetches/min per IP. | **PASSED** (`rateLimiter.check()`) |

---

## 3. Content Safety Filter Specification (`safetyFilter.ts`)

The content safety engine evaluates user submissions against 5 prohibited categories:

### 1. `violence_harm`
- Self-harm, suicide encouragement, cutting, severe physical trauma.
- Multilingual patterns: English (`suicide`, `cut your wrists`), Hindi (`आत्महत्या`, `खुद को मारो`), Spanish (`suicidio`, `hacerse daño`), German (`selbstmord`, `ritzen`), French (`se blesser`), Arabic (`انتحار`), Indonesian (`bunuh diri`).

### 2. `dangerous_physical`
- Ingesting toxic chemicals (bleach, detergent, poison), jumping from moving vehicles, touching live electrical lines, fire hazards.
- Multilingual patterns: `swallow bleach`, `drink gasoline`, `set ... on fire`, `touch live wire`.

### 3. `illegal_activity`
- Driving under the influence, theft, shoplifting, vandalism, doxxing.
- Multilingual patterns: `drive drunk`, `steal from`, `slash tires`, `chori karo`.

### 4. `non_consensual`
- Non-consensual touching, distributing private/intimate images without consent, groping, blackmail.
- Multilingual patterns: `touch ... without consent`, `share nudes without permission`, `tocar sin consentimiento`.

### 5. `hate_harassment`
- Slurs, hate speech, white supremacy, targeted group attacks.
