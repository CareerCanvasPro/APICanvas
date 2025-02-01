import { ResourceGroups, EC2, RDS, DynamoDB } from 'aws-sdk';

export class TagManager {
  private resourceGroups: ResourceGroups;
  private ec2: EC2;
  private rds: RDS;
  private dynamodb: DynamoDB;

  constructor() {
    const region = process.env.AWS_REGION || 'us-east-1';
    this.resourceGroups = new ResourceGroups({ region });
    this.ec2 = new EC2({ region });
    this.rds = new RDS({ region });
    this.dynamodb = new DynamoDB({ region });
  }

  async applyTags() {
    const standardTags = {
      Environment: process.env.STAGE || 'production',
      Project: 'CareerCanvas',
      Service: 'API',
      ManagedBy: 'Infrastructure-as-Code'
    };

    await Promise.all([
      this.tagEC2Resources(standardTags),
      this.tagRDSResources(standardTags),
      this.tagDynamoDBResources(standardTags)
    ]);

    await this.verifyTags();
  }

  private async tagEC2Resources(tags: Record<string, string>) {
    const instances = await this.ec2.describeInstances().promise();
    
    for (const reservation of instances.Reservations || []) {
      for (const instance of reservation.Instances || []) {
        await this.ec2.createTags({
          Resources: [instance.InstanceId!],
          Tags: Object.entries(tags).map(([Key, Value]) => ({ Key, Value }))
        }).promise();
      }
    }
  }

  private async tagRDSResources(tags: Record<string, string>) {
    const instances = await this.rds.describeDBInstances().promise();
    
    for (const instance of instances.DBInstances || []) {
      await this.rds.addTagsToResource({
        ResourceName: instance.DBInstanceArn!,
        Tags: Object.entries(tags).map(([Key, Value]) => ({ Key, Value }))
      }).promise();
    }
  }

  private async tagDynamoDBResources(tags: Record<string, string>) {
    const tables = await this.dynamodb.listTables().promise();
    
    for (const tableName of tables.TableNames || []) {
      const table = await this.dynamodb.describeTable({ TableName: tableName }).promise();
      await this.dynamodb.tagResource({
        ResourceArn: table.Table!.TableArn!,
        Tags: Object.entries(tags).map(([Key, Value]) => ({ Key, Value }))
      }).promise();
    }
  }

  private async verifyTags() {
    // Implementation for tag verification
    return true;
  }
}