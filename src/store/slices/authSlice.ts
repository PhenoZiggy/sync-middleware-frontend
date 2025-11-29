// src/store/slices/authSlice.ts - FIXED with proper cookie settings

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authAPI } from '@/services/authApi';
import { AuthState, LoginRequest, User } from '@/interfaces/auth.interface';
import Cookies from 'js-cookie';

// Initial state
const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Helper functions for token storage
const setTokens = (accessToken: string, refreshToken: string, user: User) => {
  // Store in localStorage
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('user', JSON.stringify(user));
  
  // Store in cookies with proper settings
  Cookies.set('accessToken', accessToken, { 
    expires: 1, // 1 day
    path: '/',
    sameSite: 'lax'
  });
  Cookies.set('refreshToken', refreshToken, { 
    expires: 7, // 7 days
    path: '/',
    sameSite: 'lax'
  });
};

const clearTokens = () => {
  // Clear localStorage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  
  // Clear cookies
  Cookies.remove('accessToken', { path: '/' });
  Cookies.remove('refreshToken', { path: '/' });
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      
      // Store tokens in both localStorage and cookies
      setTokens(response.data.accessToken, response.data.refreshToken, response.data.user);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Login failed. Please try again.'
      );
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { getState }) => {
    const state = getState() as { auth: AuthState };
    const refreshToken = state.auth.refreshToken;
    const accessToken = state.auth.accessToken;

    if (refreshToken && accessToken) {
      try {
        await authAPI.logout(refreshToken, accessToken);
      } catch (error) {
        console.error('Logout API error:', error);
      }
    }

    // Clear all tokens
    clearTokens();

    return true;
  }
);

export const refreshAccessToken = createAsyncThunk(
  'auth/refreshAccessToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const refreshToken = state.auth.refreshToken;

      if (!refreshToken) {
        return rejectWithValue('No refresh token available');
      }

      const response = await authAPI.refreshAccessToken(refreshToken);
      
      // Update access token in both localStorage and cookies
      localStorage.setItem('accessToken', response.data.accessToken);
      Cookies.set('accessToken', response.data.accessToken, { 
        expires: 1,
        path: '/',
        sameSite: 'lax'
      });

      return response.data.accessToken;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to refresh token'
      );
    }
  }
);

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      // Try to get from cookies first (most reliable)
      let accessToken = Cookies.get('accessToken');
      let refreshToken = Cookies.get('refreshToken');
      
      // Fallback to localStorage
      if (!accessToken) {
        accessToken = localStorage.getItem('accessToken') ?? undefined;
        refreshToken = localStorage.getItem('refreshToken') ?? undefined;
      }

      const userStr = localStorage.getItem('user');

      if (!accessToken || !refreshToken || !userStr) {
        return rejectWithValue('No auth data found');
      }

      const user: User = JSON.parse(userStr);

      return {
        accessToken,
        refreshToken,
        user,
      };
    } catch (error) {
      return rejectWithValue('Failed to initialize auth');
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string; refreshToken: string }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      
      // Store in both localStorage and cookies
      setTokens(action.payload.accessToken, action.payload.refreshToken, action.payload.user);
    },
    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      
      // Clear all tokens
      clearTokens();
    },
    updateAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      
      // Update in both localStorage and cookies
      localStorage.setItem('accessToken', action.payload);
      Cookies.set('accessToken', action.payload, { 
        expires: 1,
        path: '/',
        sameSite: 'lax'
      });
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Logout
    builder
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
      });

    // Refresh token
    builder
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.accessToken = action.payload;
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        // If refresh fails, logout user
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        clearTokens();
      });

    // Initialize auth
    builder
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      });
  },
});

export const { setCredentials, clearCredentials, updateAccessToken, clearError } =
  authSlice.actions;

export default authSlice.reducer;