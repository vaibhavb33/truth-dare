/**
 * Asteria Spinner Wheel Mathematical Engine
 * Pure physics and geometric algorithms for wheel-pointer alignment,
 * target angle calculation, quintic deceleration curves, and winner resolution.
 */

// Canvas 2D default: 12 o'clock (top) is 3*PI/2 radians (270 degrees)
export const DEFAULT_POINTER_ANGLE = (3 * Math.PI) / 2;

/**
 * Normalizes an angle in radians to the standard interval [0, 2*PI).
 */
export function normalizeAngle(angle: number): number {
  return ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
}

/**
 * Resolves the segment index currently positioned under the fixed pointer.
 *
 * Mathematical Proof:
 * Slices are drawn starting at currentRotation + i * anglePerSegment.
 * Pointer is fixed at pointerAngle.
 * The unrotated wheel angle corresponding to the pointer is:
 *   alpha = normalizeAngle(pointerAngle - currentRotation)
 * The segment index is:
 *   floor(alpha / anglePerSegment) % numSegments
 */
export function getSegmentAtAngle(
  rotationAngle: number,
  numSegments: number,
  pointerAngle: number = DEFAULT_POINTER_ANGLE
): number {
  if (numSegments <= 0) return -1;
  const anglePerSegment = (2 * Math.PI) / numSegments;
  const normalizedRot = normalizeAngle(rotationAngle);
  const relativeAngle = normalizeAngle(pointerAngle - normalizedRot);
  return Math.floor(relativeAngle / anglePerSegment) % numSegments;
}

/**
 * Computes the exact final rotation angle required to align targetIndex
 * directly under the pointer, factoring in complete revolutions and safe jitter.
 *
 * @param currentRotation Current wheel rotation in radians
 * @param targetIndex Intended winning segment [0, numSegments - 1]
 * @param numSegments Total number of slices on the wheel
 * @param fullTurns Number of complete 360-degree rotations (default: 8)
 * @param jitter Normalized offset within segment [-0.3, 0.3] (default: 0)
 * @param pointerAngle Fixed pointer position in radians
 */
export function computeTargetRotation(
  currentRotation: number,
  targetIndex: number,
  numSegments: number,
  fullTurns: number = 8,
  jitter: number = 0,
  pointerAngle: number = DEFAULT_POINTER_ANGLE
): number {
  if (numSegments <= 0) return currentRotation;
  const anglePerSegment = (2 * Math.PI) / numSegments;

  // Clamped jitter: stay safely away from boundary lines (within ±35% of half-arc)
  const clampedJitter = Math.max(-0.35, Math.min(0.35, jitter)) * anglePerSegment;
  const sliceCenterAngle = targetIndex * anglePerSegment + anglePerSegment / 2 + clampedJitter;

  const currentNormalized = normalizeAngle(currentRotation);
  const targetNormalized = normalizeAngle(pointerAngle - sliceCenterAngle);

  let delta = targetNormalized - currentNormalized;
  if (delta < 0) {
    delta += 2 * Math.PI;
  }

  const fullRevolutions = Math.max(1, fullTurns) * 2 * Math.PI;
  return currentRotation + fullRevolutions + delta;
}

/**
 * Quintic Ease-Out Curve for natural suspenseful deceleration.
 * Rapid acceleration in first 10%, steady momentum, and exponential crawl at stop.
 * f(t) = 1 - (1 - t)^5
 */
export function quinticEaseOut(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - clamped, 5);
}

/**
 * Formats and truncates segment text labels to prevent canvas overflow.
 */
export function formatSegmentLabel(label: string, maxLength: number = 24): string {
  const trimmed = label.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return trimmed.slice(0, maxLength - 2) + '..';
}

