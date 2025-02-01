import { CloudWatch } from 'aws-sdk';

export class HealthDashboard {
  private cloudwatch: CloudWatch;

  constructor() {
    this.cloudwatch = new CloudWatch({
      region: process.env.AWS_REGION || 'us-east-1'
    });
  }

  async createDashboard() {
    const widgets = [
      this.createApiHealthWidget(),
      this.createInfrastructureHealthWidget(),
      this.createDatabaseHealthWidget(),
      this.createSecurityHealthWidget()
    ];

    await this.cloudwatch.putDashboard({
      DashboardName: 'CareerCanvas-Infrastructure-Health',
      DashboardBody: JSON.stringify({
        widgets,
        periodOverride: 'auto'
      })
    }).promise();
  }

  private createApiHealthWidget() {
    return {
      type: 'metric',
      properties: {
        metrics: [
          ['CareerCanvas/APIManagement', 'RequestCount'],
          ['CareerCanvas/APIManagement', 'ErrorCount'],
          ['CareerCanvas/APIManagement', 'Latency']
        ],
        view: 'timeSeries',
        stacked: false,
        region: process.env.AWS_REGION,
        title: 'API Health'
      }
    };
  }

  private createInfrastructureHealthWidget() {
    return {
      type: 'metric',
      properties: {
        metrics: [
          ['AWS/EC2', 'CPUUtilization'],
          ['AWS/EC2', 'StatusCheckFailed'],
          ['CWAgent', 'MemoryUtilization']
        ],
        view: 'timeSeries',
        stacked: false,
        region: process.env.AWS_REGION,
        title: 'Infrastructure Health'
      }
    };
  }

  private createDatabaseHealthWidget() {
    return {
      type: 'metric',
      properties: {
        metrics: [
          ['AWS/DynamoDB', 'ConsumedReadCapacityUnits'],
          ['AWS/DynamoDB', 'ConsumedWriteCapacityUnits'],
          ['AWS/DynamoDB', 'ThrottledRequests']
        ],
        view: 'timeSeries',
        stacked: false,
        region: process.env.AWS_REGION,
        title: 'Database Health'
      }
    };
  }

  private createSecurityHealthWidget() {
    return {
      type: 'metric',
      properties: {
        metrics: [
          ['CareerCanvas/Security', 'UnauthorizedAPICalls'],
          ['CareerCanvas/Security', 'SecurityGroupChanges'],
          ['CareerCanvas/Security', 'NetworkAclChanges']
        ],
        view: 'timeSeries',
        stacked: false,
        region: process.env.AWS_REGION,
        title: 'Security Health'
      }
    };
  }
}