# Asteria Voice Playback: Cloud Cost & Budget Projections

**Document Version:** 1.0.0  
**Date:** November 9, 2026  
**Auditor:** Senior Audio Systems Engineer + AI Voice Developer  
**Subsystem:** Question Voice Playback (`app/api/voice/`, `lib/voice/`)  
**Status:** **BUDGET OPTIMIZED & ZERO REQUIRED SPEND**

---

## 1. Provider Unit Cost Structure

| Metric / Dimension | Google Cloud TTS (Neural2) | Microsoft Azure AI Speech (Neural) | ElevenLabs (Multilingual v2) |
| :--- | :--- | :--- | :--- |
| **Free Monthly Allowance** | **1,000,000 characters/mo FREE (Perpetual)** | **500,000 characters/mo FREE (12-mo trial)** | 10,000 characters/mo (Non-commercial only) |
| **Standard Voice Free Allowance** | 4,000,000 characters/mo FREE | None | None |
| **Price per 1M characters (Overage)** | **\$16.00 / 1M chars** (\$0.000016 / char) | **\$16.00 / 1M chars** (\$0.000016 / char) | **\$240.00 – \$300.00 / 1M chars** |
| **Minimum Base Subscription** | **\$0.00 (Pure Pay-As-You-Go)** | **\$0.00 (Pure Pay-As-You-Go)** | \$5.00/mo (Starter) or \$22.00/mo (Creator) |
| **Commercial Usage Permitted** | **YES (Included)** | **YES (Included)** | NO on Free tier; Requires paid plans |

---

## 2. Character Consumption Model

- **Average Question Length:** ~75 characters (including `Truth: ` or `Dare: ` prefix).
- **Average Characters per Game Session:** ~15 questions played $\times$ 75 characters = **1,125 characters per active player session**.
- **Public Cache Absorption Rate:** Standard category prompts (e.g. Classic, Party, Deep, Spicy) repeat across players. The integrated server `VoiceCache` achieves an estimated **55% to 70% cache hit rate**, eliminating redundant API synthesis calls.

---

## 3. Real-World Traffic Scenarios

### Scenario 1: Indie Launch / Casual Traffic
- **Volume:** 500 game sessions / day $\approx$ 15,000 sessions / month
- **Gross Synthesis Demand:** ~1,125,000 characters / month
- **Net Synthesis Demand (with 60% Cache Hit Rate):** ~450,000 characters / month

| Provider | Characters Billed | Monthly Cost | Budget Assessment |
| :--- | :--- | :--- | :--- |
| **Google Cloud TTS (Neural2)** | 0 (Within 1,000,000 free chars) | **\$0.00 / month** | **100% Free** |
| **Azure AI Speech** | 0 (Within 500,000 trial chars) | **\$0.00 / month** | Free for 12 mos, then \$7.20/mo |
| **ElevenLabs** | Exceeds all starter tiers | **\$99.00 / month** | Pro Plan required |

---

### Scenario 2: Active Multiplayer Community
- **Volume:** 2,500 game sessions / day $\approx$ 75,000 sessions / month
- **Gross Synthesis Demand:** ~5,625,000 characters / month
- **Net Synthesis Demand (with 65% Cache Hit Rate):** ~1,968,750 characters / month

| Provider | Characters Billed | Monthly Cost | Budget Assessment |
| :--- | :--- | :--- | :--- |
| **Google Cloud TTS (Neural2)** | 968,750 chars (1M free deducted) | **\$15.50 / month** | **Exceptional value** |
| **Azure AI Speech** | 1,468,750 chars | **\$23.50 / month** | Good value |
| **ElevenLabs** | ~2,000,000 chars | **\$480.00 / month** | **Prohibitive (31x higher)** |

---

### Scenario 3: High-Scale Viral Traffic
- **Volume:** 10,000 game sessions / day $\approx$ 300,000 sessions / month
- **Gross Synthesis Demand:** ~22,500,000 characters / month
- **Net Synthesis Demand (with 70% Cache Hit Rate):** ~6,750,000 characters / month

| Provider | Characters Billed | Monthly Cost | Budget Assessment |
| :--- | :--- | :--- | :--- |
| **Google Cloud TTS (Neural2)** | 5,750,000 chars (1M free deducted) | **\$92.00 / month** | Highly sustainable |
| **Azure AI Speech** | 6,250,000 chars | **\$100.00 / month** | Sustainable |
| **ElevenLabs** | Enterprise quota tier | **\$1,620.00 / month** | **Unsustainable for casual gaming** |

---

## 4. Cost Governance & Safety Guardrails

To prevent accidental credit card charges or malicious runaway queries, the architecture enforces:

1. **Strict Character Upper Bound:** `app/api/voice/synthesize/route.ts` rejects any request exceeding **500 characters** with HTTP 400.
2. **Client IP Rate Limiting:** Limits clients to **30 synthesis requests per minute** per IP.
3. **Cache Prioritization:** Public questions are cached for 7 days (`Cache-Control: public, max-age=604800`).
4. **Fallback Safety Valve:** If external API quotas are exhausted or credentials omitted, `SpeechService` immediately falls back to client-side browser `window.speechSynthesis` at **\$0.00 cost**, ensuring games never break.

