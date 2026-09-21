import axiosInstance from '../core/axiosInstance';
import { ENDPOINTS } from '../core/config';

const liftingApi = {
  getAll: async (params = {}) => {
    const response = await axiosInstance.get(ENDPOINTS.LIFTING.GET_ALL, { params });
    return response.data;
  },
  getSummary: async (params = {}) => {
    const response = await axiosInstance.get(ENDPOINTS.LIFTING.GET_SUMMARY, { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await axiosInstance.get(ENDPOINTS.LIFTING.GET_BY_ID(id));
    return response.data;
  },
};

export default liftingApi;
