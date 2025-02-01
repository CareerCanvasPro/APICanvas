import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { DynamoDBService } from '../../infrastructure/dynamodb/dynamodb.service';
import { TABLES } from '../../infrastructure/dynamodb/tables';

@Injectable()
export class DynamoDBHealthIndicator extends HealthIndicator {
  constructor(private readonly dynamoDBService: DynamoDBService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.dynamoDBService.get({
        TableName: TABLES.APIS,
        Key: { id: 'health-check' }
      });

      return this.getStatus(key, true);
    } catch (error) {
      return this.getStatus(key, false, { message: error.message });
    }
  }
}