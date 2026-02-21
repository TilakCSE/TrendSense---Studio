import { useState, useEffect, useRef } from 'react';

interface UseCountUpOptions {
  start?: number;
  end: number;
  duration?: number;
  delay?: number;
  easing?: (t: number) => number;
}

// Easing functions
const easings = {
  linear: (t: number) => t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  easeOutExpo: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
};

export function useCountUp({
  start = 0,
  end,
  duration = 1500,
  delay = 0,
  easing = easings.easeOutExpo,
}: UseCountUpOptions) {
  const [value, setValue] = useState(start);
  const [isComplete, setIsComplete] = useState(false);
  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const animate = (timestamp: number) => {
        if (startTimeRef.current === null) {
          startTimeRef.current = timestamp;
        }

        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easing(progress);
        const currentValue = Math.round(start + (end - start) * easedProgress);

        setValue(currentValue);

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animate);
        } else {
          setIsComplete(true);
        }
      };

      frameRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [start, end, duration, delay, easing]);

  return { value, isComplete };
}

export function useAnimatedValue(
  targetValue: number,
  options: Omit<UseCountUpOptions, 'end'> = {}
) {
  return useCountUp({ end: targetValue, ...options });
}
