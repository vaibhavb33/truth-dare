# Interaction Guidelines & Motion Choreography

**Project Name:** Project Asteria  
**Document:** Motion Choreography, Sensory Timing & Gesture Guidelines  
**Role:** Senior UI/UX Designer & Product Design Lead  
**Date:** November 5, 2026  
**Status:** Complete — Ready for Review

---

## 1. Motion Philosophy: "Crisp & Tactile"

Every animation in Project Asteria must serve a **functional purpose**: communicating state changes, rewarding bold actions, or establishing spatial orientation. Unnecessary or slow animations that impede rapid turn rotation are strictly banned.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MOTION TIMING CURVES                            │
├─────────────────────┬───────────┬──────────────────────────────────────┤
│ INTERACTION TYPE    │ DURATION  │ TIMING BEZIER CURVE                  │
├─────────────────────┼───────────┼──────────────────────────────────────┤
│ 3D Card Perspective │ 450ms     │ cubic-bezier(0.34, 1.56, 0.64, 1)    │
│ Button Tap Scale    │ 120ms     │ cubic-bezier(0.2, 0.8, 0.2, 1)       │
│ Modal Reveal/Dismiss│ 250ms     │ cubic-bezier(0.16, 1, 0.3, 1)        │
│ Floating Emoji Burst│ 1200ms    │ cubic-bezier(0.25, 0.46, 0.45, 0.94) │
│ Timer Color Morph   │ 300ms     │ ease-in-out                          │
└─────────────────────┴───────────┴──────────────────────────────────────┘
```

---

## 2. 3D Card Flip Choreography

When a player taps **"Truth"** or **"Dare"**, a multi-sensory cascade occurs:

```
[Tap Initiated: t=0ms]
  ├── Button scales down to 0.96x + Haptic trigger (20ms pulse)
  └── Procedural Web Audio whoosh begins (synthesized filtered white noise)
[Card Mid-Rotation: t=225ms]
  ├── Card passes 90 degrees (invisible edge-on)
  └── Active prompt text & category badge populate on back face
[Card Settles: t=450ms]
  ├── Slight spring over-rotation (183 deg -> 180 deg)
  ├── Ambient color glow blooms (Cyan for Truth / Coral for Dare)
  └── Reveal chime sounds (synthesized two-tone bell chime)
```

### Key CSS Properties:
```css
.card-3d-wrapper {
  perspective: 1200px;
}

.card-3d-inner {
  transform-style: preserve-3d;
  transition: transform 450ms cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform;
}

.card-flipped {
  transform: rotateY(180deg);
}

.card-face {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
```

---

## 3. Web Audio Synthesis Sync

To guarantee zero network asset lag, sound is programmatically generated using the native **Web Audio API**:

| Sound Event | Trigger Point | Synthesis Profile | Fallback |
| :--- | :--- | :--- | :--- |
| **Card Flip (Whoosh)** | `t = 0ms` (Tap Truth/Dare) | Bandpass filtered noise ramp (300Hz -> 1800Hz) over 350ms. | Silent if muted |
| **Card Reveal (Chime)**| `t = 400ms` (Card landing) | Dual sine wave chime (F#5: 740Hz + C#6: 1108Hz) with 400ms exponential decay. | Silent if muted |
| **Timer Tick** | `t = each 1.0s` | High-frequency short click (3200Hz sine burst for 25ms). | Silent if muted |
| **Timer Buzzer** | `t = 0s` (Time expired) | Sawtooth wave (150Hz) dual buzz (150ms on / 80ms off / 200ms on). | Silent if muted |
| **Dare Completed** | Tap "Completed" | Major triad arpeggio (C5 -> E5 -> G5) over 300ms + confetti pop. | Silent if muted |

---

## 4. Mobile Haptic Vibration Profiles (`navigator.vibrate`)

Haptic feedback bridges the digital-physical divide, reinforcing card physicalization:

* **Button Press (Subtle Click):** `[15]` (single 15ms micro-vibration).
* **Card Flip Settle:** `[25]` (satisfying 25ms pulse as card snaps into place).
* **Timer Urgency Warning (< 5s):** `[40, 60, 40]` (double tap warning).
* **Dare Expiration Buzzer:** `[150, 80, 200]` (heavy dual vibration).
* **Dare Completed (Celebration):** `[20, 40, 20, 40, 60]` (cheerful victory rumble).

*Note: Automatically bypasses if `navigator.vibrate` is unavailable (e.g., iOS Safari) without throwing errors.*

---

## 5. Confetti Particle Dynamics (`ConfettiCelebration.tsx`)

Triggered upon tapping **"Completed (+1)"**:
* **Particle Count:** 60 particles on mobile, 120 particles on desktop.
* **Palette:** Brand Electric Violet (`#8B5CF6`), Truth Cyan (`#06B6D4`), Dare Coral (`#FF5C77`), and Gold (`#F59E0B`).
* **Physics:**
  * Launch Origin: Bottom center of the screen (behind the Completed button).
  * Initial Velocity: 35–45 px/frame with a 65°–115° launch cone.
  * Gravity: 0.8 px/frame².
  * Drag / Air Resistance: 0.95.
  * Lifetime: Automatically garbage-collected after 2.5 seconds to conserve mobile GPU cycles.

---

## 6. Gesture Ergonomics

* **Spinner Wheel Swipe:**
  * Supports touch drag-to-spin. The release velocity is calculated from the last 3 touchmove events: `velocity = deltaY / deltaTime`. Deceleration uses constant friction (`v = v * 0.985`).
* **This or That Swipe:**
  * Left swipe (Option A) vs. Right swipe (Option B).
  * Snap-back threshold: If dragged less than 35% of card width, springs back to center (`transform: translateX(0)` with spring damping). If dragged beyond 35%, translates off-screen with 15° rotation tilt.

---

## 7. Reduced Motion Fallback (`prefers-reduced-motion`)

For users with vestibular disorders or motion sensitivities:
* 3D card rotation is replaced with a **150ms smooth cross-fade opacity transition** (`opacity: 0 -> opacity: 1`).
* Confetti explosions are disabled; replaced with a glowing checkmark badge.
* Spinner wheel skips rotation physics and instantly jumps to the selected slice with a brief highlight pulse.

