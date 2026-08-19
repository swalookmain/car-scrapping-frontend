import axiosInstance from '../core/axiosInstance';
import { ENDPOINTS } from '../core/config';

const storageApi = {
  deleteFile: async (storageKey) => {
    const response = await axiosInstance.delete(ENDPOINTS.STORAGE.DELETE(storageKey));
    return response.data;
  },
};

export default storageApi;
