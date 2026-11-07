# Asteria Question Voice Playback Architecture

## 1. Overview & Architectural Principles
Asteria integrates high-fidelity client-side Text-to-Speech (TTS) using the browser's native **Web Speech API** (`window.speechSynthesis` and `SpeechSynthesisUtterance`).

The architecture follows strict real-time gaming guidelines:
1. **Zero Unsolicited Audio**: Playback is never triggered automatically without explicit user action.
2. **Deterministic Lifecycle**: In-flight speech is cancelled prior to starting a new utterance, preventing overlapping voices.
3. **Local-Only Multiplayer Audio**: In multiplayer rooms, voice synthesis runs strictly on the participant's local device. No audio packets or commands are broadcast over the network.
4. **Strict Linguistic Integrity**: The service selects the closest matching native voice for the card's language. If a matching voice is not installed on the user's browser, the system **never** silently uses an unrelated voice (such as an English voice reading Hindi or Arabic text). Instead, it surfaces a helpful, non-blocking notification.
5. **Garbage Collection Shielding**: Chrome and Chromium-based browsers aggressively garbage collect active `SpeechSynthesisUtterance` instances if not held by a permanent reference, which cuts off audio mid-sentence. Asteria retains active utterance instances in memory until `onend` or `onerror` fires.

---

## 2. Directory Structure & Service Layout
```
truth&dare/
├── lib/
│   └── voice/
│       ├── speechService.ts          # Singleton TTS engine & voice resolver
│       └── useVoice.ts               # Reactive React hook for UI components
├── components/
│   └── voice/
│       └── QuestionVoiceControls.tsx # Accessible mobile voice player (play, pause, stop, rate, voice select)
├── tests/
│   └── speechService.test.ts         # Automated unit & integration test suite
└── project-docs/
    └── 26-voice/
        ├── voice-architecture.md     # Architecture & system design
        ├── language-voice-support.md # Language mapping & voice resolution matrix
        ├── browser-compatibility.md  # Cross-browser capabilities & fallbacks
        └── voice-test-report.md      # Empirical verification & test results
```

---

## 3. Core Component Integrations
- **`Card3D.tsx`**:
  - **Front Face**: Accessible "Listen to Truth only" and "Listen to Dare only" buttons allow users to draw and hear their preferred category immediately.
  - **Back Face (Revealed Card)**: Embedded `QuestionVoiceControls` bar providing Play, Pause, Resume, Stop, Speed adjustment (0.75x, 1.0x, 1.25x, 1.5x), and Voice Selector.
- **`TruthOrDareGameClient.tsx`**:
  - Automatically cleans up speech (`speechService.stop()`) on turn transitions, skipping, card completion, and navigation.
- **`CustomDeckClient.tsx`**:
  - Every custom card item in the deck manager includes a compact voice player button to test and preview card challenge playback.
- **`RoomClient.tsx` (Multiplayer)**:
  - Participants can listen locally to the shared room challenge using their local device synthesizer without disturbing or streaming audio to other players.
- **`QuestionsClient.tsx` (Library)**:
  - Each challenge item in the directory includes a quick voice listen button.

---

## 4. Voice Playback Flowchart
```
User clicks "Listen to Truth" / "Listen to Dare" / Voice Button
                             │
                             ▼
              speechService.stop() [Cancel any active speech]
                             │
                             ▼
         Resolve Voice for Target Language (e.g. 'hi-IN', 'ar-SA')
                             │
             ┌───────────────┴───────────────┐
             │                               │
       Matching Voice?                 No Matching Voice?
             │                               │
             ▼                               ▼
 Create SpeechSynthesisUtterance        Display Helpful Toast:
 - voice = matchedVoice                 "Voice unavailable for this language
 - rate = userSelectedRate (0.75-1.5x)   on this browser/device."
 - pitch = 1.0                               │
 - retain GC reference                       ▼
             │                          Return gracefully
             ▼                          (Never use unrelated voice)
 window.speechSynthesis.speak()
             │
   ┌─────────┴─────────┐
   ▼                   ▼
onstart             onend / onerror
Set playing state   Clear GC reference & reset state
```
