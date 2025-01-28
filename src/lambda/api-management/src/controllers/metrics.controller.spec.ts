import { Test, TestingModule } from '@nestjs/testing';
import { MetricsController } from './metrics.controller';
import { MetricsService } from '../services/metrics.service';
import { TokenService } from '../services/token.service';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { MetricsQueryDto } from '../dto/metrics.dto';

describe('MetricsController', () => {
  let controller: MetricsController;
  let metricsService: MetricsService;

  const mockMetricsService = {
    getMetrics: jest.fn(),
    getDailyMetrics: jest.fn(),
    getMonthlyMetrics: jest.fn()
  };

  const mockTokenService = {
    validateToken: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetricsController],
      providers: [
        {
          provide: MetricsService,
          useValue: mockMetricsService
        },
        {
          provide: TokenService,
          useValue: mockTokenService
        }
      ]
    })
    .overrideGuard(ApiKeyGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<MetricsController>(MetricsController);
    metricsService = module.get<MetricsService>(MetricsService);
  });

  describe('getMetrics', () => {
    it('should return metrics for an API', async () => {
      const mockQuery: MetricsQueryDto = {
        start_date: '2024-01-01',
        end_date: '2024-01-31'
      };

      const mockMetrics = {
        api_id: 'api1',
        total_requests: 1000,
        error_rate: 0.02,
        avg_latency: 200,
        rate_limit_violations: 5
      };

      mockMetricsService.getMetrics.mockResolvedValue(mockMetrics);

      const result = await controller.getMetrics('api1', mockQuery);
      expect(result).toBe(mockMetrics);
      expect(metricsService.getMetrics).toHaveBeenCalledWith('api1', mockQuery);
    });
  });

  describe('getDailyMetrics', () => {
    it('should return daily metrics', async () => {
      const mockQuery: MetricsQueryDto = {
        start_date: '2024-01-01',
        end_date: '2024-01-31'
      };

      const mockDailyMetrics = [{
        api_id: 'api1',
        period: '2024-01-01',
        total_requests: 500,
        error_rate: 0.01,
        avg_latency: 180,
        rate_limit_violations: 2
      }];

      mockMetricsService.getDailyMetrics.mockResolvedValue(mockDailyMetrics);

      const result = await controller.getDailyMetrics('api1', mockQuery);
      expect(result).toBe(mockDailyMetrics);
      expect(metricsService.getDailyMetrics).toHaveBeenCalledWith('api1', mockQuery);
    });
  });

  describe('getMonthlyMetrics', () => {
    it('should return monthly metrics', async () => {
      const mockQuery: MetricsQueryDto = {
        start_date: '2024-01-01',
        end_date: '2024-01-31'
      };

      const mockMonthlyMetrics = [{
        api_id: 'api1',
        period: '2024-01',
        total_requests: 15000,
        error_rate: 0.015,
        avg_latency: 190,
        rate_limit_violations: 45
      }];

      mockMetricsService.getMonthlyMetrics.mockResolvedValue(mockMonthlyMetrics);

      const result = await controller.getMonthlyMetrics('api1', mockQuery);
      expect(result).toBe(mockMonthlyMetrics);
      expect(metricsService.getMonthlyMetrics).toHaveBeenCalledWith('api1', mockQuery);
    });
  });
});