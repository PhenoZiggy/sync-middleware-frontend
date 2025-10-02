 

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { departmentAPI } from '@/services/api';
import { DepartmentStatsState } from '@/interfaces/employee.interface';

// Initial state
const initialState: DepartmentStatsState = {
  departments: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  loading: false,
  error: null,
  selectedDepartments: [],
};

// Async thunks
export const fetchDepartmentStats = createAsyncThunk(
  'departmentStats/fetchDepartmentStats',
  async ({ page, limit }: { page: number; limit: number }, { rejectWithValue }) => {
    try {
      const response = await departmentAPI.getDepartmentStats(page, limit);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch department stats');
    }
  }
);

export const syncDepartment = createAsyncThunk(
  'departmentStats/syncDepartment',
  async (departmentId: number, { rejectWithValue }) => {
    try {
      await departmentAPI.syncDepartment(departmentId);
      return departmentId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to sync department');
    }
  }
);

export const retryDepartmentFailed = createAsyncThunk(
  'departmentStats/retryDepartmentFailed',
  async (departmentId: number, { rejectWithValue }) => {
    try {
      await departmentAPI.retryDepartmentFailed(departmentId);
      return departmentId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to retry department');
    }
  }
);

export const forceSyncDepartment = createAsyncThunk(
  'departmentStats/forceSyncDepartment',
  async (departmentId: number, { rejectWithValue }) => {
    try {
      await departmentAPI.forceSyncDepartment(departmentId);
      return departmentId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to force sync department');
    }
  }
);

export const syncMultipleDepartments = createAsyncThunk(
  'departmentStats/syncMultipleDepartments',
  async (departmentIds: number[], { rejectWithValue }) => {
    try {
      await departmentAPI.syncMultipleDepartments(departmentIds);
      return departmentIds;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to sync multiple departments'
      );
    }
  }
);

// Slice
const departmentStatsSlice = createSlice({
  name: 'departmentStats',
  initialState,
  reducers: {
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
    },
    toggleSelectDepartment: (state, action: PayloadAction<number>) => {
      const deptId = action.payload;
      if (state.selectedDepartments.includes(deptId)) {
        state.selectedDepartments = state.selectedDepartments.filter((id) => id !== deptId);
      } else {
        state.selectedDepartments.push(deptId);
      }
    },
    selectAllDepartments: (state) => {
      state.selectedDepartments = state.departments.map((dept) => dept.id);
    },
    clearDepartmentSelection: (state) => {
      state.selectedDepartments = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch department stats
    builder
      .addCase(fetchDepartmentStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartmentStats.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchDepartmentStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Sync department
    builder
      .addCase(syncDepartment.pending, (state) => {
        state.error = null;
      })
      .addCase(syncDepartment.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Retry department failed
    builder
      .addCase(retryDepartmentFailed.pending, (state) => {
        state.error = null;
      })
      .addCase(retryDepartmentFailed.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Force sync department
    builder
      .addCase(forceSyncDepartment.pending, (state) => {
        state.error = null;
      })
      .addCase(forceSyncDepartment.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Sync multiple departments
    builder
      .addCase(syncMultipleDepartments.pending, (state) => {
        state.error = null;
      })
      .addCase(syncMultipleDepartments.fulfilled, (state) => {
        state.selectedDepartments = [];
      })
      .addCase(syncMultipleDepartments.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setPage,
  setLimit,
  toggleSelectDepartment,
  selectAllDepartments,
  clearDepartmentSelection,
  clearError,
} = departmentStatsSlice.actions;

export default departmentStatsSlice.reducer;