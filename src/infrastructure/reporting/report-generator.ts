import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { BenchmarkConfig } from '../benchmarks/benchmark-config';

@Injectable()
export class ReportGenerator {
  private s3: S3;
  private benchmarkConfig: BenchmarkConfig;

  constructor() {
    this.s3 = new S3({
      region: process.env.AWS_REGION || 'us-east-1'
    });
    this.benchmarkConfig = new BenchmarkConfig();
  }

  async generateReport(metrics: any) {
    const benchmarks = await this.benchmarkConfig.loadBenchmarks();
    const report = {
      timestamp: new Date().toISOString(),
      metrics,
      benchmarks,
      analysis: this.analyzeMetrics(metrics, benchmarks),
      recommendations: this.generateRecommendations(metrics, benchmarks)
    };

    await this.saveReport(report);
    return report;
  }

  private analyzeMetrics(metrics: any, benchmarks: any) {
    return {
      latencyStatus: this.analyzeLatency(metrics.latency, benchmarks.latency),
      throughputStatus: this.analyzeThroughput(metrics.throughput, benchmarks.throughput),
      errorStatus: this.analyzeErrors(metrics.errorRate, benchmarks.errorRate)
    };
  }

  private generateRecommendations(metrics: any, benchmarks: any) {
    const recommendations = [];

    if (metrics.latency.p95 > benchmarks.latency.p95) {
      recommendations.push('Consider optimizing database queries');
      recommendations.push('Review caching strategies');
    }

    if (metrics.throughput.current < benchmarks.throughput.minimum) {
      recommendations.push('Consider scaling up resources');
      recommendations.push('Review connection pooling settings');
    }

    return recommendations;
  }

  private async saveReport(report: any) {
    const date = new Date();
    const key = `reports/${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}/performance-report.json`;

    await this.s3.putObject({
      Bucket: process.env.REPORTS_BUCKET || 'careercanvas-reports',
      Key: key,
      Body: JSON.stringify(report, null, 2),
      ContentType: 'application/json'
    }).promise();
  }

  private analyzeLatency(current: any, benchmark: any) {
    return {
      status: current.p95 <= benchmark.p95 ? 'healthy' : 'degraded',
      difference: ((current.p95 - benchmark.p95) / benchmark.p95) * 100
    };
  }

  private analyzeThroughput(current: any, benchmark: any) {
    return {
      status: current >= benchmark.minimum ? 'healthy' : 'degraded',
      difference: ((current - benchmark.minimum) / benchmark.minimum) * 100
    };
  }

  private analyzeErrors(current: any, benchmark: any) {
    return {
      status: current <= benchmark.maximum ? 'healthy' : 'degraded',
      difference: ((current - benchmark.maximum) / benchmark.maximum) * 100
    };
  }
}