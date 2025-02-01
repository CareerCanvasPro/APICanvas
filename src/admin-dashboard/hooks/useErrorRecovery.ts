import { useState, useCallback, useEffect } from 'react';
import { errorRecovery } from '../services/errorRecovery';

export const useErrorRecovery = () => {
  const [recovering, setRecovering] = useState(false);
  const [recoveryStatus, setRecoveryStatus] = useState<string>('idle');

  useEffect(() => {
    const subscription = errorRecovery.getRecoveryStatus().subscribe(status => {
      setRecoveryStatus(status);
      setRecovering(status === 'recovering');
    });

    return () => subscription.unsubscribe();
  }, []);

  const attemptRecovery = useCallback(async (errorType: string) => {
    setRecovering(true);
    const success = await errorRecovery.recover(errorType);
    setRecovering(false);
    return success;
  }, []);

  const resetRecovery = useCallback((errorType: string) => {
    errorRecovery.resetAttempts(errorType);
  }, []);

  return {
    recovering,
    recoveryStatus,
    attemptRecovery,
    resetRecovery
  };
};