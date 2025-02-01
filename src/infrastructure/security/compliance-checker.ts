import { IAM, Config, SecurityHub } from 'aws-sdk';

export class ComplianceChecker {
  private iam: IAM;
  private config: Config;
  private securityHub: SecurityHub;

  constructor() {
    this.iam = new IAM();
    this.config = new Config({ region: process.env.AWS_REGION || 'us-east-1' });
    this.securityHub = new SecurityHub({ region: process.env.AWS_REGION || 'us-east-1' });
  }

  async runComplianceChecks() {
    const results = {
      iam: await this.checkIAMCompliance(),
      encryption: await this.checkEncryption(),
      securityHub: await this.getSecurityHubFindings()
    };

    await this.generateComplianceReport(results);
    return results;
  }

  private async checkIAMCompliance() {
    const checks = {
      mfaEnabled: await this.checkMFAEnabled(),
      passwordPolicy: await this.checkPasswordPolicy(),
      accessKeyRotation: await this.checkAccessKeyRotation()
    };

    return checks;
  }

  private async checkEncryption() {
    const rules = await this.config.getComplianceDetailsByConfigRule({
      ConfigRuleName: 'encrypted-volumes'
    }).promise();

    return {
      compliant: rules.EvaluationResults?.every(r => r.ComplianceType === 'COMPLIANT'),
      details: rules.EvaluationResults
    };
  }

  private async getSecurityHubFindings() {
    const findings = await this.securityHub.getFindings({
      Filters: {
        RecordState: [{ Value: 'ACTIVE', Comparison: 'EQUALS' }],
        Severity: [{ Value: 'HIGH', Comparison: 'EQUALS' }]
      }
    }).promise();

    return findings.Findings;
  }

  private async generateComplianceReport(results: any) {
    const report = {
      timestamp: new Date().toISOString(),
      results,
      summary: this.generateSummary(results),
      recommendations: this.generateRecommendations(results)
    };

    console.log('Compliance Report:', JSON.stringify(report, null, 2));
    return report;
  }

  private generateSummary(results: any) {
    return {
      totalChecks: Object.keys(results).length,
      passedChecks: this.countPassedChecks(results),
      criticalFindings: results.securityHub?.length || 0
    };
  }

  private generateRecommendations(results: any) {
    const recommendations = [];

    if (!results.iam.mfaEnabled) {
      recommendations.push('Enable MFA for all IAM users');
    }

    if (results.securityHub?.length > 0) {
      recommendations.push('Address high-severity Security Hub findings');
    }

    return recommendations;
  }

  private countPassedChecks(results: any): number {
    let passed = 0;
    if (results.iam.mfaEnabled) passed++;
    if (results.iam.passwordPolicy) passed++;
    if (results.encryption.compliant) passed++;
    return passed;
  }
}