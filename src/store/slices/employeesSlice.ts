// src/store/slices/employeesSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { employeeAPI } from '@/services/api';
import { EmployeesState, Employee, EmployeesSummary } from '@/interfaces/employee.interface';

// Initial state
const initialState: EmployeesState = {
  employees: [],
  total: 0,
  page: 1,
  limit: 5,
  totalPages: 0,
  loading: false,
  error: null,
  selectedEmployees: [],
  summary: {
    all: 0,
    blocked: 0,
    hasFailures: 0,
    pending: 0,
  },
  currentFilter: 'all',  
  searchTerm: '',
};

// Async thunks
export const fetchEmployees = createAsyncThunk(
  'employees/fetchEmployees',
  async (
    { 
      page, 
      limit, 
      search, 
      filter 
    }: { 
      page: number; 
      limit: number; 
      search?: string; 
      filter?: string 
    }, 
    { rejectWithValue }
  ) => {
    try {
      const response = await employeeAPI.getEmployees(page, limit, search, filter);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch employees');
    }
  }
);

export const syncEmployee = createAsyncThunk(
  'employees/syncEmployee',
  async (employeeId: string, { rejectWithValue }) => {
    try {
      await employeeAPI.syncEmployee(employeeId);
      return employeeId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to sync employee');
    }
  }
);

export const syncAllEmployees = createAsyncThunk(
  'employees/syncAllEmployees',
  async (_, { rejectWithValue }) => {
    try {
      await employeeAPI.syncAllEmployees();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to sync all employees');
    }
  }
);

export const toggleBlockEmployee = createAsyncThunk(
  'employees/toggleBlockEmployee',
  async (employeeId: string, { rejectWithValue }) => {
    try {
      await employeeAPI.toggleBlockEmployee(employeeId);
      return employeeId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle block status');
    }
  }
);

export const retryFailedRecords = createAsyncThunk(
  'employees/retryFailedRecords',
  async (employeeId: string, { rejectWithValue }) => {
    try {
      await employeeAPI.retryFailedRecords(employeeId);
      return employeeId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to retry failed records');
    }
  }
);

// Slice
const employeesSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
    },
    setFilter: (state, action: PayloadAction<string>) => {
      state.currentFilter = action.payload;
      state.page = 1; // Reset to first page when filter changes
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      state.page = 1; // Reset to first page when search changes
    },
    toggleSelectEmployee: (state, action: PayloadAction<string>) => {
      const employeeId = action.payload;
      if (state.selectedEmployees.includes(employeeId)) {
        state.selectedEmployees = state.selectedEmployees.filter(id => id !== employeeId);
      } else {
        state.selectedEmployees.push(employeeId);
      }
    },
    selectAllEmployees: (state) => {
      state.selectedEmployees = state.employees.map(emp => emp.id);
    },
    clearSelection: (state) => {
      state.selectedEmployees = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch employees
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload.data.data;
        state.total = action.payload.data.total;
        state.page = action.payload.data.page;
        state.limit = action.payload.data.limit;
        state.totalPages = action.payload.data.totalPages;
    
        if (action.payload.data.summary) {
          state.summary = action.payload.data.summary;
        }
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Sync employee
    builder
      .addCase(syncEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncEmployee.fulfilled, (state, action) => {
        // Update employee status in state
        const employee = state.employees.find(emp => emp.id === action.payload);
        if (employee) {
          employee.lastSyncStatus = 'pending';
        }
        state.loading = false;
      })
      .addCase(syncEmployee.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      });

    // Sync all employees
    builder
      .addCase(syncAllEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncAllEmployees.fulfilled, (state) => {
        // Update all employees status
        state.loading = false;
        state.employees.forEach(emp => {
          emp.lastSyncStatus = 'pending';
        });
      })
      .addCase(syncAllEmployees.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      });

    // Toggle block employee
    builder
      .addCase(toggleBlockEmployee.pending, (state) => {
        state.error = null;
      })
      .addCase(toggleBlockEmployee.fulfilled, (state, action) => {
        const employee = state.employees.find(emp => emp.id === action.payload);
        if (employee) {
          employee.isBlocked = !employee.isBlocked;
        }
      })
      .addCase(toggleBlockEmployee.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Retry failed records
    builder
      .addCase(retryFailedRecords.pending, (state) => {
        state.error = null;
      })
      .addCase(retryFailedRecords.fulfilled, (state, action) => {
        const employee = state.employees.find(emp => emp.id === action.payload);
        if (employee) {
          employee.lastSyncStatus = 'pending';
        }
      })
      .addCase(retryFailedRecords.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setPage,
  setLimit,
  setFilter,
  setSearchTerm,
  toggleSelectEmployee,
  selectAllEmployees,
  clearSelection,
  clearError,
} = employeesSlice.actions;

export default employeesSlice.reducer;