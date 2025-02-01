import { ChecklistItem, ProjectStatus } from './types';

interface DependencyNode {
  id: string;
  dependencies: string[];
  dependents: string[];
  earliestStart: number;
  earliestFinish: number;
  latestStart: number;
  latestFinish: number;
}

export class DependencyGraph {
  private nodes: Map<string, DependencyNode>;
  private readonly tableName = 'CareerCanvas-Dependencies';

  constructor() {
    this.nodes = new Map();
  }

  async addDependency(taskId: string, dependsOnId: string): Promise<void> {
    if (!this.nodes.has(taskId)) {
      this.nodes.set(taskId, {
        id: taskId,
        dependencies: [],
        dependents: [],
        earliestStart: 0,
        earliestFinish: 0,
        latestStart: 0,
        latestFinish: 0
      });
    }

    if (!this.nodes.has(dependsOnId)) {
      this.nodes.set(dependsOnId, {
        id: dependsOnId,
        dependencies: [],
        dependents: [],
        earliestStart: 0,
        earliestFinish: 0,
        latestStart: 0,
        latestFinish: 0
      });
    }

    const node = this.nodes.get(taskId)!;
    const dependsOnNode = this.nodes.get(dependsOnId)!;

    if (!this.willCreateCycle(taskId, dependsOnId)) {
      node.dependencies.push(dependsOnId);
      dependsOnNode.dependents.push(taskId);
      await this.updateTimings();
    } else {
      throw new Error('Adding this dependency would create a cycle');
    }
  }

  async getUnfinishedDependencies(taskId: string): Promise<string[]> {
    const node = this.nodes.get(taskId);
    if (!node) return [];

    return node.dependencies.filter(depId => {
      const depNode = this.nodes.get(depId);
      return depNode && depNode.earliestFinish > Date.now();
    });
  }

  async calculateCriticalPath(items: ChecklistItem[]): Promise<ChecklistItem[]> {
    await this.updateTimings();
    const criticalPath: string[] = [];
    let maxFinish = 0;

    this.nodes.forEach(node => {
      if (node.latestFinish > maxFinish) {
        maxFinish = node.latestFinish;
      }
    });

    let currentNode = Array.from(this.nodes.values()).find(
      node => node.latestFinish === maxFinish
    );

    while (currentNode) {
      criticalPath.unshift(currentNode.id);
      const nextNode = currentNode.dependencies.length > 0
        ? this.nodes.get(currentNode.dependencies[0])
        : null;
      currentNode = nextNode || null;
    }

    return items.filter(item => criticalPath.includes(item.id));
  }

  private async updateTimings(): Promise<void> {
    // Forward pass
    this.nodes.forEach(node => {
      const maxDependencyFinish = Math.max(
        0,
        ...node.dependencies.map(depId => {
          const depNode = this.nodes.get(depId);
          return depNode ? depNode.earliestFinish : 0;
        })
      );
      node.earliestStart = maxDependencyFinish;
      node.earliestFinish = node.earliestStart + this.estimateTaskDuration(node.id);
    });

    // Backward pass
    const maxFinish = Math.max(...Array.from(this.nodes.values()).map(n => n.earliestFinish));
    this.nodes.forEach(node => {
      if (node.dependents.length === 0) {
        node.latestFinish = maxFinish;
      } else {
        node.latestFinish = Math.min(
          ...node.dependents.map(depId => {
            const depNode = this.nodes.get(depId);
            return depNode ? depNode.latestStart : maxFinish;
          })
        );
      }
      node.latestStart = node.latestFinish - this.estimateTaskDuration(node.id);
    });
  }

  private willCreateCycle(taskId: string, dependsOnId: string): boolean {
    const visited = new Set<string>();
    const explore = (currentId: string): boolean => {
      if (currentId === taskId) return true;
      if (visited.has(currentId)) return false;
      
      visited.add(currentId);
      const node = this.nodes.get(currentId);
      return node ? node.dependencies.some(explore) : false;
    };

    return explore(dependsOnId);
  }

  private estimateTaskDuration(taskId: string): number {
    // Implementation for task duration estimation
    return 24 * 60 * 60 * 1000; // Default 24 hours in milliseconds
  }
}