import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as cognito from 'aws-cdk-lib/aws-cognito';

export class ApiManagementStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // API Keys and Usage Plans Table
    const apiKeysTable = new dynamodb.Table(this, 'ApiKeysTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'clientId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'ttl'
    });

    // Usage Analytics Table
    const usageTable = new dynamodb.Table(this, 'UsageTable', {
      partitionKey: { name: 'apiKeyId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST
    });

    // Admin User Pool
    const adminUserPool = new cognito.UserPool(this, 'AdminUserPool', {
      selfSignUpEnabled: false,
      userPoolName: 'career-canvas-admin-pool',
      standardAttributes: {
        email: { required: true, mutable: true }
      }
    });

    // API Management Functions
    const apiKeyManager = new lambda.NodejsFunction(this, 'ApiKeyManager', {
      entry: 'src/functions/api-management/key-manager.ts',
      handler: 'handler'
    });

    const usageAnalytics = new lambda.NodejsFunction(this, 'UsageAnalytics', {
      entry: 'src/functions/api-management/usage-analytics.ts',
      handler: 'handler'
    });

    // Admin API
    const adminApi = new apigateway.RestApi(this, 'AdminApi', {
      restApiName: 'CareerCanvas Admin API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS
      }
    });

    // Admin API Resources
    const keys = adminApi.root.addResource('keys');
    const usage = adminApi.root.addResource('usage');
    
    keys.addMethod('POST', new apigateway.LambdaIntegration(apiKeyManager));
    usage.addMethod('GET', new apigateway.LambdaIntegration(usageAnalytics));
  }
}