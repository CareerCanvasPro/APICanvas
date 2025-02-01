import { CloudWatch } from 'aws-sdk';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CustomMetricsCollector {
  private cloudwatch: CloudWatch;
  private metrics: Map<string, number>;

  constructor() {
    this.cloudwatch = new CloudWatch({
      region: process.env.AWS_REGION || 'us-east-1'
    });
    this.metrics = new Map();
  }

  trackApiUsage(apiId: string, responseTime: number, success: boolean) {
    this.incrementMetric(`api_${apiId}_calls`);
    this.incrementMetric(`api_${apiId}_${success ? 'success' : 'error'}`);
    this.recordResponseTime(apiId, responseTime);
  }

  private incrementMetric(key: string) {
    const current = this.metrics.get(key) || 0;
    this.metrics.set(key, current + 1);
  }

  private recordResponseTime(apiId: string, responseTime: number) {
    this.cloudwatch.putMetricData({
      Namespace: 'CareerCanvas/APIManagement/Custom',
      MetricData: [
        {
          MetricName: 'ResponseTime',
          Value: responseTime,
          Unit: 'Milliseconds',
          Dimensions: [
            {
              Name: 'ApiId',
              Value: apiId
            }
          ]
        }
      ]
    }).promise();
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async publishMetrics() {
    const metricData = Array.from(this.metrics.entries()).map(([key, value]) => ({
      MetricName: key,
      Value: value,
      Unit: 'Count',
      Timestamp: new Date()
    }));

    if (metricData.length > 0) {
      await this.cloudwatch.putMetricData({
        Namespace: 'CareerCanvas/APIManagement/Custom',
        MetricData: metricData
      }).promise();

      this.metrics.clear();
    }
  }
}