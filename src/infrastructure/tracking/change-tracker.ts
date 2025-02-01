import { CloudTrail, DynamoDB, SNS } from 'aws-sdk';

export class ChangeTracker {
  private cloudtrail: CloudTrail;
  private dynamodb: DynamoDB;
  private sns: SNS;

  constructor() {
    const region = process.env.AWS_REGION || 'us-east-1';
    this.cloudtrail = new CloudTrail({ region });
    this.dynamodb = new DynamoDB({ region });
    this.sns = new SNS({ region });
  }

  async trackChanges() {
    const events = await this.getCloudTrailEvents();
    const significantChanges = this.filterSignificantChanges(events);
    await this.storeChanges(significantChanges);
    await this.notifyStakeholders(significantChanges);
    return significantChanges;
  }

  private async getCloudTrailEvents() {
    const endTime = new Date();
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - 1);

    return this.cloudtrail.lookupEvents({
      StartTime: startTime,
      EndTime: endTime,
      LookupAttributes: [{
        AttributeKey: 'EventName',
        AttributeValue: 'CreateStack'
      }, {
        AttributeKey: 'EventName',
        AttributeValue: 'UpdateStack'
      }, {
        AttributeKey: 'EventName',
        AttributeValue: 'DeleteStack'
      }]
    }).promise();
  }

  private filterSignificantChanges(events: any) {
    return events.Events?.filter(event => {
      const eventName = event.EventName;
      return eventName.includes('Stack') ||
             eventName.includes('Instance') ||
             eventName.includes('Database');
    });
  }

  private async storeChanges(changes: any[]) {
    const timestamp = new Date().toISOString();
    await this.dynamodb.putItem({
      TableName: 'CareerCanvas-InfraChanges',
      Item: {
        timestamp: { S: timestamp },
        changes: { S: JSON.stringify(changes) }
      }
    }).promise();
  }

  private async notifyStakeholders(changes: any[]) {
    if (changes.length > 0) {
      await this.sns.publish({
        TopicArn: process.env.INFRA_CHANGES_TOPIC_ARN,
        Subject: 'Infrastructure Changes Detected',
        Message: JSON.stringify(changes, null, 2)
      }).promise();
    }
  }
}