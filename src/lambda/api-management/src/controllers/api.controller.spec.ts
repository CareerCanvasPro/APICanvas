import { Test, TestingModule } from '@nestjs/testing';
import { ApiController } from './api.controller';
import { ApiService } from '../services/api.service';
import { CreateApiDto, UpdateApiDto } from '../dto/api.dto';
import { NotFoundException } from '@nestjs/common';

describe('ApiController', () => {
  let controller: ApiController;
  let service: ApiService;

  const mockApiService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiController],
      providers: [
        {
          provide: ApiService,
          useValue: mockApiService
        }
      ]
    }).compile();

    controller = module.get<ApiController>(ApiController);
    service = module.get<ApiService>(ApiService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreateApiDto = {
      name: 'Test API',
      endpoint: '/test',
      method: 'GET',
      config: {
        rateLimit: 100
      }
    };

    it('should create a new API', async () => {
      const expected = {
        id: 'test-id',
        ...createDto,
        status: 'active',
        created_at: expect.any(String),
        updated_at: expect.any(String)
      };

      mockApiService.create.mockResolvedValue(expected);

      const result = await controller.create(createDto);
      expect(result).toEqual(expected);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });

    it('should handle creation errors', async () => {
      mockApiService.create.mockRejectedValue(new Error('Creation failed'));
      await expect(controller.create(createDto)).rejects.toThrow('Creation failed');
    });
  });

  describe('findAll', () => {
    it('should return array of APIs', async () => {
      const mockApis = [{ id: '1', name: 'Test API' }];
      mockApiService.findAll.mockResolvedValue(mockApis);

      const result = await controller.findAll();
      expect(result).toEqual(mockApis);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no APIs exist', async () => {
      mockApiService.findAll.mockResolvedValue([]);
      const result = await controller.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a single API', async () => {
      const mockApi = { id: '1', name: 'Test API' };
      mockApiService.findOne.mockResolvedValue(mockApi);

      const result = await controller.findOne('1');
      expect(result).toEqual(mockApi);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when API not found', async () => {
      mockApiService.findOne.mockRejectedValue(new NotFoundException());
      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateApiDto = {
      name: 'Updated API'
    };

    it('should update an API', async () => {
      const mockUpdatedApi = { id: '1', ...updateDto };
      mockApiService.update.mockResolvedValue(mockUpdatedApi);

      const result = await controller.update('1', updateDto);
      expect(result).toEqual(mockUpdatedApi);
      expect(service.update).toHaveBeenCalledWith('1', updateDto);
    });

    it('should throw NotFoundException when updating non-existent API', async () => {
      mockApiService.update.mockRejectedValue(new NotFoundException());
      await expect(controller.update('999', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove an API', async () => {
      mockApiService.remove.mockResolvedValue(undefined);
      await controller.remove('1');
      expect(service.remove).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when removing non-existent API', async () => {
      mockApiService.remove.mockRejectedValue(new NotFoundException());
      await expect(controller.remove('999')).rejects.toThrow(NotFoundException);
    });
  });
});