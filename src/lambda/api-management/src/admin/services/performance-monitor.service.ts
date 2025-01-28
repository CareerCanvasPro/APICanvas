import { Injectable } from '@nestjs/common';

interface PerformanceMetrics {
  cacheHitTime: number[];
  cacheMissTime: number[];
  cacheWriteTime: number[];
}

@Injectable()
export class PerformanceMonitorService {
  private metrics: PerformanceMetrics = {
    cacheHitTime: [],
    cacheMissTime: [],
    cacheWriteTime: []
  };

  recordCacheHitTime(duration: number): void {
    this.metrics.cacheHitTime.push(duration);
    this.trimMetrics();
  }

  recordCacheMissTime(duration: number): void {
    this.metrics.cacheMissTime.push(duration);
    this.trimMetrics();
  }

  recordCacheWriteTime(duration: number): void {
    this.metrics.cacheWriteTime.push(duration);
    this.trimMetrics();
  }

  getPerformanceStats() {
    return {
      cacheHit: this.calculateStats(this.metrics.cacheHitTime),
      cacheMiss: this.calculateStats(this.metrics.cacheMissTime),
      cacheWrite: this.calculateStats(this.metrics.cacheWriteTime)
    };
  }

  private calculateStats(times: number[]) {
    if (times.length === 0) return { avg: 0, min: 0, max: 0 };
    return {
      avg: times.reduce((a, b) => a + b) / times.length,
      min: Math.min(...times),
      max: Math.max(...times)
    };
  }

  private trimMetrics() {
    const maxSize = 1000;
    Object.values(this.metrics).forEach(array => {
      if (array.length > maxSize) {
        array.splice(0, array.length - maxSize);
      }
    });
  }
}