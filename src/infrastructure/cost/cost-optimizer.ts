import { CostExplorer, DynamoDB } from 'aws-sdk';

export class CostOptimizer {
  private costExplorer: CostExplorer;
  private dynamodb: DynamoDB;

  constructor() {
    this.costExplorer = new CostExplorer({ region: 'us-east-1' });
    this.dynamodb = new DynamoDB({
      region: process.env.AWS_REGION || 'us-east-1'
    });
  }

  async analyzeCosts() {
    const costs = await this.getCostAnalysis();
    const recommendations = await this.generateRecommendations(costs);
    await this.applyOptimizations(recommendations);
    return recommendations;
  }

  private async getCostAnalysis() {
    const date = new Date();
    const startDate = new Date(date.setMonth(date.getMonth() - 1)).toISOString().split('T')[0];
    const endDate = new Date().toISOString().split('T')[0];

    return this.costExplorer.getCostAndUsage({
      TimePeriod: { Start: startDate, End: endDate },
      Granularity: 'DAILY',
      Metrics: ['UnblendedCost'],
      GroupBy: [{ Type: 'DIMENSION', Key: 'SERVICE' }]
    }).promise();
  }

  private async generateRecommendations(costs: any) {
    const recommendations = [];
    const dynamoDBCosts = costs.ResultsByTime
      .map((result: any) => result.Groups
        .find((group: any) => group.Keys[0] === 'Amazon DynamoDB'));

    if (this.shouldOptimizeDynamoDB(dynamoDBCosts)) {
      recommendations.push({
        service: 'DynamoDB',
        action: 'OPTIMIZE_CAPACITY',
        details: 'Consider switching to on-demand capacity'
      });
    }

    return recommendations;
  }

  private async applyOptimizations(recommendations: any[]) {
    for (const rec of recommendations) {
      if (rec.service === 'DynamoDB' && rec.action === 'OPTIMIZE_CAPACITY') {
        await this.optimizeDynamoDBCapacity();
      }
    }
  }

  private shouldOptimizeDynamoDB(costs: any[]) {
    const avgDailyCost = costs.reduce((sum, day) => 
      sum + parseFloat(day.Metrics.UnblendedCost.Amount), 0) / costs.length;
    return avgDailyCost > 50; // Threshold for optimization
  }

  private async optimizeDynamoDBCapacity() {
    const tables = await this.dynamodb.listTables().promise();
    
    for (const tableName of tables.TableNames || []) {
      await this.dynamodb.updateTable({
        TableName: tableName,
        BillingMode: 'PAY_PER_REQUEST'
      }).promise();
    }
  }
}