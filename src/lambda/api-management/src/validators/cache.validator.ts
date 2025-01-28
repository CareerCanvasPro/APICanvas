import { Injectable } from '@nestjs/common';

@Injectable()
export class CacheValidator {
  validateKey(key: string): boolean {
    return typeof key === 'string' && key.length > 0;
  }

  validateTTL(ttl: number): boolean {
    return typeof ttl === 'number' && ttl > 0;
  }
}