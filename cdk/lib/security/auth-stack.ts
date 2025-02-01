import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';

export class AuthStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    this.userPool = new cognito.UserPool(this, 'AdminPool', {
      userPoolName: 'career-canvas-admin-pool',
      selfSignUpEnabled: false,
      signInAliases: {
        email: true,
        username: true
      },
      standardAttributes: {
        email: { required: true, mutable: true }
      }
    });

    const adminClient = this.userPool.addClient('AdminClient', {
      oAuth: {
        flows: {
          authorizationCodeGrant: true
        },
        scopes: [cognito.OAuthScope.EMAIL]
      }
    });
  }
}