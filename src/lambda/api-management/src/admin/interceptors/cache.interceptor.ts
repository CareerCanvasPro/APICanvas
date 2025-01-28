import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CacheMonitorService } from '../services/cache-monitor.service';
import { PerformanceMonitorService } from '../services/performance-monitor.service';

@Injectable()
export class MetricsCacheInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly cacheMonitor: CacheMonitorService,
    private readonly performanceMonitor: PerformanceMonitorService
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const cacheKey = `metrics_${request.url}`;
    const startTime = Date.now();

    const cachedData = await this.cacheManager.get(cacheKey);

    if (cachedData) {
      const hitDuration = Date.now() - startTime;
      this.performanceMonitor.recordCacheHitTime(hitDuration);
      this.cacheMonitor.recordHit(cacheKey);
      return of(cachedData);
    }

    const missDuration = Date.now() - startTime;
    this.performanceMonitor.recordCacheMissTime(missDuration);
    this.cacheMonitor.recordMiss(cacheKey);

    return next.handle().pipe(
      tap(async (response) => {
        const writeStart = Date.now();
        await this.cacheManager.set(cacheKey, response, 30000);
        const writeDuration = Date.now() - writeStart;
        this.performanceMonitor.recordCacheWriteTime(writeDuration);
      })
    );
  }
}