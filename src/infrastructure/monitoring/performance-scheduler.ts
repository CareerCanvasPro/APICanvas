import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class PerformanceScheduler {
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async runDailyPerformanceTest() {
    try {
      await execAsync('npm run performance:test');
      console.log('Daily performance test completed successfully');
    } catch (error) {
      console.error('Daily performance test failed:', error);
    }
  }

  @Cron(CronExpression.EVERY_WEEK)
  async runWeeklyLoadTest() {
    try {
      await execAsync('npm run performance:test -- --connections 500 --duration 60');
      console.log('Weekly load test completed successfully');
    } catch (error) {
      console.error('Weekly load test failed:', error);
    }
  }
}