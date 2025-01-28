export class CacheUtil {
  static isExpired(expiry: number): boolean {
    return Date.now() > expiry;
  }

  static calculateExpiry(ttl: number): number {
    return Date.now() + (ttl * 1000);
  }
}