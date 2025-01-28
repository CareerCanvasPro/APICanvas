import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheMonitorService {
  private metrics = {
    hits: 0,
    misses: 0,
    keys: new Set<string>(),
    lastAccess: null as Date | null,
  };

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  recordHit(key: string): void {
    this.metrics.hits++;
    this.metrics.keys.add(key);
    this.metrics.lastAccess = new Date();
  }

  recordMiss(key: string): void {
    this.metrics.misses++;
    this.metrics.lastAccess = new Date();
  }

  async getCacheStats() {
    return {
      hits: this.metrics.hits,
      misses: this.metrics.misses,
      hitRatio: this.metrics.hits / (this.metrics.hits + this.metrics.misses || 1),
      activeKeys: Array.from(this.metrics.keys),
      keyCount: this.metrics.keys.size,
      lastAccess: this.metrics.lastAccess,
    };
  }
}