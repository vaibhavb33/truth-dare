# Asteria Spinner Wheel Technical & System Architecture

## Architecture Overview
The redesigned Asteria Spinner Wheel is built on a clean separation of concerns between mathematical physics calculation, high-performance HTML5 Canvas 2D rendering, procedural Web Audio generation, and React-governed game state management.

```
+-------------------------------------------------------------+
|               User Interaction / UI Layer                  |
|  - Mode Switcher (Players, Truth/Dare, Forfeits, Custom)    |
|  - Player Roster Manager (Add, Inline Edit, Remove, Shuffle)|
|  - Spin Trigger Button (data-testid="spin-wheel-button")    |
|  - Audio Mute / Unmute Toggle                               |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|            Spinner Client Component (React 19)              |
|              (SpinnerWheelClient.tsx)                       |
|  - State: isSpinning, winner, showWinnerModal, segments     |
|  - Refs: rotationRef, animationFrameRef, pointerDeflection  |
|  - Lifecycle: unmount animation cleanup, prefers-reduced-   |
|    motion detection, live-announcement aria region          |
+---------------+-----------------------------+---------------+
                |                             |
                v                             v
+-------------------------------+ +---------------------------+
| Pure Mathematical Engine      | | Procedural Sound Engine   |
| (lib/games/spinnerMath.ts)    | | (soundSynthesizer.ts)     |
| - normalizeAngle()            | | - playSpinStart() (whoosh)|
| - getSegmentAtAngle()         | | - playTick() (peg tick)   |
| - computeTargetRotation()     | | - playVictory() (fanfare) |
| - quinticEaseOut()            | | - triggerHaptic()         |
+---------------+---------------+ +---------------------------+
                |
                v
+-------------------------------------------------------------+
|             HiDPI HTML5 Canvas 2D Rendering Store           |
|  - devicePixelRatio scaling (2x / 3x Retina support)        |
|  - Double-buffered context drawing                          |
|  - Multi-stop linear gradients per slice                    |
|  - Radial depth shadowing + Perimeter gold rivet studs     |
|  - Centered multi-tier jewel hub + Animated flapper pointer |
+-------------------------------------------------------------+
```

---

## 1. Pure Mathematical Engine (`lib/games/spinnerMath.ts`)

To ensure server/client consistency and 100% testable physics, all geometry and alignment equations are isolated in `spinnerMath.ts` without any React or DOM dependencies.

### 1.1 Geometry & Angles
- **Coordinate System:**
  In HTML5 Canvas 2D:
  - $0$ rad is at 3 o'clock (positive X axis).
  - $\frac{\pi}{2}$ rad ($90^\circ$) is at 6 o'clock.
  - $\pi$ rad ($180^\circ$) is at 9 o'clock.
  - $\frac{3\pi}{2}$ rad ($270^\circ$) is at 12 o'clock (the default pointer position `DEFAULT_POINTER_ANGLE`).

### 1.2 Angle Normalization
```ts
export function normalizeAngle(angle: number): number {
  return ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
}
```
Normalizes any angular value (including arbitrary multi-turn rotations and negative numbers) into the continuous interval $[0, 2\pi)$.

### 1.3 Visible Segment Identification (`getSegmentAtAngle`)
When the wheel is rotated by angle $\theta$, each slice $i \in [0, N-1]$ spans from $\theta + i \cdot \Delta\theta$ to $\theta + (i+1) \cdot \Delta\theta$, where $\Delta\theta = \frac{2\pi}{N}$.
The relative angle on the wheel directly under the fixed pointer at $\theta_p = \frac{3\pi}{2}$ is:
$$\alpha = \text{normalizeAngle}(\theta_p - \theta)$$
The visible winning slice index is strictly:
$$\text{index} = \left\lfloor \frac{\alpha}{\Delta\theta} \right\rfloor \pmod N$$

### 1.4 Target Rotation Angle Computation (`computeTargetRotation`)
To guarantee that the wheel visibly and accurately halts on the chosen target segment (with no post-spin jumps or visual discrepancies), `computeTargetRotation` calculates the final rotation angle before animation starts:
1. Calculates the slice's center angle: $\theta_{\text{center}} = i \cdot \Delta\theta + \frac{\Delta\theta}{2} + \text{jitter} \cdot \Delta\theta$, where $\text{jitter} \in [-0.35, 0.35]$.
2. Finds the required delta rotation $\Delta\theta_{\text{target}}$ to align $\theta_{\text{center}}$ with $\theta_p$.
3. Adds $K \ge 7$ full revolutions ($K \cdot 2\pi$) to ensure suspenseful multi-second spinning.

---

## 2. Canvas 2D HiDPI Rendering Engine

### 2.1 HiDPI Pixel Ratio Compensation
```ts
const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
canvas.width = Math.round(displaySize * dpr);
canvas.height = Math.round(displaySize * dpr);
canvas.style.width = `${displaySize}px`;
canvas.style.height = `${displaySize}px`;
ctx.scale(dpr, dpr);
```
This guarantees crisp vector text, razor-sharp metallic gold rivet studs, and flawless gradient arcs on modern smartphone displays (iPhone Retina 3x, Android 2.625x).

### 2.2 Segment Rendering Loop
Each segment is rendered via `ctx.arc(0, 0, radius, startAngle, endAngle)` followed by:
1. `ctx.createLinearGradient()` mapped between the slice edges.
2. Inner ambient shadow overlay for 3D bowl effect.
3. Radial label placement with dynamic font size and dark stroke shadow.
4. Gold peg drawing at `(radius * cos(endAngle), radius * sin(endAngle))`.

---

## 3. Procedural Audio Synthesis (`soundSynthesizer.ts`)

All audio is procedurally synthesized using the browser's native Web Audio API with zero external MP3 assets, guaranteeing zero latency, offline readiness, and tiny bundle size:

1. **Spin Launch Whoosh (`playSpinStart`):**
   - Sine wave oscillator sweeping upward from 160Hz to 520Hz over 0.35 seconds.
   - Low-pass filter with exponential gain envelope.
2. **Peg Collision Tick (`playTick`):**
   - High-frequency 3200Hz sine burst lasting 18ms with rapid exponential decay.
   - Accompanying device haptic impulse (`navigator.vibrate(8)`).
3. **Victory Fanfare (`playVictory`):**
   - Ascending major triad arpeggio (C5: 523Hz, E5: 659Hz, G5: 784Hz, C6: 1046Hz) over 0.5s.
   - Clustered victory haptic feedback `[30, 60, 30, 80]`.
4. **Mute State Persistence:**
   - Sound toggle button directly updates `sound.toggleMute()`.

---

## 4. State Machine & Lifecycle

```
[IDLE / READY]
   |
   | User clicks "SPIN THE WHEEL" (or presses Space/Enter)
   v
[SPINNING]
   | - isSpinning: true
   | - CTA button disabled
   | - requestAnimationFrame loop runs quinticEaseOut(progress)
   | - Peg crossing triggers playTick() + needle deflection
   |
   v (progress === 1.0)
[RESOLVED & CELEBRATION]
   | - isSpinning: false
   | - Needle snaps to targetAngle (100% verified visible segment)
   | - Winner announcement modal appears (data-testid="winner-modal")
   | - playVictory() fanfare + confetti fireworks triggered
   | - Screen reader aria-live polite announcement: "Result: {winner} selected!"
   |
   +---> Option A: "Spin Again" -> Returns to [SPINNING]
   +---> Option B: "Remove Winner & Keep Playing" (Elimination) -> Slices count decreases by 1
   +---> Option C: "Close" -> Returns to [IDLE / READY]
```

---

## 5. Accessibility (a11y) & Motion Safeguards

1. **Screen Reader Live Announcement:**
   An invisible container with `aria-live="polite"` and `aria-atomic="true"` announces game events to visually impaired users:
   - "The wheel is spinning..."
   - "Result: {winner} selected!"
2. **`prefers-reduced-motion` Compliance:**
   When the user or operating system has enabled reduced motion preferences, the animation duration is scaled from 4500ms down to 400ms, immediately presenting the result without vertigo-inducing rapid rotation.
3. **Keyboard Navigation:**
   Full keyboard focus rings, Enter/Space key triggers on spin button, and modal ESC dismiss.

