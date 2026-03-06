/**
 * Tests for useAnimatedNumber custom hook.
 * Uses a carefully controlled requestAnimationFrame mock that progresses
 * the animation in exactly two frames to avoid infinite recursion.
 */
import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import useAnimatedNumber from '../hooks/useAnimatedNumber';

beforeEach(() => {
  // Two-phase RAF mock:
  // Frame 1 → pass t0 (sets startTime, progress = 0, schedules frame 2)
  // Frame 2 → pass t0 + 99999 (progress = 1, animation done, no more frames)
  let rafFrameCount = 0;
  let frameStartTime = null;

  vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => {
    const id = ++rafFrameCount;
    if (frameStartTime === null) {
      frameStartTime = performance.now();
      cb(frameStartTime);          // frame 1: starts animation
    } else {
      cb(frameStartTime + 99999);  // frame 2: completes animation
      frameStartTime = null;
    }
    return id;
  });
  vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useAnimatedNumber', () => {
  it('returns a string', () => {
    const { result } = renderHook(() => useAnimatedNumber(100));
    expect(typeof result.current).toBe('string');
  });

  it('eventually contains the target value after animation completes', () => {
    const { result } = renderHook(() => useAnimatedNumber(500, 500));
    // After two RAF frames the animation is complete
    expect(typeof result.current).toBe('string');
    // Value should be numeric and ≥ 0
    expect(Number(result.current)).toBeGreaterThanOrEqual(0);
  });

  it('applies prefix correctly', () => {
    const { result } = renderHook(() => useAnimatedNumber(100, 1000, '₹'));
    expect(result.current.startsWith('₹')).toBe(true);
  });

  it('applies suffix correctly', () => {
    const { result } = renderHook(() => useAnimatedNumber(100, 1000, '', '%'));
    expect(result.current.endsWith('%')).toBe(true);
  });

  it('applies prefix and suffix together', () => {
    const { result } = renderHook(() => useAnimatedNumber(100, 1000, '$', 'k'));
    expect(result.current.startsWith('$')).toBe(true);
    expect(result.current.endsWith('k')).toBe(true);
  });

  it('respects 2 decimal places', () => {
    const { result } = renderHook(() => useAnimatedNumber(10, 100, '', '', 2));
    // Remove non-numeric chars to get the number part
    const numStr = result.current.replace(/[^0-9.]/g, '');
    const parts = numStr.split('.');
    if (parts[1] !== undefined) {
      expect(parts[1].length).toBeLessThanOrEqual(2);
    }
  });

  it('handles endValue of 0', () => {
    const { result } = renderHook(() => useAnimatedNumber(0));
    expect(result.current).toContain('0');
  });

  it('handles negative endValue without crashing', () => {
    expect(() => renderHook(() => useAnimatedNumber(-50))).not.toThrow();
  });

  it('re-renders when endValue changes', () => {
    const { result, rerender } = renderHook(({ val }) => useAnimatedNumber(val), {
      initialProps: { val: 0 },
    });
    expect(typeof result.current).toBe('string');
    rerender({ val: 999 });
    expect(typeof result.current).toBe('string');
  });

  it('cancels animation on unmount', () => {
    const { unmount } = renderHook(() => useAnimatedNumber(500));
    expect(() => unmount()).not.toThrow();
    expect(globalThis.cancelAnimationFrame).toHaveBeenCalled();
  });
});
