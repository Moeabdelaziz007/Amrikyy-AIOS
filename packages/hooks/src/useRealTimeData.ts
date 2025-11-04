import { useEffect, useState, useCallback } from 'react';

export interface UseRealTimeDataOptions {
  interval?: number; // milliseconds
  onError?: (error: Error) => void;
  enabled?: boolean;
}

export interface UseRealTimeDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching and polling real-time data at specified intervals
 * @param fetchFn - Async function that fetches the data
 * @param options - Configuration options
 * @returns Object with data, loading state, error, and refetch function
 */
export function useRealTimeData<T>(
  fetchFn: () => Promise<T>,
  options: UseRealTimeDataOptions = {}
): UseRealTimeDataReturn<T> {
  const { interval = 30000, onError, enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchFn();
      setData(result);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, onError]);

  useEffect(() => {
    if (!enabled) return;

    fetchData();
    const timer = setInterval(fetchData, interval);
    return () => clearInterval(timer);
  }, [fetchData, interval, enabled]);

  return { data, loading, error, refetch: fetchData };
}
