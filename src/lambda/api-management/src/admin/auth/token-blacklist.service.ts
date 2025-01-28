import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenMetricsService } from '../metrics/token-metrics.service';

interface BlacklistedToken {
  token: string;
  expiresAt: number;
}

@Injectable()
export class TokenBlacklistService implements OnModuleInit, OnModuleDestroy {
  private blacklistedTokens: Map<string, BlacklistedToken> = new Map();
  private cleanupInterval: NodeJS.Timer;

  constructor(
    private readonly jwtService: JwtService,
    private readonly metricsService: TokenMetricsService
  ) {}

  onModuleInit() {
    this.cleanupInterval = setInterval(() => this.removeExpiredTokens(), 3600000);
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  async blacklist(token: string): Promise<void> {
    try {
      const decoded = this.jwtService.decode(token);
      if (decoded && typeof decoded === 'object' && decoded.exp) {
        this.blacklistedTokens.set(token, {
          token,
          expiresAt: decoded.exp * 1000
        });
        this.metricsService.incrementBlacklisted();
      }
    } catch (error) {
      console.error('Error blacklisting token:', error);
    }
  }

  async isBlacklisted(token: string): Promise<boolean> {
    this.metricsService.incrementValidations();
    return this.blacklistedTokens.has(token);
  }

  private async removeExpiredTokens(): Promise<void> {
    const now = Date.now();
    let removedCount = 0;
    
    for (const [token, data] of this.blacklistedTokens.entries()) {
      if (data.expiresAt < now) {
        this.blacklistedTokens.delete(token);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      this.metricsService.decrementActiveBlacklisted(removedCount);
    }
  }
}