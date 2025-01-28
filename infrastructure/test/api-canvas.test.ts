import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { ApiCanvasStack } from '../lib/api-canvas-stack';

describe('ApiCanvasStack', () => {
  const app = new cdk.App();
  const stack = new ApiCanvasStack(app, 'TestStack');
  const template = Template.fromStack(stack);

  test('DynamoDB Tables Created', () => {
    template.resourceCountIs('AWS::DynamoDB::Table', 3);
    
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      BillingMode: 'PAY_PER_REQUEST',
      KeySchema: [
        {
          AttributeName: 'id',
          KeyType: 'HASH'
        }
      ]
    });
  });

  test('Lambda Function Created', () => {
    template.resourceCountIs('AWS::Lambda::Function', 1);
    
    template.hasResourceProperties('AWS::Lambda::Function', {
      Runtime: 'nodejs18.x',
      Handler: 'dist/main.handler',
      Environment: {
        Variables: {
          APIS_TABLE: {
            Ref: expect.any(String)
          },
          TOKENS_TABLE: {
            Ref: expect.any(String)
          },
          RATE_LIMIT_TABLE: {
            Ref: expect.any(String)
          }
        }
      }
    });
  });

  test('API Gateway Created', () => {
    template.resourceCountIs('AWS::ApiGateway::RestApi', 1);
    
    template.hasResourceProperties('AWS::ApiGateway::RestApi', {
      Name: 'API Canvas Service'
    });

    // Verify API endpoints
    template.resourceCountIs('AWS::ApiGateway::Method', expect.any(Number));
  });

  test('IAM Roles and Policies', () => {
    template.hasResourceProperties('AWS::IAM::Role', {
      AssumeRolePolicyDocument: {
        Statement: [
          {
            Action: 'sts:AssumeRole',
            Effect: 'Allow',
            Principal: {
              Service: 'lambda.amazonaws.com'
            }
          }
        ]
      }
    });

    // Verify DynamoDB access policies
    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: expect.arrayContaining([
          expect.objectContaining({
            Action: expect.arrayContaining(['dynamodb:*']),
            Effect: 'Allow',
            Resource: expect.any(Array)
          })
        ])
      }
    });
  });
});