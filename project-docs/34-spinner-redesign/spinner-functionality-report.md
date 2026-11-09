# Asteria Spinner Wheel Functionality & Feature Report

## Executive Summary
The Asteria Spinner Wheel (`/games/spin-the-bottle`) provides an interactive, versatile gaming hub suitable for casual party play, drinking games, team decisions, and Truth or Dare companion gameplay.

---

## 1. Core Feature Matrix

| Feature | Description | Implementation Status | Test Coverage |
|---|---|---|---|
| **Physics-Based Canvas Wheel** | Dynamic HiDPI 2D canvas with multi-stop linear gradients, metallic bevels, and gold pegs | Completed | E2E + Visual |
| **Accurate Winner Landing** | Pure math calculation ensuring visible needle strictly points to winner | Completed | 17/17 Unit Tests |
| **Player Roster Management** | Add, edit inline, remove, reorder/shuffle, and populate demo players | Completed | E2E Playwright |
| **Minimum Player Safeguard** | Enforces minimum of 2 players/slices to prevent invalid division-by-zero wheels | Completed | Unit + UI |
| **Elimination Mode** | "Remove Winner & Keep Playing" flow to sequentially eliminate picked participants | Completed | E2E Playwright |
| **4 Game Modes** | Players, Truth or Dare, Party Forfeits, and Custom Wheel | Completed | E2E Playwright |
| **Procedural Audio Engine** | Zero-latency Web Audio API: spin whoosh, peg clicks, victory fanfare, mute toggle | Completed | Audio Synthesizer |
| **Winner Celebration Modal** | Trophy icon, celebration header, winner name, confetti fireworks, and action buttons | Completed | E2E Playwright |
| **Responsive Split-Screen** | Desktop dual-column console vs. mobile stacked touch-first view | Completed | 3 Viewport Tests |
| **Accessibility (a11y)** | Screen reader live region (`aria-live="polite"`), keyboard triggers, reduced motion | Completed | Automated |

---

## 2. Detailed Feature Breakdown

### 2.1 Player Roster & Slice Management
- **Add Participant:** Text input field with "Add" button and `Enter` key submission. Cleans whitespace and rejects empty entries.
- **Inline Editing:** Each participant pill features an edit button (`Edit2`). Clicking toggles an inline input box with Save (`Check`) and Cancel (`X`) icons, allowing instant correction of typos without deleting the slice.
- **Remove Participant:** Delete button (`Trash2`) on each player pill. Automatically disabled when only 2 players remain, guaranteeing wheel mathematical integrity.
- **Shuffle Roster:** Randomizes segment order with haptic feedback, mixing up adjacent colors.
- **Fill Demo Players:** Quickly seeds 6 party names (Alex, Jordan, Taylor, Morgan, Casey, Riley) for immediate play.
- **Reset Wheel:** Reverts the active mode to its initial default preset.

### 2.2 Game Modes & Presets
1. **Players Mode (Default):**
   - Ideal for: Truth or Dare turn picker, chore assigner, party selector.
   - Slices: Custom user player names or demo players.
2. **Truth or Dare Mode:**
   - Slices: `Truth`, `Dare`, `Double Truth`, `Wild Dare`, `Penalty Sip`, `Pass Card`.
   - Directly complements Truth and Dare gameplay sessions.
3. **Party Forfeits Mode:**
   - Slices: `Sing Chorus`, `Deep Secret`, `10 Pushups`, `Switch Seats`, `Show Camera Roll`, `Take 2 Sips`, `Tell a Joke`, `Dance No Music`.
   - High-energy party challenges for social gatherings.
4. **Custom Wheel Mode:**
   - Starts with 4 blank options (`Option 1` to `Option 4`) for custom decision-making (e.g. dinner options, travel destinations).

### 2.3 Elimination Game Flow
In tournament, drinking, or party game contexts, users frequently want to eliminate players who have already taken their turn:
1. Wheel completes spin and displays winner celebration modal.
2. If remaining players count $N > 2$, the modal renders:
   `Remove Winner & Keep Playing ({N-1} left)`
3. Clicking this button immediately strips the winner from the active segment array, updates the wheel geometry, dismisses the modal, and leaves the wheel ready for the next round.

### 2.4 Audio & Haptic Feedback Controls
- **Toggle Control:** Accessible sound button (`Volume2` / `VolumeX`) in the wheel controls bar.
- **Mute State:** Toggling sound mutes all synthesized audio (whoosh, tick, victory) while preserving haptic vibrations on supported mobile devices.
- **No Autoplay:** Audio is only synthesized upon deliberate user interaction (spinning the wheel, clicking toggle, or completing spin).

