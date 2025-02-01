import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseApiResponse<T> extends ApiState<T> {
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<T>
): UseApiResponse<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const execute = useCallback(
    async (...args: any[]) => {
      try {
        setState({ data: null, loading: true, error: null });
        const data = await apiFunction(...args);
        setState({ data, loading: false, error: null });
      } catch (error) {
        setState({ data: null, loading: false, error: error as Error });
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}