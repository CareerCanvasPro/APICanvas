import { APIGatewayProxyHandler } from 'aws-lambda';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID!,
  clientId: process.env.COGNITO_CLIENT_ID!,
  tokenUse: 'access'
});

export const authMiddleware = (handler: APIGatewayProxyHandler): APIGatewayProxyHandler => {
  return async (event, context) => {
    try {
      const token = event.headers.Authorization?.replace('Bearer ', '');
      if (!token) {
        return {
          statusCode: 401,
          body: JSON.stringify({ message: 'No token provided' })
        };
      }

      const payload = await verifier.verify(token);
      event.requestContext.authorizer = {
        claims: payload
      };

      return handler(event, context);
    } catch (error) {
      console.error('Auth Error:', error);
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Invalid token' })
      };
    }
  };
};