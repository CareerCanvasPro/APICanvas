import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';

const dynamodb = new DynamoDB.DocumentClient();

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { startDate, endDate } = event.queryStringParameters || {};
    
    const result = await dynamodb.query({
      TableName: process.env.USAGE_TABLE!,
      KeyConditionExpression: 'timestamp BETWEEN :start AND :end',
      ExpressionAttributeValues: {
        ':start': startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        ':end': endDate || new Date().toISOString()
      }
    }).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        data: result.Items,
        period: { startDate, endDate }
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};