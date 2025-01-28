import { Test } from '@nestjs/testing';
import { DynamoDBService } from '../src/services/dynamodb.service';

export const mockDynamoDBService = {
  query: jest.fn().mockResolvedValue({ Items: [] }),
  scan: jest.fn().mockResolvedValue({ Items: [] }),
  get: jest.fn().mockResolvedValue({ Item: null }),
  put: jest.fn().mockResolvedValue({}),
  delete: jest.fn().mockResolvedValue({}),
  update: jest.fn().mockResolvedValue({}),
  batchWrite: jest.fn().mockResolvedValue({}),
  batchGet: jest.fn().mockResolvedValue({})
};

export const createTestingModule = async (providers: any[]) => {
  const module = await Test.createTestingModule({
    providers: [
      {
        provide: DynamoDBService,
        useValue: mockDynamoDBService
      },
      ...providers
    ],
  }).compile();

  return module;
};