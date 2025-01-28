import { Controller, Get, Post, UseGuards, HttpStatus, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';
import { TokenMetricsService } from './metrics/token-metrics.service';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { 
  TokenMetricsResponse, 
  SystemHealthResponse, 
  DashboardMetricsResponse 
} from './interfaces/metrics.interface';
import { ErrorResponse } from './interfaces/error.interface';
import { UseInterceptors } from '@nestjs/common';
import { MetricsCacheInterceptor } from './interceptors/cache.interceptor';
import { CacheService } from './services/cache.service';
import { CacheMonitorService } from './services/cache-monitor.service';
import { PerformanceMonitorService } from './services/performance-monitor.service';
import { MetricsAnalyzerService } from './services/metrics-analyzer.service';

@ApiTags('Admin Dashboard')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly tokenMetrics: TokenMetricsService,
    private readonly cacheService: CacheService,
    private readonly cacheMonitor: CacheMonitorService,
    private readonly performanceMonitor: PerformanceMonitorService,
    private readonly metricsAnalyzer: MetricsAnalyzerService
  ) {}

  @Throttle(5, 60) // 5 requests per minute
  @ApiOperation({ summary: 'Get admin dashboard metrics' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns dashboard metrics including API stats and usage data',
    type: DashboardMetricsResponse
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
    type: ErrorResponse
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
    type: ErrorResponse
  })
  @Get('dashboard')
  async getDashboard(): Promise<DashboardMetricsResponse> {
    return await this.adminService.getDashboardMetrics();
  }

  @Throttle(10, 60) // 10 requests per minute
  @ApiOperation({ summary: 'Get token metrics' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns detailed token usage and blacklist metrics',
    type: TokenMetricsResponse
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
    type: ErrorResponse
  })
  @UseInterceptors(MetricsCacheInterceptor)
  @Get('metrics/tokens')
  async getTokenMetrics(): Promise<TokenMetricsResponse> {
    return {
      timestamp: new Date().toISOString(),
      metrics: await this.tokenMetrics.getMetrics()
    };
  }

  @Throttle(20, 60) // 20 requests per minute for health checks
  @ApiOperation({ summary: 'Get system health status' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns system health information and performance metrics',
    type: SystemHealthResponse
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
    type: ErrorResponse
  })
  @UseInterceptors(MetricsCacheInterceptor)
  @Get('metrics/health')
  async getSystemHealth(): Promise<SystemHealthResponse> {
    const metrics = await this.tokenMetrics.getMetrics();
    return {
      status: 'healthy',
      blacklist: {
        total: metrics.totalBlacklisted,
        active: metrics.activeBlacklisted,
        cleanups: metrics.cleanupOperations
      },
      performance: {
        tokenValidations: metrics.tokenValidations,
        lastCleanup: metrics.lastCleanup
      }
    };
  }

  @Post('cache/invalidate/metrics')
  @ApiOperation({ summary: 'Invalidate metrics cache' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Metrics cache invalidated' })
  async invalidateMetricsCache() {
    await this.cacheService.invalidateMetricsCache();
    return { message: 'Metrics cache invalidated successfully' };
  }

  @Post('cache/invalidate/all')
  @ApiOperation({ summary: 'Invalidate all cache' })
  @ApiResponse({ status: HttpStatus.OK, description: 'All cache invalidated' })
  async invalidateAllCache() {
    await this.cacheService.invalidateAllCache();
    return { message: 'All cache invalidated successfully' };
  }

  @Get('cache/stats')
  @ApiOperation({ summary: 'Get cache statistics' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns cache usage statistics' 
  })
  async getCacheStats() {
    return await this.cacheMonitor.getCacheStats();
  }

  @Get('metrics/performance')
  @ApiOperation({ summary: 'Get cache performance metrics' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns detailed cache performance statistics' 
  })
  async getCachePerformance() {
    return {
      timestamp: new Date().toISOString(),
      performance: await this.performanceMonitor.getPerformanceStats()
    };
  }

  @Get('metrics/combined')
  @ApiOperation({ summary: 'Get combined metrics' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns combined cache and performance metrics' 
  })
  async getCombinedMetrics() {
    const [cacheStats, performanceStats] = await Promise.all([
      this.cacheMonitor.getCacheStats(),
      this.performanceMonitor.getPerformanceStats()
    ]);

    return {
      timestamp: new Date().toISOString(),
      cache: cacheStats,
      performance: performanceStats
    };
  }

  @Get('metrics/analysis')
  @ApiOperation({ summary: 'Get metrics analysis' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns comprehensive metrics analysis and recommendations' 
  })
  async getMetricsAnalysis() {
    return await this.metricsAnalyzer.analyzeMetrics();
  }

  @Get('metrics/analysis/health')
  @ApiOperation({ summary: 'Get system health analysis' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns system health status and recommendations' 
  })
  async getHealthAnalysis() {
    const analysis = await this.metricsAnalyzer.analyzeMetrics();
    return {
      timestamp: analysis.timestamp,
      healthStatus: analysis.summary.healthStatus,
      recommendations: analysis.recommendations,
      performance: analysis.summary.performanceScore
    };
  }
}