// CDK offers more control over API Gateway settings
export const apiGatewayConfig = {
  minimumCompressionSize: 1024,
  defaultCorsPreflightOptions: {
    allowOrigins: ['*'],
    cacheTime: cdk.Duration.minutes(10)
  },
  proxy: false, // Direct integration for better performance
  cacheClusterEnabled: true,
  cacheClusterSize: '0.5' // Configurable caching
};