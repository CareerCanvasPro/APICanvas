import { captureException, init as initSentry } from '@sentry/react';

interface ErrorMetadata {
  userId?: string;
  component?: string;
  action?: string;
  additionalData?: Record<string, any>;
}

class ErrorReportingService {
  private static instance: ErrorReportingService;
  private initialized: boolean = false;

  private constructor() {
    // Singleton pattern
  }

  public static getInstance(): ErrorReportingService {
    if (!ErrorReportingService.instance) {
      ErrorReportingService.instance = new ErrorReportingService();
    }
    return ErrorReportingService.instance;
  }

  public init(dsn: string) {
    if (this.initialized) return;

    initSentry({
      dsn,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
      integrations: [
        new BrowserTracing(),
      ],
    });

    this.initialized = true;
  }

  public reportError(error: Error, metadata?: ErrorMetadata) {
    if (!this.initialized) {
      console.warn('Error reporting service not initialized');
      return;
    }

    captureException(error, {
      extra: metadata,
      tags: {
        component: metadata?.component,
        action: metadata?.action
      },
      user: metadata?.userId ? { id: metadata.userId } : undefined
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error:', error);
      console.error('Metadata:', metadata);
    }
  }

  public setUser(userId: string, email?: string) {
    if (!this.initialized) return;

    Sentry.setUser({
      id: userId,
      email
    });
  }

  public clearUser() {
    if (!this.initialized) return;
    Sentry.setUser(null);
  }
}

export const errorReporting = ErrorReportingService.getInstance();