import { Test, TestingModule } from '@nestjs/testing';
import { TokenController } from './token.controller';
import { TokenService } from '../services/token.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

describe('TokenController', () => {
  let controller: TokenController;
  let service: TokenService;

  const mockTokenService = {
    createToken: jest.fn(),
    findAllByApiId: jest.fn(),
    validateToken: jest.fn(),
    removeToken: jest.fn(),
    getToken: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TokenController],
      providers: [
        {
          provide: TokenService,
          useValue: mockTokenService
        }
      ]
    }).compile();

    controller = module.get<TokenController>(TokenController);
    service = module.get<TokenService>(TokenService);

    jest.clearAllMocks();
  });

  describe('createToken', () => {
    it('should create a new token', async () => {
      const mockToken = {
        id: 'token123',
        api_id: 'api1',
        status: 'active',
        created: expect.any(String),
        expires: expect.any(String)
      };

      mockTokenService.createToken.mockResolvedValue(mockToken);

      const result = await controller.createToken('api1');
      expect(result).toEqual(mockToken);
      expect(service.createToken).toHaveBeenCalledWith('api1');
    });

    it('should throw NotFoundException when API not found', async () => {
      mockTokenService.createToken.mockRejectedValue(new NotFoundException());
      await expect(controller.createToken('invalid-api')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllByApiId', () => {
    it('should return all tokens for an API', async () => {
      const mockTokens = [
        { id: 'token1', api_id: 'api1' },
        { id: 'token2', api_id: 'api1' }
      ];

      mockTokenService.findAllByApiId.mockResolvedValue(mockTokens);

      const result = await controller.findAllByApiId('api1');
      expect(result).toEqual(mockTokens);
      expect(service.findAllByApiId).toHaveBeenCalledWith('api1');
    });

    it('should return empty array when no tokens exist', async () => {
      mockTokenService.findAllByApiId.mockResolvedValue([]);
      const result = await controller.findAllByApiId('api1');
      expect(result).toEqual([]);
    });
  });

  describe('validateToken', () => {
    it('should validate a valid token', async () => {
      mockTokenService.validateToken.mockResolvedValue(true);
      const result = await controller.validateToken('valid-token');
      expect(result).toBeTruthy();
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      mockTokenService.validateToken.mockRejectedValue(new UnauthorizedException());
      await expect(controller.validateToken('invalid-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('removeToken', () => {
    it('should remove a token', async () => {
      await controller.removeToken('api1', 'token1');
      expect(service.removeToken).toHaveBeenCalledWith('api1', 'token1');
    });

    it('should throw NotFoundException when token not found', async () => {
      mockTokenService.removeToken.mockRejectedValue(new NotFoundException());
      await expect(controller.removeToken('api1', 'invalid-token')).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException when token does not belong to API', async () => {
      mockTokenService.removeToken.mockRejectedValue(new UnauthorizedException());
      await expect(controller.removeToken('api2', 'token1')).rejects.toThrow(UnauthorizedException);
    });
  });
});