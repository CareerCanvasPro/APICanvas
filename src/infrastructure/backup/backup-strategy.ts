import { Backup, DynamoDB, RDS, EC2 } from 'aws-sdk';

export class BackupStrategy {
  private backup: Backup;
  private dynamodb: DynamoDB;
  private rds: RDS;
  private ec2: EC2;

  constructor() {
    const region = process.env.AWS_REGION || 'us-east-1';
    this.backup = new Backup({ region });
    this.dynamodb = new DynamoDB({ region });
    this.rds = new RDS({ region });
    this.ec2 = new EC2({ region });
  }

  async setupBackupStrategy() {
    const vaultName = 'careercanvas-backup-vault';
    await this.createBackupVault(vaultName);
    await this.setupBackupPlan(vaultName);
    await this.configureRetentionRules();
    await this.setupCrossRegionCopy();
  }

  private async createBackupVault(vaultName: string) {
    await this.backup.createBackupVault({
      BackupVaultName: vaultName,
      EncryptionKeyArn: process.env.BACKUP_KMS_KEY_ARN
    }).promise();
  }

  private async setupBackupPlan(vaultName: string) {
    const plan = await this.backup.createBackupPlan({
      BackupPlan: {
        BackupPlanName: 'CareerCanvasBackupPlan',
        Rules: [
          {
            RuleName: 'DailyBackups',
            TargetBackupVaultName: vaultName,
            ScheduleExpression: 'cron(0 5 ? * * *)',
            StartWindowMinutes: 60,
            CompletionWindowMinutes: 120,
            Lifecycle: {
              DeleteAfterDays: 30
            }
          },
          {
            RuleName: 'WeeklyBackups',
            TargetBackupVaultName: vaultName,
            ScheduleExpression: 'cron(0 5 ? * SUN *)',
            StartWindowMinutes: 60,
            CompletionWindowMinutes: 120,
            Lifecycle: {
              DeleteAfterDays: 90
            }
          }
        ]
      }
    }).promise();

    await this.assignResourcesToBackupPlan(plan.BackupPlanId!);
  }

  private async assignResourcesToBackupPlan(planId: string) {
    const resources = await this.getBackupResources();
    
    for (const resource of resources) {
      await this.backup.createBackupSelection({
        BackupPlanId: planId,
        BackupSelection: {
          SelectionName: `Selection-${resource.type}`,
          IamRoleArn: process.env.BACKUP_ROLE_ARN!,
          Resources: [resource.arn]
        }
      }).promise();
    }
  }

  private async getBackupResources() {
    const resources = [];
    
    // Get DynamoDB tables
    const tables = await this.dynamodb.listTables().promise();
    for (const tableName of tables.TableNames || []) {
      const table = await this.dynamodb.describeTable({ TableName: tableName }).promise();
      resources.push({
        type: 'DynamoDB',
        arn: table.Table!.TableArn
      });
    }

    // Get RDS instances
    const dbInstances = await this.rds.describeDBInstances().promise();
    for (const instance of dbInstances.DBInstances || []) {
      resources.push({
        type: 'RDS',
        arn: instance.DBInstanceArn
      });
    }

    return resources;
  }

  private async configureRetentionRules() {
    // Implementation for retention rules
  }

  private async setupCrossRegionCopy() {
    // Implementation for cross-region copy
  }
}