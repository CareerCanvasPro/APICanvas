import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenMetricsService {
  private metrics = {
    totalBlacklisted: 0,
    activeBlacklisted: 0,
    cleanupOperations: 0,
    tokenValidations: 0,
    lastCleanup: null as Date | null
  };

  incrementBlacklisted(): void {
    this.metrics.totalBlacklisted++;
    this.metrics.activeBlacklisted++;
  }

  decrementActiveBlacklisted(count: number): void {
    this.metrics.activeBlacklisted = Math.max(0, this.metrics.activeBlacklisted - count);
    this.metrics.cleanupOperations++;
    this.metrics.lastCleanup = new Date();
  }

  incrementValidations(): void {
    this.metrics.tokenValidations++;
  }

  getMetrics() {
    return { ...this.metrics };
  }
}