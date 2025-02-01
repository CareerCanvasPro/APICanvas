import { useState, useCallback, useEffect } from 'react';
import { errorLogger } from '../services/errorLogger';
import type { LogEntry } from '../types/error.types';

export const useErrorLogger = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    const subscription = errorLogger.getLogs().subscribe(setLogs);
    return () => subscription.unsubscribe();
  }, []);

  const logError = useCallback((
    message: string,
    error?: Error,
    context?: Record<string, any>
  ) => {
    errorLogger.log('error', message, error, context);
  }, []);

  const logWarning = useCallback((
    message: string,
    error?: Error,
    context?: Record<string, any>
  ) => {
    errorLogger.log('warn', message, error, context);
  }, []);

  const clearLogs = useCallback(() => {
    errorLogger.clearLogs();
  }, []);

  return {
    logs,
    logError,
    logWarning,
    clearLogs
  };
};