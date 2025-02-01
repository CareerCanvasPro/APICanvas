import { CloudTrail, CloudWatchLogs, S3 } from 'aws-sdk';

export class AccessLogger {
  private cloudtrail: CloudTrail;
  private cloudwatchLogs: CloudWatchLogs;
  private s3: S3;

  constructor() {
    const region = process.env.AWS_REGION || 'us-east-1';
    this.cloudtrail = new CloudTrail({ region });
    this.cloudwatchLogs = new CloudWatchLogs({ region });
    this.s3: new S3({ region });
  }

  async setupLogging() {
    await this.createCloudTrail();
    await this.setupLogGroups();
    await this.configureMetricFilters();
  }

  private async createCloudTrail() {
    await this.cloudtrail.createTrail({
      Name: 'careercanvas-api-trail',
      S3BucketName: process.env.LOGS_BUCKET || 'careercanvas-logs',
      CloudWatchLogsLogGroupArn: `arn:aws:logs:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT_ID}:log-group:/aws/cloudtrail/*`,
      CloudWatchLogsRoleArn: process.env.CLOUDTRAIL_ROLE_ARN,
      IsMultiRegionTrail: true,
      EnableLogFileValidation: true
    }).promise();
  }

  private async setupLogGroups() {
    const logGroups = [
      '/aws/cloudtrail/api-access',
      '/aws/cloudtrail/infrastructure-changes',
      '/aws/cloudtrail/security-events'
    ];

    for (const logGroup of logGroups) {
      await this.cloudwatchLogs.createLogGroup({
        logGroupName: logGroup
      }).promise();

      await this.cloudwatchLogs.putRetentionPolicy({
        logGroupName: logGroup,
        retentionInDays: 90
      }).promise();
    }
  }

  private async configureMetricFilters() {
    const filters = [
      {
        filterName: 'UnauthorizedAPICalls',
        filterPattern: '{ $.errorCode = "*UnauthorizedOperation" }',
        metricName: 'UnauthorizedAPICalls',
        metricNamespace: 'CareerCanvas/Security'
      },
      {
        filterName: 'InfrastructureChanges',
        filterPattern: '{ $.eventName = Create* || $.eventName = Delete* || $.eventName = Update* }',
        metricName: 'InfrastructureChanges',
        metricNamespace: 'CareerCanvas/Infrastructure'
      }
    ];

    for (const filter of filters) {
      await this.cloudwatchLogs.putMetricFilter({
        logGroupName: '/aws/cloudtrail/api-access',
        filterName: filter.filterName,
        filterPattern: filter.filterPattern,
        metricTransformations: [{
          metricName: filter.metricName,
          metricNamespace: filter.metricNamespace,
          metricValue: '1'
        }]
      }).promise();
    }
  }
}