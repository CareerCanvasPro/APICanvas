import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as cognito from 'aws-cdk-lib/aws-cognito';

export class AdminApiStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // API Gateway
    const api = new apigateway.RestApi(this, 'AdminApi', {
      restApiName: 'CareerCanvas Admin API',
      defaultCorsPreflightOptions: {
        allowOrigins: ['http://localhost:3000'],
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowHeaders: ['Authorization', 'Content-Type']
      }
    });

    // API Endpoints
    const apiKeys = api.root.addResource('api-keys');
    const analytics = api.root.addResource('analytics');
    const users = api.root.addResource('users');

    // Lambda Functions
    const manageKeys = new lambda.NodejsFunction(this, 'ManageKeys', {
      entry: 'src/functions/admin/manage-keys.ts',
      handler: 'handler'
    });

    const getAnalytics = new lambda.NodejsFunction(this, 'GetAnalytics', {
      entry: 'src/functions/admin/get-analytics.ts',
      handler: 'handler'
    });

    const manageUsers = new lambda.NodejsFunction(this, 'ManageUsers', {
      entry: 'src/functions/admin/manage-users.ts',
      handler: 'handler'
    });

    // API Methods
    apiKeys.addMethod('GET', new apigateway.LambdaIntegration(manageKeys));
    apiKeys.addMethod('POST', new apigateway.LambdaIntegration(manageKeys));
    
    analytics.addMethod('GET', new apigateway.LambdaIntegration(getAnalytics));
    
    users.addMethod('GET', new apigateway.LambdaIntegration(manageUsers));
    users.addMethod('POST', new apigateway.LambdaIntegration(manageUsers));
  }
}