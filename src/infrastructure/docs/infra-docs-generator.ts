import { CloudFormation } from 'aws-sdk';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

export class InfraDocsGenerator {
  private cloudformation: CloudFormation;
  private docsPath: string;

  constructor() {
    this.cloudformation = new CloudFormation({
      region: process.env.AWS_REGION || 'us-east-1'
    });
    this.docsPath = join(__dirname, '../../../../docs/infrastructure');
  }

  async generateDocs() {
    mkdirSync(this.docsPath, { recursive: true });
    
    const resources = await this.getStackResources();
    const architecture = this.generateArchitectureDiagram(resources);
    const documentation = this.generateMarkdownDocs(resources);

    this.writeDocumentation(documentation, architecture);
  }

  private async getStackResources() {
    const stacks = await this.cloudformation.listStacks().promise();
    const resources = [];

    for (const stack of stacks.StackSummaries || []) {
      if (stack.StackName.startsWith('careercanvas')) {
        const stackResources = await this.cloudformation.listStackResources({
          StackName: stack.StackName
        }).promise();
        resources.push(...(stackResources.StackResourceSummaries || []));
      }
    }

    return resources;
  }

  private generateArchitectureDiagram(resources: any[]) {
    return `
digraph Infrastructure {
  rankdir=LR;
  node [shape=box];
  
  ${resources.map(r => `  "${r.LogicalResourceId}" [label="${r.ResourceType}"];`).join('\n')}
  ${this.generateRelationships(resources)}
}`;
  }

  private generateMarkdownDocs(resources: any[]) {
    return `# CareerCanvas API Infrastructure

## Overview
This document describes the infrastructure components of the CareerCanvas API.

## Resources
${resources.map(r => `
### ${r.LogicalResourceId}
- Type: ${r.ResourceType}
- Status: ${r.ResourceStatus}
- Physical ID: ${r.PhysicalResourceId}
`).join('\n')}

## Security
- IAM Roles and Policies
- Network Security Groups
- Encryption Configuration

## Monitoring
- CloudWatch Alarms
- Metrics
- Logs

## Disaster Recovery
- Backup Strategy
- Failover Configuration
- Recovery Procedures
`;
  }

  private generateRelationships(resources: any[]) {
    return resources
      .filter(r => r.ResourceType.includes('AWS::IAM::Role'))
      .map(role => {
        return resources
          .filter(r => r.ResourceType.includes('AWS::Lambda::Function'))
          .map(func => `  "${role.LogicalResourceId}" -> "${func.LogicalResourceId}";`)
          .join('\n');
      })
      .join('\n');
  }

  private writeDocumentation(markdown: string, architecture: string) {
    writeFileSync(join(this.docsPath, 'README.md'), markdown);
    writeFileSync(join(this.docsPath, 'architecture.dot'), architecture);
  }
}