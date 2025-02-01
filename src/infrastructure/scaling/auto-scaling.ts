import { AutoScaling } from 'aws-sdk';

export class AutoScalingConfig {
  private autoscaling: AutoScaling;

  constructor() {
    this.autoscaling = new AutoScaling({
      region: process.env.AWS_REGION || 'us-east-1'
    });
  }

  async setupAutoScaling() {
    const groupName = 'careercanvas-api-asg';

    await this.autoscaling.createAutoScalingGroup({
      AutoScalingGroupName: groupName,
      MinSize: 2,
      MaxSize: 10,
      DesiredCapacity: 2,
      HealthCheckType: 'ELB',
      HealthCheckGracePeriod: 300,
      VPCZoneIdentifier: process.env.SUBNET_IDS || '',
      TargetGroupARNs: [process.env.TARGET_GROUP_ARN || ''],
      Tags: [
        {
          Key: 'Environment',
          Value: process.env.STAGE || 'production',
          PropagateAtLaunch: true
        }
      ]
    }).promise();

    await this.setupScalingPolicies(groupName);
  }

  private async setupScalingPolicies(groupName: string) {
    const policies = [
      {
        name: 'CPUUtilization',
        metric: 'CPUUtilization',
        threshold: 70,
        scaleOut: 2,
        scaleIn: -1
      },
      {
        name: 'RequestCount',
        metric: 'RequestCountPerTarget',
        threshold: 1000,
        scaleOut: 2,
        scaleIn: -1
      }
    ];

    for (const policy of policies) {
      await this.createScalingPolicy(groupName, policy);
    }
  }

  private async createScalingPolicy(groupName: string, policy: any) {
    await this.autoscaling.putScalingPolicy({
      AutoScalingGroupName: groupName,
      PolicyName: `${policy.name}ScaleOut`,
      PolicyType: 'TargetTrackingScaling',
      TargetTrackingConfiguration: {
        TargetValue: policy.threshold,
        PredefinedMetricSpecification: {
          PredefinedMetricType: policy.metric
        }
      }
    }).promise();
  }
}