import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Duration } from 'aws-cdk-lib';
import * as semver from 'semver';

// Validate Node.js version
const REQUIRED_NODE_VERSION = '>=7.5.2';
if (!semver.satisfies(process.version, REQUIRED_NODE_VERSION)) {
  throw new Error(`Required node version ${REQUIRED_NODE_VERSION}`);
}

export class ApiStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Table
    const apiTable = new dynamodb.Table(this, 'ApiManagementTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Lambda Function
    // Update Lambda Function with version constraint
    const apiHandler = new lambda.Function(this, 'ApiManagementHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'dist/main.handler',
      code: lambda.Code.fromAsset('../src/lambda/api-management', {
        bundling: {
          nodeModules: ['semver'],
          forceDockerBundling: false
        }
      }),
      environment: {
        TABLE_NAME: apiTable.tableName,
        NODE_VERSION: RUNTIME_VERSION
      },
      timeout: Duration.seconds(30),
      memorySize: 1024,
    });

    // API Gateway
    const api = new apigateway.RestApi(this, 'ApiManagementApi', {
      restApiName: 'API Management Service',
      description: 'API Management Service for CareerCanvas',
      deployOptions: {
        stageName: 'prod',
        throttlingRateLimit: 10,
        throttlingBurstLimit: 20,
      },
    });

    // OIDC Provider
    const oidcProvider = new iam.OpenIdConnectProvider(this, 'OIDCProvider', {
      url: 'https://token.actions.githubusercontent.com',
      clientIds: ['sts.amazonaws.com'],
      thumbprints: [
        '6938fd4d98bab03faadb97b34396831e3780aea1',
        '1c58a3a8518e8759bf075b76b750d4f2df264fcd'
      ]
    });

    // OIDC Role
    const role = new iam.Role(this, 'OIDCRole', {
      assumedBy: new iam.WebIdentityPrincipal(oidcProvider.openIdConnectProviderArn, {
        'StringEquals': {
          'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          'token.actions.githubusercontent.com:sub': `repo:${this.node.tryGetContext('github_repo')}:*`
        }
      }),
      maxSessionDuration: Duration.hours(1),
      description: 'Role for GitHub Actions OIDC authentication'
    });

    // Grant permissions
    apiTable.grantReadWriteData(apiHandler);
    role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('AWSLambda_FullAccess')
    );

    // API Gateway Integration
    const integration = new apigateway.LambdaIntegration(apiHandler);
    api.root.addMethod('ANY', integration);
    api.root.addProxy({
      defaultIntegration: integration,
      anyMethod: true,
    });
  }
}