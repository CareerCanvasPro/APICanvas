import { useCallback } from 'react';
import { errorReporting } from '../services/errorReporting';
import { useAuth } from './useAuth';

export const useErrorReporting = (component?: string) => {
  const { user } = useAuth();

  const reportError = useCallback((
    error: Error,
    action?: string,
    additionalData?: Record<string, any>
  ) => {
    errorReporting.reportError(error, {
      userId: user?.id,
      component,
      action,
      additionalData
    });
  }, [user?.id, component]);

  return { reportError };
};