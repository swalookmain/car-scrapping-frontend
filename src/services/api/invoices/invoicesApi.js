import axiosInstance from '../core/axiosInstance';
import { ENDPOINTS } from '../core/config';

// Simple in-memory cache for invoices list
const _cache = { ts: 0, key: null, data: null };
const CACHE_TTL = 60 * 1000;
const _inflight = new Map();

export const invoicesApi = {
  // ── Invoice CRUD ──────────────────────────────────────────────
  getAll: async (page = 1, limit = 10, { useCache = true } = {}) => {
    const key = JSON.stringify({ page, limit });
    const now = Date.now();
    if (useCache && _cache.data && _cache.key === key && now - _cache.ts < CACHE_TTL) {
      return _cache.data;
    }

    if (_inflight.has(key)) return _inflight.get(key);

    const promise = (async () => {
      try {
        const response = await axiosInstance.get(ENDPOINTS.INVOICES.GET_ALL, { params: { page, limit } });
        _cache.ts = Date.now();
        _cache.key = key;
        _cache.data = response.data;
        return response.data;
      } finally {
        _inflight.delete(key);
      }
    })();

    _inflight.set(key, promise);
    return promise;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(ENDPOINTS.INVOICES.GET_BY_ID(id));
    return response.data;
  },

  create: async (payload) => {
    const response = await axiosInstance.post(ENDPOINTS.INVOICES.CREATE, payload);
    return response.data;
  },

  update: async (id, payload) => {
    const response = await axiosInstance.patch(ENDPOINTS.INVOICES.UPDATE(id), payload);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(ENDPOINTS.INVOICES.DELETE(id));
    return response.data;
  },

  // ── Vehicle Invoice CRUD ──────────────────────────────────────
  getAllVehicles: async (page = 1, limit = 10) => {
    const response = await axiosInstance.get(ENDPOINTS.INVOICES.VEHICLE.GET_ALL, { params: { page, limit } });
    return response.data;
  },

  createVehicle: async (payload) => {
    const response = await axiosInstance.post(ENDPOINTS.INVOICES.VEHICLE.CREATE, payload);
    return response.data;
  },

  getVehicleById: async (invoiceId) => {
    const response = await axiosInstance.get(ENDPOINTS.INVOICES.VEHICLE.GET_BY_ID, { params: { invoiceId } });
    return response.data;
  },

  updateVehicle: async (id, payload) => {
    const response = await axiosInstance.patch(ENDPOINTS.INVOICES.VEHICLE.UPDATE(id), payload);
    return response.data;
  },

  deleteVehicle: async (id) => {
    const response = await axiosInstance.delete(ENDPOINTS.INVOICES.VEHICLE.DELETE(id));
    return response.data;
  },

  // ── Purchase Documents ────────────────────────────────────────
  uploadDocuments: async (formData) => {
    const response = await axiosInstance.post(ENDPOINTS.INVOICES.DOCUMENTS.UPLOAD, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getDocuments: async (invoiceId) => {
    const response = await axiosInstance.get(ENDPOINTS.INVOICES.DOCUMENTS.GET, { params: { invoiceId } });
    return response.data;
  },
};

export default invoicesApi;
