#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ApiCanvasStack } from '../lib/api-canvas-stack';

const app = new cdk.App();

new ApiCanvasStack(app, 'ApiCanvasStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1'
  },
  description: 'API Management Service for CareerCanvas',
  tags: {
    Project: 'CareerCanvas',
    Service: 'APIManagement'
  }
});

app.synth();