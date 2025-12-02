"use client";
import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import type { User } from '@/interfaces/user.interface';
import type { Role } from '@/interfaces/role.interface';
import { rolesAPI } from '@/services/rolesApi';

interface AssignRolesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userId: string, roleIds: number[]) => Promise<void>;
  user: User | null;
}

const AssignRolesModal: React.FC<AssignRolesModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user,
}) => {
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchRoles();
    }
  }, [isOpen]);

  useEffect(() => {
    // When user changes, set their current roles as selected
    if (user) {
      // If the user has roles array with role objects, extract the IDs
      if (user.roles && Array.isArray(user.roles)) {
        const roleIds = user.roles.map((role: any) => role.id);
        setSelectedRoleIds(roleIds);
      }
      // If the user has a single roleId (legacy support)
      else if (user.roleId) {
        // Convert string roleId to number if needed
        const roleId = typeof user.roleId === 'string' ? parseInt(user.roleId, 10) : user.roleId;
        setSelectedRoleIds([roleId]);
      } else {
        setSelectedRoleIds([]);
      }
    } else {
      setSelectedRoleIds([]);
    }
  }, [user]);

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const roles = await rolesAPI.getAllRoles();
      setAllRoles(roles.filter(role => role.isActive));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch roles');
      console.error('Error fetching roles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = (roleId: number) => {
    setSelectedRoleIds(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    setIsSubmitting(true);
    try {
      await onSubmit(user.id, selectedRoleIds);
      handleClose();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to assign roles');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedRoleIds([]);
      setError(null);
      onClose();
    }
  };

  if (!user) return null;

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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-xl font-semibold leading-6 text-gray-900 dark:text-white mb-4"
                >
                  Assign Roles to {user.username}
                </Dialog.Title>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : allRoles.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No roles available
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {allRoles.map((role) => (
                        <label
                          key={role.id}
                          className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                            selectedRoleIds.includes(role.id)
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedRoleIds.includes(role.id)}
                            onChange={() => handleRoleToggle(role.id)}
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                            disabled={isSubmitting}
                          />
                          <div className="ml-3 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {role.name}
                              </span>
                              {role.isSystemRole && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                                  System
                                </span>
                              )}
                            </div>
                            {role.description && (
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {role.description}
                              </p>
                            )}
                          </div>
                        </label>
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
                      {isSubmitting ? 'Assigning...' : 'Assign Roles'}
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

export default AssignRolesModal;
