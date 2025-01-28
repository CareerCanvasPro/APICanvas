import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ICacheService, CacheItem } from '../../common/interfaces/cache.interface';
import { CacheUtil } from '../../common/utils/cache.util';
import { CacheValidator } from '../../validators/cache.validator';
import { cacheConfig } from '../../config/cache.config';

@Injectable()
export class CacheService implements ICacheService {
  private cache = new Map<string, CacheItem>();
  private readonly TTL = cacheConfig.defaultTTL;

  constructor(private readonly validator: CacheValidator) {}

  set(key: string, value: any, ttl: number = this.TTL) {
    if (!this.validator.validateKey(key) || !this.validator.validateTTL(ttl)) {
      throw new Error('Invalid cache parameters');
    }

    this.cache.set(key, {
      value,
      expiry: CacheUtil.calculateExpiry(ttl)
    });
  }

  get(key: string) {
    if (!this.validator.validateKey(key)) {
      throw new Error('Invalid cache key');
    }

    const item = this.cache.get(key);
    if (!item) return null;
    if (CacheUtil.isExpired(item.expiry)) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }
}