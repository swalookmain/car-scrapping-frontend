import axiosInstance from '../core/axiosInstance';
import { ENDPOINTS } from '../core/config';

export const inventoryAuditApi = {
  preview: async (params = {}) => {
    const response = await axiosInstance.get(ENDPOINTS.INVENTORY_AUDIT.PREVIEW, { params });
    return response.data;
  },
  downloadPdf: async (params = {}) => {
    const response = await axiosInstance.get(ENDPOINTS.INVENTORY_AUDIT.PDF, {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};

export const facilitySettingsApi = {
  get: async () => {
    const response = await axiosInstance.get(ENDPOINTS.FACILITY_SETTINGS.GET);
    return response.data;
  },
  update: async (payload) => {
    const response = await axiosInstance.patch(ENDPOINTS.FACILITY_SETTINGS.UPDATE, payload);
    return response.data;
  },
};

export default inventoryAuditApi;
