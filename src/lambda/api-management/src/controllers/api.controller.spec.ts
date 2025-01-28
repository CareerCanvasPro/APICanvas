import { Test, TestingModule } from '@nestjs/testing';
import { ApiController } from './api.controller';
import { ApiService } from '../services/api.service';
import { CreateApiDto, UpdateApiDto } from '../dto/api.dto';

describe('ApiController', () => {
  let controller: ApiController;
  let service: ApiService;

  const mockApiService = {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiController],
      providers: [
        {
          provide: ApiService,
          useValue: mockApiService,
        },
      ],
    }).compile();

    controller = module.get<ApiController>(ApiController);
    service = module.get<ApiService>(ApiService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return array of APIs', async () => {
      const mockApis = [{ id: '1', name: 'Test API' }];
      mockApiService.findAll.mockResolvedValue(mockApis);

      const result = await controller.findAll();
      expect(result).toBe(mockApis);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new API', async () => {
      const createApiDto: CreateApiDto = {
        name: 'New API',
        endpoint: 'https://api.test.com',
        method: 'GET',
        config: {
          rateLimit: 100,
          cacheDuration: 300,
          timeout: 5000
        }
      };
      const mockCreatedApi = { id: '1', ...createApiDto };
      mockApiService.create.mockResolvedValue(mockCreatedApi);

      const result = await controller.create(createApiDto);
      expect(result).toBe(mockCreatedApi);
      expect(service.create).toHaveBeenCalledWith(createApiDto);
    });
  });

  describe('update', () => {
    it('should update an API', async () => {
      const updateApiDto: UpdateApiDto = {
        name: 'Updated API'
      };
      const mockUpdatedApi = { id: '1', ...updateApiDto };
      mockApiService.update.mockResolvedValue(mockUpdatedApi);

      const result = await controller.update('1', updateApiDto);
      expect(result).toBe(mockUpdatedApi);
      expect(service.update).toHaveBeenCalledWith('1', updateApiDto);
    });
  });

  describe('remove', () => {
    it('should remove an API', async () => {
      await controller.remove('1');
      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });
});