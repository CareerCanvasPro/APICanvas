import { Test } from '@nestjs/testing';
import { DynamoDBService } from '../src/utils/dynamodb.service';
import { DynamoDBClient, CreateTableCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

beforeAll(async () => {
  // Configure AWS SDK v3 for testing
  process.env.AWS_REGION = 'us-east-1';
  process.env.AWS_ACCESS_KEY_ID = 'test';
  process.env.AWS_SECRET_ACCESS_KEY = 'test';
  process.env.DYNAMODB_ENDPOINT = 'http://localhost:8000';

  const ddbClient = new DynamoDBClient({
    endpoint: process.env.DYNAMODB_ENDPOINT,
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });

  // Create test tables
  const tables = ['apis', 'tokens', 'metrics'];
  for (const table of tables) {
    try {
      await ddbClient.send(new CreateTableCommand({
        TableName: `api-management-${table}`,
        AttributeDefinitions: [
          { AttributeName: 'id', AttributeType: 'S' }
        ],
        KeySchema: [
          { AttributeName: 'id', KeyType: 'HASH' }
        ],
        BillingMode: 'PAY_PER_REQUEST'
      }));
    } catch (error) {
      // Table might already exist
      console.log(`Table ${table} setup: ${error.message}`);
    }
  }

  // Configure DynamoDB Document Client
  const docClient = DynamoDBDocumentClient.from(ddbClient, {
    marshallOptions: {
      removeUndefinedValues: true,
      convertEmptyValues: true
    }
  });

  global.__DYNAMODB_DOC_CLIENT__ = docClient;
});

afterAll(async () => {
  // Clean up test data
  const ddbClient = new DynamoDBClient({
    endpoint: process.env.DYNAMODB_ENDPOINT,
    region: process.env.AWS_REGION
  });
  
  // Add cleanup logic here if needed
});

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