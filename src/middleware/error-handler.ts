import { APIGatewayProxyHandler } from 'aws-lambda';

export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

export const errorHandler = (handler: APIGatewayProxyHandler): APIGatewayProxyHandler => {
  return async (event, context) => {
    try {
      const response = await handler(event, context);
      return response;
    } catch (error) {
      console.error('Error:', error);

      if (error instanceof ApiError) {
        return {
          statusCode: error.statusCode,
          body: JSON.stringify({
            message: error.message,
            code: error.statusCode
          })
        };
      }

      return {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Internal server error',
          code: 500
        })
      };
    }
  };
};