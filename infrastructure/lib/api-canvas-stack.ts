import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

export class ApiCanvasStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Tables
    const apisTable = new dynamodb.Table(this, 'ApisTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const tokensTable = new dynamodb.Table(this, 'TokensTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const rateLimitTable = new dynamodb.Table(this, 'RateLimitTable', {
      partitionKey: { name: 'token', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'api_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      timeToLiveAttribute: 'ttl'
    });

    // Lambda Functions
    const apiManagementFunction = new lambda.Function(this, 'ApiManagementFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'dist/main.handler',
      code: lambda.Code.fromAsset('../src/lambda/api-management', {
        bundling: {
          image: lambda.Runtime.NODEJS_18_X.bundlingImage,
          command: [
            'bash', '-c',
            'npm install -g @nestjs/cli@9.5.0 && ' +  // Specify older version of CLI
            'npm install --legacy-peer-deps && ' +
            'npm run build && ' +
            'cp -r dist/* /asset-output/ && ' +
            'cp package*.json /asset-output/ && ' +
            'cd /asset-output && ' +
            'npm install --production --legacy-peer-deps --no-package-lock'
          ],
          environment: {
            NODE_ENV: 'production',
            HOME: '/tmp/home',
            npm_config_cache: '/tmp/npm-cache',
            NODE_OPTIONS: '--max_old_space_size=4096'  // Increase memory limit
          },
          user: 'root',
          volumes: [{
            hostPath: '/tmp',
            containerPath: '/tmp'
          }]
        },
      }),
      environment: {
        APIS_TABLE: apisTable.tableName,
        TOKENS_TABLE: tokensTable.tableName,
        RATE_LIMIT_TABLE: rateLimitTable.tableName,
        NODE_OPTIONS: '--enable-source-maps',
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
    });

    // Grant permissions
    apisTable.grantReadWriteData(apiManagementFunction);
    tokensTable.grantReadWriteData(apiManagementFunction);
    rateLimitTable.grantReadWriteData(apiManagementFunction);

    // API Gateway with CORS
    const api = new apigateway.RestApi(this, 'ApiCanvasApi', {
      restApiName: 'API Canvas Service',
      description: 'API Management Service',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
        maxAge: cdk.Duration.days(1),
      },
    });

    // APIs resource and methods
    const apis = api.root.addResource('apis');
    apis.addMethod('GET', new apigateway.LambdaIntegration(apiManagementFunction));
    apis.addMethod('POST', new apigateway.LambdaIntegration(apiManagementFunction));

    const singleApi = apis.addResource('{id}');
    singleApi.addMethod('PUT', new apigateway.LambdaIntegration(apiManagementFunction));
    singleApi.addMethod('DELETE', new apigateway.LambdaIntegration(apiManagementFunction));

    // Token management endpoints
    const tokens = singleApi.addResource('tokens');
    tokens.addMethod('GET', new apigateway.LambdaIntegration(apiManagementFunction));
    tokens.addMethod('POST', new apigateway.LambdaIntegration(apiManagementFunction));

    const singleToken = tokens.addResource('{tokenId}');
    singleToken.addMethod('DELETE', new apigateway.LambdaIntegration(apiManagementFunction));

    // Metrics endpoints
    const metrics = singleApi.addResource('metrics');
    metrics.addMethod('GET', new apigateway.LambdaIntegration(apiManagementFunction));
    
    const dailyMetrics = metrics.addResource('daily');
    dailyMetrics.addMethod('GET', new apigateway.LambdaIntegration(apiManagementFunction));
    
    const monthlyMetrics = metrics.addResource('monthly');
    monthlyMetrics.addMethod('GET', new apigateway.LambdaIntegration(apiManagementFunction));

    // Output the API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway endpoint URL',
    });
  }
}