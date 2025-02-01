import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { TokenService } from '../../modules/token/token.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    const adminKey = request.headers['x-admin-key'];

    if (adminKey === process.env.CAREERCANVAS_ADMIN_KEY) {
      return true;
    }

    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    await this.tokenService.validateToken(apiKey);
    return true;
  }
}