import { CloudWatch } from 'aws-sdk';

export class PerformanceAlerts {
  private cloudwatch: CloudWatch;

  constructor() {
    this.cloudwatch = new CloudWatch({
      region: process.env.AWS_REGION || 'us-east-1'
    });
  }

  async setupAlerts() {
    const alerts = [
      {
        AlarmName: 'HighLatency',
        MetricName: 'AverageLatency',
        Namespace: 'CareerCanvas/APIManagement/Performance',
        Period: 300,
        EvaluationPeriods: 2,
        Threshold: 1000,
        ComparisonOperator: 'GreaterThanThreshold',
        AlarmDescription: 'API latency is above 1000ms'
      },
      {
        AlarmName: 'LowThroughput',
        MetricName: 'Throughput',
        Namespace: 'CareerCanvas/APIManagement/Performance',
        Period: 300,
        EvaluationPeriods: 2,
        Threshold: 10,
        ComparisonOperator: 'LessThanThreshold',
        AlarmDescription: 'API throughput is below 10 requests/second'
      },
      {
        AlarmName: 'HighErrorRate',
        MetricName: 'ErrorRate',
        Namespace: 'CareerCanvas/APIManagement/Performance',
        Period: 300,
        EvaluationPeriods: 1,
        Threshold: 5,
        ComparisonOperator: 'GreaterThanThreshold',
        AlarmDescription: 'Error rate is above 5%'
      }
    ];

    for (const alert of alerts) {
      await this.cloudwatch.putMetricAlarm(alert).promise();
    }
  }
}