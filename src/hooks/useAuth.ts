 

import { useAppSelector } from '@/store/hooks';
import { useMemo } from 'react';

export const useAuth = () => {
  const { user, isAuthenticated, loading } = useAppSelector((state) => state.auth);

  // Check if user has specific permission
  const hasPermission = (permission: string) => {
    if (!user) return false;
    return user.permissions.includes(permission);
  };

  // Check if user has any of the specified permissions
  const hasAnyPermission = (permissions: string[]) => {
    if (!user) return false;
    return permissions.some((permission) => user.permissions.includes(permission));
  };

  // Check if user has all specified permissions
  const hasAllPermissions = (permissions: string[]) => {
    if (!user) return false;
    return permissions.every((permission) => user.permissions.includes(permission));
  };

  // Check if user has specific role
  const hasRole = (role: string) => {
    if (!user) return false;
    return user.roles.includes(role);
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles: string[]) => {
    if (!user) return false;
    return roles.some((role) => user.roles.includes(role));
  };

  return {
    user,
    isAuthenticated,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
  };
};