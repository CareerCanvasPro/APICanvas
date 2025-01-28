import { Injectable } from '@nestjs/common';
import { ApiService } from '../api/api.service';

@Injectable()
export class AdminService {
  constructor(private readonly apiService: ApiService) {}

  async getDashboardMetrics() {
    const apis = await this.apiService.findAll();
    const metrics = {
      apis: {
        total: apis.length,
        active: apis.filter(api => api.status === 'active').length,
        inactive: apis.filter(api => api.status === 'inactive').length,
        recent: apis.slice(-5)
      },
      usage: {
        totalRequests: await this.getTotalRequests(),
        successRate: await this.getSuccessRate(),
        avgResponseTime: await this.getAverageResponseTime()
      },
      limits: {
        totalRateLimit: apis.reduce((sum, api) => sum + api.config.rateLimit, 0),
        avgTimeout: apis.reduce((sum, api) => sum + api.config.timeout, 0) / apis.length
      }
    };

    return metrics;
  }

  private async getTotalRequests(): Promise<number> {
    // TODO: Implement request counting logic
    return 1000;
  }

  private async getSuccessRate(): Promise<number> {
    // TODO: Implement success rate calculation
    return 98.5;
  }

  private async getAverageResponseTime(): Promise<number> {
    // TODO: Implement average response time calculation
    return 250;
  }
}