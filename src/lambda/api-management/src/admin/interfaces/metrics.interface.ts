export interface TokenMetricsResponse {
  timestamp: string;
  metrics: {
    totalBlacklisted: number;
    activeBlacklisted: number;
    cleanupOperations: number;
    tokenValidations: number;
    lastCleanup: Date | null;
  };
}

export interface SystemHealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  blacklist: {
    total: number;
    active: number;
    cleanups: number;
  };
  performance: {
    tokenValidations: number;
    lastCleanup: Date | null;
  };
}

export interface DashboardMetricsResponse {
  apis: {
    total: number;
    active: number;
    inactive: number;
  };
  usage: {
    totalRequests: number;
    successRate: number;
    avgResponseTime: number;
  };
  security: {
    activeTokens: number;
    blacklistedTokens: number;
  };
}