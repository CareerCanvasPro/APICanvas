import { Injectable } from '@nestjs/common';
import { DynamoDBService } from '../../infrastructure/dynamodb/dynamodb.service';
import { TABLES } from '../../infrastructure/dynamodb/tables';

@Injectable()
export class MetricsService {
  constructor(private readonly dynamoDBService: DynamoDBService) {}

  async getDailyMetrics(apiId: string, date?: string) {
    const params = {
      TableName: TABLES.METRICS,
      KeyConditionExpression: 'apiId = :apiId and begins_with(timestamp, :date)',
      ExpressionAttributeValues: {
        ':apiId': apiId,
        ':date': date || new Date().toISOString().split('T')[0]
      }
    };

    return this.dynamoDBService.query(params);
  }

  async getMonthlyMetrics(apiId: string, month?: string) {
    const currentMonth = month || new Date().toISOString().slice(0, 7);
    const params = {
      TableName: TABLES.METRICS,
      KeyConditionExpression: 'apiId = :apiId and begins_with(timestamp, :month)',
      ExpressionAttributeValues: {
        ':apiId': apiId,
        ':month': currentMonth
      }
    };

    return this.dynamoDBService.query(params);
  }

  async getMetricsSummary(apiId: string) {
    const params = {
      TableName: TABLES.METRICS,
      KeyConditionExpression: 'apiId = :apiId',
      ExpressionAttributeValues: {
        ':apiId': apiId
      },
      Limit: 100
    };

    return this.dynamoDBService.query(params);
  }
}