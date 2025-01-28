export interface CacheItem {
  value: any;
  expiry: number;
}

export interface ICacheService {
  set(key: string, value: any, ttl?: number): void;
  get(key: string): any;
}