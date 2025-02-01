import { EC2, RDS, DynamoDB, S3, CloudWatch } from 'aws-sdk';

export class CleanupManager {
  private ec2: EC2;
  private rds: RDS;
  private dynamodb: DynamoDB;
  private s3: S3;
  private cloudwatch: CloudWatch;

  constructor() {
    const region = process.env.AWS_REGION || 'us-east-1';
    this.ec2 = new EC2({ region });
    this.rds = new RDS({ region });
    this.dynamodb = new DynamoDB({ region });
    this.s3 = new S3({ region });
    this.cloudwatch = new CloudWatch({ region });
  }

  async performCleanup() {
    const results = await Promise.all([
      this.cleanupUnusedInstances(),
      this.cleanupOldSnapshots(),
      this.cleanupUnusedVolumes(),
      this.cleanupOldLogs(),
      this.cleanupOldMetrics()
    ]);

    await this.generateCleanupReport(results);
    return results;
  }

  private async cleanupUnusedInstances() {
    const instances = await this.ec2.describeInstances({
      Filters: [
        { Name: 'instance-state-name', Values: ['stopped'] }
      ]
    }).promise();

    const stoppedInstances = instances.Reservations?.flatMap(r => r.Instances || []) || [];
    const oldInstances = stoppedInstances.filter(i => 
      this.isOlderThan(i.LaunchTime!, 30) // 30 days
    );

    for (const instance of oldInstances) {
      await this.ec2.terminateInstances({
        InstanceIds: [instance.InstanceId!]
      }).promise();
    }

    return { type: 'EC2', cleaned: oldInstances.length };
  }

  private async cleanupOldSnapshots() {
    const snapshots = await this.ec2.describeSnapshots({
      OwnerIds: ['self']
    }).promise();

    const oldSnapshots = snapshots.Snapshots?.filter(s =>
      this.isOlderThan(s.StartTime!, 90) // 90 days
    ) || [];

    for (const snapshot of oldSnapshots) {
      await this.ec2.deleteSnapshot({
        SnapshotId: snapshot.SnapshotId!
      }).promise();
    }

    return { type: 'Snapshots', cleaned: oldSnapshots.length };
  }

  private async cleanupUnusedVolumes() {
    const volumes = await this.ec2.describeVolumes({
      Filters: [
        { Name: 'status', Values: ['available'] }
      ]
    }).promise();

    for (const volume of volumes.Volumes || []) {
      await this.ec2.deleteVolume({
        VolumeId: volume.VolumeId!
      }).promise();
    }

    return { type: 'Volumes', cleaned: volumes.Volumes?.length || 0 };
  }

  private async cleanupOldLogs() {
    const logGroups = await this.cloudwatch.describeLogGroups().promise();

    for (const group of logGroups.logGroups || []) {
      await this.cloudwatch.putRetentionPolicy({
        logGroupName: group.logGroupName!,
        retentionInDays: 30
      }).promise();
    }

    return { type: 'Logs', cleaned: logGroups.logGroups?.length || 0 };
  }

  private async cleanupOldMetrics() {
    // Implementation for cleaning up old metrics
    return { type: 'Metrics', cleaned: 0 };
  }

  private isOlderThan(date: Date, days: number): boolean {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - days);
    return date < threshold;
  }

  private async generateCleanupReport(results: any[]) {
    const report = {
      timestamp: new Date().toISOString(),
      results,
      summary: {
        totalCleaned: results.reduce((sum, r) => sum + r.cleaned, 0),
        byType: results.reduce((acc, r) => ({
          ...acc,
          [r.type]: r.cleaned
        }), {})
      }
    };

    console.log('Cleanup Report:', JSON.stringify(report, null, 2));
    return report;
  }
}