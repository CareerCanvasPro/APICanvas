import { CloudWatch } from 'aws-sdk';

export class PerformanceDashboard {
  private cloudwatch: CloudWatch;

  constructor() {
    this.cloudwatch = new CloudWatch({
      region: process.env.AWS_REGION || 'us-east-1'
    });
  }

  async createDashboard() {
    const dashboardBody = {
      widgets: [
        {
          type: 'metric',
          properties: {
            metrics: [
              ['CareerCanvas/APIManagement/Performance', 'AverageLatency'],
              ['CareerCanvas/APIManagement/Performance', 'Throughput'],
              ['CareerCanvas/APIManagement/Performance', 'ErrorRate']
            ],
            period: 300,
            stat: 'Average',
            region: process.env.AWS_REGION,
            title: 'API Performance Metrics'
          }
        },
        {
          type: 'metric',
          properties: {
            metrics: [
              ['AWS/ApplicationELB', 'RequestCount', 'LoadBalancer', 'careercanvas-api-lb'],
              ['AWS/ApplicationELB', 'TargetResponseTime', 'LoadBalancer', 'careercanvas-api-lb']
            ],
            period: 300,
            stat: 'Sum',
            region: process.env.AWS_REGION,
            title: 'Load Balancer Metrics'
          }
        }
      ]
    };

    await this.cloudwatch.putDashboard({
      DashboardName: 'CareerCanvas-API-Performance',
      DashboardBody: JSON.stringify(dashboardBody)
    }).promise();
  }
}