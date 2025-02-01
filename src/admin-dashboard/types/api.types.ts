export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalTemplates: number;
  systemHealth: SystemHealth;
  usersTrend: TrendData;
  templatesTrend: TrendData;
  activityData: ActivityData[];
  performanceData: PerformanceMetrics;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  uptime: number;
  lastChecked: string;
  services: ServiceHealth[];
}

export interface ServiceHealth {
  name: string;
  status: 'up' | 'down';
  responseTime: number;
}

export interface TrendData {
  current: number;
  previous: number;
  percentageChange: number;
}

export interface ActivityData {
  timestamp: string;
  activeUsers: number;
  actions: number;
}

export interface PerformanceMetrics {
  cpu: number;
  memory: number;
  responseTime: number;
  errorRate: number;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  content: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserMetrics {
  loginCount: number;
  lastActive: string;
  actionsPerformed: number;
  templatesCreated: number;
  averageSessionDuration: number;
}

export interface SystemConfig {
  maintenanceMode: boolean;
  featureFlags: Record<string, boolean>;
  limits: {
    maxUsers: number;
    maxTemplates: number;
    maxFileSize: number;
  };
}