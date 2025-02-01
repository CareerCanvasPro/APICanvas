import { Injectable } from '@nestjs/common';
import { DynamoDB } from 'aws-sdk';
import { TABLES } from '../dynamodb/tables';

@Injectable()
export class BackupService {
  private dynamodb: DynamoDB;

  constructor() {
    this.dynamodb = new DynamoDB({
      region: process.env.AWS_REGION || 'us-east-1'
    });
  }

  async createBackup(tableName: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `${tableName}-backup-${timestamp}`;

    const params = {
      TableName: tableName,
      BackupName: backupName,
    };

    const result = await this.dynamodb.createBackup(params).promise();
    return result.BackupDetails.BackupArn;
  }

  async restoreFromBackup(backupArn: string, targetTableName: string): Promise<void> {
    const params = {
      BackupArn: backupArn,
      TargetTableName: targetTableName,
    };

    await this.dynamodb.restoreTableFromBackup(params).promise();
  }

  async backupAllTables(): Promise<Map<string, string>> {
    const backupArns = new Map<string, string>();
    
    for (const table of Object.values(TABLES)) {
      const backupArn = await this.createBackup(table);
      backupArns.set(table, backupArn);
    }

    return backupArns;
  }
}