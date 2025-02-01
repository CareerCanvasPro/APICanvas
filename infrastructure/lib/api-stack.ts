import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export class CareerCanvasApiStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Tables
    const apisTable = new dynamodb.Table(this, 'ApisTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN
    });

    const tokensTable = new dynamodb.Table(this, 'TokensTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN
    });

    // API Lambda
    const apiHandler = new NodejsFunction(this, 'ApiHandler', {
      entry: 'src/lambda.ts',
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(30),
      environment: {
        APIS_TABLE: apisTable.tableName,
        TOKENS_TABLE: tokensTable.tableName
      }
    });

    // API Gateway
    const api = new apigateway.RestApi(this, 'CareerCanvasApi', {
      restApiName: 'CareerCanvas API Management',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS
      },
      deployOptions: {
        cachingEnabled: true,
        cacheTtl: cdk.Duration.minutes(5),
        throttlingRateLimit: 1000,
        throttlingBurstLimit: 2000
      }
    });

    // Grant permissions
    apisTable.grantReadWriteData(apiHandler);
    tokensTable.grantReadWriteData(apiHandler);

    // API Integration
    const integration = new apigateway.LambdaIntegration(apiHandler);
    api.root.addProxy({
      defaultIntegration: integration,
      anyMethod: true
    });
  }
}