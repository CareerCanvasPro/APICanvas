import { CloudWatch } from 'aws-sdk';

const cloudwatch = new CloudWatch({
  region: process.env.AWS_REGION || 'us-east-1'
});

export const createDashboard = async () => {
  const dashboard = {
    widgets: [
      {
        type: 'metric',
        properties: {
          metrics: [
            ['CareerCanvas/APIManagement', 'APIRequests', 'ApiId', '*'],
            ['CareerCanvas/APIManagement', 'Errors', 'ApiId', '*'],
            ['CareerCanvas/APIManagement', 'Latency', 'ApiId', '*']
          ],
          period: 300,
          stat: 'Sum',
          region: process.env.AWS_REGION || 'us-east-1',
          title: 'API Metrics'
        }
      },
      {
        type: 'metric',
        properties: {
          metrics: [
            ['CareerCanvas/APIManagement', 'TokenUsage', 'TokenId', '*'],
            ['CareerCanvas/APIManagement', 'RateLimitExceeded', 'TokenId', '*']
          ],
          period: 300,
          stat: 'Sum',
          region: process.env.AWS_REGION || 'us-east-1',
          title: 'Token Usage'
        }
      }
    ]
  };

  await cloudwatch.putDashboard({
    DashboardName: 'CareerCanvas-APIManagement',
    DashboardBody: JSON.stringify(dashboard)
  }).promise();
};