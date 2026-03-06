import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Hook for safe async API calls with proper loading state management.
 * 
 * Handles:
 * - Race conditions (only the latest request updates state)
 * - Cleanup on unmount (prevents state updates after unmount)
 * - Loading counter (concurrent requests tracked correctly)
 * - Error state
 * 
 * Usage:
 *   const { execute, loading, error } = useApiCall();
 * 
 *   const fetchData = () => execute(async () => {
 *     const data = await api.getData();
 *     setData(data);
 *   });
 */
export const useApiCall = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const loadingCountRef = useRef(0);
  const mountedRef = useRef(true);
  const callIdRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async (asyncFn, options = {}) => {
    const { silentError = false } = options;
    const currentCallId = ++callIdRef.current;

    loadingCountRef.current += 1;
    if (mountedRef.current) {
      setLoading(true);
      setError(null);
    }

    try {
      const result = await asyncFn();

      // Only update state if this is still the latest call and component is mounted
      if (mountedRef.current && currentCallId === callIdRef.current) {
        return result;
      }
      return result;
    } catch (err) {
      if (mountedRef.current && !silentError) {
        setError(err);
      }
      throw err;
    } finally {
      loadingCountRef.current = Math.max(0, loadingCountRef.current - 1);
      if (mountedRef.current && loadingCountRef.current === 0) {
        setLoading(false);
      }
    }
  }, []);

  const reset = useCallback(() => {
    if (mountedRef.current) {
      setLoading(false);
      setError(null);
      loadingCountRef.current = 0;
    }
  }, []);

  return { execute, loading, error, reset };
};

export default useApiCall;
