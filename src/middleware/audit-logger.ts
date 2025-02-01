import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';

const dynamodb = new DynamoDB.DocumentClient();

export const auditLogger = (handler: APIGatewayProxyHandler): APIGatewayProxyHandler => {
  return async (event, context) => {
    const startTime = Date.now();
    const response = await handler(event, context);
    
    await dynamodb.put({
      TableName: process.env.AUDIT_LOG_TABLE!,
      Item: {
        id: context.awsRequestId,
        timestamp: new Date().toISOString(),
        userId: event.requestContext.authorizer?.claims.sub,
        action: `${event.httpMethod} ${event.path}`,
        statusCode: response.statusCode,
        duration: Date.now() - startTime,
        userAgent: event.headers['User-Agent']
      }
    }).promise();

    return response;
  };
};