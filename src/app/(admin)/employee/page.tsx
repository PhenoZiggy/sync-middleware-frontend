// src/app/(admin)/employee/page.tsx

"use client"
import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import Badge from '@/components/ui/badge/Badge'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table'
import { NextPage } from 'next'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchEmployees,
  syncEmployee,
  syncAllEmployees,
  toggleBlockEmployee,
  retryFailedRecords,
  toggleSelectEmployee,
  selectAllEmployees,
  clearSelection,
  setPage,
  setFilter,
  setSearchTerm,
} from '@/store/slices/employeesSlice'
import { fetchRecentLogs, retryLog } from '@/store/slices/recentLogsSlice'
import { Employee } from '@/interfaces/employee.interface'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { PERMISSIONS } from '@/const/permissions';

interface Props {}

const Page: NextPage<Props> = ({}) => {
  const dispatch = useAppDispatch();
  
  // Redux state
  const {
    employees,
    total,
    page,
    limit,
    totalPages,
    loading: employeesLoading,
    error: employeesError,
    selectedEmployees,
    summary,
    currentFilter,
    searchTerm,
  } = useAppSelector((state) => state.employees);
 
  const {
    logs: recentLogs,
    loading: logsLoading,
    error: logsError,
  } = useAppSelector((state) => state.recentLogs);
 
  // Fetch data when page, filter, or search changes
  useEffect(() => {
    dispatch(fetchEmployees({ 
      page, 
      limit, 
      search: searchTerm || undefined, 
      filter: currentFilter 
    }));
  }, [dispatch, page, limit, currentFilter, searchTerm]);

  // Fetch recent logs on mount
  useEffect(() => {
    dispatch(fetchRecentLogs(5));
  }, [dispatch]);

  // Handlers
  const handleTabChange = (tab: string) => {
    dispatch(setFilter(tab));
  };

  const handleSearchChange = (value: string) => {
    dispatch(setSearchTerm(value));
  };

  const handleSelectEmployee = (employeeId: string) => {
    dispatch(toggleSelectEmployee(employeeId));
  };

  const handleSelectAll = () => {
    if (selectedEmployees.length === employees.length) {
      dispatch(clearSelection());
    } else {
      dispatch(selectAllEmployees());
    }
  };

  const handleSyncEmployee = (employeeId: string) => {
    dispatch(syncEmployee(employeeId)).then(() => {
      setTimeout(() => {
        dispatch(fetchEmployees({ page, limit, search: searchTerm, filter: currentFilter }));
      }, 1000);
    });
  };

  const handleSyncAll = () => {
    dispatch(syncAllEmployees()).then(() => {
      setTimeout(() => {
        dispatch(fetchEmployees({ page, limit, search: searchTerm, filter: currentFilter }));
        dispatch(fetchRecentLogs(5));
      }, 1000);
    });
  };

  const handleToggleBlock = (employeeId: string) => {
    dispatch(toggleBlockEmployee(employeeId)).then(() => {
      dispatch(fetchEmployees({ page, limit, search: searchTerm, filter: currentFilter }));
    });
  };

  const handleRetryFailed = (employeeId: string) => {
    dispatch(retryFailedRecords(employeeId)).then(() => {
      setTimeout(() => {
        dispatch(fetchEmployees({ page, limit, search: searchTerm, filter: currentFilter }));
      }, 1000);
    });
  };

  const handleRetryLog = (logId: number) => {
    dispatch(retryLog(logId)).then(() => {
      setTimeout(() => {
        dispatch(fetchRecentLogs(5));
      }, 1000);
    });
  };

  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
  };

  const getSyncStatusBadge = (employee: Employee) => {
    if (employee.isBlocked) return { color: 'error' as const, text: 'Blocked' };
    if (employee.pendingRecords > 0) return { color: 'warning' as const, text: 'Pending' };
    if (employee.failedRecords > 0) return { color: 'warning' as const, text: 'Has Failures' };
    return { color: 'success' as const, text: 'Synced' };
  };

  const calculateSyncRate = (employee: Employee) => {
    if (employee.totalRecords === 0) return '0%';
    return `${Math.round((employee.syncedRecords / employee.totalRecords) * 100)}%`;
  };

  // Loading state
  if (employeesLoading && employees.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading employees...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (employeesError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{employeesError}</p>
          <button
            onClick={() => dispatch(fetchEmployees({ page, limit, search: searchTerm, filter: currentFilter }))}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredPermissions={[PERMISSIONS.EMPLOYEES.READ]}>
    <div>
      <PageBreadcrumb pageTitle="Employees" />
      
      <div className="space-y-6">
        {/* Header with Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
          
          <div className="flex gap-2">
          <PermissionGate permissions={[PERMISSIONS.SYNC.MANUAL]}>
            <button 
              onClick={handleSyncAll}
              disabled={employeesLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {employeesLoading ? 'Syncing...' : 'Sync All Employees'}
            </button>
          </PermissionGate>
          <PermissionGate permissions={[PERMISSIONS.ATTENDANCE.FETCH]}>
              <button 
                onClick={() => dispatch(fetchEmployees({ page, limit, search: searchTerm, filter: currentFilter }))}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Manual Fetch
              </button>
            </PermissionGate>

            {selectedEmployees.length > 0 && (
              <PermissionGate permissions={[PERMISSIONS.SYNC.MANUAL]}>
                <button 
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  onClick={() => {
                    selectedEmployees.forEach(id => handleSyncEmployee(id));
                  }}
                >
                  Sync Selected ({selectedEmployees.length})
                </button>
              </PermissionGate>
  )}
          </div>
        </div>

        {/* Tab Navigation - Using summary data */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            
            {[
              { key: 'all', label: 'All Employees', count: summary.all },
              { key: 'blocked', label: 'Blocked', count: summary.blocked },
              { key: 'hasFailures', label: 'Has Failures', count: summary.hasFailures },
              { key: 'pending', label: 'Pending', count: summary.pending }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  currentFilter === tab.key
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Employees Table */}
        <ComponentCard title={`Employees - ${currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1)}`}>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <div className="min-w-[1200px]">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        <input
                          type="checkbox"
                          checked={selectedEmployees.length === employees.length && employees.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300"
                        />
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Employee
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Sync Statistics
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Status
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Last Activity
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {employees.map((employee) => {
                      const statusBadge = getSyncStatusBadge(employee);
                      return (
                        <TableRow key={employee.id}>
                          <TableCell className="px-5 py-4 text-start">
                            <input
                              type="checkbox"
                              checked={selectedEmployees.includes(employee.id)}
                              onChange={() => handleSelectEmployee(employee.id)}
                              className="rounded border-gray-300"
                            />
                          </TableCell>
                          
                          <TableCell className="px-5 py-4 text-start">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 overflow-hidden rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-medium text-sm">
                                  {employee.personName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </span>
                              </div>
                              <div>
                                <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                  {employee.personName}
                                </span>
                                <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                                  {employee.personCode} • {employee.department}
                                </span>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="px-4 py-3 text-start">
                            <div className="space-y-1">
                              <div className="flex items-center gap-4 text-sm">
                                <span className="text-green-600">✓ {employee.syncedRecords}</span>
                                <span className="text-red-600">✗ {employee.failedRecords}</span>
                                <span className="text-yellow-600">⏳ {employee.pendingRecords}</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {calculateSyncRate(employee)} sync rate • {employee.totalRecords} total
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="px-4 py-3 text-start">
                            <div className="space-y-1">
                              <Badge size="sm" color={statusBadge.color}>
                                {statusBadge.text}
                              </Badge>
                              {employee.consecutiveFailures > 0 && (
                                <div className="text-xs text-red-500">
                                  {employee.consecutiveFailures} consecutive failures
                                </div>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            <div className="text-sm">
                              {new Date(employee.lastActivity).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(employee.lastActivity).toLocaleTimeString()}
                            </div>
                          </TableCell>

                          <TableCell className="px-4 py-3 text-start">
                            <div className="flex gap-2">
                        <PermissionGate permissions={[PERMISSIONS.SYNC.MANUAL]}>
                          <button 
                            onClick={() => handleSyncEmployee(employee.id)}
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                          >
                            Sync Employee
                          </button>
                        </PermissionGate>
                              <button 
                                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                                onClick={() => window.location.href = `/employee/${employee.personCode}`}
                              >
                                View Details
                              </button>
                              {employee.isBlocked && (
                                <PermissionGate permissions={[PERMISSIONS.EMPLOYEES.UPDATE]}>
                                  <button 
                                    onClick={() => handleToggleBlock(employee.id)}
                                    className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                  >
                                    Unblock
                                  </button>
                                </PermissionGate>
                              )}
                               {employee.failedRecords > 0 && (
                                <PermissionGate permissions={[PERMISSIONS.SYNC.RETRY]}>
                                  <button 
                                    onClick={() => handleRetryFailed(employee.id)}
                                    className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                                  >
                                    Retry Failed
                                  </button>
                                </PermissionGate>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1 || employeesLoading}
                className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages || employeesLoading}
                className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </ComponentCard>

        {/* Recent Activity - remains the same */}
        {/* ... rest of your component */}

         {/* Recent Activity */}
        <ComponentCard title="Recent Employee Activity">
          {logsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : logsError ? (
            <div className="text-center py-8 text-red-600">{logsError}</div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="max-w-full overflow-x-auto">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Employee
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Activity
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Device
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Sync Status
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {recentLogs.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell className="px-5 py-4 text-start">
                          <div>
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                              {activity.personName}
                            </span>
                            <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                              {activity.personCode}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="px-4 py-3 text-start">
                          <div>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              activity.punchType === 'checkIn' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {activity.punchType === 'checkIn' ? '→ Check In' : '← Check Out'}
                            </span>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(activity.punchTime).toLocaleString()}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {activity.deviceName}
                        </TableCell>

                        <TableCell className="px-4 py-3 text-start">
                          <div className="space-y-1">
                            <Badge 
                              size="sm" 
                              color={
                                activity.syncStatus === 'success' ? 'success' :
                                activity.syncStatus === 'failed' ? 'error' : 'warning'
                              }
                            >
                              {activity.syncStatus.charAt(0).toUpperCase() + activity.syncStatus.slice(1)}
                            </Badge>
                            {activity.errorMessage && (
                              <div className="text-xs text-red-500">
                                {activity.errorMessage}
                              </div>
                            )}
                            {activity.retryCount && (
                              <div className="text-xs text-gray-500">
                                Retry {activity.retryCount}/3
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="px-4 py-3 text-start">
                          <div className="flex gap-2">
                            {activity.syncStatus === 'failed' && (
                              <button 
                                onClick={() => handleRetryLog(activity.id)}
                                className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                              >
                                Retry Now
                              </button>
                            )}
                            {activity.syncStatus === 'pending' && (
                              <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
                                Force Sync
                              </button>
                            )}
                            <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
                              View Details
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </ComponentCard>
      </div>
    </div>
    </ProtectedRoute>
  );
};

export default Page;