import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { DynamoDBService } from '../../infrastructure/dynamodb/dynamodb.service';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [DynamoDBService],
})
export class HealthModule {}