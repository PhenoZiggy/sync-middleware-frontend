// src/store/slices/recentLogsSlice.ts

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { logsAPI } from '@/services/api';
import { RecentLogsState } from '@/interfaces/employee.interface';

// Initial state
const initialState: RecentLogsState = {
  logs: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchRecentLogs = createAsyncThunk(
  'recentLogs/fetchRecentLogs',
  async (limit: number = 5, { rejectWithValue }) => {
    try {
      const response = await logsAPI.getRecentLogs(limit);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recent logs');
    }
  }
);

export const retryLog = createAsyncThunk(
  'recentLogs/retryLog',
  async (logId: number, { rejectWithValue }) => {
    try {
      await logsAPI.retryLog(logId);
      return logId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to retry log');
    }
  }
);

// Slice
const recentLogsSlice = createSlice({
  name: 'recentLogs',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch recent logs
    builder
      .addCase(fetchRecentLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecentLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload;
      })
      .addCase(fetchRecentLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Retry log
    builder
      .addCase(retryLog.pending, (state) => {
        state.error = null;
      })
      .addCase(retryLog.fulfilled, (state, action) => {
        // Update log status
        const log = state.logs.find(log => log.id === action.payload);
        if (log) {
          log.syncStatus = 'pending';
        }
      })
      .addCase(retryLog.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = recentLogsSlice.actions;

export default recentLogsSlice.reducer;