import { CloudWatch } from 'aws-sdk';

const cloudwatch = new CloudWatch({
  region: process.env.AWS_REGION || 'us-east-1'
});

export const createAlerts = async () => {
  const alerts = [
    {
      AlarmName: 'APIHighErrorRate',
      MetricName: 'Errors',
      Namespace: 'CareerCanvas/APIManagement',
      Period: 300,
      EvaluationPeriods: 2,
      Threshold: 5,
      ComparisonOperator: 'GreaterThanThreshold',
      AlarmDescription: 'Alert when API error rate exceeds threshold'
    },
    {
      AlarmName: 'APIHighLatency',
      MetricName: 'Latency',
      Namespace: 'CareerCanvas/APIManagement',
      Period: 300,
      EvaluationPeriods: 2,
      Threshold: 1000,
      ComparisonOperator: 'GreaterThanThreshold',
      AlarmDescription: 'Alert when API latency exceeds 1 second'
    },
    {
      AlarmName: 'TokenRateLimitExceeded',
      MetricName: 'RateLimitExceeded',
      Namespace: 'CareerCanvas/APIManagement',
      Period: 300,
      EvaluationPeriods: 1,
      Threshold: 100,
      ComparisonOperator: 'GreaterThanThreshold',
      AlarmDescription: 'Alert when rate limit is frequently exceeded'
    }
  ];

  for (const alert of alerts) {
    await cloudwatch.putMetricAlarm(alert).promise();
  }
};