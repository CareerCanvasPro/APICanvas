import { Test } from '@nestjs/testing';
import { DynamoDBService } from '../src/services/dynamodb.service';

export const createTestingModule = async (providers: any[]) => {
  const module = await Test.createTestingModule({
    providers: [
      {
        provide: DynamoDBService,
        useValue: {
          query: jest.fn(),
          scan: jest.fn(),
          get: jest.fn(),
          put: jest.fn(),
          delete: jest.fn(),
          update: jest.fn(),
          batchWrite: jest.fn(),
          batchGet: jest.fn()
        }
      },
      ...providers
    ],
  }).compile();

  return module;
};