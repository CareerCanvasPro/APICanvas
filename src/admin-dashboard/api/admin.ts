import axios from 'axios';
import {
  DashboardStats,
  User,
  Role,
  Template,
  PaginatedResponse,
  UserMetrics,
  SystemConfig,
  SystemHealth
} from '../types/api.types';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api/admin',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Dashboard
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get<DashboardStats>('/dashboard/stats');
  return response.data;
};

// User Management
export const fetchUsers = async (params?: { 
  page?: number; 
  limit?: number 
}): Promise<PaginatedResponse<User>> => {
  const response = await api.get<PaginatedResponse<User>>('/users', { params });
  return response.data;
};

export const createUser = async (userData: Partial<User>): Promise<User> => {
  const response = await api.post<User>('/users', userData);
  return response.data;
};

export const updateUser = async (userId: string, userData: Partial<User>): Promise<User> => {
  const response = await api.put<User>(`/users/${userId}`, userData);
  return response.data;
};

export const deleteUser = async (userId: string) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};

// Role Management
export const fetchRoles = async () => {
  const response = await api.get('/roles');
  return response.data;
};

export const createRole = async (roleData: any) => {
  const response = await api.post('/roles', roleData);
  return response.data;
};

export const updateRole = async (roleId: string, roleData: any) => {
  const response = await api.put(`/roles/${roleId}`, roleData);
  return response.data;
};

export const assignPermissions = async (roleId: string, permissionIds: string[]) => {
  const response = await api.put(`/roles/${roleId}/permissions`, { permissionIds });
  return response.data;
};

// Template Management
export const fetchTemplates = async (params?: { category?: string }) => {
  const response = await api.get('/templates', { params });
  return response.data;
};

export const createTemplate = async (templateData: any) => {
  const response = await api.post('/templates', templateData);
  return response.data;
};

export const updateTemplate = async (templateId: string, templateData: any) => {
  const response = await api.put(`/templates/${templateId}`, templateData);
  return response.data;
};

export const deleteTemplate = async (templateId: string) => {
  const response = await api.delete(`/templates/${templateId}`);
  return response.data;
};

// Analytics
export const fetchAnalytics = async (params: { 
  startDate: string; 
  endDate: string; 
  metric: string 
}) => {
  const response = await api.get('/analytics/user-activity', { params });
  return response.data;
};

export const fetchSystemPerformance = async () => {
  const response = await api.get('/analytics/system-performance');
  return response.data;
};

// Analytics
export const fetchUserMetrics = async (userId: string): Promise<UserMetrics> => {
  const response = await api.get<UserMetrics>(`/analytics/user/${userId}/metrics`);
  return response.data;
};

// System Configuration
export const updateSystemConfig = async (configData: Partial<SystemConfig>): Promise<SystemConfig> => {
  const response = await api.put<SystemConfig>('/system/config', configData);
  return response.data;
};

export const fetchSystemHealth = async (): Promise<SystemHealth> => {
  const response = await api.get<SystemHealth>('/system/health');
  return response.data;
};

// Error handling interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);