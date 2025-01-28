import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { RateLimitService } from './rate-limit.service';
import { DynamoDBService } from '../utils/dynamodb.service';
import { Api } from '../interfaces/api.interface';

describe('RateLimitService', () => {
  let service: RateLimitService;
  let dynamoDBService: DynamoDBService;

  const mockApi: Api = {
    id: 'api1',
    name: 'Test API',
    endpoint: '/test',
    method: 'GET',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    config: {
      rateLimit: 100
    }
  };

  const mockDynamoDBService = {
    query: jest.fn(),
    put: jest.fn(),
    get: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    scan: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RateLimitService,
        {
          provide: DynamoDBService,
          useValue: mockDynamoDBService
        }
      ]
    }).compile();

    service = module.get<RateLimitService>(RateLimitService);
    dynamoDBService = module.get<DynamoDBService>(DynamoDBService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkRateLimit', () => {
    it('should allow requests within rate limit', async () => {
      mockDynamoDBService.query.mockResolvedValue({ Count: 50 });
      mockDynamoDBService.put.mockResolvedValue({});

      const result = await service.checkRateLimit('token1', mockApi);
      expect(result).toBeTruthy();
      expect(dynamoDBService.put).toHaveBeenCalled();
    });

    it('should throw exception when rate limit exceeded', async () => {
      mockDynamoDBService.query.mockResolvedValue({ Count: 100 });

      await expect(service.checkRateLimit('token1', mockApi))
        .rejects
        .toThrow(new HttpException('Rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS));
    });

    it('should record request after successful check', async () => {
      mockDynamoDBService.query.mockResolvedValue({ Count: 50 });
      mockDynamoDBService.put.mockResolvedValue({});

      await service.checkRateLimit('token1', mockApi);
      
      expect(dynamoDBService.put).toHaveBeenCalledWith(
        expect.objectContaining({
          TableName: expect.any(String),
          Item: expect.objectContaining({
            token: 'token1',
            api_id: 'api1',
            timestamp: expect.any(Number),
            ttl: expect.any(Number)
          })
        })
      );
    });
  });
});