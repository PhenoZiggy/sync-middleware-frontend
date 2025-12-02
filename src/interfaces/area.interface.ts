// src/interfaces/area.interface.ts

export interface Area {
  id: string;
  areaId: string;
  areaName: string;
  areaType: string;
  parentAreaId: string | null;
  parentAreaName: string | null;
  areaLevel: number | null;
  apiUrl: string | null;
  lastSyncedAt: Date | null;
  devicesCount: number;
  devices: Device[];
}

export interface Device {
  id: string;
  deviceId: string;
  deviceName: string;
  deviceCategory: string | null;
  deviceType: string | null;
  deviceStatus: string | null;
  serialNumber: string | null;
  model: string | null;
  ipAddress: string | null;
  port: number | null;
  isOnline: boolean;
  lastSyncedAt: Date | null;
  settings?: DeviceSettings;
}

export interface DeviceSettings {
  id: string;
  deviceId: string;
  storeAttendance: boolean;
  pushToBayzat: boolean;
  notes: string | null;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AreasResponse {
  success: boolean;
  data: Area[];
  total: number;
}

export interface DevicesResponse {
  success: boolean;
  data: Device[];
  total: number;
}

export interface FetchAreasResponse {
  success: boolean;
  message: string;
  data: {
    totalFetched: number;
    newAreas: number;
    updatedAreas: number;
    apiUrl: string;
  };
}

export interface FetchDevicesResponse {
  success: boolean;
  message: string;
  data: {
    totalFetched: number;
    newDevices: number;
    updatedDevices: number;
    apiUrl: string;
  };
}
