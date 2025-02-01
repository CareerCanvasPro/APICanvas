import { ELBv2 } from 'aws-sdk';

export class LoadBalancerConfig {
  private elbv2: ELBv2;

  constructor() {
    this.elbv2 = new ELBv2({
      region: process.env.AWS_REGION || 'us-east-1'
    });
  }

  async setupLoadBalancer() {
    const lbName = 'careercanvas-api-lb';
    
    const lb = await this.elbv2.createLoadBalancer({
      Name: lbName,
      Subnets: process.env.SUBNET_IDS?.split(',') || [],
      SecurityGroups: [process.env.SECURITY_GROUP_ID || ''],
      Type: 'application',
      IpAddressType: 'ipv4'
    }).promise();

    const targetGroup = await this.elbv2.createTargetGroup({
      Name: 'careercanvas-api-targets',
      Protocol: 'HTTP',
      Port: 3000,
      VpcId: process.env.VPC_ID,
      HealthCheckPath: '/health',
      HealthCheckIntervalSeconds: 30,
      HealthyThresholdCount: 2,
      UnhealthyThresholdCount: 3
    }).promise();

    await this.elbv2.createListener({
      LoadBalancerArn: lb.LoadBalancers?.[0].LoadBalancerArn || '',
      Protocol: 'HTTPS',
      Port: 443,
      DefaultActions: [{
        Type: 'forward',
        TargetGroupArn: targetGroup.TargetGroups?.[0].TargetGroupArn || ''
      }]
    }).promise();
  }
}