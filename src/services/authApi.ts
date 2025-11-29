import axios from 'axios';
import { LoginRequest, LoginResponse, RefreshTokenResponse } from '@/interfaces/auth.interface';

const AUTH_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create a separate axios instance for auth (without interceptors)
export const authApi = axios.create({
  baseURL: AUTH_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const authAPI = {
  // Login
  login: async (credentials: LoginRequest) => {
    const response = await authApi.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  // Logout - requires Bearer token
  logout: async (refreshToken: string, accessToken: string) => {
    try {
      await authApi.post(
        '/auth/logout', 
        { refreshToken },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    } catch (error) {
      console.error('Logout error:', error);
      // Don't throw error - allow local logout even if API fails
    }
  },

  // Refresh access token
  refreshAccessToken: async (refreshToken: string) => {
    const response = await authApi.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },

  // Verify token
  verifyToken: async (token: string) => {
    const response = await authApi.post('/auth/verify', { token });
    return response.data;
  },
};