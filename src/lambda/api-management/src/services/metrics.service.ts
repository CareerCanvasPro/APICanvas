import { Injectable } from '@nestjs/common';
import { DynamoDBService } from '../utils/dynamodb.service';
import { MetricsQueryDto, MetricsResponseDto } from '../dto/metrics.dto';

@Injectable()
export class MetricsService {
  constructor(private readonly dynamoDBService: DynamoDBService) {}

  private readonly tableName = process.env.METRICS_TABLE!;

  async getMetrics(apiId: string, query: MetricsQueryDto): Promise<MetricsResponseDto> {
    const result = await this.dynamoDBService.query({
      TableName: this.tableName,
      KeyConditionExpression: 'api_id = :apiId AND #ts BETWEEN :start AND :end',
      ExpressionAttributeNames: {
        '#ts': 'timestamp'
      },
      ExpressionAttributeValues: {
        ':apiId': apiId,
        ':start': query.start_date,
        ':end': query.end_date || new Date().toISOString()
      }
    });

    return this.aggregateMetrics(result.Items, 'all');
  }

  async getDailyMetrics(apiId: string, query: MetricsQueryDto): Promise<MetricsResponseDto[]> {
    const result = await this.getMetrics(apiId, query);
    return this.groupByPeriod(result, 'daily');
  }

  async getMonthlyMetrics(apiId: string, query: MetricsQueryDto): Promise<MetricsResponseDto[]> {
    const result = await this.getMetrics(apiId, query);
    return this.groupByPeriod(result, 'monthly');
  }

  private aggregateMetrics(items: any[], period: string): MetricsResponseDto {
    const total = items.length;
    return {
      api_id: items[0]?.api_id,
      period,
      total_requests: total,
      error_rate: items.filter(i => i.errors > 0).length / total,
      avg_latency: items.reduce((acc, i) => acc + i.latency, 0) / total,
      rate_limit_violations: items.filter(i => i.rate_limit_hits > 0).length
    };
  }

  private groupByPeriod(metrics: any, period: 'daily' | 'monthly'): MetricsResponseDto[] {
    // Implementation of grouping logic based on period
    return [];
  }
}