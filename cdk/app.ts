import * as cdk from 'aws-cdk-lib';
import { ApiStack } from './stacks/api-stack';
import { DatabaseStack } from './stacks/database-stack';
import { AdminStack } from './stacks/admin-stack';
import { MonitoringStack } from './stacks/monitoring-stack';
import { AiStack } from './stacks/ai-stack';
import { loadConfig } from './config';

export async function main() {
  const app = new cdk.App();
  const config = await loadConfig();

  const env = { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1'
  };

  const stacks = {
    db: new DatabaseStack(app, 'CareerCanvasDbStack', { env }),
    ai: new AiStack(app, 'CareerCanvasAiStack', { env }),
    api: new ApiStack(app, 'CareerCanvasApiStack', { 
      env,
      database: stacks.db,
      aiServices: stacks.ai
    }),
    admin: new AdminStack(app, 'CareerCanvasAdminStack', {
      env,
      api: stacks.api
    }),
    monitoring: new MonitoringStack(app, 'CareerCanvasMonitoringStack', {
      env,
      api: stacks.api,
      admin: stacks.admin
    })
  };

  // Add tags
  Object.values(stacks).forEach(stack => {
    cdk.Tags.of(stack).add('Project', 'CareerCanvas');
    cdk.Tags.of(stack).add('Environment', process.env.NODE_ENV || 'development');
  });

  return app;
}

main().catch(console.error);