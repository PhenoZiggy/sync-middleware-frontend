// src/interfaces/user.interface.ts

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber?: string | null;
  isActive: boolean;
  lastLoginAt: Date | null;
  failedLoginAttempts?: number;
  lockedUntil?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // Role-based access control fields
  roleId?: string | number; // Legacy support for single role
  roleName?: string;
  roles?: Array<{
    id: number;
    name: string;
    slug: string;
    description?: string;
  }>;
  permissions?: string[];
}

export interface UsersResponse {
  success: boolean;
  data: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateUserDto {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  password: string;
  isActive?: boolean;
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  isActive?: boolean;
  password?: string;
}

export interface UserFormData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  password?: string;
  confirmPassword?: string;
  isActive: boolean;
}
