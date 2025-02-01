import { APIGatewayProxyHandler } from 'aws-lambda';
import * as yup from 'yup';
import { ApiError } from './error-handler';

export const validateRequest = (schema: yup.ObjectSchema<any>) => {
  return (handler: APIGatewayProxyHandler): APIGatewayProxyHandler => {
    return async (event, context) => {
      try {
        if (event.body) {
          const data = JSON.parse(event.body);
          await schema.validate(data);
        }
        return handler(event, context);
      } catch (error) {
        if (error instanceof yup.ValidationError) {
          throw new ApiError(400, error.message);
        }
        throw error;
      }
    };
  };
};