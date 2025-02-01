import { DynamoDB, S3 } from 'aws-sdk';
import { TABLES } from '../dynamodb/tables';

export class BackupVerifier {
  private dynamodb: DynamoDB;
  private s3: S3;

  constructor() {
    this.dynamodb = new DynamoDB({
      region: process.env.AWS_REGION || 'us-east-1'
    });
    this.s3 = new S3();
  }

  async verifyBackups() {
    const results = new Map<string, boolean>();

    for (const tableName of Object.values(TABLES)) {
      const backups = await this.listBackups(tableName);
      const isValid = await this.verifyTableBackups(tableName, backups);
      results.set(tableName, isValid);
    }

    await this.generateVerificationReport(results);
    return results;
  }

  private async listBackups(tableName: string) {
    return this.dynamodb.listBackups({
      TableName: tableName,
      TimeRangeLowerBound: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }).promise();
  }

  private async verifyTableBackups(tableName: string, backups: DynamoDB.ListBackupsOutput) {
    if (!backups.BackupSummaries?.length) {
      return false;
    }

    const latestBackup = backups.BackupSummaries[0];
    const restoreTableName = `${tableName}-verify-${Date.now()}`;

    try {
      await this.dynamodb.restoreTableFromBackup({
        BackupArn: latestBackup.BackupArn!,
        TargetTableName: restoreTableName
      }).promise();

      await this.compareTableData(tableName, restoreTableName);
      return true;
    } catch (error) {
      console.error(`Backup verification failed for ${tableName}:`, error);
      return false;
    } finally {
      await this.cleanupVerificationTable(restoreTableName);
    }
  }

  private async compareTableData(sourceTable: string, verifyTable: string): Promise<boolean> {
    const sourceData = await this.scanTable(sourceTable);
    const verifyData = await this.scanTable(verifyTable);
    return JSON.stringify(sourceData) === JSON.stringify(verifyData);
  }

  private async scanTable(tableName: string) {
    const items: any[] = [];
    let lastKey;

    do {
      const result = await this.dynamodb.scan({
        TableName: tableName,
        ExclusiveStartKey: lastKey
      }).promise();

      items.push(...(result.Items || []));
      lastKey = result.LastEvaluatedKey;
    } while (lastKey);

    return items;
  }

  private async cleanupVerificationTable(tableName: string) {
    try {
      await this.dynamodb.deleteTable({ TableName: tableName }).promise();
    } catch (error) {
      console.error(`Failed to cleanup verification table ${tableName}:`, error);
    }
  }

  private async generateVerificationReport(results: Map<string, boolean>) {
    const report = {
      timestamp: new Date().toISOString(),
      results: Object.fromEntries(results),
      summary: {
        total: results.size,
        verified: Array.from(results.values()).filter(Boolean).length
      }
    };

    await this.s3.putObject({
      Bucket: process.env.REPORTS_BUCKET || 'careercanvas-reports',
      Key: `backup-verifications/${report.timestamp}.json`,
      Body: JSON.stringify(report, null, 2)
    }).promise();
  }
}