import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BackupService } from './backup.service';
import { CloudWatch } from 'aws-sdk';

@Injectable()
export class BackupScheduler {
  private cloudwatch: CloudWatch;

  constructor(private readonly backupService: BackupService) {
    this.cloudwatch = new CloudWatch({
      region: process.env.AWS_REGION || 'us-east-1'
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async performDailyBackup() {
    try {
      const backupArns = await this.backupService.backupAllTables();
      await this.publishBackupMetrics(true);
      return backupArns;
    } catch (error) {
      await this.publishBackupMetrics(false);
      throw error;
    }
  }

  private async publishBackupMetrics(success: boolean) {
    await this.cloudwatch.putMetricData({
      Namespace: 'CareerCanvas/APIManagement',
      MetricData: [{
        MetricName: 'BackupStatus',
        Value: success ? 1 : 0,
        Unit: 'Count',
        Timestamp: new Date()
      }]
    }).promise();
  }
}