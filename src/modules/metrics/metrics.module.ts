import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { DynamoDBService } from '../../infrastructure/dynamodb/dynamodb.service';

@Module({
  controllers: [MetricsController],
  providers: [MetricsService, DynamoDBService],
  exports: [MetricsService]
})
export class MetricsModule {}