

"use client"

import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import Badge from '@/components/ui/badge/Badge'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table'
import { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Dialog, Transition } from '@headlessui/react' 
import { Fragment } from 'react' 
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchEmployeeDetail,
  fetchEmployeeLogs,
  syncEmployeeDateRange,
  syncSingleRecord,
  forceSyncEmployee,
  syncSelectedRecords,
  setLogsPage,
  setFilterStatus,
  setDateRange,
  toggleSelectLog,
  selectAllLogs,
  clearLogSelection,
  resetEmployeeDetails,
} from '@/store/slices/employeeDetailsSlice'
import { retryFailedRecords, syncEmployee } from '@/store/slices/employeesSlice'
import { EmployeeLog } from '@/interfaces/employee.interface'

interface Props {}

const Page: NextPage<Props> = ({}) => {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const employeeId = params.employeeId as string;

  // Redux state
  const {
    employee,
    logs,
    logsTotal,
    logsPage,
    logsLimit,
    logsTotalPages,
    loading,
    logsLoading,
    error,
    logsError,
    selectedLogs,
    filterStatus,
    dateRange,
  } = useAppSelector((state) => state.employeeDetails);

  // Local state
  const [showDateRangeModal, setShowDateRangeModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false); // ADD THIS
  const [selectedImage, setSelectedImage] = useState<{ url: string; personName: string; punchTime: string } | null>(null); // ADD THIS

  // ... existing useEffect hooks ...

  // Fetch employee details and logs on mount
  useEffect(() => {
    if (employeeId) {
      dispatch(fetchEmployeeDetail(employeeId));
      dispatch(fetchEmployeeLogs({
        employeeId,
        params: {
          page: logsPage,
          limit: logsLimit,
          status: filterStatus as any,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
      }));
    }

    return () => {
      dispatch(resetEmployeeDetails());
    };
  }, [dispatch, employeeId]);

  useEffect(() => {
    if (employeeId) {
      dispatch(fetchEmployeeLogs({
        employeeId,
        params: {
          page: logsPage,
          limit: logsLimit,
          status: filterStatus === 'all' ? undefined : filterStatus as any,
          startDate: dateRange.startDate || undefined,
          endDate: dateRange.endDate || undefined,
        },
      }));
    }
  }, [dispatch, employeeId, logsPage, logsLimit, filterStatus, dateRange]);

  // ADD THIS HANDLER
  const handleViewSnapshot = (snapPicUrl: string, personName: string, punchTime: string) => {
    setSelectedImage({ url: snapPicUrl, personName, punchTime });
    setShowImageModal(true);
  };

  // ... all existing handlers (handleSelectLog, handleSelectAll, etc.) ...

  const handleSelectLog = (logId: string) => {
    dispatch(toggleSelectLog(logId));
  };

  const handleSelectAll = () => {
    if (selectedLogs.length === logs.length) {
      dispatch(clearLogSelection());
    } else {
      dispatch(selectAllLogs());
    }
  };

  const handleSyncAllEmployee = () => {
    dispatch(syncEmployee(employeeId)).then(() => {
      setTimeout(() => {
        dispatch(fetchEmployeeDetail(employeeId));
        dispatch(fetchEmployeeLogs({
          employeeId,
          params: { page: logsPage, limit: logsLimit },
        }));
      }, 1000);
    });
  };

  const handleSyncDateRange = () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      alert('Please select both start and end dates');
      return;
    }

    dispatch(syncEmployeeDateRange({
      employeeId,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    })).then(() => {
      setShowDateRangeModal(false);
      setTimeout(() => {
        dispatch(fetchEmployeeDetail(employeeId));
        dispatch(fetchEmployeeLogs({
          employeeId,
          params: { page: logsPage, limit: logsLimit },
        }));
      }, 1000);
    });
  };

  const handleRetryAllFailed = () => {
    dispatch(retryFailedRecords(employeeId)).then(() => {
      setTimeout(() => {
        dispatch(fetchEmployeeDetail(employeeId));
        dispatch(fetchEmployeeLogs({
          employeeId,
          params: { page: logsPage, limit: logsLimit },
        }));
      }, 1000);
    });
  };

  const handleForceSyncEmployee = () => {
    if (confirm('This will override the block status and force sync. Continue?')) {
      dispatch(forceSyncEmployee(employeeId)).then(() => {
        setTimeout(() => {
          dispatch(fetchEmployeeDetail(employeeId));
        }, 1000);
      });
    }
  };

  const handleSyncSingleRecord = (logId: string) => {
    dispatch(syncSingleRecord({ employeeId, logId })).then(() => {
      setTimeout(() => {
        dispatch(fetchEmployeeLogs({
          employeeId,
          params: { page: logsPage, limit: logsLimit },
        }));
      }, 1000);
    });
  };

  const handleSyncSelected = () => {
    dispatch(syncSelectedRecords({ employeeId, logIds: selectedLogs })).then(() => {
      setTimeout(() => {
        dispatch(fetchEmployeeLogs({
          employeeId,
          params: { page: logsPage, limit: logsLimit },
        }));
      }, 1000);
    });
  };

  const handlePageChange = (newPage: number) => {
    dispatch(setLogsPage(newPage));
  };

  const handleFilterChange = (status: string) => {
    dispatch(setFilterStatus(status));
  };

  const getSyncStatusBadge = (record: EmployeeLog) => {
    switch(record.syncStatus) {
      case 'success':
        return { color: 'success' as const, text: 'Synced', icon: '✓' };
      case 'failed':
        return { color: 'error' as const, text: 'Failed', icon: '✗' };
      case 'pending':
        return { color: 'warning' as const, text: 'Pending', icon: '⏳' };
      case 'processing':
        return { color: 'warning' as const, text: 'Processing', icon: '🔄' };
      case 'ignored':
        return { color: 'error' as const, text: 'Ignored', icon: '⚠' };
      case 'not_queued':
        return { color: 'warning' as const, text: 'Not Queued', icon: '⏸️' };
      default:
        return { color: 'warning' as const, text: 'Unknown', icon: '?' };
    }
  };

  const getPunchTypeIcon = (punchType: string) => {
    return punchType === 'checkIn' ? '→' : '←';
  };

  const calculateSyncRate = () => {
    if (!employee || employee.totalRecords === 0) return '0%';
    return `${Math.round((employee.syncedRecords / employee.totalRecords) * 100)}%`;
  };

  // ... existing loading and error states ...

  if (loading && !employee) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading employee details...</p>
        </div>
      </div>
    );
  }

  if (error && !employee) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Employee</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => dispatch(fetchEmployeeDetail(employeeId))}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
            <Link
              href="/employee"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Back to Employees
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!employee) return null;

  return (
    <div>
      <PageBreadcrumb pageTitle={`Employee Details - ${employee.personName}`} />
      
      <div className="space-y-6">
        {/* ... existing Employee Header Information ... */}
        <ComponentCard title="Employee Information">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                  {employee.avatar ? (
                    <img src={employee.avatar} alt={employee.personName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-blue-600 font-bold text-xl">
                      {employee.personName.split(' ').map(n => n[0]).join('')}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {employee.personName}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {employee.personCode} • {employee.department || 'N/A'}
                  </p>
                  <div className="mt-2 space-y-1 text-sm text-gray-500">
                    {employee.email && <p>📧 {employee.email}</p>}
                    {employee.phoneNumber && <p>📱 {employee.phoneNumber}</p>}
                    <p>📅 Status: {employee.status}</p>
                    {employee.lastSyncedAt && (
                      <p>🔄 Last synced: {new Date(employee.lastSyncedAt).toLocaleString()}</p>
                    )}
                  </div>
                  {employee.isBlocked && (
                    <div className="mt-2">
                      <Badge size="sm" color="error">
                        ⚠️ Employee Blocked - {employee.consecutiveFailures} consecutive failures
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Sync Statistics</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Records:</span>
                  <span className="font-medium">{employee.totalRecords}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-green-600">Synced:</span>
                  <span className="font-medium text-green-600">{employee.syncedRecords}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-red-600">Failed:</span>
                  <span className="font-medium text-red-600">{employee.failedRecords}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-yellow-600">Pending:</span>
                  <span className="font-medium text-yellow-600">{employee.pendingRecords}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Sync Rate:</span>
                  <span className="font-bold text-blue-600">{calculateSyncRate()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button 
              onClick={handleSyncAllEmployee}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Syncing...' : 'Sync All Employee Records'}
            </button>
            <button 
              onClick={() => setShowDateRangeModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Sync Date Range
            </button>
            {employee.isBlocked && (
              <button 
                onClick={handleForceSyncEmployee}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Override & Force Sync
              </button>
            )}
            {employee.failedRecords > 0 && (
              <button 
                onClick={handleRetryAllFailed}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Retry All Failed Records
              </button>
            )}
            <Link 
              href="/employee" 
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← Back to Employees
            </Link>
          </div>
        </ComponentCard>

        {/* ... existing Filters section ... */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'all', label: 'All Records', count: logsTotal },
              { key: 'success', label: 'Synced', count: logs.filter(r => r.syncStatus === 'success').length },
              { key: 'failed', label: 'Failed', count: logs.filter(r => r.syncStatus === 'failed').length },
              { key: 'pending', label: 'Pending', count: logs.filter(r => r.syncStatus === 'pending').length },
              { key: 'ignored', label: 'Ignored', count: logs.filter(r => r.syncStatus === 'ignored').length },
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => handleFilterChange(filter.key)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  filterStatus === filter.key
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>

          {selectedLogs.length > 0 && (
            <div className="flex gap-2">
              <button 
                onClick={handleSyncSelected}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sync Selected ({selectedLogs.length})
              </button>
              <button 
                onClick={() => dispatch(clearLogSelection())}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>

        {/* Attendance Records Timeline */}
        <ComponentCard title="Attendance Records Timeline">
          {logsLoading && logs.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading logs...</p>
            </div>
          ) : logsError ? (
            <div className="text-center py-8 text-red-600">{logsError}</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No attendance records found</div>
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                  <div className="min-w-[1400px]">
                    <Table>
                      <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                        <TableRow>
                          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                            <input
                              type="checkbox"
                              checked={selectedLogs.length === logs.length && logs.length > 0}
                              onChange={handleSelectAll}
                              className="rounded border-gray-300"
                            />
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                            Date & Time
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                            Activity
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                            Device & Location
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                            Sync Status
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                            Technical Details
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHeader>

                      <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {logs.map((record) => {
                          const statusBadge = getSyncStatusBadge(record);
                          return (
                            <TableRow key={record.id}>
                              <TableCell className="px-5 py-4 text-start">
                                <input
                                  type="checkbox"
                                  checked={selectedLogs.includes(record.id)}
                                  onChange={() => handleSelectLog(record.id)}
                                  className="rounded border-gray-300"
                                />
                              </TableCell>

                              <TableCell className="px-5 py-4 text-start">
                                <div className="space-y-1">
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {new Date(record.punchTime).toLocaleDateString()}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {new Date(record.punchTime).toLocaleTimeString()}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    Device: {new Date(record.deviceTime).toLocaleTimeString()}
                                  </div>
                                </div>
                              </TableCell>

                              <TableCell className="px-4 py-3 text-start">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{getPunchTypeIcon(record.punchType)}</span>
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    record.punchType === 'checkIn' 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                  }`}>
                                    {record.punchType === 'checkIn' ? 'Check In' : 'Check Out'}
                                  </span>
                                </div>
                              </TableCell>

                              <TableCell className="px-4 py-3 text-start">
                                <div className="space-y-1">
                                  <div className="font-medium text-sm">{record.deviceName}</div>
                                  <div className="text-xs text-gray-500">{record.elementName}</div>
                                  {/* UPDATED: Change from <a> to <button> */}
                                  {record.snapPicUrl && (
                                    <div className="text-xs">
                                      <button
                                        onClick={() => handleViewSnapshot(record.snapPicUrl!, employee.personName, record.punchTime)}
                                        className="text-blue-500 hover:text-blue-700 underline"
                                      >
                                        📷 View Snapshot
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </TableCell>

                              <TableCell className="px-4 py-3 text-start">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">{statusBadge.icon}</span>
                                    <Badge size="sm" color={statusBadge.color}>
                                      {statusBadge.text}
                                    </Badge>
                                  </div>
                                  
                                  {record.syncStatus === 'success' && record.syncedAt && (
                                    <div className="text-xs text-green-600">
                                      Synced: {new Date(record.syncedAt).toLocaleString()}
                                    </div>
                                  )}
                                  
                                  {record.syncStatus === 'failed' && (
                                    <div className="space-y-1">
                                      <div className="text-xs text-red-600">
                                        {record.errorMessage}
                                      </div>
                                      {record.retryCount !== undefined && (
                                        <div className="text-xs text-gray-500">
                                          Retries: {record.retryCount}/5
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  
                                  {record.syncStatus === 'pending' && record.nextRetryAt && (
                                    <div className="text-xs text-yellow-600">
                                      Next retry: {new Date(record.nextRetryAt).toLocaleString()}
                                    </div>
                                  )}

                                  {record.syncStatus === 'ignored' && (
                                    <div className="text-xs text-red-600">
                                      Max retries exceeded
                                    </div>
                                  )}
                                </div>
                              </TableCell>

                              <TableCell className="px-4 py-3 text-start">
                                <div className="space-y-1 text-xs text-gray-500">
                                  <div>ID: {record.id}</div>
                                  <div>GUID: {record.recordGuid.slice(-8)}</div>
                                  <div>Event: {record.eventType}</div>
                                  <div>Auth: {record.swipeAuthResult === 1 ? 'Success' : 'Failed'}</div>
                                  {record.batchId && <div>Batch: {record.batchId.slice(-8)}</div>}
                                  {record.errorCode && <div>Error: {record.errorCode}</div>}
                                </div>
                              </TableCell>

                              <TableCell className="px-4 py-3 text-start">
                                <div className="flex flex-col gap-1">
                                  {record.syncStatus !== 'success' && record.syncStatus !== 'ignored' && (
                                    <button 
                                      onClick={() => handleSyncSingleRecord(record.id)}
                                      className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                                    >
                                      {record.syncStatus === 'failed' ? 'Retry Now' : 'Sync Record'}
                                    </button>
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

              {logsTotalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button
                    onClick={() => handlePageChange(logsPage - 1)}
                    disabled={logsPage === 1 || logsLoading}
                    className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="px-4">
                    Page {logsPage} of {logsTotalPages} ({logsTotal} total records)
                  </span>
                  <button
                    onClick={() => handlePageChange(logsPage + 1)}
                    disabled={logsPage === logsTotalPages || logsLoading}
                    className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </ComponentCard>

        {/* Date Range Sync Modal */}
        {showDateRangeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Sync Date Range</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => dispatch(setDateRange({ ...dateRange, startDate: e.target.value }))}
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
                    onChange={(e) => dispatch(setDateRange({ ...dateRange, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700"
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <button 
                    onClick={() => setShowDateRangeModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSyncDateRange}
                    disabled={!dateRange.startDate || !dateRange.endDate}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    Sync Range
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ADD THIS: Image Preview Modal */}
        <Transition appear show={showImageModal} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setShowImageModal(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-75" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl transition-all">
                    <div className="relative">
                      {/* Header */}
                      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                        <div>
                          <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                            Attendance Snapshot
                          </Dialog.Title>
                          {selectedImage && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {selectedImage.personName} • {new Date(selectedImage.punchTime).toLocaleString()}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => setShowImageModal(false)}
                          className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Image */}
                      <div className="p-4 bg-gray-50 dark:bg-gray-900">
                        <div className="relative w-full max-h-[70vh] flex items-center justify-center">
                          {selectedImage && (
                            <img
                              src={selectedImage.url}
                              alt="Attendance snapshot"
                              className="max-w-full max-h-[70vh] object-contain rounded-lg"
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EImage not available%3C/text%3E%3C/svg%3E';
                              }}
                            />
                          )}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex justify-end gap-2 p-4 border-t dark:border-gray-700">
                        {selectedImage && (
                          <a
                            href={selectedImage.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Open in New Tab
                          </a>
                        )}
                        <button
                          onClick={() => setShowImageModal(false)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </div>
  );
};

export default Page;