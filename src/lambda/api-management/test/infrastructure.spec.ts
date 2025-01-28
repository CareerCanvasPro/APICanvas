import { DynamoDBClient, DescribeTableCommand } from '@aws-sdk/client-dynamodb';

describe('Infrastructure Tests', () => {
  const ddbClient = new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1'
  });

  const tables = ['apis', 'tokens', 'metrics'];

  describe('DynamoDB Tables', () => {
    test.each(tables)('table %s should exist', async (tableName) => {
      const command = new DescribeTableCommand({
        TableName: `api-management-${tableName}`
      });

      const response = await ddbClient.send(command);
      expect(response.Table).toBeDefined();
      expect(response.Table?.TableStatus).toBe('ACTIVE');
    });
  });
});