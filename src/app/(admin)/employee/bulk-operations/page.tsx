// src/app/(admin)/employee/bulk-operations/page.tsx

'use client'

import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import Badge from '@/components/ui/badge/Badge'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table'
import { NextPage } from 'next'
import { useState, useEffect, Fragment } from 'react'
import Link from 'next/link'
import { Tab, Dialog, Transition } from '@headlessui/react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchDepartmentStats,
  syncDepartment,
  retryDepartmentFailed,
  forceSyncDepartment,
  syncMultipleDepartments,
  toggleSelectDepartment,
  selectAllDepartments,
  clearDepartmentSelection,
  setPage,
} from '@/store/slices/departmentStatsSlice'
import { bulkSyncAPI, BulkSyncResponse } from '@/services/api'

const employeesData = [
  {
    id: 1,
    personCode: "EMP001",
    personName: "Ahmed Al-Rashid",
    department: "IT",
    totalRecords: 145,
    syncedRecords: 140,
    failedRecords: 3,
    pendingRecords: 2,
    isBlocked: false,
    lastActivity: "2025-09-28T08:30:00Z"
  },
];

const runningOperations = [
  {
    id: 1,
    operationType: "department_sync",
    targetDepartment: "IT",
    totalRecords: 45,
    processedRecords: 32,
    successfulRecords: 30,
    failedRecords: 2,
    status: "processing",
    startedAt: "2025-09-28T10:15:00Z",
    estimatedCompletion: "2025-09-28T10:25:00Z",
    initiatedBy: "admin@company.com",
    completedAt: undefined as string | undefined
  },
];

interface Props {}

// Confirmation Modal Component
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'danger';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info'
}) => {
  const iconColors = {
    info: 'text-blue-600',
    warning: 'text-orange-600',
    danger: 'text-red-600'
  };

  const icons = {
    info: '❓',
    warning: '⚠️',
    danger: '🚨'
  };

  const buttonColors = {
    info: 'bg-blue-600 hover:bg-blue-700',
    warning: 'bg-orange-600 hover:bg-orange-700',
    danger: 'bg-red-600 hover:bg-red-700'
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-start gap-3">
                  <div className={`text-3xl ${iconColors[type]}`}>
                    {icons[type]}
                  </div>
                  <div className="flex-1">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-2"
                    >
                      {title}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
                        {message}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    onClick={onClose}
                  >
                    {cancelText}
                  </button>
                  <button
                    type="button"
                    className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${buttonColors[type]}`}
                    onClick={() => {
                      onConfirm();
                      onClose();
                    }}
                  >
                    {confirmText}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// Alert Modal Component
interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'error';
}

const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info'
}) => {
  const iconColors = {
    info: 'text-blue-600',
    warning: 'text-yellow-600',
    error: 'text-red-600'
  };

  const icons = {
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌'
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-start gap-3">
                  <div className={`text-3xl ${iconColors[type]}`}>
                    {icons[type]}
                  </div>
                  <div className="flex-1">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-2"
                    >
                      {title}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {message}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={onClose}
                  >
                    OK
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// Emergency Confirmation Modal Component (Two-step confirmation)
interface EmergencyConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const EmergencyConfirmModal: React.FC<EmergencyConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  const [step, setStep] = useState(1);

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  const handleFirstConfirm = () => {
    setStep(2);
  };

  const handleFinalConfirm = () => {
    onConfirm();
    setStep(1);
    onClose();
  };

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
          <div className="fixed inset-0 bg-black bg-opacity-25" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                {step === 1 ? (
                  <>
                    <div className="flex items-start gap-3">
                      <div className="text-4xl text-red-600">🚨</div>
                      <div className="flex-1">
                        <Dialog.Title
                          as="h3"
                          className="text-lg font-bold leading-6 text-red-900 dark:text-red-400 mb-2"
                        >
                          ⚠️ EMERGENCY SYNC WARNING ⚠️
                        </Dialog.Title>
                        <div className="mt-2">
                          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                            <p className="text-sm font-semibold text-red-900 dark:text-red-300 mb-2">
                              This critical operation will:
                            </p>
                            <ul className="text-sm text-red-800 dark:text-red-300 space-y-1 list-disc list-inside">
                              <li>Unblock ALL blocked employees</li>
                              <li>Sync all records regardless of age</li>
                              <li>Process both pending and failed records</li>
                              <li>Generate high API traffic</li>
                            </ul>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                            This should only be used in critical situations.
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 font-bold">
                            Are you absolutely sure you want to proceed?
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <button
                        type="button"
                        className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                        onClick={handleClose}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                        onClick={handleFirstConfirm}
                      >
                        Yes, Continue
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-3">
                      <div className="text-4xl text-red-600 animate-pulse">⚠️</div>
                      <div className="flex-1">
                        <Dialog.Title
                          as="h3"
                          className="text-lg font-bold leading-6 text-red-900 dark:text-red-400 mb-2"
                        >
                          Final Confirmation Required
                        </Dialog.Title>
                        <div className="mt-2">
                          <div className="bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 rounded-lg p-4">
                            <p className="text-sm font-bold text-red-900 dark:text-red-300 text-center">
                              This action cannot be undone!
                            </p>
                            <p className="text-sm text-red-800 dark:text-red-300 text-center mt-2">
                              Click "Execute Emergency Sync" to proceed with the emergency operation.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <button
                        type="button"
                        className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                        onClick={handleClose}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold"
                        onClick={handleFinalConfirm}
                      >
                        Execute Emergency Sync
                      </button>
                    </div>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

const Page: NextPage<Props> = ({}) => {
  const dispatch = useAppDispatch();

  // Redux state
  const {
    departments,
    total,
    page,
    limit,
    totalPages,
    loading,
    error,
    selectedDepartments,
  } = useAppSelector((state) => state.departmentStats);

  // Local state
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState('all');
  const [showDateRangeModal, setShowDateRangeModal] = useState(false);
  const [operations, setOperations] = useState(runningOperations);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkSuccess, setBulkSuccess] = useState<BulkSyncResponse | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
    filterType: 'all' as 'all' | 'failed' | 'pending',
    includeBlocked: false,
  });

  // Modal states
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'info' | 'warning' | 'danger';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'info' | 'warning' | 'error';
  }>({
    isOpen: false,
    title: '',
    message: '',
  });

  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  // Fetch department stats on mount
  useEffect(() => {
    dispatch(fetchDepartmentStats({ page, limit }));
  }, [dispatch, page, limit]);

  // Auto-dismiss success message
  useEffect(() => {
    if (bulkSuccess) {
      const timer = setTimeout(() => {
        setBulkSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [bulkSuccess]);

  // Handlers
  const handleDepartmentSelect = (deptId: number) => {
    dispatch(toggleSelectDepartment(deptId));
  };

  const handleSelectAllDepartments = () => {
    if (selectedDepartments.length === departments.length) {
      dispatch(clearDepartmentSelection());
    } else {
      dispatch(selectAllDepartments());
    }
  };

  const handleSyncDepartment = (departmentId: number) => {
    dispatch(syncDepartment(departmentId)).then(() => {
      setTimeout(() => {
        dispatch(fetchDepartmentStats({ page, limit }));
      }, 1000);
    });
  };

  const handleRetryDepartmentFailed = (departmentId: number) => {
    dispatch(retryDepartmentFailed(departmentId)).then(() => {
      setTimeout(() => {
        dispatch(fetchDepartmentStats({ page, limit }));
      }, 1000);
    });
  };

  const handleForceSyncDepartment = (departmentId: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Force Sync Department',
      message: 'This will override blocks and force sync. Continue?',
      type: 'warning',
      onConfirm: () => {
        dispatch(forceSyncDepartment(departmentId)).then(() => {
          setTimeout(() => {
            dispatch(fetchDepartmentStats({ page, limit }));
          }, 1000);
        });
      },
    });
  };

  const handleSyncSelectedDepartments = () => {
    dispatch(syncMultipleDepartments(selectedDepartments)).then(() => {
      setTimeout(() => {
        dispatch(fetchDepartmentStats({ page, limit }));
      }, 1000);
    });
  };

  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
  };

  // Bulk operation handlers
  const handleSyncAllPending = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Sync All Pending Records',
      message: 'This will sync all pending records across all employees. Continue?',
      type: 'info',
      onConfirm: async () => {
        setBulkLoading(true);
        setBulkError(null);
        setBulkSuccess(null);

        try {
          const result = await bulkSyncAPI.syncAllPending('admin@company.com');
          setBulkSuccess(result);
          dispatch(fetchDepartmentStats({ page, limit }));
        } catch (error: any) {
          setBulkError(error.response?.data?.message || 'Failed to sync pending records');
        } finally {
          setBulkLoading(false);
        }
      },
    });
  };

  const handleRetryAllFailed = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Retry All Failed Records',
      message: 'This will retry all failed sync records. Continue?',
      type: 'warning',
      onConfirm: async () => {
        setBulkLoading(true);
        setBulkError(null);
        setBulkSuccess(null);

        try {
          const result = await bulkSyncAPI.retryAllFailed('admin@company.com');
          setBulkSuccess(result);
          dispatch(fetchDepartmentStats({ page, limit }));
        } catch (error: any) {
          setBulkError(error.response?.data?.message || 'Failed to retry failed records');
        } finally {
          setBulkLoading(false);
        }
      },
    });
  };

  const handleEmergencySync = () => {
    setShowEmergencyModal(true);
  };

  const executeEmergencySync = async () => {
    setBulkLoading(true);
    setBulkError(null);
    setBulkSuccess(null);

    try {
      const result = await bulkSyncAPI.emergencySync('admin@company.com');
      setBulkSuccess(result);
      dispatch(fetchDepartmentStats({ page, limit }));
    } catch (error: any) {
      setBulkError(error.response?.data?.message || 'Failed to execute emergency sync');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleDateRangeSync = () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      setAlertModal({
        isOpen: true,
        title: 'Missing Information',
        message: 'Please select both start and end dates',
        type: 'warning',
      });
      return;
    }

    setBulkLoading(true);
    setBulkError(null);
    setBulkSuccess(null);

    bulkSyncAPI.dateRangeSync({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      filterType: dateRange.filterType,
      includeBlocked: dateRange.includeBlocked,
      triggeredBy: 'admin@company.com',
    })
      .then((result) => {
        setBulkSuccess(result);
        setShowDateRangeModal(false);
        dispatch(fetchDepartmentStats({ page, limit }));
      })
      .catch((error: any) => {
        setBulkError(error.response?.data?.message || 'Failed to sync date range');
      })
      .finally(() => {
        setBulkLoading(false);
      });
  };

  const calculateSyncRate = (syncedRecords: number, totalRecords: number) => {
    if (totalRecords === 0) return '0%';
    return `${Math.round((syncedRecords / totalRecords) * 100)}%`;
  };

  // Filter employees (keep for other tabs)
  const filteredEmployees = employeesData.filter(employee => {
    const matchesSearch = employee.personName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.personCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartmentFilter === 'all' || employee.department === selectedDepartmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const handleEmployeeSelect = (empId: number) => {
    setSelectedEmployees(prev => 
      prev.includes(empId) 
        ? prev.filter(id => id !== empId)
        : [...prev, empId]
    );
  };

  const handleSelectAllEmployees = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map(emp => emp.id));
    }
  };

  // Simulate operation progress (keep for operations tab)
  useEffect(() => {
    const interval = setInterval(() => {
      setOperations(prev => prev.map(op => {
        if (op.status === 'processing' && op.processedRecords < op.totalRecords) {
          const newProcessed = Math.min(op.processedRecords + 1, op.totalRecords);
          const newSuccessful = op.successfulRecords + (Math.random() > 0.1 ? 1 : 0);
          const newFailed = newProcessed - newSuccessful;
          
          return {
            ...op,
            processedRecords: newProcessed,
            successfulRecords: newSuccessful,
            failedRecords: newFailed,
            status: newProcessed === op.totalRecords ? 'completed' : 'processing',
            completedAt: newProcessed === op.totalRecords ? new Date().toISOString() : undefined
          };
        }
        return op;
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getOperationProgress = (operation: any) => {
    return Math.round((operation.processedRecords / operation.totalRecords) * 100);
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Bulk Employee Operations" />
      
      <div className="space-y-6">
        {/* Success/Error Messages */}
        {bulkSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-green-600 text-2xl">✓</div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 mb-1">Sync Operation Completed</h3>
                <div className="text-sm text-green-700 space-y-1">
                  <div>Batch ID: <span className="font-mono">{bulkSuccess.batchId}</span></div>
                  <div className="flex gap-4">
                    <span>Total: {bulkSuccess.totalRecords}</span>
                    <span className="text-green-600">✓ Success: {bulkSuccess.successCount}</span>
                    <span className="text-red-600">✗ Failed: {bulkSuccess.failedCount}</span>
                    {bulkSuccess.ignoredCount > 0 && (
                      <span className="text-gray-600">⊘ Ignored: {bulkSuccess.ignoredCount}</span>
                    )}
                  </div>
                  {bulkSuccess.unblockedEmployees && (
                    <div className="text-orange-700">
                      🔓 Unblocked {bulkSuccess.unblockedEmployees} employees
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setBulkSuccess(null)}
                className="text-green-600 hover:text-green-800"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {bulkError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-red-600 text-2xl">⚠️</div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">Operation Failed</h3>
                <p className="text-sm text-red-700">{bulkError}</p>
              </div>
              <button
                onClick={() => setBulkError(null)}
                className="text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions Header */}
        <ComponentCard title="Quick Bulk Actions">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={handleSyncAllPending}
              disabled={bulkLoading}
              className="p-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-lg transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-blue-600 text-2xl mb-2">
                {bulkLoading ? '⏳' : '🔄'}
              </div>
              <h3 className="font-semibold text-blue-900 mb-1">Sync All Pending</h3>
              <p className="text-sm text-blue-700">Sync all pending records across all employees</p>
            </button>
            
            <button 
              onClick={handleRetryAllFailed}
              disabled={bulkLoading}
              className="p-4 bg-orange-50 hover:bg-orange-100 border-2 border-orange-200 rounded-lg transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-orange-600 text-2xl mb-2">
                {bulkLoading ? '⏳' : '🔁'}
              </div>
              <h3 className="font-semibold text-orange-900 mb-1">Retry All Failed</h3>
              <p className="text-sm text-orange-700">Retry all failed sync records</p>
            </button>
            
            <button 
              onClick={handleEmergencySync}
              disabled={bulkLoading}
              className="p-4 bg-red-50 hover:bg-red-100 border-2 border-red-200 rounded-lg transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-red-600 text-2xl mb-2">
                {bulkLoading ? '⏳' : '🚨'}
              </div>
              <h3 className="font-semibold text-red-900 mb-1">Emergency Sync</h3>
              <p className="text-sm text-red-700">Override blocks and force sync all</p>
            </button>
            
            <button 
              onClick={() => setShowDateRangeModal(true)}
              disabled={bulkLoading}
              className="p-4 bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-lg transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-green-600 text-2xl mb-2">📅</div>
              <h3 className="font-semibold text-green-900 mb-1">Date Range Sync</h3>
              <p className="text-sm text-green-700">Sync records for specific date range</p>
            </button>
          </div>
        </ComponentCard>

        {/* Tab Navigation and Content */}
        <Tab.Group>
          <Tab.List className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <Tab as={Fragment}>
                {({ selected }) => (
                  <button
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      selected
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                    }`}
                  >
                    Department Operations
                  </button>
                )}
              </Tab>
              <Tab as={Fragment}>
                {({ selected }) => (
                  <button
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      selected
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                    }`}
                  >
                    Individual Selection
                  </button>
                )}
              </Tab>
              <Tab as={Fragment}>
                {({ selected }) => (
                  <button
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      selected
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                    }`}
                  >
                    Running Operations ({operations.filter(op => op.status === 'processing').length})
                  </button>
                )}
              </Tab>
            </nav>
          </Tab.List>

          <Tab.Panels className="mt-6">
            {/* Department Operations Panel - REDUX INTEGRATED */}
            <Tab.Panel>
              <ComponentCard title="Department-wise Sync Operations">
                {loading && departments.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading departments...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                      onClick={() => dispatch(fetchDepartmentStats({ page, limit }))}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Department Selection Header */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={handleSelectAllDepartments}
                          disabled={loading}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {selectedDepartments.length === departments.length ? 'Deselect All' : 'Select All'}
                        </button>
                        {selectedDepartments.length > 0 && (
                          <span className="text-sm text-gray-600">
                            {selectedDepartments.length} department(s) selected
                          </span>
                        )}
                      </div>
                      {selectedDepartments.length > 0 && (
                        <div className="flex gap-2">
                          <button 
                            onClick={handleSyncSelectedDepartments}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                          >
                            {loading ? 'Syncing...' : 'Sync Selected Departments'}
                          </button>
                          <button 
                            onClick={() => dispatch(clearDepartmentSelection())}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            Clear Selection
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Departments Table */}
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                      <Table>
                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                          <TableRow>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                              <input
                                type="checkbox"
                                checked={selectedDepartments.length === departments.length && departments.length > 0}
                                onChange={handleSelectAllDepartments}
                                className="rounded border-gray-300"
                              />
                            </TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                              Department
                            </TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                              Employees
                            </TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                              Sync Statistics
                            </TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                              Issues
                            </TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                              Last Sync
                            </TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                              Actions
                            </TableCell>
                          </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                          {departments.map((department) => (
                            <TableRow key={department.id}>
                              <TableCell className="px-5 py-4 text-start">
                                <input
                                  type="checkbox"
                                  checked={selectedDepartments.includes(department.id)}
                                  onChange={() => handleDepartmentSelect(department.id)}
                                  className="rounded border-gray-300"
                                />
                              </TableCell>

                              <TableCell className="px-5 py-4 text-start">
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {department.name}
                                </div>
                              </TableCell>

                              <TableCell className="px-4 py-3 text-start">
                                <div className="space-y-1">
                                  <div className="font-medium">{department.employeeCount} employees</div>
                                  <div className="text-sm text-gray-500">{department.totalRecords} total records</div>
                                </div>
                              </TableCell>

                              <TableCell className="px-4 py-3 text-start">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-4 text-sm">
                                    <span className="text-green-600">✓ {department.syncedRecords}</span>
                                    <span className="text-red-600">✗ {department.failedRecords}</span>
                                    <span className="text-yellow-600">⏳ {department.pendingRecords}</span>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {calculateSyncRate(department.syncedRecords, department.totalRecords)} sync rate
                                  </div>
                                </div>
                              </TableCell>

                              <TableCell className="px-4 py-3 text-start">
                                <div className="space-y-1">
                                  {department.blockedEmployees > 0 && (
                                    <Badge size="sm" color="error">
                                      {department.blockedEmployees} Blocked
                                    </Badge>
                                  )}
                                  {department.failedRecords > 50 && (
                                    <Badge size="sm" color="warning">
                                      High Failures
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>

                              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                                {department.lastSync ? (
                                  <>
                                    <div className="text-sm">
                                      {new Date(department.lastSync).toLocaleDateString()}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      {new Date(department.lastSync).toLocaleTimeString()}
                                    </div>
                                  </>
                                ) : (
                                  <span className="text-sm text-gray-400">Never synced</span>
                                )}
                              </TableCell>

                              <TableCell className="px-4 py-3 text-start">
                                <div className="flex flex-col gap-1">
                                  <button 
                                    onClick={() => handleSyncDepartment(department.id)}
                                    disabled={loading}
                                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors disabled:opacity-50"
                                  >
                                    Sync Department
                                  </button>
                                  {department.failedRecords > 0 && (
                                    <button 
                                      onClick={() => handleRetryDepartmentFailed(department.id)}
                                      disabled={loading}
                                      className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors disabled:opacity-50"
                                    >
                                      Retry Failed
                                    </button>
                                  )}
                                  {department.blockedEmployees > 0 && (
                                    <button 
                                      onClick={() => handleForceSyncDepartment(department.id)}
                                      disabled={loading}
                                      className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                                    >
                                      Force Sync
                                    </button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-4">
                        <button
                          onClick={() => handlePageChange(page - 1)}
                          disabled={page === 1 || loading}
                          className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-50"
                        >
                          Previous
                        </button>
                        <span className="px-4">
                          Page {page} of {totalPages} ({total} total departments)
                        </span>
                        <button
                          onClick={() => handlePageChange(page + 1)}
                          disabled={page === totalPages || loading}
                          className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-50"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </ComponentCard>
            </Tab.Panel>

            {/* Individual Employee Selection Panel - KEEP AS IS FOR NOW */}
            <Tab.Panel>
              <ComponentCard title="Individual Employee Selection">
                <p className="text-gray-500">Coming soon with Redux integration...</p>
              </ComponentCard>
            </Tab.Panel>

            {/* Running Operations Panel - KEEP AS IS FOR NOW */}
            <Tab.Panel>
              <ComponentCard title="Operation Monitoring">
                <p className="text-gray-500">Coming soon with Redux integration...</p>
              </ComponentCard>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>

        {/* Date Range Modal */}
        <Transition appear show={showDateRangeModal} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => !bulkLoading && setShowDateRangeModal(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
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
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                    >
                      Bulk Date Range Sync
                    </Dialog.Title>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={dateRange.startDate}
                          onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                          disabled={bulkLoading}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={dateRange.endDate}
                          onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                          disabled={bulkLoading}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Filter Type
                        </label>
                        <select 
                          value={dateRange.filterType}
                          onChange={(e) => setDateRange(prev => ({ ...prev, filterType: e.target.value as 'all' | 'failed' | 'pending' }))}
                          disabled={bulkLoading}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 disabled:opacity-50"
                        >
                          <option value="all">All Records (Pending & Failed)</option>
                          <option value="pending">Pending Records Only</option>
                          <option value="failed">Failed Records Only</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="includeBlocked"
                          checked={dateRange.includeBlocked}
                          onChange={(e) => setDateRange(prev => ({ ...prev, includeBlocked: e.target.checked }))}
                          disabled={bulkLoading}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor="includeBlocked" className="text-sm text-gray-700 dark:text-gray-300">
                          Include Blocked Employees (override blocks)
                        </label>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-xs text-yellow-800">
                          <strong>Note:</strong> Bayzat API has a 7-day limitation. Records older than 7 days will be filtered during sync.
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <button
                        type="button"
                        className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
                        onClick={() => setShowDateRangeModal(false)}
                        disabled={bulkLoading}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        onClick={handleDateRangeSync}
                        disabled={bulkLoading}
                      >
                        {bulkLoading ? 'Syncing...' : 'Start Sync'}
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>

        {/* Confirmation Modal */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          type={confirmModal.type}
        />

        {/* Alert Modal */}
        <AlertModal
          isOpen={alertModal.isOpen}
          onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
          title={alertModal.title}
          message={alertModal.message}
          type={alertModal.type}
        />

        {/* Emergency Confirmation Modal */}
        <EmergencyConfirmModal
          isOpen={showEmergencyModal}
          onClose={() => setShowEmergencyModal(false)}
          onConfirm={executeEmergencySync}
        />

        {/* Back to Employees Link */}
        <div className="flex justify-start">
          <Link href="/employee" className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            ← Back to Employees
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Page;