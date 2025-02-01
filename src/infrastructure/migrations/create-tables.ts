import { DynamoDB } from 'aws-sdk';
import { TABLES } from '../dynamodb/tables';

const dynamodb = new DynamoDB({
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000'
});

const createTables = async () => {
  const tables = [
    {
      TableName: TABLES.APIS,
      KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
      AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
      ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
    },
    {
      TableName: TABLES.TOKENS,
      KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' },
        { AttributeName: 'key', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexes: [{
        IndexName: 'TokenKeyIndex',
        KeySchema: [{ AttributeName: 'key', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
      }],
      ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
    },
    {
      TableName: TABLES.METRICS,
      KeySchema: [
        { AttributeName: 'apiId', KeyType: 'HASH' },
        { AttributeName: 'timestamp', KeyType: 'RANGE' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'apiId', AttributeType: 'S' },
        { AttributeName: 'timestamp', AttributeType: 'S' }
      ],
      ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
    },
    {
      TableName: TABLES.RATE_LIMITS,
      KeySchema: [
        { AttributeName: 'tokenId', KeyType: 'HASH' },
        { AttributeName: 'apiId', KeyType: 'RANGE' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'tokenId', AttributeType: 'S' },
        { AttributeName: 'apiId', AttributeType: 'S' }
      ],
      ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
    }
  ];

  for (const table of tables) {
    try {
      await dynamodb.createTable(table).promise();
      console.log(`Created table: ${table.TableName}`);
    } catch (error) {
      if (error.code === 'ResourceInUseException') {
        console.log(`Table already exists: ${table.TableName}`);
      } else {
        console.error(`Error creating table ${table.TableName}:`, error);
      }
    }
  }
};

createTables();