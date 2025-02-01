import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { RateLimitService } from '../services/rate-limit.service';
import { TokenService } from '../../modules/token/token.service';

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
      throw new HttpException('API key is required', HttpStatus.UNAUTHORIZED);
    }

    const token = await this.tokenService.validateToken(apiKey);
    const isAllowed = await this.rateLimitService.checkRateLimit(token.apiId, token.id);

    if (!isAllowed) {
      throw new HttpException('Rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
    }

    return true;
  }
}