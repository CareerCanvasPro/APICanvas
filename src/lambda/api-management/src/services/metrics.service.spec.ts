import { Test, TestingModule } from '@nestjs/testing';
import { MetricsService } from './metrics.service';
import { DynamoDBService } from '../utils/dynamodb.service';
import { MetricsQueryDto } from '../dto/metrics.dto';

describe('MetricsService', () => {
  let service: MetricsService;
  let dynamoDBService: DynamoDBService;

  const mockDynamoDBService = {
    query: jest.fn().mockResolvedValue({ Items: [] }),
    scan: jest.fn().mockResolvedValue({ Items: [] })
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricsService,
        {
          provide: DynamoDBService,
          useValue: mockDynamoDBService,
        },
      ],
    }).compile();

    service = module.get<MetricsService>(MetricsService);
    dynamoDBService = module.get<DynamoDBService>(DynamoDBService);
  });

  describe('getMetrics', () => {
    const mockQuery: MetricsQueryDto = {
      start_date: '2024-01-01',
      end_date: '2024-01-31'
    };

    const mockMetricsData = [
      {
        api_id: 'api1',
        timestamp: '2024-01-01T10:00:00Z',
        requests: 100,
        errors: 5,
        latency: 250,
        rate_limit_hits: 2
      },
      {
        api_id: 'api1',
        timestamp: '2024-01-01T11:00:00Z',
        requests: 150,
        errors: 3,
        latency: 200,
        rate_limit_hits: 1
      }
    ];

    it('should return aggregated metrics', async () => {
      mockDynamoDBService.query.mockResolvedValueOnce({ Items: mockMetricsData });

      const result = await service.getMetrics('api1', mockQuery);
      
      const totalRequests = mockMetricsData.reduce((sum, item) => sum + item.requests, 0);
      const totalErrors = mockMetricsData.reduce((sum, item) => sum + item.errors, 0);
      const errorRate = (totalErrors / totalRequests) * 100;
      const avgLatency = mockMetricsData.reduce((sum, item) => sum + item.latency, 0) / mockMetricsData.length;
      const rateLimit = mockMetricsData.reduce((sum, item) => sum + item.rate_limit_hits, 0);

      expect(result).toEqual({
        api_id: 'api1',
        period: 'all',
        total_requests: totalRequests,
        error_rate: errorRate,
        avg_latency: avgLatency,
        rate_limit_violations: rateLimit
      });
    });

    it('should handle empty metrics data', async () => {
      mockDynamoDBService.query.mockResolvedValueOnce({ Items: [] });
      const result = await service.getMetrics('api1', mockQuery);
      
      expect(result).toEqual({
        api_id: 'api1',
        period: 'all',
        total_requests: 0,
        error_rate: 0,
        avg_latency: 0,
        rate_limit_violations: 0
      });
    });
  });

  describe('getDailyMetrics', () => {
    it('should return metrics grouped by day', async () => {
      const mockQuery: MetricsQueryDto = {
        api_id: 'api1',
        start_date: '2024-01-01'
      };

      const result = await service.getDailyMetrics('api1', mockQuery);
      expect(Array.isArray(result)).toBeTruthy();
    });
  });

  describe('getMonthlyMetrics', () => {
    it('should return metrics grouped by month', async () => {
      const mockQuery: MetricsQueryDto = {
        api_id: 'api1',
        start_date: '2024-01-01'
      };

      const result = await service.getMonthlyMetrics('api1', mockQuery);
      expect(Array.isArray(result)).toBeTruthy();
    });
  });
});