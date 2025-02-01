import { BehaviorSubject } from 'rxjs';

type RecoveryStrategy = 'retry' | 'reload' | 'reset' | 'redirect';

interface RecoveryAction {
  type: RecoveryStrategy;
  maxAttempts: number;
  delay: number;
  callback?: () => Promise<void>;
}

class ErrorRecoveryService {
  private static instance: ErrorRecoveryService;
  private recoveryAttempts: Map<string, number> = new Map();
  private recoveryStatus = new BehaviorSubject<string>('idle');

  private strategies: Record<string, RecoveryAction> = {
    network: {
      type: 'retry',
      maxAttempts: 3,
      delay: 1000,
      callback: async () => {
        await this.checkConnectivity();
      }
    },
    auth: {
      type: 'redirect',
      maxAttempts: 1,
      delay: 0,
      callback: async () => {
        window.location.href = '/admin/login';
      }
    },
    session: {
      type: 'reload',
      maxAttempts: 1,
      delay: 0,
      callback: async () => {
        window.location.reload();
      }
    },
    data: {
      type: 'reset',
      maxAttempts: 2,
      delay: 500,
      callback: async () => {
        await this.clearCache();
      }
    }
  };

  private constructor() {}

  public static getInstance(): ErrorRecoveryService {
    if (!ErrorRecoveryService.instance) {
      ErrorRecoveryService.instance = new ErrorRecoveryService();
    }
    return ErrorRecoveryService.instance;
  }

  public async recover(errorType: string): Promise<boolean> {
    const strategy = this.strategies[errorType];
    if (!strategy) return false;

    const attempts = this.recoveryAttempts.get(errorType) || 0;
    if (attempts >= strategy.maxAttempts) return false;

    this.recoveryStatus.next('recovering');
    this.recoveryAttempts.set(errorType, attempts + 1);

    try {
      await this.delay(strategy.delay);
      if (strategy.callback) {
        await strategy.callback();
      }
      this.recoveryStatus.next('recovered');
      return true;
    } catch (error) {
      this.recoveryStatus.next('failed');
      return false;
    }
  }

  public getRecoveryStatus() {
    return this.recoveryStatus.asObservable();
  }

  public resetAttempts(errorType: string) {
    this.recoveryAttempts.delete(errorType);
  }

  private async checkConnectivity(): Promise<void> {
    try {
      await fetch('/api/health');
    } catch {
      throw new Error('Network connectivity check failed');
    }
  }

  private async clearCache(): Promise<void> {
    if ('caches' in window) {
      await caches.delete('admin-dashboard-cache');
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const errorRecovery = ErrorRecoveryService.getInstance();