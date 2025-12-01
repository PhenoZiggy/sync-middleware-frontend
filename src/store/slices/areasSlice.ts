// src/store/slices/areasSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { areasAPI } from '@/services/areasApi';
import type { Area } from '@/interfaces/area.interface';

interface AreasState {
  areas: Area[];
  loading: boolean;
  error: string | null;
  fetchingData: boolean;
  fetchSuccess: string | null;
  lastFetchStats: {
    totalFetched: number;
    newAreas: number;
    updatedAreas: number;
    newDevices: number;
    updatedDevices: number;
  } | null;
  expandedAreas: string[];
}

const initialState: AreasState = {
  areas: [],
  loading: false,
  error: null,
  fetchingData: false,
  fetchSuccess: null,
  lastFetchStats: null,
  expandedAreas: [],
};

// Async thunks
export const fetchAreas = createAsyncThunk(
  'areas/fetchAreas',
  async (_, { rejectWithValue }) => {
    try {
      const response = await areasAPI.getAreas();
      // Handle nested response structure: response.data.data contains the actual areas array
      return response.data?.data || [];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch areas'
      );
    }
  }
);

export const syncAreasFromAPI = createAsyncThunk(
  'areas/syncAreasFromAPI',
  async (triggeredBy: string | undefined, { rejectWithValue }) => {
    try {
      const response = await areasAPI.fetchAreas(triggeredBy);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to sync areas from API'
      );
    }
  }
);

export const syncDevicesFromAPI = createAsyncThunk(
  'areas/syncDevicesFromAPI',
  async (
    { deviceCategory, triggeredBy }: { deviceCategory?: string; triggeredBy?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await areasAPI.fetchDevices(deviceCategory, triggeredBy);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to sync devices from API'
      );
    }
  }
);

const areasSlice = createSlice({
  name: 'areas',
  initialState,
  reducers: {
    toggleExpandArea: (state, action: PayloadAction<string>) => {
      const areaId = action.payload;
      const index = state.expandedAreas.indexOf(areaId);
      if (index > -1) {
        state.expandedAreas.splice(index, 1);
      } else {
        state.expandedAreas.push(areaId);
      }
    },
    expandAllAreas: (state) => {
      state.expandedAreas = state.areas.map((area) => area.areaId);
    },
    collapseAllAreas: (state) => {
      state.expandedAreas = [];
    },
    clearFetchSuccess: (state) => {
      state.fetchSuccess = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch areas
    builder
      .addCase(fetchAreas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAreas.fulfilled, (state, action) => {
        state.loading = false;
        state.areas = action.payload;
      })
      .addCase(fetchAreas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Sync areas from API
    builder
      .addCase(syncAreasFromAPI.pending, (state) => {
        state.fetchingData = true;
        state.error = null;
        state.fetchSuccess = null;
      })
      .addCase(syncAreasFromAPI.fulfilled, (state, action) => {
        state.fetchingData = false;
        state.fetchSuccess = `Successfully fetched ${action.payload.totalFetched} areas (${action.payload.newAreas} new, ${action.payload.updatedAreas} updated)`;
        state.lastFetchStats = {
          totalFetched: action.payload.totalFetched,
          newAreas: action.payload.newAreas,
          updatedAreas: action.payload.updatedAreas,
          newDevices: 0,
          updatedDevices: 0,
        };
      })
      .addCase(syncAreasFromAPI.rejected, (state, action) => {
        state.fetchingData = false;
        state.error = action.payload as string;
      });

    // Sync devices from API
    builder
      .addCase(syncDevicesFromAPI.pending, (state) => {
        state.fetchingData = true;
        state.error = null;
        state.fetchSuccess = null;
      })
      .addCase(syncDevicesFromAPI.fulfilled, (state, action) => {
        state.fetchingData = false;
        state.fetchSuccess = `Successfully fetched ${action.payload.totalFetched} devices (${action.payload.newDevices} new, ${action.payload.updatedDevices} updated)`;
        if (state.lastFetchStats) {
          state.lastFetchStats.newDevices = action.payload.newDevices;
          state.lastFetchStats.updatedDevices = action.payload.updatedDevices;
        } else {
          state.lastFetchStats = {
            totalFetched: 0,
            newAreas: 0,
            updatedAreas: 0,
            newDevices: action.payload.newDevices,
            updatedDevices: action.payload.updatedDevices,
          };
        }
      })
      .addCase(syncDevicesFromAPI.rejected, (state, action) => {
        state.fetchingData = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  toggleExpandArea,
  expandAllAreas,
  collapseAllAreas,
  clearFetchSuccess,
  clearError,
} = areasSlice.actions;

export default areasSlice.reducer;
