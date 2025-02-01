import { DynamoDB, S3 } from 'aws-sdk';
import { TABLES } from '../dynamodb/tables';

export class ReplicationManager {
  private readonly regions = ['us-east-1', 'us-west-2', 'eu-west-1'];
  private dynamodbClients: Map<string, DynamoDB>;

  constructor() {
    this.dynamodbClients = new Map(
      this.regions.map(region => [
        region,
        new DynamoDB({ region })
      ])
    );
  }

  async setupReplication() {
    for (const tableName of Object.values(TABLES)) {
      await this.setupTableReplication(tableName);
    }
  }

  private async setupTableReplication(tableName: string) {
    const replicationGroup = this.regions.map(region => ({
      RegionName: region,
      KMSMasterKeyId: process.env[`${region.replace(/-/g, '_')}_KMS_KEY`]
    }));

    await this.dynamodbClients.get(this.regions[0])?.createGlobalTable({
      GlobalTableName: tableName,
      ReplicationGroup: replicationGroup
    }).promise();
  }

  async verifyReplication(tableName: string): Promise<boolean> {
    const checksums = await Promise.all(
      this.regions.map(region => this.getTableChecksum(region, tableName))
    );

    return checksums.every(checksum => checksum === checksums[0]);
  }

  private async getTableChecksum(region: string, tableName: string): Promise<string> {
    const client = this.dynamodbClients.get(region);
    const result = await client?.describeTable({ TableName: tableName }).promise();
    return result?.Table?.LatestStreamArn || '';
  }
}