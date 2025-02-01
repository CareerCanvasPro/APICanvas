// AWS CDK allows more granular control over Lambda settings
export const lambdaConfig = {
  memorySize: 1024,
  timeout: cdk.Duration.seconds(30),
  runtime: lambda.Runtime.NODEJS_18_X,
  architecture: lambda.Architecture.ARM_64, // Better cost-performance ratio
  bundling: {
    minify: true,
    sourceMap: true,
    target: 'es2020',
  }
};