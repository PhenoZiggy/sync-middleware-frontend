import axios from 'axios';
import { store } from '@/store';
import { refreshAccessToken, clearCredentials } from '@/store/slices/authSlice';
import { DepartmentStatsResponse, Employee, EmployeeDetailResponse, EmployeeLogsParams, EmployeeLogsResponse, EmployeesResponse, RecentLogsResponse } from '@/interfaces/employee.interface';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle token refresh
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh token
        const resultAction = await store.dispatch(refreshAccessToken());

        if (refreshAccessToken.fulfilled.match(resultAction)) {
          const newToken = resultAction.payload;
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          // Refresh failed
          processQueue(error, null);
          store.dispatch(clearCredentials());
          
          // Redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/signin';
          }
          
          return Promise.reject(error);
        }
      } catch (err) {
        processQueue(err, null);
        store.dispatch(clearCredentials());
        
        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/signin';
        }
        
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
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
    const response = await api.post('attendance/fetch/trigger');
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


export interface BulkSyncResponse {
  success: boolean;
  batchId: string;
  totalRecords: number;
  successCount: number;
  failedCount: number;
  ignoredCount: number;
  unblockedEmployees?: number;
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: {
    type: string;
    includeBlocked: boolean;
  };
}

export interface DateRangeSyncRequest {
  startDate: string;
  endDate: string;
  filterType?: 'all' | 'failed' | 'pending';
  includeBlocked?: boolean;
  triggeredBy?: string;
}

export const bulkSyncAPI = {
  // Sync all pending records
  syncAllPending: async (triggeredBy?: string) => {
    const response = await api.post<BulkSyncResponse>('/bayzat/sync/pending', {
      triggeredBy,
    });
    return response.data;
  },

  // Retry all failed records
  retryAllFailed: async (triggeredBy?: string) => {
    const response = await api.post<BulkSyncResponse>('/bayzat/sync/retry-failed', {
      triggeredBy,
    });
    return response.data;
  },

  // Emergency sync - overrides all blocks
  emergencySync: async (triggeredBy?: string) => {
    const response = await api.post<BulkSyncResponse>('/bayzat/sync/emergency', {
      triggeredBy,
      confirmEmergency: true,
    });
    return response.data;
  },

  // Date range sync with filters
  dateRangeSync: async (params: DateRangeSyncRequest) => {
    const response = await api.post<BulkSyncResponse>('/bayzat/sync/date-range', params);
    return response.data;
  },
};