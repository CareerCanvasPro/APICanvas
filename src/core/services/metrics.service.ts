import { Injectable } from '@nestjs/common';
import { CloudWatch } from 'aws-sdk';

@Injectable()
export class MetricsService {
  private cloudwatch: CloudWatch;

  constructor() {
    this.cloudwatch = new CloudWatch({
      region: process.env.AWS_REGION || 'us-east-1'
    });
  }

  async publishMetric(
    metricName: string,
    value: number,
    dimensions: { [key: string]: string }
  ): Promise<void> {
    await this.cloudwatch.putMetricData({
      Namespace: 'CareerCanvas/APIManagement',
      MetricData: [{
        MetricName: metricName,
        Value: value,
        Timestamp: new Date(),
        Dimensions: Object.entries(dimensions).map(([Name, Value]) => ({
          Name,
          Value
        }))
      }]
    }).promise();
  }

  async trackAPIRequest(apiId: string, latency: number, hasError: boolean): Promise<void> {
    const dimensions = { ApiId: apiId };
    
    await Promise.all([
      this.publishMetric('APIRequests', 1, dimensions),
      this.publishMetric('Latency', latency, dimensions),
      hasError && this.publishMetric('Errors', 1, dimensions)
    ]);
  }

  async trackTokenUsage(tokenId: string, apiId: string, rateLimitExceeded: boolean): Promise<void> {
    const dimensions = { TokenId: tokenId, ApiId: apiId };
    
    await Promise.all([
      this.publishMetric('TokenUsage', 1, dimensions),
      rateLimitExceeded && this.publishMetric('RateLimitExceeded', 1, dimensions)
    ]);
  }
}