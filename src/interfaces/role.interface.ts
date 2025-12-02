// src/interfaces/role.interface.ts

export interface Permission {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  module: string;
  action: string;
  isSystemPermission: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  isSystemRole: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  permissions?: Permission[];
  users?: any[];
}

export interface CreateRoleDto {
  name: string;
  slug: string;
  description?: string;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface AssignRolesToUserDto {
  roleIds: number[];
}

export interface AssignPermissionsToRoleDto {
  permissionIds: number[];
}
