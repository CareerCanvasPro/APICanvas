import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { ApiError } from './error-handler';

const dynamodb = new DynamoDB.DocumentClient();
const WINDOW_SIZE_IN_SECONDS = 60;
const MAX_REQUESTS_PER_WINDOW = 100;

export const rateLimiter = (handler: APIGatewayProxyHandler): APIGatewayProxyHandler => {
  return async (event, context) => {
    const userId = event.requestContext.authorizer?.claims.sub;
    const windowKey = Math.floor(Date.now() / (WINDOW_SIZE_IN_SECONDS * 1000));
    const rateKey = `${userId}:${windowKey}`;

    const result = await dynamodb.update({
      TableName: process.env.RATE_LIMIT_TABLE!,
      Key: { id: rateKey },
      UpdateExpression: 'ADD requests :inc',
      ExpressionAttributeValues: { ':inc': 1 },
      ReturnValues: 'UPDATED_NEW'
    }).promise();

    if ((result.Attributes?.requests || 0) > MAX_REQUESTS_PER_WINDOW) {
      throw new ApiError(429, 'Too many requests');
    }

    return handler(event, context);
  };
};