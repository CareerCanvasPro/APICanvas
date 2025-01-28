import { Module } from '@nestjs/common';
import { ApiController } from './controllers/api.controller';
import { TokenController } from './controllers/token.controller';
import { MetricsController } from './controllers/metrics.controller';
import { ApiService } from './services/api.service';
import { TokenService } from './services/token.service';
import { MetricsService } from './services/metrics.service';
import { RateLimitService } from './services/rate-limit.service';
import { DynamoDBService } from './utils/dynamodb.service';

@Module({
  imports: [],
  controllers: [
    ApiController,
    TokenController,
    MetricsController,
  ],
  providers: [
    ApiService,
    TokenService,
    MetricsService,
    RateLimitService,
    DynamoDBService,
  ],
})
export class AppModule {}