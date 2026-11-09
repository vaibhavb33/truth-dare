# Asteria Voice Playback: Diagnostic & Root Cause Analysis

**Task Reference:** Task 39 (Voice Playback Complete Diagnostic & Repair)  
**System Component:** Web Speech API, Server-Authoritative Neural Synthesis (`/api/voice/synthesize`), UI State Management (`QuestionVoiceControls.tsx`, `useVoice.ts`, `speechService.ts`).  
**Environment:** Desktop Chrome/Firefox/Safari, iOS Safari, Android Chrome.  
**Date:** November 2026

---

## Executive Summary

Asteria's voice playback system experienced multiple cascading failures that caused users to press the "Listen" button without hearing any question audio, or hearing unexpected mathematical beeps rather than natural speech.

A comprehensive multi-layer investigation across frontend audio pipelines, browser Web Speech engines, audio element lifecycles, and backend synthesis endpoints diagnosed **four distinct root causes**:

1. **Mock Neural Tone Preemption (False Positive Success):** When cloud API keys (`GOOGLE_TTS_API_KEY`, etc.) were absent in development or self-hosted setups, the backend `MockNeuralProvider` returned a 440 Hz / 392 Hz mathematical sine wave beep in a WAV container. The frontend treated the `200 OK` response as successful speech synthesis, playing an obscure beep tone instead of vocalizing the question, thereby preempting and disabling the native browser Web Speech API.
2. **Mobile Autoplay & Asynchronous Dropping:** On modern mobile browsers (iOS Safari and Android Chrome), audio playback must be initiated synchronously within a user gesture (tap/click). The client architecture previously awaited an asynchronous network call (`fetch('/api/voice/synthesize')`) before calling `audio.play()`. By the time the fetch resolved, mobile operating systems had stripped the transient user activation token, raising `NotAllowedError` or silently discarding the playback. When caught, the fallback to `speechSynthesis.speak()` was also rejected by WebKit because it was executed asynchronously outside user activation.
3. **Overly Restrictive Voice Filtering & Premature Null Bailout:** In `speechService.ts`, when `getBestVoiceForLanguage()` returned `null` (which occurs on clean mobile installs where Hindi (`hi-IN`), Arabic (`ar-SA`), or Indonesian (`id-ID`) voice objects have not yet loaded or require OS-level language pack downloads), the service returned `{ success: false }` and refused to invoke `window.speechSynthesis.speak()`. In reality, modern browser engines can synthesize text using `utterance.lang = 'hi-IN'` even when an explicit `SpeechSynthesisVoice` object is not enumerated in `getVoices()`.
4. **Premature Component Unmount Cancellation in `useVoice`:** The hook `useVoice.ts` previously registered a cleanup effect (`return () => { speechService.stop(); }`). In React 18 strict mode and dynamic question transition loops (e.g., clicking Truth -> Dare, changing categories, or selecting another question), unmounting the card immediately called `speechService.stop()`, abruptly terminating speech mid-sentence or within the first 100 milliseconds of playback.

---

## Detailed Root Cause Matrix

| Root Cause ID | Layer | Symptom | Mechanism | Resolution |
| :--- | :--- | :--- | :--- | :--- |
| **RC-VOICE-01** | Backend Provider | Beeping tone or silence instead of speech | `getVoiceProvider()` returned `MockNeuralProvider` which generated sine beeps. `SpeechService` treated 200 OK as success and never engaged native TTS. | Refactored `checkNeuralAvailability()` to verify `data.provider !== 'mock'`. When cloud credentials are absent, client defaults directly to the enhanced native Web Speech engine. |
| **RC-VOICE-02** | Browser Security | Silence on iOS Safari & Android Chrome | Awaiting `fetch()` before `audio.play()` expired user activation gesture, triggering `NotAllowedError`. Async fallback to `speechSynthesis` was also dropped. | Client pre-checks neural availability on load; when using browser fallback, `utterance.speak()` executes synchronously in the gesture context without awaiting async network hops. |
| **RC-VOICE-03** | Web Speech API | Error: "No matching voice found for hi" | `getBestVoiceForLanguage` returned null if Hindi voice object wasn't in `getVoices()`, aborting playback before calling `synth.speak()`. | Distinguish between devices with loaded voices lacking language families vs. pending voice lists; set `utterance.lang = bcp47` directly, enabling OS-level remote speech synthesizers. |
| **RC-VOICE-04** | React Lifecycle | Speech cuts off within 100ms or on card switch | Hook `useVoice.ts` had `useEffect(() => () => speechService.stop(), [])`, stopping audio whenever a card remounts. | Removed component-level `speechService.stop()` from unmount cleanup; stop is now exclusively bound to explicit user action, new question playback, or page unload. |
| **RC-VOICE-05** | Chromium Engine | Playback freezes after 14 seconds on long questions | Chromium garbage collection bug drops `SpeechSynthesisUtterance` instances if not retained in global memory. | Utterances are assigned to `this.activeUtterance` and `window.__asteria_speech_utterance__`, with a 10s keepalive pulse (`synth.pause() + synth.resume()`). |

---

## Empirical Verification Checklist

- [x] **Root Cause 1 Verified & Fixed:** Unit tests in `tests/neuralVoiceEngine.test.ts` pass; `SpeechService` detects mock provider and selects native Web Speech engine.
- [x] **Root Cause 2 Verified & Fixed:** Mobile gesture context preserved; instant speech activation without async gesture loss.
- [x] **Root Cause 3 Verified & Fixed:** `tests/speechService.test.ts` validates strict non-silent fallback rules while properly handling missing language voices.
- [x] **Root Cause 4 Verified & Fixed:** Question switching and card re-renders do not cut off active speech.
- [x] **Root Cause 5 Verified & Fixed:** Utterance retains global anchor and keepalive pulse, preventing Chrome GC freeze.
