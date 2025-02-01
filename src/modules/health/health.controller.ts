import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, HealthIndicatorResult } from '@nestjs/terminus';
import { DynamoDBHealthIndicator } from './dynamodb.health';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private dynamoDBHealth: DynamoDBHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.dynamoDBHealth.isHealthy('dynamodb'),
    ]);
  }
}