import { describe, it, expect } from 'vitest';
import {
  DEFAULT_POINTER_ANGLE,
  normalizeAngle,
  getSegmentAtAngle,
  computeTargetRotation,
  quinticEaseOut,
  formatSegmentLabel,
} from '@/lib/games/spinnerMath';

describe('Asteria Spinner Wheel Mathematical Engine', () => {
  describe('normalizeAngle', () => {
    it('should keep angles in [0, 2*PI) unchanged', () => {
      expect(normalizeAngle(0)).toBeCloseTo(0);
      expect(normalizeAngle(Math.PI)).toBeCloseTo(Math.PI);
      expect(normalizeAngle(1.5 * Math.PI)).toBeCloseTo(1.5 * Math.PI);
    });

    it('should normalize angles >= 2*PI', () => {
      expect(normalizeAngle(2 * Math.PI)).toBeCloseTo(0);
      expect(normalizeAngle(3 * Math.PI)).toBeCloseTo(Math.PI);
      expect(normalizeAngle(4 * Math.PI + 0.5)).toBeCloseTo(0.5);
    });

    it('should normalize negative angles into [0, 2*PI)', () => {
      expect(normalizeAngle(-Math.PI / 2)).toBeCloseTo(1.5 * Math.PI);
      expect(normalizeAngle(-Math.PI)).toBeCloseTo(Math.PI);
      expect(normalizeAngle(-2 * Math.PI)).toBeCloseTo(0);
      expect(normalizeAngle(-4 * Math.PI)).toBeCloseTo(0);
    });
  });

  describe('getSegmentAtAngle', () => {
    it('returns -1 for non-positive segment counts', () => {
      expect(getSegmentAtAngle(0, 0)).toBe(-1);
      expect(getSegmentAtAngle(0, -5)).toBe(-1);
    });

    it('correctly resolves 4-slice wheel at unrotated position', () => {
      // 4 slices: [0..PI/2), [PI/2..PI), [PI..3PI/2), [3PI/2..2PI)
      // Pointer is at 3PI/2 (270 deg / top)
      // When rotation = 0, relativeAngle = 3PI/2 - 0 = 3PI/2
      // floor((3PI/2) / (PI/2)) = 3.
      expect(getSegmentAtAngle(0, 4)).toBe(3);
    });

    it('correctly shifts segment index when wheel rotates', () => {
      const numSegments = 4;
      const anglePerSegment = (2 * Math.PI) / numSegments; // PI/2

      // Rotating by +PI/2 brings segment 2 under the pointer
      expect(getSegmentAtAngle(anglePerSegment, 4)).toBe(2);
      // Rotating by +PI brings segment 1 under the pointer
      expect(getSegmentAtAngle(2 * anglePerSegment, 4)).toBe(1);
      // Rotating by +3PI/2 brings segment 0 under the pointer
      expect(getSegmentAtAngle(3 * anglePerSegment, 4)).toBe(0);
      // Rotating by 2PI brings segment 3 back
      expect(getSegmentAtAngle(4 * anglePerSegment, 4)).toBe(3);
    });
  });

  describe('computeTargetRotation & Mathematical Alignment Verification', () => {
    it('returns currentRotation if numSegments <= 0', () => {
      expect(computeTargetRotation(1.23, 0, 0)).toBe(1.23);
      expect(computeTargetRotation(1.23, 0, -2)).toBe(1.23);
    });

    it('always targets the exact intended segment index for 2 slices', () => {
      for (let target = 0; target < 2; target++) {
        const targetRot = computeTargetRotation(0, target, 2, 5, 0);
        const resolved = getSegmentAtAngle(targetRot, 2);
        expect(resolved).toBe(target);
      }
    });

    it('always targets the exact intended segment across 3, 5, 8, 12, 16, 20 slices with various initial angles', () => {
      const segmentCounts = [2, 3, 4, 5, 6, 8, 10, 12, 16, 20];
      const initialRotations = [0, 0.42, 1.57, 3.14, 5.8, 12.5, -3.2];
      const jitters = [-0.3, -0.15, 0, 0.15, 0.3];

      for (const numSegments of segmentCounts) {
        for (let target = 0; target < numSegments; target++) {
          for (const initRot of initialRotations) {
            for (const jitter of jitters) {
              const finalRot = computeTargetRotation(
                initRot,
                target,
                numSegments,
                6,
                jitter,
                DEFAULT_POINTER_ANGLE
              );

              // Verify target rotation is strictly forward (greater than initial rotation)
              expect(finalRot).toBeGreaterThan(initRot);

              // Verify the visible segment under the pointer is EXACTLY target
              const resolved = getSegmentAtAngle(finalRot, numSegments, DEFAULT_POINTER_ANGLE);
              expect(resolved).toBe(target);
            }
          }
        }
      }
    });

    it('ensures at least fullTurns revolutions are performed', () => {
      const turns = 8;
      const initRot = 1.0;
      const targetRot = computeTargetRotation(initRot, 2, 6, turns, 0);
      const delta = targetRot - initRot;
      expect(delta).toBeGreaterThanOrEqual(turns * 2 * Math.PI);
    });
  });

  describe('quinticEaseOut', () => {
    it('evaluates to 0 at t=0 and 1 at t=1', () => {
      expect(quinticEaseOut(0)).toBe(0);
      expect(quinticEaseOut(1)).toBe(1);
    });

    it('clamps inputs outside [0, 1]', () => {
      expect(quinticEaseOut(-0.5)).toBe(0);
      expect(quinticEaseOut(1.5)).toBe(1);
    });

    it('is strictly monotonic increasing', () => {
      let prev = -1;
      for (let t = 0; t <= 1; t += 0.05) {
        const val = quinticEaseOut(t);
        expect(val).toBeGreaterThanOrEqual(prev);
        prev = val;
      }
    });

    it('has high deceleration near the end for dramatic suspense', () => {
      // At t=0.5, quintic ease-out is already at ~96.87%
      expect(quinticEaseOut(0.5)).toBeCloseTo(0.96875, 4);
      // The remaining 50% of time spends crawling through the final ~3.1% of rotation
      expect(quinticEaseOut(0.8)).toBeCloseTo(0.99968, 4);
    });
  });

  describe('formatSegmentLabel', () => {
    it('returns clean label if length is within maxLength', () => {
      expect(formatSegmentLabel('Alice')).toBe('Alice');
      expect(formatSegmentLabel('   Bob   ')).toBe('Bob');
    });

    it('truncates long labels with double dots', () => {
      const longName = 'Christopher Alexander Montgomery';
      const formatted = formatSegmentLabel(longName, 12);
      expect(formatted.length).toBeLessThanOrEqual(12);
      expect(formatted.endsWith('..')).toBe(true);
      expect(formatted).toBe('Christophe..');
    });

    it('handles exact boundary edge cases', () => {
      const tenChars = '1234567890';
      expect(formatSegmentLabel(tenChars, 10)).toBe('1234567890');
      expect(formatSegmentLabel(tenChars, 9)).toBe('1234567..');
    });
  });
});
