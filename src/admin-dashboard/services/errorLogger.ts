import { BehaviorSubject } from 'rxjs';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  error?: Error;
  context?: Record<string, any>;
  stack?: string;
}

class ErrorLogger {
  private static instance: ErrorLogger;
  private logs = new BehaviorSubject<LogEntry[]>([]);
  private maxLogs: number = 1000;

  private constructor() {}

  public static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  public log(
    level: LogEntry['level'],
    message: string,
    error?: Error,
    context?: Record<string, any>
  ) {
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      level,
      message,
      error,
      context,
      stack: error?.stack
    };

    this.addEntry(entry);
    this.persistLog(entry);
    this.notifyListeners(entry);
  }

  public getLogs() {
    return this.logs.asObservable();
  }

  public clearLogs() {
    this.logs.next([]);
    localStorage.removeItem('admin_error_logs');
  }

  private addEntry(entry: LogEntry) {
    const currentLogs = this.logs.value;
    const updatedLogs = [entry, ...currentLogs].slice(0, this.maxLogs);
    this.logs.next(updatedLogs);
  }

  private persistLog(entry: LogEntry) {
    try {
      const storedLogs = JSON.parse(localStorage.getItem('admin_error_logs') || '[]');
      const updatedLogs = [entry, ...storedLogs].slice(0, this.maxLogs);
      localStorage.setItem('admin_error_logs', JSON.stringify(updatedLogs));
    } catch (error) {
      console.warn('Failed to persist error log:', error);
    }
  }

  private notifyListeners(entry: LogEntry) {
    if (entry.level === 'error' || entry.level === 'fatal') {
      // Send to external monitoring service
      this.sendToMonitoring(entry);
    }
  }

  private async sendToMonitoring(entry: LogEntry) {
    try {
      await fetch('/api/admin/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      console.warn('Failed to send log to monitoring service:', error);
    }
  }
}

export const errorLogger = ErrorLogger.getInstance();