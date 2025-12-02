"use client";
import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import type { Role, Permission } from '@/interfaces/role.interface';
import { rolesAPI } from '@/services/rolesApi';

interface AssignPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (roleId: number, permissionIds: number[]) => Promise<void>;
  role: Role | null;
}

const AssignPermissionsModal: React.FC<AssignPermissionsModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  role,
}) => {
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');

  useEffect(() => {
    if (isOpen) {
      fetchPermissions();
    }
  }, [isOpen]);

  useEffect(() => {
    // When role changes, set their current permissions as selected
    if (role && role.permissions) {
      const permissionIds = role.permissions.map((permission) => permission.id);
      setSelectedPermissionIds(permissionIds);
    } else {
      setSelectedPermissionIds([]);
    }
  }, [role]);

  const fetchPermissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const permissions = await rolesAPI.getAllPermissions();
      setAllPermissions(permissions.filter(perm => perm.isActive));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch permissions');
      console.error('Error fetching permissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissionIds(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const handleSelectAll = () => {
    const filteredPermissions = getFilteredPermissions();
    const allIds = filteredPermissions.map(p => p.id);
    setSelectedPermissionIds(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedPermissionIds([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!role) return;

    setIsSubmitting(true);
    try {
      await onSubmit(role.id, selectedPermissionIds);
      handleClose();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to assign permissions');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedPermissionIds([]);
      setSearchQuery('');
      setSelectedModule('all');
      setError(null);
      onClose();
    }
  };

  const getFilteredPermissions = () => {
    return allPermissions.filter(permission => {
      const matchesSearch = permission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           permission.slug.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesModule = selectedModule === 'all' || permission.module === selectedModule;
      return matchesSearch && matchesModule;
    });
  };

  const getUniqueModules = () => {
    const modules = new Set(allPermissions.map(p => p.module));
    return Array.from(modules).sort();
  };

  const groupPermissionsByModule = () => {
    const filtered = getFilteredPermissions();
    const grouped = filtered.reduce((acc, permission) => {
      if (!acc[permission.module]) {
        acc[permission.module] = [];
      }
      acc[permission.module].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
    return grouped;
  };

  if (!role) return null;

  const groupedPermissions = groupPermissionsByModule();
  const modules = Object.keys(groupedPermissions).sort();

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 dark:bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-xl font-semibold leading-6 text-gray-900 dark:text-white mb-4"
                >
                  Assign Permissions to {role.name}
                </Dialog.Title>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Search and Filter */}
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Search permissions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    <select
                      value={selectedModule}
                      onChange={(e) => setSelectedModule(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="all">All Modules</option>
                      {getUniqueModules().map(module => (
                        <option key={module} value={module}>
                          {module.charAt(0).toUpperCase() + module.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select/Deselect All */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {selectedPermissionIds.length} of {allPermissions.length} permissions selected
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Select All
                      </button>
                      <span className="text-gray-400">|</span>
                      <button
                        type="button"
                        onClick={handleDeselectAll}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  {/* Permissions List */}
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : modules.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No permissions found
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto space-y-4">
                      {modules.map((module) => (
                        <div key={module} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 capitalize">
                            {module} Module
                          </h4>
                          <div className="space-y-2">
                            {groupedPermissions[module].map((permission) => (
                              <label
                                key={permission.id}
                                className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors ${
                                  selectedPermissionIds.includes(permission.id)
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedPermissionIds.includes(permission.id)}
                                  onChange={() => handlePermissionToggle(permission.id)}
                                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                                  disabled={isSubmitting}
                                />
                                <div className="ml-3 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900 dark:text-white">
                                      {permission.name}
                                    </span>
                                    <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                                      {permission.action}
                                    </span>
                                  </div>
                                  {permission.description && (
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                      {permission.description}
                                    </p>
                                  )}
                                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                    {permission.slug}
                                  </p>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || loading}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Assigning...' : 'Assign Permissions'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AssignPermissionsModal;
