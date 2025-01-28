import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { TokenService } from '../services/token.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    const isValid = await this.tokenService.validateToken(apiKey);
    if (!isValid) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }
}