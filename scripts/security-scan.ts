import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';

const execAsync = promisify(exec);

async function runSecurityScan() {
  try {
    // Run npm audit
    console.log('Running npm security audit...');
    await execAsync('npm audit --json > security-reports/npm-audit.json');

    // Run OWASP Dependency Check
    console.log('Running dependency check...');
    await execAsync('dependency-check --project "CareerCanvas API" --scan . --out security-reports/dependency-check.html');

    // Run SonarQube analysis
    console.log('Running SonarQube analysis...');
    await execAsync('sonar-scanner');

    console.log('Security scan completed successfully');
  } catch (error) {
    console.error('Security scan failed:', error);
    process.exit(1);
  }
}

runSecurityScan();