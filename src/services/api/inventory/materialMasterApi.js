import axiosInstance from '../core/axiosInstance';
import { ENDPOINTS } from '../core/config';

export const materialMasterApi = {
  list: async () => {
    const response = await axiosInstance.get(ENDPOINTS.MATERIAL_MASTER.LIST);
    return response.data;
  },
  create: async (payload) => {
    const response = await axiosInstance.post(ENDPOINTS.MATERIAL_MASTER.CREATE, payload);
    return response.data;
  },
  deactivate: async (id) => {
    const response = await axiosInstance.delete(ENDPOINTS.MATERIAL_MASTER.DELETE(id));
    return response.data;
  },
};

export default materialMasterApi;
