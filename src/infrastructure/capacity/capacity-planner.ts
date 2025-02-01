import { CloudWatch, EC2, DynamoDB } from 'aws-sdk';

export class CapacityPlanner {
  private cloudwatch: CloudWatch;
  private ec2: EC2;
  private dynamodb: DynamoDB;

  constructor() {
    const region = process.env.AWS_REGION || 'us-east-1';
    this.cloudwatch = new CloudWatch({ region });
    this.ec2 = new EC2({ region });
    this.dynamodb = new DynamoDB({ region });
  }

  async planCapacity() {
    const metrics = await this.collectUsageMetrics();
    const forecast = await this.generateCapacityForecast(metrics);
    const recommendations = this.generateRecommendations(forecast);
    await this.storeCapacityPlan({ metrics, forecast, recommendations });
    return { metrics, forecast, recommendations };
  }

  private async collectUsageMetrics() {
    const endTime = new Date();
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - 30);

    return this.cloudwatch.getMetricData({
      MetricDataQueries: [
        {
          Id: 'cpu',
          MetricStat: {
            Metric: {
              Namespace: 'AWS/EC2',
              MetricName: 'CPUUtilization'
            },
            Period: 3600,
            Stat: 'Average'
          }
        },
        {
          Id: 'memory',
          MetricStat: {
            Metric: {
              Namespace: 'CWAgent',
              MetricName: 'MemoryUtilization'
            },
            Period: 3600,
            Stat: 'Average'
          }
        },
        {
          Id: 'storage',
          MetricStat: {
            Metric: {
              Namespace: 'AWS/EBS',
              MetricName: 'VolumeReadOps'
            },
            Period: 3600,
            Stat: 'Sum'
          }
        }
      ],
      StartTime: startTime,
      EndTime: endTime
    }).promise();
  }

  private async generateCapacityForecast(metrics: any) {
    const forecast = {
      cpu: this.calculateTrend(metrics.MetricDataResults[0].Values),
      memory: this.calculateTrend(metrics.MetricDataResults[1].Values),
      storage: this.calculateTrend(metrics.MetricDataResults[2].Values)
    };

    return forecast;
  }

  private calculateTrend(values: number[]) {
    const n = values.length;
    if (n < 2) return { trend: 'stable', growth: 0 };

    const xMean = (n - 1) / 2;
    const yMean = values.reduce((a, b) => a + b, 0) / n;

    let slope = 0;
    let divisor = 0;
    
    for (let i = 0; i < n; i++) {
      slope += (i - xMean) * (values[i] - yMean);
      divisor += Math.pow(i - xMean, 2);
    }

    const growth = slope / divisor;
    return {
      trend: growth > 0.1 ? 'increasing' : growth < -0.1 ? 'decreasing' : 'stable',
      growth: growth
    };
  }

  private generateRecommendations(forecast: any) {
    const recommendations = [];

    if (forecast.cpu.trend === 'increasing') {
      recommendations.push({
        resource: 'CPU',
        action: 'SCALE_UP',
        reason: 'Increasing CPU utilization trend'
      });
    }

    if (forecast.memory.trend === 'increasing') {
      recommendations.push({
        resource: 'Memory',
        action: 'INCREASE_MEMORY',
        reason: 'Increasing memory utilization trend'
      });
    }

    return recommendations;
  }

  private async storeCapacityPlan(plan: any) {
    const timestamp = new Date().toISOString();
    await this.dynamodb.putItem({
      TableName: 'CareerCanvas-CapacityPlans',
      Item: {
        timestamp: { S: timestamp },
        plan: { S: JSON.stringify(plan) }
      }
    }).promise();
  }
}