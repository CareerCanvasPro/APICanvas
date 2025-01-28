import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async validateAdmin(username: string, password: string): Promise<boolean> {
    // TODO: Replace with actual admin validation logic
    return username === 'admin' && password === 'admin123';
  }

  async generateTokens(username: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(username),
      this.generateRefreshToken(username)
    ]);

    return {
      accessToken,
      refreshToken
    };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key'
      });
      
      return {
        accessToken: await this.generateAccessToken(payload.username)
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateAccessToken(username: string): Promise<string> {
    const payload = { username, role: 'admin', type: 'access' };
    return this.jwtService.sign(payload, {
      expiresIn: '1h'
    });
  }

  private async generateRefreshToken(username: string): Promise<string> {
    const payload = { username, type: 'refresh' };
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
      expiresIn: '7d'
    });
  }
}