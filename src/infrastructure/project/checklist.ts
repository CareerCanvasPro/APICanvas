import { DynamoDB } from 'aws-sdk';
import { ChecklistItem, ProjectStatus, Priority } from './types';
import { ChecklistFilter, SubtaskStatus, ProjectProgress } from './types';
import { ChecklistNotification } from './notification';
import { DependencyGraph } from './dependency';
import { TaskAnalytics } from './analytics';

export class ProjectChecklist {
  private dynamoDB: DynamoDB.DocumentClient;
  private readonly tableName = 'CareerCanvas-ProjectChecklist';
  private notification: ChecklistNotification;
  private dependencyGraph: DependencyGraph;
  private analytics: TaskAnalytics;

  constructor() {
    this.dynamoDB = new DynamoDB.DocumentClient({
      region: process.env.AWS_REGION || 'us-east-1'
    });
    this.notification = new ChecklistNotification();
    this.dependencyGraph = new DependencyGraph();
    this.analytics = new TaskAnalytics();
  }

  async initializeChecklist(): Promise<void> {
    const items: ChecklistItem[] = [
      // API Service Tasks
      {
        id: 'API-001',
        category: 'API',
        title: 'Security Implementation',
        description: 'Implement comprehensive security measures',
        priority: Priority.HIGH,
        status: ProjectStatus.IN_PROGRESS,
        subtasks: [
          'Configure AWS Security Services',
          'Implement Authentication',
          'Setup Authorization',
          'Enable Audit Logging'
        ]
      },
      {
        id: 'API-002',
        category: 'API',
        title: 'Performance Optimization',
        description: 'Optimize API performance and scalability',
        priority: Priority.HIGH,
        status: ProjectStatus.PENDING,
        subtasks: [
          'Implement Caching',
          'Setup Load Balancing',
          'Configure Auto-scaling',
          'Optimize Database Queries'
        ]
      },
      
      // Admin Dashboard Tasks
      {
        id: 'ADMIN-001',
        category: 'Dashboard',
        title: 'User Management Interface',
        description: 'Implement user management features',
        priority: Priority.MEDIUM,
        status: ProjectStatus.PENDING,
        subtasks: [
          'User CRUD Operations',
          'Role Management',
          'Permission Settings',
          'User Activity Logs'
        ]
      },
      {
        id: 'ADMIN-002',
        category: 'Dashboard',
        title: 'Analytics Dashboard',
        description: 'Implement analytics and reporting features',
        priority: Priority.MEDIUM,
        status: ProjectStatus.PENDING,
        subtasks: [
          'User Analytics',
          'Performance Metrics',
          'Usage Statistics',
          'Export Functionality'
        ]
      }
    ];

    await Promise.all(
      items.map(item =>
        this.dynamoDB.put({
          TableName: this.tableName,
          Item: {
            ...item,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }).promise()
      )
    );
  }

  async addDependency(taskId: string, dependsOnId: string): Promise<void> {
    const [task, dependsOn] = await Promise.all([
      this.getItem(taskId),
      this.getItem(dependsOnId)
    ]);

    if (!task || !dependsOn) {
      throw new Error('Task or dependency not found');
    }

    await this.dynamoDB.update({
      TableName: this.tableName,
      Key: { id: taskId },
      UpdateExpression: 'SET dependencies = list_append(if_not_exists(dependencies, :empty), :newDep)',
      ExpressionAttributeValues: {
        ':empty': [],
        ':newDep': [dependsOnId]
      }
    }).promise();

    await this.dependencyGraph.addDependency(taskId, dependsOnId);
    await this.notification.notifyDependencyAdded(task, dependsOn);
  }

  async updateItemStatus(id: string, status: ProjectStatus): Promise<void> {
    const item = await this.getItem(id);
    if (!item) throw new Error('Item not found');

    // Check dependencies before marking as complete
    if (status === ProjectStatus.COMPLETED) {
      const unfinishedDependencies = await this.dependencyGraph.getUnfinishedDependencies(id);
      if (unfinishedDependencies.length > 0) {
        throw new Error('Cannot complete task: unfinished dependencies exist');
      }
    }

    const oldStatus = item.status;
    await this.dynamoDB.update({
      TableName: this.tableName,
      Key: { id },
      UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': status,
        ':updatedAt': new Date().toISOString()
      }
    }).promise();

    await Promise.all([
      this.notification.notifyStatusChange(item, oldStatus, status),
      this.analytics.trackStatusChange(item, oldStatus, status)
    ]);
  }

  async getTaskAnalytics(taskId: string): Promise<any> {
    const item = await this.getItem(taskId);
    if (!item) throw new Error('Task not found');

    const [dependencies, blockedTasks] = await Promise.all([
      this.dependencyGraph.getDependencies(taskId),
      this.dependencyGraph.getBlockedTasks(taskId)
    ]);

    return {
      task: item,
      dependencies,
      blockedTasks,
      metrics: await this.analytics.getTaskMetrics(taskId),
      timeline: await this.analytics.getTaskTimeline(taskId)
    };
  }

  async getCriticalPath(): Promise<ChecklistItem[]> {
    const items = await this.getChecklist();
    return this.dependencyGraph.calculateCriticalPath(items);
  }
}

  async getChecklist(): Promise<ChecklistItem[]> {
    const result = await this.dynamoDB.scan({
      TableName: this.tableName
    }).promise();

    return result.Items as ChecklistItem[];
  }

  async getProgress(): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
  }> {
    const items = await this.getChecklist();
    
    return {
      total: items.length,
      completed: items.filter(item => item.status === ProjectStatus.COMPLETED).length,
      inProgress: items.filter(item => item.status === ProjectStatus.IN_PROGRESS).length,
      pending: items.filter(item => item.status === ProjectStatus.PENDING).length
    };
  }

  async updateSubtaskStatus(
    itemId: string,
    subtaskIndex: number,
    completed: boolean,
    assignee?: string
  ): Promise<void> {
    const item = await this.getItem(itemId);
    if (!item) throw new Error('Item not found');

    const subtasks = item.subtasks.map((task, index) => {
      if (index === subtaskIndex) {
        return {
          task: typeof task === 'string' ? task : task.task,
          completed,
          assignee,
          completedAt: completed ? new Date().toISOString() : undefined
        };
      }
      return typeof task === 'string' ? { task, completed: false } : task;
    });

    await this.dynamoDB.update({
      TableName: this.tableName,
      Key: { id: itemId },
      UpdateExpression: 'SET subtasks = :subtasks, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':subtasks': subtasks,
        ':updatedAt': new Date().toISOString()
      }
    }).promise();

    if (completed) {
      await this.notification.notifySubtaskComplete(item, subtaskIndex, assignee);
    }
  }

  async filterChecklist(filters: ChecklistFilter): Promise<ChecklistItem[]> {
    const items = await this.getChecklist();
    
    return items.filter(item => {
      if (filters.category && item.category !== filters.category) return false;
      if (filters.priority && item.priority !== filters.priority) return false;
      if (filters.status && item.status !== filters.status) return false;
      if (filters.assignee && item.assignee !== filters.assignee) return false;
      if (filters.tags && !filters.tags.every(tag => item.tags?.includes(tag))) return false;
      return true;
    });
  }

  async getDetailedProgress(): Promise<ProjectProgress> {
    const items = await this.getChecklist();
    const total = items.length;
    const statusCounts = items.reduce(
      (acc, item) => {
        acc[item.status]++;
        return acc;
      },
      {
        COMPLETED: 0,
        IN_PROGRESS: 0,
        PENDING: 0,
        BLOCKED: 0
      }
    );

    return {
      total,
      ...statusCounts,
      completionPercentage: (statusCounts.COMPLETED / total) * 100
    };
  }

  private async getItem(id: string): Promise<ChecklistItem | null> {
    const result = await this.dynamoDB.get({
      TableName: this.tableName,
      Key: { id }
    }).promise();

    return result.Item as ChecklistItem || null;
  }
}