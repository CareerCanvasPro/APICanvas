import { BehaviorSubject } from 'rxjs';

interface ErrorMetrics {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsByComponent: Record<string, number>;
  errorTimeline: Array<{ timestamp: Date; count: number }>;
  averageRecoveryTime: number;
}

class ErrorAnalytics {
  private static instance: ErrorAnalytics;
  private metrics = new BehaviorSubject<ErrorMetrics>({
    totalErrors: 0,
    errorsByType: {},
    errorsByComponent: {},
    errorTimeline: [],
    averageRecoveryTime: 0
  });

  private recoveryTimes: number[] = [];
  private timelineInterval = 3600000; // 1 hour in milliseconds

  private constructor() {
    this.initializeTimeline();
  }

  public static getInstance(): ErrorAnalytics {
    if (!ErrorAnalytics.instance) {
      ErrorAnalytics.instance = new ErrorAnalytics();
    }
    return ErrorAnalytics.instance;
  }

  public trackError(error: Error, component?: string) {
    const currentMetrics = this.metrics.value;
    const errorType = error.name || 'Unknown';

    // Update total errors
    currentMetrics.totalErrors += 1;

    // Update errors by type
    currentMetrics.errorsByType[errorType] = 
      (currentMetrics.errorsByType[errorType] || 0) + 1;

    // Update errors by component
    if (component) {
      currentMetrics.errorsByComponent[component] = 
        (currentMetrics.errorsByComponent[component] || 0) + 1;
    }

    // Update timeline
    const now = new Date();
    const timelineEntry = currentMetrics.errorTimeline.find(
      entry => Math.abs(entry.timestamp.getTime() - now.getTime()) < this.timelineInterval
    );

    if (timelineEntry) {
      timelineEntry.count += 1;
    } else {
      currentMetrics.errorTimeline.push({ timestamp: now, count: 1 });
    }

    this.metrics.next(currentMetrics);
  }

  public trackRecovery(duration: number) {
    this.recoveryTimes.push(duration);
    
    const currentMetrics = this.metrics.value;
    currentMetrics.averageRecoveryTime = 
      this.recoveryTimes.reduce((a, b) => a + b, 0) / this.recoveryTimes.length;
    
    this.metrics.next(currentMetrics);
  }

  public getMetrics() {
    return this.metrics.asObservable();
  }

  public getErrorRate(timeframe: number = 3600000): number {
    const currentMetrics = this.metrics.value;
    const now = new Date();
    const errorsInTimeframe = currentMetrics.errorTimeline.filter(
      entry => now.getTime() - entry.timestamp.getTime() < timeframe
    );

    return errorsInTimeframe.reduce((total, entry) => total + entry.count, 0);
  }

  private initializeTimeline() {
    setInterval(() => {
      const currentMetrics = this.metrics.value;
      const now = new Date();
      
      // Remove entries older than 24 hours
      currentMetrics.errorTimeline = currentMetrics.errorTimeline.filter(
        entry => now.getTime() - entry.timestamp.getTime() < 86400000
      );
      
      this.metrics.next(currentMetrics);
    }, this.timelineInterval);
  }
}

export const errorAnalytics = ErrorAnalytics.getInstance();