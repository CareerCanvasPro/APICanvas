import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

export class BenchmarkConfig {
  private readonly benchmarkPath = join(__dirname, '../../../benchmarks/baseline.json');

  private readonly defaultBenchmarks = {
    latency: {
      p50: 100,  // 50th percentile in ms
      p95: 200,  // 95th percentile in ms
      p99: 500   // 99th percentile in ms
    },
    throughput: {
      minimum: 100,  // requests per second
      target: 500
    },
    errorRate: {
      maximum: 1.0   // percentage
    }
  };

  async loadBenchmarks() {
    try {
      const data = readFileSync(this.benchmarkPath, 'utf8');
      return JSON.parse(data);
    } catch {
      await this.saveBenchmarks(this.defaultBenchmarks);
      return this.defaultBenchmarks;
    }
  }

  async saveBenchmarks(benchmarks: any) {
    writeFileSync(this.benchmarkPath, JSON.stringify(benchmarks, null, 2));
  }

  async updateBenchmarks(newMetrics: any) {
    const current = await this.loadBenchmarks();
    const updated = this.calculateNewBaseline(current, newMetrics);
    await this.saveBenchmarks(updated);
    return updated;
  }

  private calculateNewBaseline(current: any, newMetrics: any) {
    return {
      latency: {
        p50: (current.latency.p50 + newMetrics.latency.p50) / 2,
        p95: (current.latency.p95 + newMetrics.latency.p95) / 2,
        p99: (current.latency.p99 + newMetrics.latency.p99) / 2
      },
      throughput: {
        minimum: Math.min(current.throughput.minimum, newMetrics.throughput.minimum),
        target: (current.throughput.target + newMetrics.throughput.target) / 2
      },
      errorRate: {
        maximum: Math.max(current.errorRate.maximum, newMetrics.errorRate.maximum)
      }
    };
  }
}