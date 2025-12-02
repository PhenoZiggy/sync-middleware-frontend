// src/services/rolesApi.ts
import { api } from './api';
import type {
  Role,
  Permission,
  CreateRoleDto,
  UpdateRoleDto,
  AssignRolesToUserDto,
  AssignPermissionsToRoleDto,
} from '@/interfaces/role.interface';

// Define response wrapper interface
interface ApiResponse<T> {
  isSuccess: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export const rolesAPI = {
  // Get all roles
  getAllRoles: async () => {
    const response = await api.get<ApiResponse<Role[]>>('/roles');
    return response.data.data; // Extract data from wrapper
  },

  // Get all permissions
  getAllPermissions: async () => {
    const response = await api.get<ApiResponse<Permission[]>>('/roles/permissions');
    return response.data.data; // Extract data from wrapper
  },

  // Get role by ID
  getRoleById: async (id: number) => {
    const response = await api.get<ApiResponse<Role>>(`/roles/${id}`);
    return response.data.data;
  },

  // Create new role
  createRole: async (data: CreateRoleDto) => {
    const response = await api.post<ApiResponse<Role>>('/roles', data);
    return response.data.data;
  },

  // Update role
  updateRole: async (id: number, data: UpdateRoleDto) => {
    const response = await api.post<ApiResponse<Role>>(`/roles/${id}`, data);
    return response.data.data;
  },

  // Delete role
  deleteRole: async (id: number) => {
    const response = await api.delete<ApiResponse<{ success: boolean; message: string }>>(`/roles/${id}`);
    return response.data.data;
  },

  // Assign permissions to role
  assignPermissionsToRole: async (roleId: number, data: AssignPermissionsToRoleDto) => {
    const response = await api.post<ApiResponse<Role>>(`/roles/${roleId}/permissions`, data);
    return response.data.data;
  },

  // Assign roles to user
  assignRolesToUser: async (userId: string, data: AssignRolesToUserDto) => {
    const response = await api.post<ApiResponse<{
      success: boolean;
      message: string;
      user: {
        id: string;
        username: string;
        roles: string[];
      };
    }>>(`/roles/users/${userId}/roles`, data);
    return response.data.data;
  },
};
