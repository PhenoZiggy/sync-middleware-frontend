// src/services/api.ts

import axios from 'axios';
import { DepartmentStatsResponse, Employee, EmployeeDetailResponse, EmployeeLogsParams, EmployeeLogsResponse, EmployeesResponse, RecentLogsResponse } from '@/interfaces/employee.interface';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.25.71:8000';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor (for auth tokens, etc.)
api.interceptors.request.use(
  (config) => {
    // Add auth token if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (for error handling)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error codes
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    return Promise.reject(error);
  }
);

// API Endpoints
export const employeeAPI = {
  // Get employees with pagination
 getEmployees: async (
    page: number = 1, 
    limit: number = 5,
    search?: string,
    filter?: string
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (search) {
      params.append('search', search);
    }
    
    if (filter && filter !== 'all') {
      params.append('filter', filter);
    }

    const response = await api.get<EmployeesResponse>(
      `/attendance/employees?${params.toString()}`
    );
    return response.data;
  },

  // Get single employee
  getEmployeeById: async (id: string) => {
    const response = await api.get<Employee>(`/attendance/employees/${id}`);
    return response.data;
  },

  // Sync employee
  syncEmployee: async (employeeId: string) => {
    const response = await api.post(`/attendance/sync/${employeeId}`);
    return response.data;
  },

  // Sync all employees
  syncAllEmployees: async () => {
    const response = await api.post('/attendance/sync-all');
    return response.data;
  },

  // Block/Unblock employee
  toggleBlockEmployee: async (employeeId: string) => {
    const response = await api.patch(`/attendance/employees/${employeeId}/toggle-block`);
    return response.data;
  },

  // Retry failed records
  retryFailedRecords: async (employeeId: string) => {
    const response = await api.post(`/attendance/retry-failed/${employeeId}`);
    return response.data;
  },

  getEmployeeDetail: async (employeeId: string) => {
    const response = await api.get<EmployeeDetailResponse>(
      `/attendance/employees/${employeeId}`
    );
    return response.data;
  },

  // Get employee logs with filters
  getEmployeeLogs: async (employeeId: string, params: EmployeeLogsParams = {}) => {
    const { page = 1, limit = 10, status, startDate, endDate } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && status !== 'all' && { status }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    });

    const response = await api.get<EmployeeLogsResponse>(
      `/attendance/employees/${employeeId}/logs?${queryParams}`
    );
    return response.data;
  },

  // Sync employee by date range
  syncEmployeeDateRange: async (employeeId: string, startDate: string, endDate: string) => {
    const response = await api.post(`/attendance/sync/${employeeId}/date-range`, {
      startDate,
      endDate,
    });
    return response.data;
  },

  // Sync single record
  syncSingleRecord: async (employeeId: string, logId: string) => {
    const response = await api.post(`/attendance/sync/${employeeId}/record/${logId}`);
    return response.data;
  },

  // Force sync (override block)
  forceSyncEmployee: async (employeeId: string) => {
    const response = await api.post(`/attendance/sync/${employeeId}/force`);
    return response.data;
  },
};

export const logsAPI = {
  // Get recent logs
  getRecentLogs: async (limit: number = 5) => {
    const response = await api.get<RecentLogsResponse>(
      `/attendance/recent-logs?limit=${limit}`
    );
    return response.data;
  },

  // Retry single log
  retryLog: async (logId: number) => {
    const response = await api.post(`/attendance/retry-log/${logId}`);
    return response.data;
  },
};


// src/services/api.ts (ADD these to existing file)

export const departmentAPI = {
  // Get department statistics
  getDepartmentStats: async (page: number = 1, limit: number = 10) => {
    const response = await api.get<DepartmentStatsResponse>(
      `/attendance/departments/stats?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Sync entire department
  syncDepartment: async (departmentId: number) => {
    const response = await api.post(`/attendance/sync/department/${departmentId}`);
    return response.data;
  },

  // Retry failed records for department
  retryDepartmentFailed: async (departmentId: number) => {
    const response = await api.post(`/attendance/retry/department/${departmentId}`);
    return response.data;
  },

  // Force sync department (override blocks)
  forceSyncDepartment: async (departmentId: number) => {
    const response = await api.post(`/attendance/sync/department/${departmentId}/force`);
    return response.data;
  },

  // Sync multiple departments
  syncMultipleDepartments: async (departmentIds: number[]) => {
    const response = await api.post('/attendance/sync/departments/bulk', {
      departmentIds,
    });
    return response.data;
  },
};



 