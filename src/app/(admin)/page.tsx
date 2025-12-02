'use client';

import React, { useEffect, useState } from 'react';
import AttendanceMetrics from '@/components/dashboard/AttendanceMetrics';
import SyncActivityChart from '@/components/dashboard/SyncActivityChart';
import RecentSyncLogs from '@/components/dashboard/RecentSyncLogs';
import DeviceStatusCard from '@/components/dashboard/DeviceStatusCard';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    // TODO: Replace with actual API call
    // Simulating API call with mock data
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Mock data for now - will be replaced with real API
        const mockData = {
          metrics: {
            totalRecordsToday: 1247,
            totalRecordsThisMonth: 34821,
            syncSuccessRate: 97.3,
            activeDevices: 12,
            pendingSync: 45,
            failedSync: 8,
          },
          syncActivity: {
            dates: ['Jan 25', 'Jan 26', 'Jan 27', 'Jan 28', 'Jan 29', 'Jan 30', 'Jan 31'],
            successCount: [142, 189, 156, 178, 201, 167, 145],
            failedCount: [3, 5, 2, 4, 6, 3, 4],
            ignoredCount: [8, 12, 9, 11, 15, 10, 9],
          },
          recentLogs: [
            {
              id: '1',
              batchId: 'batch-001',
              batchType: 'auto_sync',
              status: 'completed',
              recordsCount: 145,
              successCount: 141,
              failedCount: 4,
              ignoredCount: 0,
              startedAt: new Date(Date.now() - 15 * 60000),
              completedAt: new Date(Date.now() - 14 * 60000),
              triggeredByUser: null,
            },
            {
              id: '2',
              batchId: 'batch-002',
              batchType: 'manual_sync',
              status: 'partial',
              recordsCount: 89,
              successCount: 82,
              failedCount: 7,
              ignoredCount: 0,
              startedAt: new Date(Date.now() - 2 * 60 * 60000),
              completedAt: new Date(Date.now() - 2 * 60 * 60000 + 45000),
              triggeredByUser: 'admin',
            },
            {
              id: '3',
              batchId: 'batch-003',
              batchType: 'retry_failed',
              status: 'completed',
              recordsCount: 12,
              successCount: 12,
              failedCount: 0,
              ignoredCount: 0,
              startedAt: new Date(Date.now() - 4 * 60 * 60000),
              completedAt: new Date(Date.now() - 4 * 60 * 60000 + 20000),
              triggeredByUser: null,
            },
            {
              id: '4',
              batchId: 'batch-004',
              batchType: 'auto_sync',
              status: 'completed',
              recordsCount: 178,
              successCount: 176,
              failedCount: 2,
              ignoredCount: 0,
              startedAt: new Date(Date.now() - 6 * 60 * 60000),
              completedAt: new Date(Date.now() - 6 * 60 * 60000 + 52000),
              triggeredByUser: null,
            },
            {
              id: '5',
              batchId: 'batch-005',
              batchType: 'auto_sync',
              status: 'completed',
              recordsCount: 201,
              successCount: 195,
              failedCount: 6,
              ignoredCount: 0,
              startedAt: new Date(Date.now() - 24 * 60 * 60000),
              completedAt: new Date(Date.now() - 24 * 60 * 60000 + 67000),
              triggeredByUser: null,
            },
          ],
          devices: [
            {
              deviceId: 'dev001',
              deviceName: 'Main Entrance',
              areaName: 'Building A',
              isOnline: true,
              lastSyncedAt: new Date(Date.now() - 10 * 60000),
              storeAttendance: true,
              pushToBayzat: true,
              todayRecords: 234,
            },
            {
              deviceId: 'dev002',
              deviceName: 'Office Floor 2',
              areaName: 'Building A',
              isOnline: true,
              lastSyncedAt: new Date(Date.now() - 15 * 60000),
              storeAttendance: true,
              pushToBayzat: true,
              todayRecords: 189,
            },
            {
              deviceId: 'dev003',
              deviceName: 'Parking Gate',
              areaName: 'Parking Area',
              isOnline: false,
              lastSyncedAt: new Date(Date.now() - 2 * 60 * 60000),
              storeAttendance: true,
              pushToBayzat: false,
              todayRecords: 0,
            },
            {
              deviceId: 'dev004',
              deviceName: 'Cafeteria',
              areaName: 'Building B',
              isOnline: true,
              lastSyncedAt: new Date(Date.now() - 5 * 60000),
              storeAttendance: true,
              pushToBayzat: true,
              todayRecords: 156,
            },
            {
              deviceId: 'dev005',
              deviceName: 'Warehouse',
              areaName: 'Warehouse Complex',
              isOnline: true,
              lastSyncedAt: new Date(Date.now() - 20 * 60000),
              storeAttendance: false,
              pushToBayzat: false,
              todayRecords: 0,
            },
          ],
        };

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setDashboardData(mockData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Attendance Sync Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Monitor attendance synchronization between HikVision devices and Bayzat HR system
        </p>
      </div>

      {/* Metrics Cards */}
      <AttendanceMetrics
        totalRecordsToday={dashboardData?.metrics.totalRecordsToday}
        totalRecordsThisMonth={dashboardData?.metrics.totalRecordsThisMonth}
        syncSuccessRate={dashboardData?.metrics.syncSuccessRate}
        activeDevices={dashboardData?.metrics.activeDevices}
        pendingSync={dashboardData?.metrics.pendingSync}
        failedSync={dashboardData?.metrics.failedSync}
        loading={loading}
      />

      {/* Sync Activity Chart and Device Status */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SyncActivityChart
            data={dashboardData?.syncActivity}
            loading={loading}
          />
        </div>
        <div className="xl:col-span-1">
          <DeviceStatusCard
            devices={dashboardData?.devices}
            loading={loading}
          />
        </div>
      </div>

      {/* Recent Sync Logs */}
      <RecentSyncLogs
        logs={dashboardData?.recentLogs}
        loading={loading}
      />

      {/* Quick Actions */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/areas"
            className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/40">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Manage Devices
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Configure devices
              </p>
            </div>
          </a>

          <a
            href="/employee"
            className="flex items-center gap-3 p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
          >
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/40">
              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                View Employees
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Manage employee data
              </p>
            </div>
          </a>

          <button className="flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/40">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Manual Sync
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Trigger sync now
              </p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/40">
              <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                View Logs
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Detailed sync logs
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
