"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiCanvasStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const dynamodb = __importStar(require("aws-cdk-lib/aws-dynamodb"));
const lambda = __importStar(require("aws-cdk-lib/aws-lambda"));
const apigateway = __importStar(require("aws-cdk-lib/aws-apigateway"));
class ApiCanvasStack extends cdk.Stack {
    constructor(scope, id, props) {
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
            code: lambda.Code.fromAsset('src/lambda/api-management', {
                bundling: {
                    image: lambda.Runtime.NODEJS_18_X.bundlingImage,
                    command: [
                        'bash', '-c',
                        'npm install && npm run build && cp -r dist/* /asset-output/ && cp package.json /asset-output/ && cd /asset-output && npm install --production'
                    ],
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
        // Output the API URL
        new cdk.CfnOutput(this, 'ApiUrl', {
            value: api.url,
            description: 'API Gateway endpoint URL',
        });
    }
}
exports.ApiCanvasStack = ApiCanvasStack;
//# sourceMappingURL=api-canvas-stack.js.map