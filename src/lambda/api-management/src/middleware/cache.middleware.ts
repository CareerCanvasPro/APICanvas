import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CacheService } from '../admin/services/cache.service';

@Injectable()
export class CacheMiddleware implements NestMiddleware {
  constructor(private cacheService: CacheService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const cacheKey = `${req.method}:${req.url}`;
    const cachedResponse = this.cacheService.get(cacheKey);

    if (cachedResponse) {
      return res.json(cachedResponse);
    }

    next();
  }
}