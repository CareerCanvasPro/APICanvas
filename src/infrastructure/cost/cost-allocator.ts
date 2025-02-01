import { CostExplorer, Organizations, DynamoDB } from 'aws-sdk';

export class CostAllocator {
  private costExplorer: CostExplorer;
  private organizations: Organizations;
  private dynamodb: DynamoDB;

  constructor() {
    const region = process.env.AWS_REGION || 'us-east-1';
    this.costExplorer = new CostExplorer({ region });
    this.organizations = new Organizations({ region });
    this.dynamodb = new DynamoDB({ region });
  }

  async allocateCosts() {
    const costs = await this.getCostsByService();
    const allocation = await this.calculateAllocation(costs);
    const recommendations = this.generateCostRecommendations(allocation);
    
    await this.storeCostAllocation(allocation);
    return { allocation, recommendations };
  }

  private async getCostsByService() {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    return this.costExplorer.getCostAndUsage({
      TimePeriod: {
        Start: startDate.toISOString().split('T')[0],
        End: endDate
      },
      Granularity: 'MONTHLY',
      Metrics: ['UnblendedCost'],
      GroupBy: [
        { Type: 'DIMENSION', Key: 'SERVICE' },
        { Type: 'TAG', Key: 'Environment' }
      ]
    }).promise();
  }

  private async calculateAllocation(costs: any) {
    const allocation = {
      byService: this.groupCostsByDimension(costs, 'SERVICE'),
      byEnvironment: this.groupCostsByDimension(costs, 'Environment'),
      total: this.calculateTotalCost(costs)
    };

    return allocation;
  }

  private groupCostsByDimension(costs: any, dimension: string) {
    const groups: Record<string, number> = {};
    
    costs.ResultsByTime.forEach((result: any) => {
      result.Groups.forEach((group: any) => {
        const key = group.Keys.find((k: string) => k.includes(dimension));
        const cost = parseFloat(group.Metrics.UnblendedCost.Amount);
        groups[key] = (groups[key] || 0) + cost;
      });
    });

    return groups;
  }

  private calculateTotalCost(costs: any) {
    return costs.ResultsByTime.reduce((total: number, result: any) => {
      return total + result.Groups.reduce((sum: number, group: any) => {
        return sum + parseFloat(group.Metrics.UnblendedCost.Amount);
      }, 0);
    }, 0);
  }

  private generateCostRecommendations(allocation: any) {
    const recommendations = [];

    Object.entries(allocation.byService).forEach(([service, cost]) => {
      if (cost > allocation.total * 0.3) {
        recommendations.push({
          service,
          cost,
          message: `High cost detected for ${service}. Consider optimization.`
        });
      }
    });

    return recommendations;
  }

  private async storeCostAllocation(allocation: any) {
    const timestamp = new Date().toISOString();
    await this.dynamodb.putItem({
      TableName: 'CareerCanvas-CostAllocation',
      Item: {
        timestamp: { S: timestamp },
        allocation: { S: JSON.stringify(allocation) }
      }
    }).promise();
  }
}