import axiosInstance from '../core/axiosInstance';
import { ENDPOINTS } from '../core/config';

const dashboardApi = {
  getOverview: async () => {
    const response = await axiosInstance.get(ENDPOINTS.DASHBOARD.OVERVIEW);
    return response.data;
  },
};

export default dashboardApi;
