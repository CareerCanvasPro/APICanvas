import { Test, TestingModule } from '@nestjs/testing';
import { TokenController } from './token.controller';
import { TokenService } from '../services/token.service';
import { UnauthorizedException } from '@nestjs/common';

describe('TokenController', () => {
  let controller: TokenController;
  let service: TokenService;

  const mockTokenService = {
    findAllByApiId: jest.fn(),
    createToken: jest.fn(),
    removeToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TokenController],
      providers: [
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
      ],
    }).compile();

    controller = module.get<TokenController>(TokenController);
    service = module.get<TokenService>(TokenService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return array of tokens', async () => {
      const mockTokens = [
        { id: '1', api_id: 'api1', status: 'active' },
        { id: '2', api_id: 'api1', status: 'revoked' }
      ];
      mockTokenService.findAllByApiId.mockResolvedValue(mockTokens);

      const result = await controller.findAll('api1');
      expect(result).toBe(mockTokens);
      expect(service.findAllByApiId).toHaveBeenCalledWith('api1');
    });
  });

  describe('create', () => {
    it('should create a new token', async () => {
      const mockToken = { 
        id: '1', 
        api_id: 'api1', 
        status: 'active',
        created: expect.any(String),
        expires: expect.any(String)
      };
      mockTokenService.createToken.mockResolvedValue(mockToken);

      const result = await controller.create('api1');
      expect(result).toBe(mockToken);
      expect(service.createToken).toHaveBeenCalledWith('api1');
    });
  });

  describe('remove', () => {
    it('should remove a token', async () => {
      await controller.remove('api1', 'token1');
      expect(service.removeToken).toHaveBeenCalledWith('api1', 'token1');
    });

    it('should handle unauthorized token removal', async () => {
      mockTokenService.removeToken.mockRejectedValue(new UnauthorizedException());
      
      await expect(controller.remove('api1', 'token1'))
        .rejects
        .toThrow(UnauthorizedException);
    });
  });
});