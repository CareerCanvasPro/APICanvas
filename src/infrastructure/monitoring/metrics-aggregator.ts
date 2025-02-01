import { CloudWatch, DynamoDB } from 'aws-sdk';

export class MetricsAggregator {
  private cloudwatch: CloudWatch;
  private dynamodb: DynamoDB;

  constructor() {
    const region = process.env.AWS_REGION || 'us-east-1';
    this.cloudwatch = new CloudWatch({ region });
    this.dynamodb = new DynamoDB({ region });
  }

  async aggregateMetrics() {
    const metrics = await Promise.all([
      this.getApiMetrics(),
      this.getInfrastructureMetrics(),
      this.getPerformanceMetrics()
    ]);

    await this.storeAggregatedMetrics(metrics);
    return this.generateMetricsSummary(metrics);
  }

  private async getApiMetrics() {
    return this.cloudwatch.getMetricData({
      MetricDataQueries: [
        {
          Id: 'apiRequests',
          MetricStat: {
            Metric: {
              Namespace: 'CareerCanvas/APIManagement',
              MetricName: 'RequestCount'
            },
            Period: 3600,
            Stat: 'Sum'
          }
        },
        {
          Id: 'apiLatency',
          MetricStat: {
            Metric: {
              Namespace: 'CareerCanvas/APIManagement',
              MetricName: 'Latency'
            },
            Period: 3600,
            Stat: 'Average'
          }
        }
      ],
      StartTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
      EndTime: new Date()
    }).promise();
  }

  private async getInfrastructureMetrics() {
    return this.cloudwatch.getMetricData({
      MetricDataQueries: [
        {
          Id: 'cpuUtilization',
          MetricStat: {
            Metric: {
              Namespace: 'AWS/EC2',
              MetricName: 'CPUUtilization'
            },
            Period: 3600,
            Stat: 'Average'
          }
        },
        {
          Id: 'memoryUtilization',
          Expression: 'SELECT AVG(MemoryUtilization) FROM SCHEMA("CWAgent", InstanceId)',
          Period: 3600
        }
      ],
      StartTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
      EndTime: new Date()
    }).promise();
  }

  private async getPerformanceMetrics() {
    return this.cloudwatch.getMetricData({
      MetricDataQueries: [
        {
          Id: 'databaseConnections',
          MetricStat: {
            Metric: {
              Namespace: 'AWS/RDS',
              MetricName: 'DatabaseConnections'
            },
            Period: 3600,
            Stat: 'Average'
          }
        },
        {
          Id: 'dynamoDBThrottles',
          MetricStat: {
            Metric: {
              Namespace: 'AWS/DynamoDB',
              MetricName: 'ThrottledRequests'
            },
            Period: 3600,
            Stat: 'Sum'
          }
        }
      ],
      StartTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
      EndTime: new Date()
    }).promise();
  }

  private async storeAggregatedMetrics(metrics: any[]) {
    const timestamp = new Date().toISOString();
    await this.dynamodb.putItem({
      TableName: 'CareerCanvas-Metrics',
      Item: {
        timestamp: { S: timestamp },
        metrics: { S: JSON.stringify(metrics) }
      }
    }).promise();
  }

  private generateMetricsSummary(metrics: any[]) {
    // Implementation for metrics summary generation
    return {};
  }
}