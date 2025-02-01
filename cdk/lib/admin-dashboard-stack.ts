import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cognito from 'aws-cdk-lib/aws-cognito';

export class AdminDashboardStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Admin User Pool
    const userPool = new cognito.UserPool(this, 'AdminUserPool', {
      selfSignUpEnabled: false,
      signInAliases: {
        email: true
      }
    });

    // Dashboard Static Assets Bucket
    const websiteBucket = new s3.Bucket(this, 'AdminDashboardBucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true,
      cors: [{
        allowedMethods: [s3.HttpMethods.GET],
        allowedOrigins: ['*'],
        allowedHeaders: ['*']
      }]
    });

    // Bucket policy to restrict access to authenticated users
    const bucketPolicy = new s3.BucketPolicy(this, 'BucketPolicy', {
      bucket: websiteBucket
    });

    bucketPolicy.document.addStatements(
      new iam.PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [websiteBucket.arnForObjects('*')],
        principals: [new iam.AnyPrincipal()],
        conditions: {
          'StringEquals': {
            'aws:PrincipalTag/Role': 'Admin'
          }
        }
      })
    );

    // Output the website URL
    new cdk.CfnOutput(this, 'AdminDashboardUrl', {
      value: websiteBucket.bucketWebsiteUrl
    });
  }
}