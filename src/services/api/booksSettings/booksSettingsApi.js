import axiosInstance from '../core/axiosInstance';
import { ENDPOINTS } from '../core/config';

const booksSettingsApi = {
  get: async () => {
    const response = await axiosInstance.get(ENDPOINTS.BOOKS_SETTINGS.GET);
    return response.data;
  },
  update: async (payload) => {
    const response = await axiosInstance.patch(ENDPOINTS.BOOKS_SETTINGS.UPDATE, payload);
    return response.data;
  },
};

export default booksSettingsApi;
