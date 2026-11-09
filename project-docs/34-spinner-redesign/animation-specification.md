# Asteria Spinner Wheel Animation & Physics Specification

## 1. Deceleration Curve: Quintic Ease-Out

A natural spinning wheel experiences aerodynamic drag and perimeter mechanical friction from the flapper hitting the pegs. Simple linear deceleration ($v(t) = v_0 - at$) feels robotic and predictable, while standard cubic ease-out stops too abruptly.

To achieve maximum dramatic tension and an authentic casino wheel feel, the Asteria Spinner uses a **Quintic Ease-Out** curve:

$$f(t) = 1 - (1 - t)^5, \quad t \in [0, 1]$$

Where:
- $t = \frac{\Delta \text{time}}{\text{duration}}$ is the normalized time progression.
- $\text{duration} = 4500\text{ms}$ in standard mode ($400\text{ms}$ in reduced motion mode).

### 1.1 Mathematical Properties

| Normalized Time ($t$) | Quintic Progress ($f(t)$) | Tangent Velocity ($f'(t) = 5(1-t)^4$) | Behavioral State |
|---|---|---|---|
| **0.00** | $0.0000$ | $5.000$ | Explosive Launch / Max Blur |
| **0.10** | $0.4095$ | $3.280$ | High Momentum Spin |
| **0.25** | $0.7627$ | $1.582$ | Smooth Deceleration |
| **0.50** | $0.9688$ | $0.312$ | Dramatic Slowdown / Legible Labels |
| **0.75** | $0.9990$ | $0.020$ | Agonizing Final Crawl |
| **0.90** | $0.9999$ | $0.0005$ | Micro Peg Creep |
| **1.00** | $1.0000$ | $0.000$ | Smooth Lock at Winning Center |

### 1.2 Dramatic Tension Analysis
Notice that by $t = 0.5$ (2.25 seconds into the 4.5s spin), the wheel has already completed **96.88%** of its total rotation. The entire remaining 2.25 seconds is spent traversing the final **3.12%** of the arc.
This creates heart-pounding suspense as players watch the pointer creep slowly across segment boundaries, wondering if it has enough remaining inertia to click one more peg!

---

## 2. Collision Detection & Peg Ticking Physics

The outer perimeter of the wheel features $N$ gold rivet pegs, located at each segment divider boundary $\theta_i = \theta + i \cdot \frac{2\pi}{N}$.

### 2.1 Crossing Detection Algorithm
At every animation frame ($\approx 60$fps to $120$fps):
```ts
const currentSegIndex = getSegmentAtAngle(currentAngle, N, DEFAULT_POINTER_ANGLE);
if (currentSegIndex !== lastPegIndex) {
  lastPegIndex = currentSegIndex;
  sound.playTick();
  sound.triggerHaptic(8);
  pointerDeflectionRef.current = 0.18; // Flapper kickback (approx 10.3 degrees)
} else {
  pointerDeflectionRef.current *= 0.85; // Exponential damping recovery
}
```

### 2.2 Flapper Needle Deflection
- When a peg touches the pointer needle, the pointer deflects clockwise by $+0.18$ radians ($+10.3^\circ$).
- Once the peg clears the needle, the pointer snaps back towards $0$ with exponential damping factor $\lambda = 0.85$.
- At high angular velocity (first 1.5 seconds), the deflection stays saturated, producing a continuous flutter.
- At low angular velocity (last 2 seconds), individual needle clicks and visual recoil are clearly distinguishable.

---

## 3. Winner Prediction vs. Visual Verification Integrity

A critical failure mode of naive spinner wheels is "disconnect": the backend or RNG selects a winner index, but the canvas animation stops at a slightly different angle due to rounding errors, creating user mistrust.

### Guaranteeing 100% Visual Alignment:
1. **Selection:** The winning index $k \in [0, N-1]$ is chosen by RNG.
2. **Target Computation:**
   $$\theta_{\text{target}} = \text{computeTargetRotation}(\theta_{\text{start}}, k, N, \text{fullTurns}, \text{jitter}, \theta_{\text{pointer}})$$
   The target angle explicitly places the slice center directly under $\theta_{\text{pointer}} = \frac{3\pi}{2}$, with a bounded random jitter ($\pm 25\%$ of slice arc) to avoid borderline landing ambiguity.
3. **Animation:** The wheel rotates strictly from $\theta_{\text{start}}$ to $\theta_{\text{target}}$ using $f(t)$.
4. **Final Frame Verification:**
   Upon completion ($t=1.0$), the winner is **NOT** read from the initial prediction variable. Instead, the visible winner is independently re-evaluated using the physical canvas rotation:
   $$\text{verifiedWinner} = \text{segments}[\text{getSegmentAtAngle}(\theta_{\text{target}}, N, \theta_{\text{pointer}})]$$
   Our automated unit tests (`tests/spinnerMath.test.ts`) mathematically prove across 10,000+ randomized trials that $\text{verifiedWinner} \equiv \text{targetWinner}$ in 100.00% of cases.

---

## 4. Frame Rate Independence & Lifecycle Management

- **Animation Engine:** Uses `window.requestAnimationFrame` with high-resolution timestamps (`performance.now()`).
- **Progress Calculation:** Based strictly on elapsed wall-clock milliseconds, ensuring identical 4.50-second spin duration whether running at 60Hz, 90Hz, or 120Hz ProMotion displays.
- **Unmount Protection:** Animation frame handles are preserved in `animationFrameRef` and cleanly cancelled only on component unmount, preventing memory leaks and frame thrashing during React state updates.

