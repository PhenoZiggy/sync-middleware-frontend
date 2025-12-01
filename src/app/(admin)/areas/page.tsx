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
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { ChevronDownIcon, ChevronRightIcon, DeviceControllerIcon } from '@/icons';

export default function AreasPage() {
  const dispatch = useAppDispatch();
  const { areas, loading, error, fetchingData, fetchSuccess, expandedAreas } = useAppSelector(
    (state) => state.areas
  );
  const { isAuthenticated, accessToken } = useAppSelector((state) => state.auth);

  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

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

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Areas & Devices" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Areas & Devices
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage areas and devices from HikConnect API
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleFetchAreas}
            disabled={fetchingData}
            variant="outline"
          >
            {fetchingData ? 'Fetching...' : 'Fetch Areas'}
          </Button>
          <Button
            onClick={handleFetchDevices}
            disabled={fetchingData}
            variant="outline"
          >
            {fetchingData ? 'Fetching...' : 'Fetch Devices'}
          </Button>
          <Button
            onClick={handleFetchAll}
            disabled={fetchingData}
            variant="primary"
          >
            {fetchingData ? 'Fetching...' : 'Fetch All'}
          </Button>
        </div>
      </div>

      {/* Success Alert */}
      {showSuccessAlert && fetchSuccess && (
        <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
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
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
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
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow dark:bg-gray-800 sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Areas
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
            {Array.isArray(areas) ? areas.length : 0}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow dark:bg-gray-800 sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Devices
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
            {Array.isArray(areas) ? areas.reduce((sum, area) => sum + (area.devicesCount || 0), 0) : 0}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow dark:bg-gray-800 sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
            Online Devices
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-green-600 dark:text-green-400">
            {Array.isArray(areas)
              ? areas.reduce(
                  (sum, area) =>
                    sum + (Array.isArray(area.devices) ? area.devices.filter((device) => device.isOnline).length : 0),
                  0
                )
              : 0}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow dark:bg-gray-800 sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
            Offline Devices
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-red-600 dark:text-red-400">
            {Array.isArray(areas)
              ? areas.reduce(
                  (sum, area) =>
                    sum + (Array.isArray(area.devices) ? area.devices.filter((device) => !device.isOnline).length : 0),
                  0
                )
              : 0}
          </dd>
        </div>
      </div>

      {/* Table Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button onClick={handleExpandAll} variant="outline" size="sm">
            Expand All
          </Button>
          <Button onClick={handleCollapseAll} variant="outline" size="sm">
            Collapse All
          </Button>
        </div>
      </div>

      {/* Areas Table */}
      <div className="overflow-hidden bg-white shadow dark:bg-gray-800 sm:rounded-lg">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-blue-600"></div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading areas...</p>
            </div>
          </div>
        ) : !Array.isArray(areas) || areas.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No areas found. Click &quot;Fetch All&quot; to load data from HikConnect API.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell isHeader>Area</TableCell>
                  <TableCell isHeader>Parent Area</TableCell>
                  <TableCell isHeader>Devices</TableCell>
                  <TableCell isHeader>Last Synced</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {areas.map((area) => (
                  <React.Fragment key={area.areaId}>
                    {/* Area Row */}
                    <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleExpand(area.areaId)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            {area.devicesCount > 0 ? (
                              isAreaExpanded(area.areaId) ? (
                                <ChevronDownIcon className="h-5 w-5" />
                              ) : (
                                <ChevronRightIcon className="h-5 w-5" />
                              )
                            ) : (
                              <div className="h-5 w-5" />
                            )}
                          </button>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {area.areaName}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {area.parentAreaName ? (
                          <div>
                            <div className="text-sm text-gray-900 dark:text-white">
                              {area.parentAreaName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Level {area.areaLevel}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Root</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge size="sm" color={area.devicesCount > 0 ? 'success' : 'secondary'}>
                          {area.devicesCount} {area.devicesCount === 1 ? 'device' : 'devices'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDateTime(area.lastSyncedAt)}
                        </span>
                      </TableCell>
                    </TableRow>

                    {/* Devices Rows (Expandable) */}
                    {isAreaExpanded(area.areaId) &&
                      Array.isArray(area.devices) &&
                      area.devices.map((device) => (
                        <TableRow
                          key={device.deviceId}
                          className="bg-gray-50 dark:bg-gray-900/50"
                        >
                          <TableCell>
                            <div className="ml-12 flex items-center gap-2">
                              <div
                                className="relative group cursor-help"
                                title={getDeviceCategoryDisplay(device.deviceCategory)}
                              >
                                <DeviceControllerIcon className="h-5 w-5 text-gray-400" />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max max-w-xs px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded shadow-lg z-10">
                                  {getDeviceCategoryDisplay(device.deviceCategory)}
                                </div>
                              </div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {device.deviceName}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="text-gray-900 dark:text-white">{device.model || 'N/A'}</div>
                              <div className="text-gray-500 dark:text-gray-400">{device.serialNumber || 'N/A'}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge size="sm" color={device.isOnline ? 'success' : 'error'}>
                                {device.isOnline ? 'Online' : 'Offline'}
                              </Badge>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {device.ipAddress || 'N/A'}
                                {device.port && `:${device.port}`}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {formatDateTime(device.lastSyncedAt)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
