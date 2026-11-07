# Web Speech API Browser Compatibility & Quirks Matrix

## 1. Browser Support Summary

The Web Speech API `SpeechSynthesis` interface is supported across all major modern mobile and desktop browsers:

| Browser / Platform | SpeechSynthesis Support | Pause / Resume | Asynchronous Voice Loading | Known Quirks & Asteria Mitigation |
|---|---|---|---|---|
| **Google Chrome (Desktop)** | Supported (100%) | Supported | Uses `onvoiceschanged` | **Garbage Collection Bug**: Active utterances can be prematurely GC'd. Mitigated by retaining `this.activeUtterance` reference in `SpeechService`. |
| **Google Chrome (Android)** | Supported (100%) | Supported | Uses `onvoiceschanged` | Relies on Google TTS Engine installed on device. Audio requires initial user gesture. |
| **Apple Safari (macOS)** | Supported (100%) | Supported | Immediate voice load | High quality Siri/System voices (Samantha, Daniel, etc.). |
| **Apple Safari (iOS / iPadOS)** | Supported (98%) | Limited | Immediate voice load | **Pause/Resume Flakiness**: On older iOS versions, `pause()` can terminate the stream. Mitigated by fallback to clean `stop()` and restart. |
| **Mozilla Firefox** | Supported (95%) | Supported | Immediate voice load | Relies strictly on OS-installed voice packages. Linux without `speech-dispatcher` or voice packs reports empty voices. Handled gracefully with fallback notice. |
| **Microsoft Edge** | Supported (100%) | Supported | Uses `onvoiceschanged` | Exceptional multilingual support via Microsoft Online Natural voices for all 8 languages. |
| **Samsung Internet** | Supported (95%) | Supported | Uses `onvoiceschanged` | Inherits Chromium behavior; user gesture mandatory. |

---

## 2. Technical Mitigations for Edge Cases

### 2.1 Mobile User-Gesture Requirement
Mobile operating systems (iOS and Android) require a physical user touch or click event to activate the audio context.
- **Asteria Implementation**: Voice synthesis is **never** invoked on page load or automatically upon card draw. It is triggered solely when the user touches:
  - *"Listen to Truth only"*
  - *"Listen to Dare only"*
  - The voice speaker button on the revealed card, custom prompt, or question library.

### 2.2 Asynchronous Voice Initialization
In Chromium-based browsers, `window.speechSynthesis.getVoices()` initially returns an empty array `[]` until the underlying synthesis daemon registers.
- **Asteria Implementation**:
  ```typescript
  if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
    window.speechSynthesis.onvoiceschanged = () => {
      this.loadVoices();
    };
  }
  ```

### 2.3 Long Utterance Auto-Pause Mitigation
Chromium browsers can silently pause utterances longer than 15 seconds.
- **Asteria Implementation**: Truth and Dare challenges are concise (typically 5 to 25 words), finishing well within 3 to 6 seconds. Furthermore, `onstart`, `onend`, `onpause`, and `onerror` listeners keep active track of the engine state.

### 2.4 Navigation & Component Teardown
When a user navigates between pages or closes a modal, audio must not continue playing as an orphaned background process.
- **Asteria Implementation**:
  - `useVoice()` unmount hook executes `speechService.stop()`.
  - `window.addEventListener('beforeunload', () => speechService.stop())`.
  - `window.addEventListener('pagehide', () => speechService.stop())`.

