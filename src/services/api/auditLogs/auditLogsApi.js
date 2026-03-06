import axiosInstance from '../core/axiosInstance';
import { ENDPOINTS } from '../core/config';

export const auditLogsApi = {
  /**
   * Get all audit logs (Super Admin only)
   * @param {Object} params - Query parameters
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=10] - Items per page
   * @param {string} [params.action] - Filter by action
   * @param {string} [params.resource] - Filter by resource type
   * @param {string} [params.status] - Filter by status (SUCCESS / FAILURE)
   * @param {string} [params.startDate] - Start date for filtering (ISO string)
   * @param {string} [params.endDate] - End date for filtering (ISO string)
   */
  getAll: async ({ page = 1, limit = 10, action, resource, status, startDate, endDate } = {}) => {
    const params = { page, limit };
    if (action) params.action = action;
    if (resource) params.resource = resource;
    if (status) params.status = status;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await axiosInstance.get(ENDPOINTS.AUDIT_LOGS.GET_ALL, { params });
    return response.data;
  },

  /**
   * Get staff audit logs (Admin only)
   * @param {Object} params - Query parameters (same as getAll)
   */
  getStaffLogs: async ({ page = 1, limit = 10, action, resource, status, startDate, endDate } = {}) => {
    const params = { page, limit };
    if (action) params.action = action;
    if (resource) params.resource = resource;
    if (status) params.status = status;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await axiosInstance.get(ENDPOINTS.AUDIT_LOGS.GET_STAFF, { params });
    return response.data;
  },

  /**
   * Get audit log by ID
   * @param {string} id - Audit log ID
   */
  getById: async (id) => {
    const response = await axiosInstance.get(ENDPOINTS.AUDIT_LOGS.GET_BY_ID(id));
    return response.data;
  },
};

export default auditLogsApi;
