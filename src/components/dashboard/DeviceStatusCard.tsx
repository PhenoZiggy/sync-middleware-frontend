'use client';

import React from 'react';
import Badge from '../ui/badge/Badge';

interface DeviceStatus {
  deviceId: string;
  deviceName: string;
  areaName: string;
  isOnline: boolean;
  lastSyncedAt: Date | null;
  storeAttendance: boolean;
  pushToBayzat: boolean;
  todayRecords: number;
}

interface DeviceStatusCardProps {
  devices?: DeviceStatus[];
  loading?: boolean;
}

export default function DeviceStatusCard({ devices = [], loading = false }: DeviceStatusCardProps) {
  const formatDateTime = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const syncDate = new Date(date);
    const diff = now.getTime() - syncDate.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const onlineDevices = devices.filter(d => d.isOnline).length;
  const offlineDevices = devices.length - onlineDevices;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Device Status
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Real-time device health monitoring
            </p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {onlineDevices} Online
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {offlineDevices} Offline
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {devices.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No devices found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {devices.slice(0, 10).map((device) => (
              <div
                key={device.deviceId}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900/70 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`flex items-center justify-center h-10 w-10 rounded-lg ${
                    device.isOnline
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}>
                    <svg className={`w-5 h-5 ${
                      device.isOnline
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {device.deviceName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {device.areaName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {device.todayRecords}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Records today
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {device.storeAttendance ? (
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30" title="Storing Attendance">
                        <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gray-200 dark:bg-gray-700" title="Not Storing Attendance">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    )}

                    {device.pushToBayzat ? (
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/30" title="Pushing to Bayzat">
                        <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                        </svg>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gray-200 dark:bg-gray-700" title="Not Pushing to Bayzat">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Last sync
                    </p>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {formatDateTime(device.lastSyncedAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {devices.length > 10 && (
          <div className="mt-4 text-center">
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              View all {devices.length} devices →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
