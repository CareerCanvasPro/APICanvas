#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CareerCanvasApiStack } from '../infrastructure/lib/api-stack';
import { DatabaseStack } from '../infrastructure/lib/database-stack';
import { AdminDashboardStack } from '../infrastructure/lib/admin-dashboard-stack';
import { MonitoringStack } from '../infrastructure/lib/monitoring-stack';
import { AiServicesStack } from '../infrastructure/lib/ai-services-stack';

const app = new cdk.App();

const env = { 
  account: process.env.CDK_DEFAULT_ACCOUNT, 
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1'
};

// Create stacks
const dbStack = new DatabaseStack(app, 'CareerCanvasDbStack', { env });
const aiStack = new AiServicesStack(app, 'CareerCanvasAiStack', { env });
const apiStack = new CareerCanvasApiStack(app, 'CareerCanvasApiStack', { 
  env,
  dbStack,
  aiStack
});
const adminStack = new AdminDashboardStack(app, 'CareerCanvasAdminStack', {
  env,
  apiStack
});
const monitoringStack = new MonitoringStack(app, 'CareerCanvasMonitoringStack', {
  env,
  apiStack,
  adminStack
});

// Add tags
const tags = {
  Environment: process.env.NODE_ENV || 'development',
  Project: 'CareerCanvas',
  Owner: 'API-Team'
};

[dbStack, apiStack, adminStack, monitoringStack, aiStack].forEach(stack => {
  Object.entries(tags).forEach(([key, value]) => {
    cdk.Tags.of(stack).add(key, value);
  });
});