import React from 'react';
import { ErrorFallback } from './ErrorFallback';

interface ErrorStateProps {
  error?: Error;
  resetError?: () => void;
}

export const NetworkError: React.FC<ErrorStateProps> = ({ error, resetError }) => (
  <ErrorFallback
    error={error}
    resetError={resetError}
    message="Network connection error"
    showBackButton={false}
  />
);

export const NotFoundError: React.FC = () => (
  <ErrorFallback
    message="Resource not found"
    showReset={false}
  />
);

export const PermissionError: React.FC = () => (
  <ErrorFallback
    message="You don't have permission to access this resource"
    showReset={false}
  />
);

export const ServerError: React.FC<ErrorStateProps> = ({ error, resetError }) => (
  <ErrorFallback
    error={error}
    resetError={resetError}
    message="Server error occurred"
  />
);

export const ValidationError: React.FC<ErrorStateProps> = ({ error }) => (
  <ErrorFallback
    error={error}
    message="Validation error"
    showReset={false}
  />
);