import { CloudWatch } from 'aws-sdk';
import { writeFileSync } from 'fs';

export class PerformanceTrendAnalyzer {
  private cloudwatch: CloudWatch;

  constructor() {
    this.cloudwatch = new CloudWatch({
      region: process.env.AWS_REGION || 'us-east-1'
    });
  }

  async analyzeTrends(days: number = 7) {
    const metrics = await this.getHistoricalMetrics(days);
    const analysis = this.calculateTrends(metrics);
    this.generateTrendReport(analysis);
    await this.detectAnomalies(analysis);
  }

  private async getHistoricalMetrics(days: number) {
    const endTime = new Date();
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - days);

    return this.cloudwatch.getMetricData({
      MetricDataQueries: [
        {
          Id: 'latency',
          MetricStat: {
            Metric: {
              Namespace: 'CareerCanvas/APIManagement/Performance',
              MetricName: 'AverageLatency'
            },
            Period: 3600,
            Stat: 'Average'
          }
        },
        {
          Id: 'throughput',
          MetricStat: {
            Metric: {
              Namespace: 'CareerCanvas/APIManagement/Performance',
              MetricName: 'Throughput'
            },
            Period: 3600,
            Stat: 'Average'
          }
        }
      ],
      StartTime: startTime,
      EndTime: endTime
    }).promise();
  }

  private calculateTrends(metrics: any) {
    return {
      latency: {
        average: this.calculateAverage(metrics.MetricDataResults[0].Values),
        trend: this.calculateTrendDirection(metrics.MetricDataResults[0].Values)
      },
      throughput: {
        average: this.calculateAverage(metrics.MetricDataResults[1].Values),
        trend: this.calculateTrendDirection(metrics.MetricDataResults[1].Values)
      }
    };
  }

  private calculateAverage(values: number[]): number {
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  private calculateTrendDirection(values: number[]): 'improving' | 'degrading' | 'stable' {
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = this.calculateAverage(firstHalf);
    const secondAvg = this.calculateAverage(secondHalf);
    
    const threshold = 0.1; // 10% change threshold
    const change = (secondAvg - firstAvg) / firstAvg;
    
    if (Math.abs(change) < threshold) return 'stable';
    return change > 0 ? 'degrading' : 'improving';
  }

  private async detectAnomalies(analysis: any) {
    if (analysis.latency.trend === 'degrading') {
      await this.cloudwatch.putMetricAlarm({
        AlarmName: 'PerformanceDegradation',
        MetricName: 'AverageLatency',
        Namespace: 'CareerCanvas/APIManagement/Performance',
        Period: 300,
        EvaluationPeriods: 2,
        Threshold: analysis.latency.average * 1.5,
        ComparisonOperator: 'GreaterThanThreshold',
        AlarmDescription: 'Performance degradation detected'
      }).promise();
    }
  }

  private generateTrendReport(analysis: any) {
    const report = {
      timestamp: new Date().toISOString(),
      analysis,
      recommendations: this.generateRecommendations(analysis)
    };

    writeFileSync(
      'performance-reports/trend-analysis.json',
      JSON.stringify(report, null, 2)
    );
  }

  private generateRecommendations(analysis: any) {
    const recommendations = [];
    
    if (analysis.latency.trend === 'degrading') {
      recommendations.push('Consider scaling up resources');
      recommendations.push('Review recent code changes');
    }
    
    if (analysis.throughput.trend === 'degrading') {
      recommendations.push('Check for bottlenecks in the system');
      recommendations.push('Review connection pooling settings');
    }

    return recommendations;
  }
}