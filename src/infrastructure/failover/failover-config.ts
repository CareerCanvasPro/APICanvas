import { Route53, DynamoDB } from 'aws-sdk';

export class FailoverConfig {
  private route53: Route53;
  private dynamodb: DynamoDB;

  constructor() {
    this.route53 = new Route53();
    this.dynamodb = new DynamoDB({
      region: process.env.AWS_REGION || 'us-east-1'
    });
  }

  async setupFailover() {
    await this.setupDynamoDBGlobalTables();
    await this.setupDNSFailover();
    await this.setupHealthChecks();
  }

  private async setupDynamoDBGlobalTables() {
    const regions = ['us-east-1', 'us-west-2'];
    const tables = ['CareerCanvas-Apis', 'CareerCanvas-Tokens', 'CareerCanvas-Metrics'];

    for (const table of tables) {
      await this.dynamodb.createGlobalTable({
        GlobalTableName: table,
        ReplicationGroup: regions.map(region => ({ RegionName: region }))
      }).promise();
    }
  }

  private async setupDNSFailover() {
    await this.route53.createHealthCheck({
      CallerReference: `careercanvas-api-${Date.now()}`,
      HealthCheckConfig: {
        FullyQualifiedDomainName: process.env.API_DOMAIN,
        Port: 443,
        Type: 'HTTPS',
        ResourcePath: '/health'
      }
    }).promise();
  }

  private async setupHealthChecks() {
    const regions = ['us-east-1', 'us-west-2'];
    
    for (const region of regions) {
      await this.route53.createHealthCheck({
        CallerReference: `careercanvas-${region}-${Date.now()}`,
        HealthCheckConfig: {
          FullyQualifiedDomainName: `api-${region}.${process.env.API_DOMAIN}`,
          Port: 443,
          Type: 'HTTPS',
          ResourcePath: '/health',
          Regions: [region]
        }
      }).promise();
    }
  }
}