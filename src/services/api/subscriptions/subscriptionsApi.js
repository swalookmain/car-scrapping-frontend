import axiosInstance from '../core/axiosInstance';
import { ENDPOINTS } from '../core/config';

export const subscriptionsApi = {
  getByOrganizationId: async (orgId) => {
    const response = await axiosInstance.get(ENDPOINTS.ORGANIZATIONS.GET_SUBSCRIPTION(orgId));
    return response.data;
  },

  update: async (orgId, payload) => {
    const response = await axiosInstance.patch(
      ENDPOINTS.ORGANIZATIONS.UPDATE_SUBSCRIPTION(orgId),
      payload,
    );
    return response.data;
  },
};

export default subscriptionsApi;
