import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { MetricsService } from '../services/metrics.service';
import { MetricsQueryDto } from '../dto/metrics.dto';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiSecurity } from '@nestjs/swagger';

@ApiTags('metrics')
@Controller('apis/:apiId/metrics')
@ApiSecurity('x-api-key')
@UseGuards(ApiKeyGuard)
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @ApiOperation({ summary: 'Get API metrics overview' })
  @ApiParam({ name: 'apiId', description: 'API ID' })
  @ApiQuery({ name: 'start_date', required: true, type: String, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'end_date', required: false, type: String, description: 'End date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'API metrics overview' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'API not found' })
  getMetrics(
    @Param('apiId') apiId: string,
    @Query() query: MetricsQueryDto
  ) {
    return this.metricsService.getMetrics(apiId, query);
  }

  @Get('daily')
  @ApiOperation({ summary: 'Get daily API metrics' })
  @ApiParam({ name: 'apiId', description: 'API ID' })
  @ApiQuery({ name: 'start_date', required: true, type: String, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'end_date', required: false, type: String, description: 'End date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Daily API metrics' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'API not found' })
  getDailyMetrics(
    @Param('apiId') apiId: string,
    @Query() query: MetricsQueryDto
  ) {
    return this.metricsService.getDailyMetrics(apiId, query);
  }

  @Get('monthly')
  @ApiOperation({ summary: 'Get monthly API metrics' })
  @ApiParam({ name: 'apiId', description: 'API ID' })
  @ApiQuery({ name: 'start_date', required: true, type: String, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'end_date', required: false, type: String, description: 'End date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Monthly API metrics' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'API not found' })
  getMonthlyMetrics(
    @Param('apiId') apiId: string,
    @Query() query: MetricsQueryDto
  ) {
    return this.metricsService.getMonthlyMetrics(apiId, query);
  }
}