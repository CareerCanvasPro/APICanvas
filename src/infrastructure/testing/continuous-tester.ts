import { CloudWatch, CloudFormation, Lambda } from 'aws-sdk';
import { InfrastructureTester } from './infra-tester';

export class ContinuousInfrastructureTester {
  private cloudwatch: CloudWatch;
  private cloudformation: CloudFormation;
  private lambda: Lambda;
  private tester: InfrastructureTester;

  constructor() {
    const region = process.env.AWS_REGION || 'us-east-1';
    this.cloudwatch = new CloudWatch({ region });
    this.cloudformation = new CloudFormation({ region });
    this.lambda = new Lambda({ region });
    this.tester = new InfrastructureTester();
  }

  async setupContinuousTests() {
    await this.createTestFunction();
    await this.setupEventRule();
    await this.configureAlarms();
  }

  private async createTestFunction() {
    await this.lambda.createFunction({
      FunctionName: 'careercanvas-infra-test',
      Runtime: 'nodejs18.x',
      Handler: 'index.handler',
      Role: process.env.LAMBDA_ROLE_ARN!,
      Code: {
        ZipFile: this.generateTestFunctionCode()
      },
      Environment: {
        Variables: {
          STAGE: process.env.STAGE || 'production'
        }
      },
      Timeout: 300
    }).promise();
  }

  private async setupEventRule() {
    const rule = await this.cloudwatch.putRule({
      Name: 'InfraTestSchedule',
      ScheduleExpression: 'rate(1 hour)',
      State: 'ENABLED'
    }).promise();

    await this.lambda.addPermission({
      FunctionName: 'careercanvas-infra-test',
      StatementId: 'InfraTestSchedule',
      Action: 'lambda:InvokeFunction',
      Principal: 'events.amazonaws.com',
      SourceArn: rule.RuleArn
    }).promise();
  }

  private async configureAlarms() {
    const alarms = [
      {
        AlarmName: 'InfraTestFailure',
        MetricName: 'TestFailures',
        Namespace: 'CareerCanvas/Infrastructure',
        Period: 300,
        EvaluationPeriods: 1,
        Threshold: 1,
        ComparisonOperator: 'GreaterThanThreshold'
      }
    ];

    for (const alarm of alarms) {
      await this.cloudwatch.putMetricAlarm(alarm).promise();
    }
  }

  private generateTestFunctionCode(): Buffer {
    const code = `
      const { InfrastructureTester } = require('./infra-tester');
      
      exports.handler = async () => {
        const tester = new InfrastructureTester();
        const results = await tester.runTests();
        return results;
      };
    `;
    return Buffer.from(code);
  }
}