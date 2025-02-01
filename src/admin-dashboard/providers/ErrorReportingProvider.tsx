import React, { useEffect } from 'react';
import { errorReporting } from '../services/errorReporting';

interface ErrorReportingProviderProps {
  children: React.ReactNode;
  dsn: string;
}

export const ErrorReportingProvider: React.FC<ErrorReportingProviderProps> = ({
  children,
  dsn
}) => {
  useEffect(() => {
    errorReporting.init(dsn);
  }, [dsn]);

  return <>{children}</>;
};