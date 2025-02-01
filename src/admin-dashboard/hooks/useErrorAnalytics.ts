import { useState, useEffect, useCallback } from 'react';
import { errorAnalytics } from '../services/errorAnalytics';
import type { ErrorMetrics } from '../types/error.types';

export const useErrorAnalytics = () => {
  const [metrics, setMetrics] = useState<ErrorMetrics | null>(null);
  const [errorRate, setErrorRate] = useState<number>(0);

  useEffect(() => {
    const subscription = errorAnalytics.getMetrics().subscribe(setMetrics);
    
    // Update error rate every minute
    const interval = setInterval(() => {
      setErrorRate(errorAnalytics.getErrorRate());
    }, 60000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const trackError = useCallback((error: Error, component?: string) => {
    errorAnalytics.trackError(error, component);
  }, []);

  const trackRecovery = useCallback((duration: number) => {
    errorAnalytics.trackRecovery(duration);
  }, []);

  return {
    metrics,
    errorRate,
    trackError,
    trackRecovery
  };
};