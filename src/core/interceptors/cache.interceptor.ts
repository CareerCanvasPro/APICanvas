import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as NodeCache from 'node-cache';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({ stdTTL: 300 }); // 5 minutes default TTL
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const cacheKey = `${request.url}-${JSON.stringify(request.query)}`;
    const cachedResponse = this.cache.get(cacheKey);

    if (cachedResponse) {
      return of(cachedResponse);
    }

    return next.handle().pipe(
      tap(response => {
        this.cache.set(cacheKey, response);
      }),
    );
  }
}