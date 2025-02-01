import { SNS } from 'aws-sdk';
import { ChecklistItem, ProjectStatus } from './types';

export class ChecklistNotification {
  private sns: SNS;
  private readonly topicArn: string;

  constructor() {
    this.sns = new SNS({ region: process.env.AWS_REGION || 'us-east-1' });
    this.topicArn = process.env.CHECKLIST_NOTIFICATION_TOPIC_ARN || '';
  }

  async notifyStatusChange(
    item: ChecklistItem,
    oldStatus: ProjectStatus,
    newStatus: ProjectStatus
  ): Promise<void> {
    const message = {
      type: 'STATUS_CHANGE',
      itemId: item.id,
      title: item.title,
      oldStatus,
      newStatus,
      timestamp: new Date().toISOString(),
      category: item.category,
      priority: item.priority
    };

    await this.publishNotification(message);
  }

  async notifySubtaskComplete(
    item: ChecklistItem,
    subtaskIndex: number,
    assignee?: string
  ): Promise<void> {
    const message = {
      type: 'SUBTASK_COMPLETE',
      itemId: item.id,
      title: item.title,
      subtask: item.subtasks[subtaskIndex],
      assignee,
      timestamp: new Date().toISOString()
    };

    await this.publishNotification(message);
  }

  async notifyDueDateApproaching(item: ChecklistItem): Promise<void> {
    const message = {
      type: 'DUE_DATE_REMINDER',
      itemId: item.id,
      title: item.title,
      dueDate: item.dueDate,
      status: item.status,
      priority: item.priority,
      timestamp: new Date().toISOString()
    };

    await this.publishNotification(message);
  }

  private async publishNotification(message: any): Promise<void> {
    if (!this.topicArn) {
      console.warn('Notification topic ARN not configured');
      return;
    }

    try {
      await this.sns.publish({
        TopicArn: this.topicArn,
        Message: JSON.stringify(message),
        MessageAttributes: {
          Type: {
            DataType: 'String',
            StringValue: message.type
          },
          Priority: {
            DataType: 'String',
            StringValue: message.priority || 'NORMAL'
          }
        }
      }).promise();
    } catch (error) {
      console.error('Failed to publish notification:', error);
    }
  }
}