import { SecurityHub, Inspector, GuardDuty, ConfigService, IAM } from 'aws-sdk';
import { SecurityScanResult, RemediationAction } from './types';
import { SNS, CloudWatch } from 'aws-sdk';
import { SecurityRecommendation } from './types';

export class SecurityScanner {
  private securityHub: SecurityHub;
  private inspector: Inspector;
  private guardDuty: GuardDuty;
  private configService: ConfigService;
  private iam: IAM;
  private sns: SNS;
  private cloudWatch: CloudWatch;

  constructor() {
    const region = process.env.AWS_REGION || 'us-east-1';
    this.securityHub = new SecurityHub({ region });
    this.inspector = new Inspector({ region });
    this.guardDuty = new GuardDuty({ region });
    this.configService = new ConfigService({ region });
    this.iam = new IAM({ region });
    this.sns = new SNS({ region: process.env.AWS_REGION || 'us-east-1' });
    this.cloudWatch = new CloudWatch({ region: process.env.AWS_REGION || 'us-east-1' });
  }

  async performSecurityScan(): Promise<SecurityScanResult> {
    await this.enableSecurityServices();
    
    const [
      findings,
      vulnerabilities,
      threats,
      complianceStatus,
      iamIssues
    ] = await Promise.all([
      this.collectSecurityFindings(),
      this.scanForVulnerabilities(),
      this.detectThreats(),
      this.checkCompliance(),
      this.auditIAMConfiguration()
    ]);

    const remediationActions = await this.generateRemediationPlan({
      findings,
      vulnerabilities,
      threats,
      complianceStatus,
      iamIssues
    });

    const report = this.generateSecurityReport({
      findings,
      vulnerabilities,
      threats,
      complianceStatus,
      iamIssues,
      remediationActions
    });

    await this.notifySecurityIssues(report);
    
    if (process.env.AUTO_REMEDIATION === 'true') {
      await this.performAutoRemediation(remediationActions);
    }

    return report;
  }

  private async checkCompliance() {
    const rules = await this.configService.describeConfigRules().promise();
    const evaluations = await Promise.all(
      rules.ConfigRules?.map(rule => 
        this.configService.getComplianceDetailsByConfigRule({
          ConfigRuleName: rule.ConfigRuleName!
        }).promise()
      ) || []
    );

    return evaluations;
  }

  private async auditIAMConfiguration() {
    const [users, roles, policies] = await Promise.all([
      this.iam.listUsers().promise(),
      this.iam.listRoles().promise(),
      this.iam.listPolicies({ OnlyAttached: true }).promise()
    ]);

    const credentialReport = await this.iam.generateCredentialReport().promise();
    
    return {
      users,
      roles,
      policies,
      credentialReport
    };
  }

  private async generateRemediationPlan(scanResults: any): Promise<RemediationAction[]> {
    const actions: RemediationAction[] = [];

    // Add remediation actions based on scan results
    if (scanResults.iamIssues?.users.Users.some((user: any) => !user.PasswordLastUsed)) {
      actions.push({
        type: 'IAM_CLEANUP',
        description: 'Remove inactive IAM users',
        priority: 'HIGH',
        automated: true
      });
    }

    // Add more remediation actions based on other findings

    return actions;
  }

  private async performAutoRemediation(actions: RemediationAction[]) {
    for (const action of actions) {
      if (action.automated) {
        try {
          await this.executeRemediationAction(action);
        } catch (error) {
          console.error(`Failed to execute remediation action: ${action.type}`, error);
        }
      }
    }
  }

  private async executeRemediationAction(action: RemediationAction) {
    switch (action.type) {
      case 'IAM_CLEANUP':
        await this.cleanupInactiveIAMUsers();
        break;
      case 'SECURITY_GROUP_REMEDIATION':
        await this.remediateSecurityGroups();
        break;
      case 'ENCRYPTION_ENFORCEMENT':
        await this.enforceEncryption();
        break;
      case 'ACCESS_KEY_ROTATION':
        await this.rotateAccessKeys();
        break;
      default:
        throw new Error(`Unknown remediation action type: ${action.type}`);
    }

    await this.trackRemediationMetrics(action);
  }

  private async cleanupInactiveIAMUsers() {
    const { Users } = await this.iam.listUsers().promise();
    const inactiveUsers = Users?.filter(user => !user.PasswordLastUsed);

    for (const user of inactiveUsers || []) {
      await this.iam.deleteLoginProfile({ UserName: user.UserName }).promise().catch(() => {});
      await this.iam.deleteUser({ UserName: user.UserName }).promise();
    }
  }

  private async remediateSecurityGroups() {
    // Implementation for security group remediation
  }

  private async enforceEncryption() {
    // Implementation for encryption enforcement
  }

  private async rotateAccessKeys() {
    // Implementation for access key rotation
  }

  private generateSecurityRecommendations(data: any): SecurityRecommendation[] {
    const recommendations: SecurityRecommendation[] = [];

    if (data.findings?.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'SECURITY_FINDINGS',
        description: 'Critical security findings detected',
        impact: 'Potential security vulnerabilities exposed',
        remediation: 'Review and address all high-severity findings',
        automated: false
      });
    }

    if (data.iamIssues?.users.Users.some((user: any) => !user.PasswordLastUsed)) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'IAM',
        description: 'Inactive IAM users detected',
        impact: 'Unnecessary access points in the system',
        remediation: 'Remove or disable inactive IAM users',
        automated: true
      });
    }

    return recommendations;
  }

  private async notifySecurityIssues(report: any) {
    const topicArn = process.env.SECURITY_NOTIFICATION_TOPIC;
    if (!topicArn) return;

    await this.sns.publish({
      TopicArn: topicArn,
      Subject: 'Security Scan Report',
      Message: JSON.stringify(report, null, 2)
    }).promise();

    await this.cloudWatch.putMetricData({
      Namespace: 'CareerCanvas/Security',
      MetricData: [
        {
          MetricName: 'HighSeverityFindings',
          Value: report.summary.highSeverityFindings,
          Unit: 'Count'
        }
      ]
    }).promise();
  }

  private async trackRemediationMetrics(action: RemediationAction) {
    await this.cloudWatch.putMetricData({
      Namespace: 'CareerCanvas/Security/Remediation',
      MetricData: [
        {
          MetricName: 'RemediationActions',
          Value: 1,
          Dimensions: [
            {
              Name: 'ActionType',
              Value: action.type
            }
          ]
        }
      ]
    }).promise();
  }
}