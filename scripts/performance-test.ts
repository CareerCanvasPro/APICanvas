import * as autocannon from 'autocannon';
import { writeFileSync } from 'fs';
import { CloudWatch } from 'aws-sdk';

const cloudwatch = new CloudWatch({
  region: process.env.AWS_REGION || 'us-east-1'
});

const endpoints = [
  { method: 'GET', path: '/apis' },
  { method: 'GET', path: '/metrics/daily' },
  { method: 'POST', path: '/apis', body: JSON.stringify({ name: 'test-api' }) },
  { method: 'GET', path: '/tokens' }
];

const publishMetrics = async (results: any) => {
  await cloudwatch.putMetricData({
    Namespace: 'CareerCanvas/APIManagement/Performance',
    MetricData: [
      {
        MetricName: 'AverageLatency',
        Value: results.latency.average,
        Unit: 'Milliseconds'
      },
      {
        MetricName: 'Throughput',
        Value: results.throughput.average,
        Unit: 'Count/Second'
      },
      {
        MetricName: 'ErrorRate',
        Value: results.errors / results.requests.total * 100,
        Unit: 'Percent'
      }
    ]
  }).promise();
};

const generateReport = (result: any) => {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalRequests: result.requests.total,
      throughput: result.throughput,
      latency: result.latency,
      errors: result.errors
    },
    endpoints: result.requests.map((req: any) => ({
      path: req.path,
      method: req.method,
      latency: req.latency,
      statusCodes: req.statusCodeStats
    }))
  };

  writeFileSync(
    `performance-reports/report-${new Date().toISOString()}.json`,
    JSON.stringify(report, null, 2)
  );

  return report;
};

const performanceTest = async () => {
  console.log('Starting performance test...');

  const result = await autocannon({
    url: process.env.API_ENDPOINT || 'http://localhost:3000',
    connections: 100,
    duration: 30,
    headers: {
      'x-api-key': process.env.TEST_API_KEY,
      'content-type': 'application/json'
    },
    requests: endpoints
  });

  const report = generateReport(result);
  await publishMetrics(result);

  console.log('Performance test completed');
  console.log('Summary:');
  console.log(`- Avg Throughput: ${result.throughput.average} req/sec`);
  console.log(`- Avg Latency: ${result.latency.average} ms`);
  console.log(`- Error Rate: ${(result.errors / result.requests.total * 100).toFixed(2)}%`);
  console.log(`Report saved to: performance-reports/report-${new Date().toISOString()}.json`);
};

performanceTest().catch(console.error);