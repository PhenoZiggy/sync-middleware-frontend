// src/services/areasApi.ts
import { api } from './api';
import type {
  AreasResponse,
  DevicesResponse,
  FetchAreasResponse,
  FetchDevicesResponse,
} from '@/interfaces/area.interface';

export const areasAPI = {
  // Fetch and store areas from HikConnect API
  fetchAreas: async (triggeredBy?: string) => {
    const params = new URLSearchParams();
    if (triggeredBy) {
      params.append('triggeredBy', triggeredBy);
    }
    const response = await api.post<FetchAreasResponse>(
      `/hikconnect/areas/fetch?${params.toString()}`
    );
    return response.data;
  },

  // Fetch and store devices from HikConnect API
  fetchDevices: async (deviceCategory: string = 'accessControllerDevice', triggeredBy?: string) => {
    const params = new URLSearchParams();
    if (deviceCategory) {
      params.append('deviceCategory', deviceCategory);
    }
    if (triggeredBy) {
      params.append('triggeredBy', triggeredBy);
    }
    const response = await api.post<FetchDevicesResponse>(
      `/hikconnect/devices/fetch?${params.toString()}`
    );
    return response.data;
  },

  // Get all areas with their devices
  getAreas: async () => {
    const response = await api.get<AreasResponse>('/hikconnect/areas');
    return response.data;
  },

  // Get devices by area ID
  getDevicesByArea: async (areaId: string) => {
    const response = await api.get<DevicesResponse>(`/hikconnect/areas/${areaId}/devices`);
    return response.data;
  },
};
