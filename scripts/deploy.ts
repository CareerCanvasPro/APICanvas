import { CloudFormation } from 'aws-sdk';
import * as fs from 'fs';
import * as path from 'path';

const cloudformation = new CloudFormation({
  region: process.env.AWS_REGION || 'us-east-1'
});

async function deploy() {
  const stackName = `careercanvas-api-${process.env.STAGE || 'production'}`;
  const templatePath = path.resolve(__dirname, '../infrastructure/cloudformation/production.yml');
  
  const template = fs.readFileSync(templatePath, 'utf8');

  try {
    await cloudformation.createStack({
      StackName: stackName,
      TemplateBody: template,
      Parameters: [
        {
          ParameterKey: 'Environment',
          ParameterValue: process.env.STAGE || 'production'
        }
      ],
      Capabilities: ['CAPABILITY_IAM']
    }).promise();

    console.log(`Stack ${stackName} creation initiated`);
  } catch (error) {
    if (error.code === 'AlreadyExistsException') {
      await cloudformation.updateStack({
        StackName: stackName,
        TemplateBody: template,
        Parameters: [
          {
            ParameterKey: 'Environment',
            ParameterValue: process.env.STAGE || 'production'
          }
        ],
        Capabilities: ['CAPABILITY_IAM']
      }).promise();

      console.log(`Stack ${stackName} update initiated`);
    } else {
      throw error;
    }
  }
}

deploy().catch(console.error);