import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from './token.service';
import { ApiService } from './api.service';
import { DynamoDBService } from '../utils/dynamodb.service';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';

describe('TokenService', () => {
  let service: TokenService;
  let apiService: ApiService;
  let dynamoDBService: DynamoDBService;

  const mockDynamoDBService = {
    query: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  };

  const mockApiService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: DynamoDBService,
          useValue: mockDynamoDBService,
        },
        {
          provide: ApiService,
          useValue: mockApiService,
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    apiService = module.get<ApiService>(ApiService);
    dynamoDBService = module.get<DynamoDBService>(DynamoDBService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllByApiId', () => {
    it('should return all tokens for an API', async () => {
      const mockTokens = [{ id: '1', api_id: 'api1' }];
      mockDynamoDBService.query.mockResolvedValue({ Items: mockTokens });

      const result = await service.findAllByApiId('api1');
      expect(result).toEqual(mockTokens);
      expect(dynamoDBService.query).toHaveBeenCalled();
    });
  });

  describe('validateToken', () => {
    it('should validate an active token', async () => {
      const mockToken = {
        id: '1',
        status: 'active',
        expires: new Date(Date.now() + 86400000).toISOString(),
      };
      mockDynamoDBService.get.mockResolvedValue({ Item: mockToken });

      const result = await service.validateToken('1');
      expect(result).toBeTruthy();
    });

    it('should throw UnauthorizedException for expired token', async () => {
      const mockToken = {
        id: '1',
        status: 'active',
        expires: new Date(Date.now() - 86400000).toISOString(),
      };
      mockDynamoDBService.get.mockResolvedValue({ Item: mockToken });

      await expect(service.validateToken('1')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('createToken', () => {
    it('should create a new token', async () => {
      const mockApi = { id: 'api1', name: 'Test API' };
      mockApiService.findOne.mockResolvedValue(mockApi);
      mockDynamoDBService.put.mockResolvedValue({});

      const result = await service.createToken('api1');
      expect(result).toHaveProperty('id');
      expect(result.api_id).toBe('api1');
      expect(dynamoDBService.put).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent API', async () => {
      mockApiService.findOne.mockRejectedValue(new NotFoundException());
      await expect(service.createToken('invalid')).rejects.toThrow(NotFoundException);
    });
  });
});