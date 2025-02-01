import { CloudWatch } from 'aws-sdk';

export const createDashboard = async () => {
  const cloudwatch = new CloudWatch({
    region: process.env.AWS_REGION || 'us-east-1'
  });

  const dashboardBody = {
    widgets: [
      {
        type: 'metric',
        properties: {
          metrics: [
            ['CareerCanvas/APIManagement', 'RequestCount', 'ApiId', '*'],
            ['CareerCanvas/APIManagement', 'Latency', 'ApiId', '*'],
            ['CareerCanvas/APIManagement', 'ErrorCount', 'ApiId', '*']
          ],
          period: 300,
          stat: 'Sum',
          region: process.env.AWS_REGION,
          title: 'API Performance'
        }
      },
      {
        type: 'metric',
        properties: {
          metrics: [
            ['AWS/DynamoDB', 'ConsumedReadCapacityUnits', 'TableName', 'CareerCanvas-Apis'],
            ['AWS/DynamoDB', 'ConsumedWriteCapacityUnits', 'TableName', 'CareerCanvas-Apis']
          ],
          period: 300,
          stat: 'Sum',
          region: process.env.AWS_REGION,
          title: 'DynamoDB Usage'
        }
      }
    ]
  };

  await cloudwatch.putDashboard({
    DashboardName: 'CareerCanvas-APIManagement',
    DashboardBody: JSON.stringify(dashboardBody)
  }).promise();
};