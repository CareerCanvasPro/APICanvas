import { EC2, RDS, DynamoDB, Lambda, S3 } from 'aws-sdk';
import { writeFileSync } from 'fs';

export class InventoryManager {
  private ec2: EC2;
  private rds: RDS;
  private dynamodb: DynamoDB;
  private lambda: Lambda;
  private s3: S3;

  constructor() {
    const region = process.env.AWS_REGION || 'us-east-1';
    this.ec2 = new EC2({ region });
    this.rds = new RDS({ region });
    this.dynamodb = new DynamoDB({ region });
    this.lambda = new Lambda({ region });
    this.s3 = new S3({ region });
  }

  async collectInventory() {
    const inventory = {
      timestamp: new Date().toISOString(),
      ec2: await this.collectEC2Inventory(),
      rds: await this.collectRDSInventory(),
      dynamodb: await this.collectDynamoDBInventory(),
      lambda: await this.collectLambdaInventory(),
      s3: await this.collectS3Inventory()
    };

    await this.generateInventoryReport(inventory);
    return inventory;
  }

  private async collectEC2Inventory() {
    const instances = await this.ec2.describeInstances().promise();
    return {
      instances: instances.Reservations?.flatMap(r => r.Instances || [])
        .map(i => ({
          id: i.InstanceId,
          type: i.InstanceType,
          state: i.State?.Name,
          launchTime: i.LaunchTime
        }))
    };
  }

  private async collectRDSInventory() {
    const instances = await this.rds.describeDBInstances().promise();
    return {
      instances: instances.DBInstances?.map(i => ({
        id: i.DBInstanceIdentifier,
        class: i.DBInstanceClass,
        engine: i.Engine,
        status: i.DBInstanceStatus
      }))
    };
  }

  private async collectDynamoDBInventory() {
    const tables = await this.dynamodb.listTables().promise();
    const tableDetails = await Promise.all(
      (tables.TableNames || []).map(name =>
        this.dynamodb.describeTable({ TableName: name }).promise()
      )
    );

    return {
      tables: tableDetails.map(t => ({
        name: t.Table?.TableName,
        status: t.Table?.TableStatus,
        itemCount: t.Table?.ItemCount,
        size: t.Table?.TableSizeBytes
      }))
    };
  }

  private async collectLambdaInventory() {
    const functions = await this.lambda.listFunctions().promise();
    return {
      functions: functions.Functions?.map(f => ({
        name: f.FunctionName,
        runtime: f.Runtime,
        memory: f.MemorySize,
        timeout: f.Timeout
      }))
    };
  }

  private async collectS3Inventory() {
    const buckets = await this.s3.listBuckets().promise();
    return {
      buckets: buckets.Buckets?.map(b => ({
        name: b.Name,
        creationDate: b.CreationDate
      }))
    };
  }

  private async generateInventoryReport(inventory: any) {
    const report = {
      ...inventory,
      summary: {
        ec2Count: inventory.ec2.instances?.length || 0,
        rdsCount: inventory.rds.instances?.length || 0,
        dynamoDBCount: inventory.dynamodb.tables?.length || 0,
        lambdaCount: inventory.lambda.functions?.length || 0,
        s3Count: inventory.s3.buckets?.length || 0
      }
    };

    writeFileSync(
      'inventory-reports/inventory.json',
      JSON.stringify(report, null, 2)
    );
  }
}