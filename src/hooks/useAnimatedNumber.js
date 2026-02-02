import { useState, useEffect, useRef, useMemo } from 'react';

/**
 * Custom hook for animating numbers
 * @param {number} endValue - The final value to animate to
 * @param {number} duration - Animation duration in milliseconds
 * @param {string} prefix - Prefix to add (e.g., '$')
 * @param {string} suffix - Suffix to add (e.g., 'k', '%')
 * @param {number} decimals - Number of decimal places
 * @returns {string} - The animated value as a formatted string
 */
const useAnimatedNumber = (endValue, duration = 1000, prefix = '', suffix = '', decimals = 0) => {
  const [displayValue, setDisplayValue] = useState(0);
  const startTimeRef = useRef(null);
  const animationRef = useRef(null);
  const previousValueRef = useRef(0);

  useEffect(() => {
    const startValue = previousValueRef.current;
    const difference = endValue - startValue;

    const animate = (currentTime) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Smoother ease-out function
      const easeOut = 1 - Math.pow(1 - progress, 4); // quartic ease-out
      const currentValue = startValue + difference * easeOut;

      // Only update state if the value has changed significantly
      const roundedValue = parseFloat(currentValue.toFixed(decimals));
      if (roundedValue !== displayValue) {
        setDisplayValue(roundedValue);
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        previousValueRef.current = endValue;
        startTimeRef.current = null;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [endValue, duration, decimals]);

  // Memoize the formatted value to avoid recalculating it on every render
  const formattedValue = useMemo(
    () => `${prefix}${displayValue.toFixed(decimals)}${suffix}`,
    [displayValue, prefix, suffix, decimals]
  );

  return formattedValue;
};

export default useAnimatedNumber;
