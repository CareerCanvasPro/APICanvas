import { APIGatewayProxyHandler } from 'aws-lambda';
import { CloudWatch } from 'aws-sdk';

const cloudwatch = new CloudWatch();

export const metricsCollector = (handler: APIGatewayProxyHandler): APIGatewayProxyHandler => {
  return async (event, context) => {
    const startTime = Date.now();
    const response = await handler(event, context);
    const duration = Date.now() - startTime;

    await cloudwatch.putMetricData({
      Namespace: 'CareerCanvas/Admin',
      MetricData: [
        {
          MetricName: 'APILatency',
          Value: duration,
          Unit: 'Milliseconds',
          Dimensions: [
            { Name: 'Endpoint', Value: `${event.httpMethod} ${event.path}` },
            { Name: 'StatusCode', Value: response.statusCode.toString() }
          ]
        },
        {
          MetricName: 'APIRequests',
          Value: 1,
          Unit: 'Count',
          Dimensions: [
            { Name: 'Endpoint', Value: `${event.httpMethod} ${event.path}` },
            { Name: 'StatusCode', Value: response.statusCode.toString() }
          ]
        }
      ]
    }).promise();

    return response;
  };
};