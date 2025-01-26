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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
            removalPolicy: cdk.RemovalPolicy.DESTROY, // For development only
        });
        const tokensTable = new dynamodb.Table(this, 'TokensTable', {
            partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.DESTROY, // For development only
        });
        // Lambda Functions
        // Updated Lambda Function configuration
        const apiManagementFunction = new lambda.Function(this, 'ApiManagementFunction', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('src/lambda/api-management', {
                bundling: {
                    image: lambda.Runtime.NODEJS_18_X.bundlingImage,
                    command: [
                        'bash', '-c',
                        'npm install && npm run build && cp -r node_modules dist/ && cp package.json dist/'
                    ],
                },
            }),
            environment: {
                APIS_TABLE: apisTable.tableName,
                TOKENS_TABLE: tokensTable.tableName,
                NODE_OPTIONS: '--enable-source-maps',
            },
            timeout: cdk.Duration.seconds(30),
            memorySize: 256,
        });
        // Grant permissions
        apisTable.grantReadWriteData(apiManagementFunction);
        tokensTable.grantReadWriteData(apiManagementFunction);
        // API Gateway
        const api = new apigateway.RestApi(this, 'ApiCanvasApi', {
            restApiName: 'API Canvas Service',
            description: 'API Management Service',
        });
        // APIs resource
        const apis = api.root.addResource('apis');
        // Collection endpoints
        apis.addMethod('GET', new apigateway.LambdaIntegration(apiManagementFunction));
        apis.addMethod('POST', new apigateway.LambdaIntegration(apiManagementFunction));
        // Single API resource
        const singleApi = apis.addResource('{id}');
        singleApi.addMethod('PUT', new apigateway.LambdaIntegration(apiManagementFunction));
        singleApi.addMethod('DELETE', new apigateway.LambdaIntegration(apiManagementFunction));
        // Add CORS support
        const corsOptions = {
            allowOrigins: apigateway.Cors.ALL_ORIGINS,
            allowMethods: apigateway.Cors.ALL_METHODS,
            allowHeaders: ['Content-Type', 'Authorization']
        };
        apis.addCorsPreflight(corsOptions);
        singleApi.addCorsPreflight(corsOptions);
    }
}
exports.ApiCanvasStack = ApiCanvasStack;
