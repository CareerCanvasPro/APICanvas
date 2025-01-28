import { DynamoDBClient, ListTablesCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';

describe('DynamoDB Connection Test', () => {
  const client = new DynamoDBClient({
    endpoint: 'http://localhost:8000',
    region: 'us-east-1',
    credentials: {
      accessKeyId: 'test',
      secretAccessKey: 'test'
    }
  });

  const expectedTables = [
    'api-management-apis',
    'api-management-tokens',
    'api-management-metrics'
  ];

  it('should connect to local DynamoDB', async () => {
    const response = await client.send(new ListTablesCommand({}));
    expect(response.TableNames).toBeDefined();
  });

  it.each(expectedTables)('should have table %s created', async (tableName) => {
    const response = await client.send(new DescribeTableCommand({
      TableName: tableName
    }));
    
    expect(response.Table).toBeDefined();
    expect(response.Table?.TableStatus).toBe('ACTIVE');
    expect(response.Table?.KeySchema?.[0].AttributeName).toBe('id');
  });
});