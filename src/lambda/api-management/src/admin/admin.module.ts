import { Module, MiddlewareConsumer } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { TokenBlacklistService } from './auth/token-blacklist.service';
import { AdminGuard } from './admin.guard';
import { ApiModule } from '../api/api.module';
import { CacheService } from './services/cache.service';
import { CacheValidator } from '../validators/cache.validator';
import { CacheMiddleware } from '../middleware/cache.middleware';

@Module({
  imports: [
    ApiModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1h' },
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
  ],
  controllers: [AdminController, AuthController],
  providers: [
    AdminService, 
    AuthService, 
    AdminGuard, 
    TokenBlacklistService,
    CacheService,
    CacheValidator
  ],
  exports: [AuthService, TokenBlacklistService, CacheService],
})
export class AdminModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CacheMiddleware)
      .forRoutes('*');
  }
}