'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchAreas,
  syncAreasFromAPI,
  syncDevicesFromAPI,
  toggleExpandArea,
  expandAllAreas,
  collapseAllAreas,
  clearFetchSuccess,
  clearError,
} from '@/store/slices/areasSlice';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { ChevronDownIcon, ChevronRightIcon, DeviceControllerIcon } from '@/icons';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import type { Device } from '@/interfaces/area.interface';

export default function AreasPage() {
  const dispatch = useAppDispatch();
  const { areas, loading, error, fetchingData, fetchSuccess, expandedAreas } = useAppSelector(
    (state) => state.areas
  );
  const { isAuthenticated, accessToken } = useAppSelector((state) => state.auth);

  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    device: Device | null;
    newValue: boolean;
  }>({
    isOpen: false,
    device: null,
    newValue: false,
  });
  const [bayzatDialog, setBayzatDialog] = useState<{
    isOpen: boolean;
    device: Device | null;
    newValue: boolean;
  }>({
    isOpen: false,
    device: null,
    newValue: false,
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Only fetch areas after auth is initialized and token is available
    if (isAuthenticated && accessToken) {
      dispatch(fetchAreas());
    }
  }, [dispatch, isAuthenticated, accessToken]);

  useEffect(() => {
    if (fetchSuccess) {
      setShowSuccessAlert(true);
      // Auto-refresh areas after successful fetch
      setTimeout(() => {
        dispatch(fetchAreas());
      }, 1000);

      setTimeout(() => {
        setShowSuccessAlert(false);
        dispatch(clearFetchSuccess());
      }, 5000);
    }
  }, [fetchSuccess, dispatch]);

  useEffect(() => {
    if (error) {
      setShowErrorAlert(true);
      setTimeout(() => {
        setShowErrorAlert(false);
        dispatch(clearError());
      }, 5000);
    }
  }, [error, dispatch]);

  const handleFetchAreas = async () => {
    await dispatch(syncAreasFromAPI('admin'));
  };

  const handleFetchDevices = async () => {
    await dispatch(syncDevicesFromAPI({ deviceCategory: 'accessControllerDevice', triggeredBy: 'admin' }));
  };

  const handleFetchAll = async () => {
    await dispatch(syncAreasFromAPI('admin'));
    await dispatch(syncDevicesFromAPI({ deviceCategory: 'accessControllerDevice', triggeredBy: 'admin' }));
  };

  const handleToggleExpand = (areaId: string) => {
    dispatch(toggleExpandArea(areaId));
  };

  const handleExpandAll = () => {
    dispatch(expandAllAreas());
  };

  const handleCollapseAll = () => {
    dispatch(collapseAllAreas());
  };

  const isAreaExpanded = (areaId: string) => {
    return expandedAreas.includes(areaId);
  };

  const formatDateTime = (date: Date | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString();
  };

  const getDeviceCategoryDisplay = (category: string | null) => {
    if (!category) return 'Unknown';
    // Convert camelCase to readable format
    const formatted = category
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
    return formatted;
  };

  const handleToggleStoreAttendance = (device: Device) => {
    const currentValue = device.settings?.storeAttendance ?? true;
    setConfirmDialog({
      isOpen: true,
      device,
      newValue: !currentValue,
    });
  };

  const confirmToggleAttendance = async () => {
    if (!confirmDialog.device) return;

    setIsUpdating(true);
    try {
      const { areasAPI } = await import('@/services/areasApi');
      await areasAPI.updateDeviceSettings(
        confirmDialog.device.deviceId,
        confirmDialog.newValue,
        undefined
      );
      // Refresh areas to get updated settings
      await dispatch(fetchAreas());
      setConfirmDialog({ isOpen: false, device: null, newValue: false });
    } catch (error) {
      console.error('Failed to update device settings:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTogglePushToBayzat = (device: Device) => {
    const currentValue = device.settings?.pushToBayzat ?? true;
    setBayzatDialog({
      isOpen: true,
      device,
      newValue: !currentValue,
    });
  };

  const confirmToggleBayzat = async () => {
    if (!bayzatDialog.device) return;

    setIsUpdating(true);
    try {
      const { areasAPI } = await import('@/services/areasApi');
      await areasAPI.updateDeviceSettings(
        bayzatDialog.device.deviceId,
        undefined,
        bayzatDialog.newValue
      );
      // Refresh areas to get updated settings
      await dispatch(fetchAreas());
      setBayzatDialog({ isOpen: false, device: null, newValue: false });
    } catch (error) {
      console.error('Failed to update device settings:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const totalDevices = Array.isArray(areas) ? areas.reduce((sum, area) => sum + (area.devicesCount || 0), 0) : 0;
  const onlineDevices = Array.isArray(areas)
    ? areas.reduce(
        (sum, area) =>
          sum + (Array.isArray(area.devices) ? area.devices.filter((device) => device.isOnline).length : 0),
        0
      )
    : 0;
  const offlineDevices = totalDevices - onlineDevices;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Areas & Devices" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Areas & Devices
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage areas and access control devices from HikConnect
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleFetchAreas}
            disabled={fetchingData}
            variant="outline"
            size="sm"
          >
            {fetchingData ? 'Fetching...' : 'Sync Areas'}
          </Button>
          <Button
            onClick={handleFetchDevices}
            disabled={fetchingData}
            variant="outline"
            size="sm"
          >
            {fetchingData ? 'Fetching...' : 'Sync Devices'}
          </Button>
          <Button
            onClick={handleFetchAll}
            disabled={fetchingData}
            variant="primary"
            size="sm"
          >
            {fetchingData ? 'Fetching...' : 'Sync All'}
          </Button>
        </div>
      </div>

      {/* Success Alert */}
      {showSuccessAlert && fetchSuccess && (
        <div className="rounded-xl bg-green-50 p-4 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                {fetchSuccess}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {showErrorAlert && error && (
        <div className="rounded-xl bg-red-50 p-4 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 px-6 py-6 shadow-lg">
          <dt className="text-sm font-medium text-blue-100">
            Total Areas
          </dt>
          <dd className="mt-2 text-4xl font-bold tracking-tight text-white">
            {Array.isArray(areas) ? areas.length : 0}
          </dd>
          <div className="absolute bottom-0 right-0 opacity-10">
            <svg className="h-24 w-24" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 px-6 py-6 shadow-lg">
          <dt className="text-sm font-medium text-purple-100">
            Total Devices
          </dt>
          <dd className="mt-2 text-4xl font-bold tracking-tight text-white">
            {totalDevices}
          </dd>
          <div className="absolute bottom-0 right-0 opacity-10">
            <svg className="h-24 w-24" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500 to-green-600 px-6 py-6 shadow-lg">
          <dt className="text-sm font-medium text-green-100">
            Online Devices
          </dt>
          <dd className="mt-2 text-4xl font-bold tracking-tight text-white">
            {onlineDevices}
          </dd>
          <div className="absolute bottom-0 right-0 opacity-10">
            <svg className="h-24 w-24" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-red-500 to-red-600 px-6 py-6 shadow-lg">
          <dt className="text-sm font-medium text-red-100">
            Offline Devices
          </dt>
          <dd className="mt-2 text-4xl font-bold tracking-tight text-white">
            {offlineDevices}
          </dd>
          <div className="absolute bottom-0 right-0 opacity-10">
            <svg className="h-24 w-24" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Table Controls */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 px-6 py-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            View:
          </span>
          <Button onClick={handleExpandAll} variant="outline" size="sm">
            Expand All
          </Button>
          <Button onClick={handleCollapseAll} variant="outline" size="sm">
            Collapse All
          </Button>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {Array.isArray(areas) ? areas.length : 0} areas with {totalDevices} devices
        </div>
      </div>

      {/* Areas Table */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">Loading areas...</p>
            </div>
          </div>
        ) : !Array.isArray(areas) || areas.length === 0 ? (
          <div className="py-16 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No areas found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Click &quot;Sync All&quot; to load data from HikConnect API.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Area / Device
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Details
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Last Synced
                  </th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Store Attendance
                  </th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Push to Bayzat
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {areas.map((area) => (
                  <React.Fragment key={area.areaId}>
                    {/* Area Row */}
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleExpand(area.areaId)}
                            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          >
                            {area.devicesCount > 0 ? (
                              isAreaExpanded(area.areaId) ? (
                                <ChevronDownIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                              ) : (
                                <ChevronRightIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                              )
                            ) : (
                              <div className="h-5 w-5" />
                            )}
                          </button>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                {area.areaName}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {area.parentAreaName ? `${area.parentAreaName} • Level ${area.areaLevel}` : 'Root Area'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {area.areaType || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge size="sm" color={area.devicesCount > 0 ? 'success' : 'light'}>
                          {area.devicesCount} {area.devicesCount === 1 ? 'device' : 'devices'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDateTime(area.lastSyncedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-xs text-gray-400">—</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-xs text-gray-400">—</span>
                      </td>
                    </tr>

                    {/* Devices Rows (Expandable) */}
                    {isAreaExpanded(area.areaId) &&
                      Array.isArray(area.devices) &&
                      area.devices.map((device) => (
                        <tr
                          key={device.deviceId}
                          className="bg-gray-50/50 dark:bg-gray-900/30 hover:bg-gray-100 dark:hover:bg-gray-700/30 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="ml-14 flex items-center gap-3">
                              <div
                                className="relative group cursor-help"
                                title={getDeviceCategoryDisplay(device.deviceCategory)}
                              >
                                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                  <DeviceControllerIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max max-w-xs px-3 py-2 text-xs font-medium text-white bg-gray-900 dark:bg-gray-700 rounded-lg shadow-lg z-10">
                                  {getDeviceCategoryDisplay(device.deviceCategory)}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {device.deviceName}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {device.serialNumber || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {device.model || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {device.ipAddress || 'N/A'}{device.port ? `:${device.port}` : ''}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge size="sm" color={device.isOnline ? 'success' : 'error'}>
                              {device.isOnline ? 'Online' : 'Offline'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatDateTime(device.lastSyncedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button
                              onClick={() => handleToggleStoreAttendance(device)}
                              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                device.settings?.storeAttendance ?? true
                                  ? 'bg-blue-600'
                                  : 'bg-gray-200 dark:bg-gray-700'
                              }`}
                              role="switch"
                              aria-checked={device.settings?.storeAttendance ?? true}
                            >
                              <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  device.settings?.storeAttendance ?? true
                                    ? 'translate-x-5'
                                    : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button
                              onClick={() => handleTogglePushToBayzat(device)}
                              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                                device.settings?.pushToBayzat ?? true
                                  ? 'bg-green-600'
                                  : 'bg-gray-200 dark:bg-gray-700'
                              }`}
                              role="switch"
                              aria-checked={device.settings?.pushToBayzat ?? true}
                            >
                              <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  device.settings?.pushToBayzat ?? true
                                    ? 'translate-x-5'
                                    : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Store Attendance Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, device: null, newValue: false })}
        onConfirm={confirmToggleAttendance}
        title={confirmDialog.newValue ? 'Enable Attendance Storage?' : 'Disable Attendance Storage?'}
        message={
          confirmDialog.newValue
            ? `Are you sure you want to enable attendance storage for "${confirmDialog.device?.deviceName}"? Attendance records from this device will be stored in the database.`
            : `Are you sure you want to disable attendance storage for "${confirmDialog.device?.deviceName}"? Attendance records from this device will be skipped and not stored in the database.`
        }
        confirmText={confirmDialog.newValue ? 'Enable' : 'Disable'}
        cancelText="Cancel"
        type={confirmDialog.newValue ? 'success' : 'warning'}
        isLoading={isUpdating}
      />

      {/* Push to Bayzat Confirmation Dialog */}
      <ConfirmDialog
        isOpen={bayzatDialog.isOpen}
        onClose={() => setBayzatDialog({ isOpen: false, device: null, newValue: false })}
        onConfirm={confirmToggleBayzat}
        title={bayzatDialog.newValue ? 'Enable Bayzat Push?' : 'Disable Bayzat Push?'}
        message={
          bayzatDialog.newValue
            ? `Are you sure you want to enable Bayzat push for "${bayzatDialog.device?.deviceName}"? Attendance records from this device will be synced to Bayzat.`
            : `Are you sure you want to disable Bayzat push for "${bayzatDialog.device?.deviceName}"? Attendance records from this device will NOT be synced to Bayzat.`
        }
        confirmText={bayzatDialog.newValue ? 'Enable' : 'Disable'}
        cancelText="Cancel"
        type={bayzatDialog.newValue ? 'success' : 'warning'}
        isLoading={isUpdating}
      />
    </div>
  );
}
