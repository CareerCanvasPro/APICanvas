import { Test, TestingModule } from '@nestjs/testing';
import { ApiService } from './api.service';
import { DynamoDBService } from '../utils/dynamodb.service';
import { CreateApiDto } from '../dto/api.dto';

describe('ApiService', () => {
  let service: ApiService;
  let dynamoDBService: DynamoDBService;

  const mockDynamoDBService = {
    scan: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiService,
        {
          provide: DynamoDBService,
          useValue: mockDynamoDBService,
        },
      ],
    }).compile();

    service = module.get<ApiService>(ApiService);
    dynamoDBService = module.get<DynamoDBService>(DynamoDBService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all APIs', async () => {
      const mockApis = [{ id: '1', name: 'Test API' }];
      mockDynamoDBService.scan.mockResolvedValue({ Items: mockApis });

      const result = await service.findAll();
      expect(result).toEqual(mockApis);
      expect(dynamoDBService.scan).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new API', async () => {
      const createApiDto: CreateApiDto = {
        name: 'Test API',
        endpoint: 'https://api.test.com',
        method: 'GET',
        config: {
          rateLimit: 100,
          cacheDuration: 300,
          timeout: 5000
        }
      };

      mockDynamoDBService.put.mockResolvedValue({});

      const result = await service.create(createApiDto);
      expect(result).toHaveProperty('id');
      expect(result.name).toBe(createApiDto.name);
      expect(dynamoDBService.put).toHaveBeenCalled();
    });
  });
});