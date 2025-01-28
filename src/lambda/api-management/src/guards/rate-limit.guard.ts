import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { RateLimitService } from '../services/rate-limit.service';
import { TokenService } from '../services/token.service';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly rateLimitService: RateLimitService,
    private readonly tokenService: TokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    
    if (!apiKey) {
      return true; // Skip rate limiting if no API key (ApiKeyGuard will handle this)
    }

    try {
      const token = await this.tokenService.getToken(apiKey);
      const api = await this.rateLimitService.getApiDetails(token.api_id);
      
      if (!api) {
        throw new HttpException('API not found', HttpStatus.NOT_FOUND);
      }
      
      const isWithinLimit = await this.rateLimitService.checkRateLimit(apiKey, api);
      
      if (!isWithinLimit) {
        throw new HttpException('Rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
      }

      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Rate limit check failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}