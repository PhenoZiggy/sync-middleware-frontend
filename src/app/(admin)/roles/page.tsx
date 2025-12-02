'use client';

import React, { useEffect, useState } from 'react';
import { rolesAPI } from '@/services/rolesApi';
import type { Role, Permission, CreateRoleDto } from '@/interfaces/role.interface';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import CreateRoleModal from '@/components/roles/CreateRoleModal';
import AssignPermissionsModal from '@/components/roles/AssignPermissionsModal';
import { useAppSelector } from '@/store/hooks';

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Get auth state to ensure token is available
  const { accessToken, isAuthenticated } = useAppSelector((state) => state.auth);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    role: Role | null;
    action: 'delete' | null;
  }>({
    isOpen: false,
    role: null,
    action: null,
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Only fetch roles when we have an access token
    if (accessToken && isAuthenticated) {
      fetchRoles();
    }
  }, [accessToken, isAuthenticated]);

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await rolesAPI.getAllRoles();
      console.log('Roles API response:', data);
      console.log('Is array?', Array.isArray(data));
      console.log('Type:', typeof data);

      // Ensure data is an array
      if (Array.isArray(data)) {
        setRoles(data);
      } else if (data && typeof data === 'object') {
        // If it's an object, maybe it has a data property
        setRoles(Array.isArray(data.data) ? data.data : []);
      } else {
        setRoles([]);
      }
    } catch (err: any) {
      console.error('Full error:', err);
      console.error('Error response:', err.response);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch roles';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async (data: CreateRoleDto) => {
    try {
      await rolesAPI.createRole(data);
      setSuccessMessage('Role created successfully');
      await fetchRoles();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create role');
      setTimeout(() => setError(null), 3000);
      throw error;
    }
  };

  const handleDeleteRole = (role: Role) => {
    setConfirmDialog({
      isOpen: true,
      role,
      action: 'delete',
    });
  };

  const confirmDeleteRole = async () => {
    if (!confirmDialog.role) return;

    setIsUpdating(true);
    try {
      await rolesAPI.deleteRole(confirmDialog.role.id);
      setSuccessMessage('Role deleted successfully');
      await fetchRoles();
      setConfirmDialog({ isOpen: false, role: null, action: null });
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete role');
      setTimeout(() => setError(null), 3000);
      console.error('Error deleting role:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const openPermissionsModal = (role: Role) => {
    setSelectedRole(role);
    setIsPermissionsModalOpen(true);
  };

  const handleAssignPermissions = async (roleId: number, permissionIds: number[]) => {
    try {
      await rolesAPI.assignPermissionsToRole(roleId, { permissionIds });
      setSuccessMessage('Permissions assigned successfully');
      await fetchRoles();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to assign permissions');
      setTimeout(() => setError(null), 3000);
      throw error;
    }
  };

  const formatDateTime = (date: Date | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && roles.length === 0) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb pageName="Roles & Permissions" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageName="Roles & Permissions" />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Roles & Permissions
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage roles and assign permissions to control access
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          variant="primary"
          size="md"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create Role
        </Button>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
          {successMessage}
        </div>
      )}

      {/* Roles Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Role Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : roles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <p className="mt-2">No roles found</p>
                  </td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            {role.name}
                            {role.isSystemRole && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                                System
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {role.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                      {role.description || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-3 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full">
                        {role.permissions?.length || 0} permissions
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {role.isActive ? (
                        <Badge color="success" size="sm">Active</Badge>
                      ) : (
                        <Badge color="light" size="sm">Inactive</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                      {formatDateTime(role.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openPermissionsModal(role)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50 transition-colors"
                          title="Manage permissions"
                        >
                          Permissions
                        </button>
                        {!role.isSystemRole && (
                          <button
                            onClick={() => handleDeleteRole(role)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, role: null, action: null })}
        onConfirm={confirmDeleteRole}
        title="Delete Role?"
        message={`Are you sure you want to delete the role "${confirmDialog.role?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isUpdating}
      />

      {/* Create Role Modal */}
      <CreateRoleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateRole}
      />

      {/* Assign Permissions Modal */}
      <AssignPermissionsModal
        isOpen={isPermissionsModalOpen}
        onClose={() => {
          setIsPermissionsModalOpen(false);
          setSelectedRole(null);
        }}
        onSubmit={handleAssignPermissions}
        role={selectedRole}
      />
    </div>
  );
}
