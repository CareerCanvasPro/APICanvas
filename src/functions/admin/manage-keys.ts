import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware } from '../../middleware/auth';
import { errorHandler } from '../../middleware/error-handler';
import * as yup from 'yup';
import { validateRequest } from '../../middleware/validator';
import { auditLogger } from '../../middleware/audit-logger';

const apiKeySchema = yup.object({
  clientName: yup.string().required(),
  permissions: yup.array().of(yup.string()).required(),
  expiresIn: yup.number().positive().optional()
});

const dynamodb = new DynamoDB.DocumentClient();

const baseHandler: APIGatewayProxyHandler = async (event) => {
  if (event.httpMethod === 'GET') {
    const result = await dynamodb.scan({
      TableName: process.env.API_KEYS_TABLE!
    }).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(result.Items)
    };
  }

  if (event.httpMethod === 'POST') {
    const { clientName, permissions, expiresIn } = JSON.parse(event.body || '{}');
    
    const apiKey = {
      id: uuidv4(),
      key: uuidv4(),
      clientName,
      permissions,
      expiresIn,
      createdAt: new Date().toISOString(),
      createdBy: event.requestContext.authorizer?.claims.sub,
      expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : null
    };

    await dynamodb.put({
      TableName: process.env.API_KEYS_TABLE!,
      Item: apiKey
    }).promise();

    return {
      statusCode: 201,
      body: JSON.stringify(apiKey)
    };
  }

  throw new ApiError(405, 'Method not allowed');
};

export const handler = errorHandler(
  authMiddleware(
    rateLimiter(
      metricsCollector(
        auditLogger(
          validateRequest(apiKeySchema)(baseHandler)
        )
      )
    )
  )
);