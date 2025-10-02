// src/interfaces/employee.interface.ts


export interface Employee {
  id: string;
  personCode: string;
  personName: string;
  department: string | null;
  avatar: string;
  totalRecords: number;
  syncedRecords: number;
  failedRecords: number;
  pendingRecords: number;
  lastActivity: string;
  isBlocked: boolean;
  consecutiveFailures: number;
  lastSyncStatus: 'success' | 'failed' | 'pending';
}

// ADD: Summary interface
export interface EmployeesSummary {
  all: number;
  blocked: number;
  hasFailures: number;
  pending: number;
}

export interface EmployeesResponse {
  isSuccess: boolean;
  statusCode: number;
  message: string;
  data: {
    data: Employee[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
     summary: EmployeesSummary;  
  };
 
}

export interface EmployeesState {
  employees: Employee[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  selectedEmployees: string[];
  summary: EmployeesSummary; // ADD: Summary to state
  currentFilter: string; // ADD: Current filter
  searchTerm: string; // ADD: Search term
}


export interface RecentLog {
  id: number;
  personCode: string;
  personName: string;
  punchType: 'checkIn' | 'checkOut';
  punchTime: string;
  deviceName: string;
  syncStatus: 'success' | 'failed' | 'pending';
  syncedAt?: string;
  batchId?: string;
  errorMessage?: string;
  retryCount?: number;
  nextRetryAt?: string;
}

export interface RecentLogsResponse {
  isSuccess: boolean;
  statusCode: number;
  message: string;
  data: RecentLog[];
}

 

export interface RecentLogsState {
  logs: RecentLog[];
  loading: boolean;
  error: string | null;
}


// src/interfaces/employee.interface.ts (ADD these to existing file)

export interface EmployeeDetail extends Employee {
  email: string | null;
  phoneNumber: string | null;
  lastSyncedAt: string | null;
  status: 'Active' | 'Inactive';
}

export interface EmployeeLog {
  id: string;
  recordGuid: string;
  punchType: 'checkIn' | 'checkOut';
  punchTime: string;
  deviceTime: string;
  deviceName: string;
  elementName: string;
  syncStatus: 'pending' | 'processing' | 'success' | 'failed' | 'ignored' | 'not_queued';
  batchId?: string;
  snapPicUrl?: string;
  eventType: number;
  swipeAuthResult: number;
  syncedAt?: string;
  errorMessage?: string;
  errorCode?: string;
  retryCount?: number;
  nextRetryAt?: string;
}

export interface EmployeeLogsResponse {
  isSuccess: boolean;
  statusCode: number;
  message: string;
  data: {
    data: EmployeeLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

}

export interface EmployeeDetailResponse {
  isSuccess: boolean;
  statusCode: number;
  message: string;
  data: EmployeeDetail;
}

export interface EmployeeLogsParams {
  page?: number;
  limit?: number;
  status?: 'pending' | 'processing' | 'success' | 'failed' | 'ignored' | 'all';
  startDate?: string;
  endDate?: string;
}

export interface EmployeeDetailsState {
  employee: EmployeeDetail | null;
  logs: EmployeeLog[];
  logsTotal: number;
  logsPage: number;
  logsLimit: number;
  logsTotalPages: number;
  loading: boolean;
  logsLoading: boolean;
  error: string | null;
  logsError: string | null;
  selectedLogs: string[];
  filterStatus: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}



export interface DepartmentStats {
  id: number;
  name: string;
  employeeCount: number;
  totalRecords: number;
  syncedRecords: number;
  failedRecords: number;
  pendingRecords: number;
  blockedEmployees: number;
  lastSync: string | null;
}

export interface DepartmentStatsResponse {
  isSuccess: boolean;
  statusCode: number;
  message: string;
  data: {
    data: DepartmentStats[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DepartmentStatsState {
  departments: DepartmentStats[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  selectedDepartments: number[];
}