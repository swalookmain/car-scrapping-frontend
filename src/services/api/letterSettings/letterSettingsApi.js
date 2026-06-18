import axiosInstance from '../core/axiosInstance';
import { ENDPOINTS } from '../core/config';

const letterSettingsApi = {
  get: async () => {
    const response = await axiosInstance.get(ENDPOINTS.LETTER_SETTINGS.GET);
    return response.data;
  },
  update: async (payload) => {
    const response = await axiosInstance.patch(ENDPOINTS.LETTER_SETTINGS.UPDATE, payload);
    return response.data;
  },
  uploadAsset: async (assetType, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('assetType', assetType);
    const response = await axiosInstance.post(ENDPOINTS.LETTER_SETTINGS.UPLOAD, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export default letterSettingsApi;
