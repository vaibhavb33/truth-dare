# Formal Acceptance Criteria & Test Verification Matrix

**Project Name:** Project Asteria  
**Document:** Master Acceptance Criteria & Verification Standards  
**Role:** Senior Product Manager & Business Analyst  
**Date:** November 5, 2026  
**Status:** Complete — Ready for Review

---

## 1. Quality Gates & Definition of Done (DoD)

A feature is strictly prohibited from being marked as **"Complete"** or merged into production unless it meets all of the following criteria:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DEFINITION OF DONE (DoD)                        │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Zero Placeholder UI   │ Every button, modal, and input is functional│
│ 2. Real Game Logic       │ Verified randomization, shuffle, & state    │
│ 3. Automated Test Proof  │ Unit & E2E tests passing 100%               │
│ 4. Type Safety           │ Zero TypeScript compiler errors (Strict)    │
│ 5. WCAG AA Accessible    │ 4.5:1+ contrast, full keyboard & ARIA       │
│ 6. Cross-Device Verified │ Tested on iOS Safari, Android Chrome, Mac   │
│ 7. Core Web Vitals Pass  │ LCP < 2.0s, INP < 150ms, CLS < 0.05         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Detailed BDD Test Specifications

### Module 3: Truth or Dare Core Engine

#### AC-TOD-001: Anti-Repetition Shuffle Engine
* **Objective:** Guarantee no prompt repeats until the deck is exhausted.
* **Test Setup:** Initialize a deck of 20 unique cards.
* **Given** an active game session with 20 cards in the deck,
* **When** the user draws 20 consecutive cards,
* **Then**:
  1. All 20 cards drawn must be unique (set size == 20).
  2. The remaining card count indicator decrements from 20 to 0.
  3. On the 21st draw attempt, an animated "Deck Exhausted" modal appears offering "Reshuffle" or "Change Deck".
  4. Selecting "Reshuffle" resets the pool and repopulates the active deck without page reload.

#### AC-TOD-002: 3D Card Flip Physics & Perspective
* **Given** a player is presented with the face-down Truth or Dare card,
* **When** the player taps "Truth" or "Dare",
* **Then**:
  1. The card rotates 180 degrees along the Y-axis using CSS `transform-style: preserve-3d`.
  2. The back face is hidden using `backface-visibility: hidden` to prevent mirror image artifacts.
  3. The flip duration is between 350ms and 500ms using an ease-out timing curve.
  4. Hardware acceleration is verified via `transform: translate3d(0,0,0)`.

#### AC-TOD-003: Integrated Dare Countdown Timer
* **Given** a Dare card is revealed with a 30s countdown enabled,
* **When** the timer starts,
* **Then**:
  1. A circular SVG progress bar smoothly transitions from 100% to 0% in exactly 30,000ms.
  2. Procedural audio ticks play at 1-second intervals.
  3. If 5 seconds remain, the progress bar turns warning amber/red.
  4. Upon reaching 0s, a buzzer or completion chime sounds and mobile haptics pulse twice (200ms pattern).
  5. Pausing the timer freezes both the visual ring and the audio ticks.

---

### Module 10: Multiplayer Game Rooms

#### AC-MP-001: Room Creation & Cryptographic Code Generation
* **Given** a user is on the homepage or room screen,
* **When** they tap "Create Room",
* **Then**:
  1. The system provisions a unique room session within 400ms.
  2. The room code is exactly 6 alphanumeric uppercase characters, excluding visually ambiguous characters (`I`, `O`, `0`, `1`).
  3. A high-contrast SVG QR code renders displaying the full direct join URL: `https://[domain]/join?room=[CODE]`.
  4. A "Copy Link" button copies the URL to the clipboard with temporary visual feedback (*"Link Copied!"* for 2000ms).

#### AC-MP-002: Real-time State Synchronization Latency
* **Given** two devices (Host on desktop, Guest on mobile) are connected to room `TEST99`,
* **When** the Host selects "Dare" and the card flips on the Host's screen,
* **Then**:
  1. The Guest's screen initiates the card flip animation within 150ms of the Host's action.
  2. The prompt text rendered on the Guest's screen exactly matches the Host's screen.
  3. The active turn indicator updates simultaneously across both clients.

#### AC-MP-003: Mobile Network Reconnection & Presence
* **Given** a mobile guest in an active multiplayer room locks their phone screen for 45 seconds and re-opens the browser,
* **When** the browser tab regains focus,
* **Then**:
  1. The client detects connection loss via heartbeat ping/pong failure.
  2. A discreet floating banner displays *"Reconnecting to room..."*.
  3. The client queries the current authoritative room state and resynchronizes the active card, scores, and turn without kicking the player from the roster.
  4. Reconnection completes in under 2 seconds on 4G networks.

---

### Module 9: Custom Deck Creator

#### AC-CD-001: Validation, Persistence & Sanitization
* **Given** a user is creating a custom deck at `/custom`,
* **When** they submit a deck with fewer than 5 cards,
* **Then**:
  1. The "Start Game" button remains disabled, and a warning states: *"Please add at least 5 cards to play (currently [N]/5)"*.
* **When** they submit a prompt containing malicious script tags (e.g., `<script>alert('xss')</script>`),
* **Then**:
  1. The input string is sanitized and stripped of executable HTML, storing only clean plain text.
* **When** they save a valid deck of 10 prompts and refresh the browser,
* **Then**:
  1. The deck is retrieved from `localStorage` and available in the custom decks selector.

---

### Module 12: User Preferences & Safety Governance

#### AC-PREF-001: Master Audio Mute Toggle
* **Given** game audio is enabled,
* **When** the user taps the speaker icon in the universal header,
* **Then**:
  1. The Web Audio `AudioContext` is immediately suspended or muted via a global master gain node.
  2. No audio ticks, chimes, or whooshes play during card flips, timer intervals, or button taps.
  3. The icon swaps to an accessible muted speaker icon with `aria-label="Unmute audio"`.
  4. The mute state persists across page navigations and refreshes in `localStorage`.

#### AC-SAFE-001: 18+ Age Verification Gate
* **Given** a user has not previously confirmed their age,
* **When** they select the "Spicy / After Dark 18+" category,
* **Then**:
  1. A modal overlay intercepts access, blocking view of the prompts.
  2. The modal states: *"This pack contains mature, adult-only challenges. You must be 18 or older to proceed."*
  3. Tapping "I am Under 18 / Exit" dismisses the modal and routes back to the "Classic Party" deck.
  4. Tapping "I am 18+ / Confirm" unlocks the deck, logs affirmative consent to `localStorage`, and reveals the game.

#### AC-SAFE-002: Safe Veto / Skip Mechanism
* **Given** any Truth or Dare card is currently active on screen,
* **When** the active player taps the "Skip / Veto" button,
* **Then**:
  1. The prompt immediately dismisses with zero required confirmation modals.
  2. The turn advances to the next player in the rotation.
  3. No humiliating animation, alarm sound, or forced blocker is triggered.

---

## 3. Verification Matrix by Viewport & Device

| Test Scenario | Mobile Portrait (375px) | Mobile Landscape (667px) | Tablet (768px - 1024px) | Desktop (1440px+) | Living Room TV (1920px+) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Card Flip Physics** | Pass (Full-bleed card) | Pass (Dual-pane layout) | Pass (Centered canvas) | Pass (Max-width 640px) | Pass (High contrast) |
| **Thumb Reachability** | Pass (Bottom 25% zone) | Pass (Side thumb zones) | Pass (Centered controls) | Pass (Mouse & Keyboard) | Pass (Remote / Arrow nav) |
| **Countdown Timer** | Pass (Sticky header bar) | Pass (Side progress ring)| Pass (Prominent ring) | Pass (High-visibility) | Pass (Large screen font) |
| **Multiplayer QR Display**| Pass (Modal overlay) | Pass (Side panel) | Pass (Side panel) | Pass (Prominent top/right) | Pass (Large TV QR code) |
| **Audio Synthesizer** | Pass (Web Audio iOS/And)| Pass (Web Audio) | Pass (Web Audio) | Pass (Web Audio) | Pass (Web Audio) |

