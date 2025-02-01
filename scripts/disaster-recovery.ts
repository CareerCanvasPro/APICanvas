import { BackupService } from '../src/infrastructure/backup/backup.service';
import { DynamoDB } from 'aws-sdk';
import { TABLES } from '../src/infrastructure/dynamodb/tables';

export class DisasterRecoveryService {
  private dynamodb: DynamoDB;
  private backupService: BackupService;

  constructor() {
    this.dynamodb = new DynamoDB({
      region: process.env.AWS_REGION || 'us-east-1'
    });
    this.backupService = new BackupService();
  }

  async performRecovery(backupArn: string, targetTable: string): Promise<void> {
    console.log(`Starting recovery for table: ${targetTable}`);
    
    try {
      await this.backupService.restoreFromBackup(backupArn, `${targetTable}-recovery`);
      console.log(`Recovery completed for table: ${targetTable}`);
    } catch (error) {
      console.error(`Recovery failed for table: ${targetTable}`, error);
      throw error;
    }
  }

  async validateRecovery(tableName: string): Promise<boolean> {
    const params = {
      TableName: tableName
    };

    try {
      await this.dynamodb.describeTable(params).promise();
      return true;
    } catch (error) {
      return false;
    }
  }
}