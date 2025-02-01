import { useState, useCallback } from 'react';

interface ErrorState {
  error: Error | null;
  componentStack?: string;
}

export const useErrorHandler = () => {
  const [errorState, setErrorState] = useState<ErrorState>({ error: null });

  const handleError = useCallback((error: Error) => {
    setErrorState({
      error,
      componentStack: error.stack
    });
  }, []);

  const clearError = useCallback(() => {
    setErrorState({ error: null });
  }, []);

  return {
    error: errorState.error,
    componentStack: errorState.componentStack,
    handleError,
    clearError
  };
};