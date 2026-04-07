import axiosInstance from '../core/axiosInstance';
import { ENDPOINTS } from '../core/config';

export const leadsApi = {
  getAll: async (params = {}) => {
    const response = await axiosInstance.get(ENDPOINTS.LEADS.GET_ALL, { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(ENDPOINTS.LEADS.GET_BY_ID(id));
    return response.data;
  },

  create: async (payload) => {
    const response = await axiosInstance.post(ENDPOINTS.LEADS.CREATE, payload);
    return response.data;
  },

  update: async (id, payload) => {
    const response = await axiosInstance.patch(
      ENDPOINTS.LEADS.UPDATE(id),
      payload,
    );
    return response.data;
  },

  assign: async (id, staffId) => {
    const response = await axiosInstance.patch(
      ENDPOINTS.LEADS.ASSIGN(id),
      { staffId },
    );
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await axiosInstance.patch(
      ENDPOINTS.LEADS.UPDATE_STATUS(id),
      { status },
    );
    return response.data;
  },

  uploadDocuments: async (id, formData) => {
    const response = await axiosInstance.post(
      ENDPOINTS.LEADS.UPLOAD_DOCUMENTS(id),
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    );
    return response.data;
  },

  getDocuments: async (id) => {
    const response = await axiosInstance.get(ENDPOINTS.LEADS.GET_DOCUMENTS(id));
    return response.data;
  },

  lookup: async (q) => {
    const response = await axiosInstance.get(ENDPOINTS.LEADS.LOOKUP, {
      params: q ? { q } : {},
    });
    return response.data;
  },

  getLookupById: async (id) => {
    const response = await axiosInstance.get(ENDPOINTS.LEADS.LOOKUP_BY_ID(id));
    return response.data;
  },
};

export default leadsApi;
