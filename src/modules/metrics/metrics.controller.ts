import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { ApiKeyGuard } from '../../core/guards/api-key.guard';

@Controller('metrics')
@UseGuards(ApiKeyGuard)
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('daily')
  async getDailyMetrics(
    @Query('apiId') apiId: string,
    @Query('date') date?: string
  ) {
    return this.metricsService.getDailyMetrics(apiId, date);
  }

  @Get('monthly')
  async getMonthlyMetrics(
    @Query('apiId') apiId: string,
    @Query('month') month?: string
  ) {
    return this.metricsService.getMonthlyMetrics(apiId, month);
  }

  @Get('summary')
  async getMetricsSummary(@Query('apiId') apiId: string) {
    return this.metricsService.getMetricsSummary(apiId);
  }
}