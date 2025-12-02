// src/services/usersApi.ts
import { api } from './api';
import type {
  UsersResponse,
  User,
  CreateUserDto,
  UpdateUserDto,
} from '@/interfaces/user.interface';

export const usersAPI = {
  // Get all users with pagination
  getUsers: async (page: number = 1, limit: number = 10) => {
    const response = await api.get<{ data: UsersResponse }>(`/users?page=${page}&limit=${limit}`);
    return response.data.data;
  },

  // Get user by ID
  getUserById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: User }>(`/users/${id}`);
    return response.data;
  },

  // Create new user
  createUser: async (data: CreateUserDto) => {
    const response = await api.post<{ success: boolean; message: string; data: User }>('/users', data);
    return response.data;
  },

  // Update user
  updateUser: async (id: string, data: UpdateUserDto) => {
    const response = await api.put<{ success: boolean; message: string; data: User }>(`/users/${id}`, data);
    return response.data;
  },

  // Activate user
  activateUser: async (id: string) => {
    const response = await api.put<{ success: boolean; message: string; data: User }>(`/users/${id}/activate`);
    return response.data;
  },

  // Unlock user (reset failed login attempts)
  unlockUser: async (id: string) => {
    const response = await api.put<{ success: boolean; message: string; data: User }>(`/users/${id}/unlock`);
    return response.data;
  },

  // Deactivate user (soft delete)
  deactivateUser: async (id: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/users/${id}`);
    return response.data;
  },

  // Hard delete user
  hardDeleteUser: async (id: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/users/${id}/hard`);
    return response.data;
  },

  // Get user statistics
  getUserStats: async () => {
    const response = await api.get<{
      success: boolean;
      data: {
        totalUsers: number;
        activeUsers: number;
        inactiveUsers: number;
        recentLogins: number;
      };
    }>('/users/stats');
    return response.data;
  },
};
