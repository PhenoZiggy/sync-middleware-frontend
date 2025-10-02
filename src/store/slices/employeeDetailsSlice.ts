// src/store/slices/employeeDetailsSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { employeeAPI } from '@/services/api';
import { EmployeeDetailsState, EmployeeLogsParams } from '@/interfaces/employee.interface';

// Initial state
const initialState: EmployeeDetailsState = {
  employee: null,
  logs: [],
  logsTotal: 0,
  logsPage: 1,
  logsLimit: 5,
  logsTotalPages: 0,
  loading: false,
  logsLoading: false,
  error: null,
  logsError: null,
  selectedLogs: [],
  filterStatus: 'all',
  dateRange: {
    startDate: '',
    endDate: '',
  },
};

// Async thunks
export const fetchEmployeeDetail = createAsyncThunk(
  'employeeDetails/fetchEmployeeDetail',
  async (employeeId: string, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getEmployeeDetail(employeeId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch employee details');
    }
  }
);

export const fetchEmployeeLogs = createAsyncThunk(
  'employeeDetails/fetchEmployeeLogs',
  async (
    { employeeId, params }: { employeeId: string; params: EmployeeLogsParams },
    { rejectWithValue }
  ) => {
    try {
      const response = await employeeAPI.getEmployeeLogs(employeeId, params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch employee logs');
    }
  }
);

export const syncEmployeeDateRange = createAsyncThunk(
  'employeeDetails/syncDateRange',
  async (
    { employeeId, startDate, endDate }: { employeeId: string; startDate: string; endDate: string },
    { rejectWithValue }
  ) => {
    try {
      await employeeAPI.syncEmployeeDateRange(employeeId, startDate, endDate);
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to sync date range');
    }
  }
);

export const syncSingleRecord = createAsyncThunk(
  'employeeDetails/syncSingleRecord',
  async (
    { employeeId, logId }: { employeeId: string; logId: string },
    { rejectWithValue }
  ) => {
    try {
      await employeeAPI.syncSingleRecord(employeeId, logId);
      return logId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to sync record');
    }
  }
);

export const forceSyncEmployee = createAsyncThunk(
  'employeeDetails/forceSyncEmployee',
  async (employeeId: string, { rejectWithValue }) => {
    try {
      await employeeAPI.forceSyncEmployee(employeeId);
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to force sync');
    }
  }
);

export const syncSelectedRecords = createAsyncThunk(
  'employeeDetails/syncSelectedRecords',
  async (
    { employeeId, logIds }: { employeeId: string; logIds: string[] },
    { rejectWithValue }
  ) => {
    try {
      // Sync all selected records
      await Promise.all(
        logIds.map((logId) => employeeAPI.syncSingleRecord(employeeId, logId))
      );
      return logIds;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to sync selected records');
    }
  }
);

// Slice
const employeeDetailsSlice = createSlice({
  name: 'employeeDetails',
  initialState,
  reducers: {
    setLogsPage: (state, action: PayloadAction<number>) => {
      state.logsPage = action.payload;
    },
    setLogsLimit: (state, action: PayloadAction<number>) => {
      state.logsLimit = action.payload;
    },
    setFilterStatus: (state, action: PayloadAction<string>) => {
      state.filterStatus = action.payload;
      state.logsPage = 1; // Reset to first page when filter changes
    },
    setDateRange: (state, action: PayloadAction<{ startDate: string; endDate: string }>) => {
      state.dateRange = action.payload;
    },
    toggleSelectLog: (state, action: PayloadAction<string>) => {
      const logId = action.payload;
      if (state.selectedLogs.includes(logId)) {
        state.selectedLogs = state.selectedLogs.filter((id) => id !== logId);
      } else {
        state.selectedLogs.push(logId);
      }
    },
    selectAllLogs: (state) => {
      state.selectedLogs = state.logs.map((log) => log.id);
    },
    clearLogSelection: (state) => {
      state.selectedLogs = [];
    },
    clearError: (state) => {
      state.error = null;
      state.logsError = null;
    },
    resetEmployeeDetails: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Fetch employee detail
    builder
      .addCase(fetchEmployeeDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.employee = action.payload;
      })
      .addCase(fetchEmployeeDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch employee logs
    builder
      .addCase(fetchEmployeeLogs.pending, (state) => {
        state.logsLoading = true;
        state.logsError = null;
      })
      .addCase(fetchEmployeeLogs.fulfilled, (state, action) => {
        state.logsLoading = false;
        state.logs = action.payload.data;
        state.logsTotal = action.payload.total;
        state.logsPage = action.payload.page;
        state.logsLimit = action.payload.limit;
        state.logsTotalPages = action.payload.totalPages;
      })
      .addCase(fetchEmployeeLogs.rejected, (state, action) => {
        state.logsLoading = false;
        state.logsError = action.payload as string;
      });

    // Sync date range
    builder
      .addCase(syncEmployeeDateRange.pending, (state) => {
        state.error = null;
      })
      .addCase(syncEmployeeDateRange.fulfilled, (state) => {
        // Success - will refetch data
      })
      .addCase(syncEmployeeDateRange.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Sync single record
    builder
      .addCase(syncSingleRecord.fulfilled, (state, action) => {
        const log = state.logs.find((l) => l.id === action.payload);
        if (log) {
          log.syncStatus = 'processing';
        }
      });

    // Force sync employee
    builder
      .addCase(forceSyncEmployee.fulfilled, (state) => {
        if (state.employee) {
          state.employee.isBlocked = false;
        }
      });

    // Sync selected records
    builder
      .addCase(syncSelectedRecords.fulfilled, (state, action) => {
        action.payload.forEach((logId) => {
          const log = state.logs.find((l) => l.id === logId);
          if (log) {
            log.syncStatus = 'processing';
          }
        });
        state.selectedLogs = [];
      });
  },
});

export const {
  setLogsPage,
  setLogsLimit,
  setFilterStatus,
  setDateRange,
  toggleSelectLog,
  selectAllLogs,
  clearLogSelection,
  clearError,
  resetEmployeeDetails,
} = employeeDetailsSlice.actions;

export default employeeDetailsSlice.reducer;