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

// Sample employees data for individual selection (keep for now)
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
  // ... rest of sample data
];

// Sample running operations (keep for now)
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
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  // Fetch department stats on mount
  useEffect(() => {
    dispatch(fetchDepartmentStats({ page, limit }));
  }, [dispatch, page, limit]);

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
    if (confirm('This will override blocks and force sync. Continue?')) {
      dispatch(forceSyncDepartment(departmentId)).then(() => {
        setTimeout(() => {
          dispatch(fetchDepartmentStats({ page, limit }));
        }, 1000);
      });
    }
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
        {/* Quick Actions Header */}
        <ComponentCard title="Quick Bulk Actions">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-lg transition-colors group">
              <div className="text-blue-600 text-2xl mb-2">🔄</div>
              <h3 className="font-semibold text-blue-900 mb-1">Sync All Pending</h3>
              <p className="text-sm text-blue-700">Sync all pending records across all employees</p>
            </button>
            
            <button className="p-4 bg-orange-50 hover:bg-orange-100 border-2 border-orange-200 rounded-lg transition-colors group">
              <div className="text-orange-600 text-2xl mb-2">🔁</div>
              <h3 className="font-semibold text-orange-900 mb-1">Retry All Failed</h3>
              <p className="text-sm text-orange-700">Retry all failed sync records</p>
            </button>
            
            <button className="p-4 bg-red-50 hover:bg-red-100 border-2 border-red-200 rounded-lg transition-colors group">
              <div className="text-red-600 text-2xl mb-2">🚨</div>
              <h3 className="font-semibold text-red-900 mb-1">Emergency Sync</h3>
              <p className="text-sm text-red-700">Override blocks and force sync all</p>
            </button>
            
            <button 
              onClick={() => setShowDateRangeModal(true)}
              className="p-4 bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-lg transition-colors group"
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

        {/* Date Range Modal - keep as is */}
        <Transition appear show={showDateRangeModal} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={setShowDateRangeModal}>
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Scope
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700">
                          <option>All Employees</option>
                          <option>Failed Records Only</option>
                          <option>Pending Records Only</option>
                          <option>Include Blocked Employees</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <button
                        type="button"
                        className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                        onClick={() => setShowDateRangeModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        onClick={() => {
                          setShowDateRangeModal(false);
                        }}
                      >
                        Start Sync
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>

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