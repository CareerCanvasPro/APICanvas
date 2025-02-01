import { CloudWatch, DynamoDB } from 'aws-sdk';
import { ChecklistItem, ProjectStatus } from './types';

interface TaskMetrics {
  timeInStatus: Record<ProjectStatus, number>;
  completionRate: number;
  blockerCount: number;
  dependencyCount: number;
  estimatedCompletion?: Date;
}

interface TimelineEvent {
  timestamp: string;
  type: 'STATUS_CHANGE' | 'DEPENDENCY_ADDED' | 'BLOCKER_ADDED' | 'SUBTASK_COMPLETED';
  details: Record<string, any>;
}

export class TaskAnalytics {
  private cloudWatch: CloudWatch;
  private dynamoDB: DynamoDB.DocumentClient;
  private readonly namespace = 'CareerCanvas/Tasks';
  private readonly timelineTable = 'CareerCanvas-TaskTimeline';

  constructor() {
    const region = process.env.AWS_REGION || 'us-east-1';
    this.cloudWatch = new CloudWatch({ region });
    this.dynamoDB = new DynamoDB.DocumentClient({ region });
  }

  async trackStatusChange(
    item: ChecklistItem,
    oldStatus: ProjectStatus,
    newStatus: ProjectStatus
  ): Promise<void> {
    await this.cloudWatch.putMetricData({
      Namespace: this.namespace,
      MetricData: [
        {
          MetricName: 'StatusTransition',
          Value: 1,
          Dimensions: [
            { Name: 'TaskId', Value: item.id },
            { Name: 'FromStatus', Value: oldStatus },
            { Name: 'ToStatus', Value: newStatus }
          ],
          Timestamp: new Date(),
          Unit: 'Count'
        }
      ]
    }).promise();

    await this.recordTimelineEvent(item.id, {
      timestamp: new Date().toISOString(),
      type: 'STATUS_CHANGE',
      details: { oldStatus, newStatus }
    });
  }

  async getTaskMetrics(taskId: string): Promise<TaskMetrics> {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 30 * 24 * 60 * 60 * 1000); // Last 30 days

    const metrics = await this.cloudWatch.getMetricData({
      MetricDataQueries: [
        {
          Id: 'statusTransitions',
          MetricStat: {
            Metric: {
              Namespace: this.namespace,
              MetricName: 'StatusTransition',
              Dimensions: [{ Name: 'TaskId', Value: taskId }]
            },
            Period: 3600,
            Stat: 'Sum'
          }
        }
      ],
      StartTime: startTime,
      EndTime: endTime
    }).promise();

    return this.processMetrics(metrics);
  }

  private async recordTimelineEvent(taskId: string, event: TimelineEvent): Promise<void> {
    await this.dynamoDB.put({
      TableName: this.timelineTable,
      Item: {
        taskId,
        timestamp: event.timestamp,
        type: event.type,
        details: event.details,
        ttl: Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60 // 90 days retention
      }
    }).promise();

    if (event.type === 'BLOCKER_ADDED') {
      await this.updateBlockerMetrics(taskId, event.details);
    }
  }

  async getTaskTimeline(taskId: string): Promise<TimelineEvent[]> {
    const result = await this.dynamoDB.query({
      TableName: this.timelineTable,
      KeyConditionExpression: 'taskId = :taskId',
      ExpressionAttributeValues: {
        ':taskId': taskId
      },
      ScanIndexForward: true
    }).promise();

    return result.Items as TimelineEvent[];
  }

  private processMetrics(rawMetrics: any): TaskMetrics {
    const timeInStatus: Record<ProjectStatus, number> = {
      [ProjectStatus.PENDING]: 0,
      [ProjectStatus.IN_PROGRESS]: 0,
      [ProjectStatus.COMPLETED]: 0,
      [ProjectStatus.BLOCKED]: 0
    };

    const statusTransitions = rawMetrics.MetricDataResults[0].Values;
    const timestamps = rawMetrics.MetricDataResults[0].Timestamps;

    let currentStatus = ProjectStatus.PENDING;
    let lastTransitionTime = timestamps[0];

    for (let i = 0; i < statusTransitions.length; i++) {
      const duration = new Date(timestamps[i]).getTime() - new Date(lastTransitionTime).getTime();
      timeInStatus[currentStatus] += duration;
      
      if (statusTransitions[i] > 0) {
        currentStatus = this.getNextStatus(currentStatus);
        lastTransitionTime = timestamps[i];
      }
    }

    const totalTime = Object.values(timeInStatus).reduce((a, b) => a + b, 0);
    const completionRate = timeInStatus[ProjectStatus.COMPLETED] / totalTime;

    return {
      timeInStatus,
      completionRate,
      blockerCount: this.calculateBlockerCount(rawMetrics),
      dependencyCount: this.calculateDependencyCount(rawMetrics),
      estimatedCompletion: this.calculateEstimatedCompletion(timeInStatus, completionRate)
    };
  }

  private getNextStatus(currentStatus: ProjectStatus): ProjectStatus {
    const statusFlow = {
      [ProjectStatus.PENDING]: ProjectStatus.IN_PROGRESS,
      [ProjectStatus.IN_PROGRESS]: ProjectStatus.COMPLETED,
      [ProjectStatus.BLOCKED]: ProjectStatus.IN_PROGRESS,
      [ProjectStatus.COMPLETED]: ProjectStatus.COMPLETED
    };
    return statusFlow[currentStatus];
  }

  private calculateBlockerCount(metrics: any): number {
    return metrics.MetricDataResults.find((m: any) => m.Id === 'blockers')?.Values[0] || 0;
  }

  private calculateDependencyCount(metrics: any): number {
    return metrics.MetricDataResults.find((m: any) => m.Id === 'dependencies')?.Values[0] || 0;
  }

  private calculateEstimatedCompletion(
    timeInStatus: Record<ProjectStatus, number>,
    completionRate: number
  ): Date | undefined {
    if (completionRate === 0) return undefined;

    const remainingWork = 1 - completionRate;
    const averageCompletionTime = timeInStatus[ProjectStatus.COMPLETED] / completionRate;
    const estimatedRemainingTime = averageCompletionTime * remainingWork;

    return new Date(Date.now() + estimatedRemainingTime);
  }

  private async updateBlockerMetrics(taskId: string, blockerDetails: any): Promise<void> {
    await this.cloudWatch.putMetricData({
      Namespace: this.namespace,
      MetricData: [
        {
          MetricName: 'BlockerCount',
          Value: 1,
          Dimensions: [{ Name: 'TaskId', Value: taskId }],
          Timestamp: new Date(),
          Unit: 'Count'
        }
      ]
    }).promise();
  }
}