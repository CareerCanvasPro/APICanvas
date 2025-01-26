import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { dynamoDBService } from './utils/dynamodb';
import { APIEntity, TokenEntity } from './models/types';

const APIS_TABLE = process.env.APIS_TABLE!;
const TOKENS_TABLE = process.env.TOKENS_TABLE!;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const path = event.path.split('/');
    const isTokenEndpoint = path.includes('tokens');

    if (isTokenEndpoint) {
      switch (event.httpMethod) {
        case 'GET':
          return await handleListTokens(event);
        case 'POST':
          return await handleCreateToken(event);
        case 'DELETE':
          return await handleRevokeToken(event);
        default:
          return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method not allowed' })
          };
      }
    }

    // Existing API endpoints handling
    switch (event.httpMethod) {
      case 'GET':
        return await handleGetAPIs();
      case 'POST':
        return await handleCreateAPI(event);
      case 'PUT':
        return await handleUpdateAPI(event);
      case 'DELETE':
        return await handleDeleteAPI(event);
      default:
        return {
          statusCode: 405,
          body: JSON.stringify({ message: 'Method not allowed' })
        };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

async function handleGetAPIs(): Promise<APIGatewayProxyResult> {
  const result = await dynamoDBService.scan({
    TableName: APIS_TABLE
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      apis: result.Items
    })
  };
}

async function handleCreateAPI(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const body = JSON.parse(event.body || '{}');
  
  if (!body.name || !body.endpoint || !body.method) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Missing required fields: name, endpoint, method'
      })
    };
  }

  const api: APIEntity = {
    id: uuidv4(),
    name: body.name,
    endpoint: body.endpoint,
    method: body.method.toUpperCase(),
    status: 'active',
    created_at: new Date().toISOString(),
    config: {
      rateLimit: body.config?.rateLimit || 100,
      cacheDuration: body.config?.cacheDuration || 0,
      timeout: body.config?.timeout || 29000
    }
  };

  await dynamoDBService.put({
    TableName: APIS_TABLE,
    Item: api
  });

  return {
    statusCode: 201,
    body: JSON.stringify(api)
  };
}

async function handleUpdateAPI(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const apiId = event.pathParameters?.id;
  if (!apiId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'API ID is required' })
    };
  }

  const body = JSON.parse(event.body || '{}');
  
  // Check if API exists
  const existingApi = await dynamoDBService.get({
    TableName: APIS_TABLE,
    Key: { id: apiId }
  });

  if (!existingApi.Item) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'API not found' })
    };
  }

  const updatedApi: APIEntity = {
    ...existingApi.Item as APIEntity,
    name: body.name || existingApi.Item.name,
    endpoint: body.endpoint || existingApi.Item.endpoint,
    method: body.method ? body.method.toUpperCase() : existingApi.Item.method,
    status: body.status || existingApi.Item.status,
    config: {
      rateLimit: body.config?.rateLimit || existingApi.Item.config.rateLimit,
      cacheDuration: body.config?.cacheDuration || existingApi.Item.config.cacheDuration,
      timeout: body.config?.timeout || existingApi.Item.config.timeout
    }
  };

  await dynamoDBService.put({
    TableName: APIS_TABLE,
    Item: updatedApi
  });

  return {
    statusCode: 200,
    body: JSON.stringify(updatedApi)
  };
}

async function handleDeleteAPI(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const apiId = event.pathParameters?.id;
  if (!apiId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'API ID is required' })
    };
  }

  // Check if API exists
  const existingApi = await dynamoDBService.get({
    TableName: APIS_TABLE,
    Key: { id: apiId }
  });

  if (!existingApi.Item) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'API not found' })
    };
  }

  await dynamoDBService.delete({
    TableName: APIS_TABLE,
    Key: { id: apiId }
  });

  return {
    statusCode: 204,
    body: ''
  };
}

async function handleListTokens(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const apiId = event.pathParameters?.id;
  if (!apiId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'API ID is required' })
    };
  }

  const result = await dynamoDBService.scan({
    TableName: TOKENS_TABLE,
    FilterExpression: 'api_id = :apiId',
    ExpressionAttributeValues: {
      ':apiId': apiId
    }
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      tokens: result.Items
    })
  };
}

async function handleCreateToken(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const apiId = event.pathParameters?.id;
  if (!apiId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'API ID is required' })
    };
  }

  // Check if API exists
  const api = await dynamoDBService.get({
    TableName: APIS_TABLE,
    Key: { id: apiId }
  });

  if (!api.Item) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'API not found' })
    };
  }

  const token: TokenEntity = {
    id: uuidv4(),
    api_id: apiId,
    status: 'active',
    created: new Date().toISOString(),
    expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year expiry
  };

  await dynamoDBService.put({
    TableName: TOKENS_TABLE,
    Item: token
  });

  return {
    statusCode: 201,
    body: JSON.stringify(token)
  };
}

async function handleRevokeToken(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const apiId = event.pathParameters?.id;
  const tokenId = event.pathParameters?.tokenId;

  if (!apiId || !tokenId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'API ID and Token ID are required' })
    };
  }

  // Check if token exists
  const token = await dynamoDBService.get({
    TableName: TOKENS_TABLE,
    Key: { id: tokenId }
  });

  if (!token.Item) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'Token not found' })
    };
  }

  if (token.Item.api_id !== apiId) {
    return {
      statusCode: 403,
      body: JSON.stringify({ message: 'Token does not belong to this API' })
    };
  }

  await dynamoDBService.delete({
    TableName: TOKENS_TABLE,
    Key: { id: tokenId }
  });

  return {
    statusCode: 204,
    body: ''
  };
}