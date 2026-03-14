import axiosInstance from '../core/axiosInstance';
import { ENDPOINTS } from '../core/config';

// Simple in-memory cache for sales invoices list
const _cache = { ts: 0, key: null, data: null };
const CACHE_TTL = 60 * 1000;
const _inflight = new Map();

export const salesInvoicesApi = {
  // ── Sales Invoices CRUD ───────────────────────────────────────
  getAll: async (page = 1, limit = 10, filters = {}, { useCache = true } = {}) => {
    const key = JSON.stringify({ page, limit, ...filters });
    const now = Date.now();
    if (useCache && _cache.data && _cache.key === key && now - _cache.ts < CACHE_TTL) {
      return _cache.data;
    }

    if (_inflight.has(key)) return _inflight.get(key);

    const promise = (async () => {
      try {
        const params = { page, limit };
        if (filters.buyerId) params.buyerId = filters.buyerId;
        if (filters.status) params.status = filters.status;
        if (filters.invoiceNumber) params.invoiceNumber = filters.invoiceNumber;

        const response = await axiosInstance.get(ENDPOINTS.SALES_DISPATCH.INVOICES.GET_ALL, { params });
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
    const response = await axiosInstance.get(ENDPOINTS.SALES_DISPATCH.INVOICES.GET_BY_ID(id));
    return response.data;
  },

  create: async (payload) => {
    const response = await axiosInstance.post(ENDPOINTS.SALES_DISPATCH.INVOICES.CREATE, payload);
    return response.data;
  },

  update: async (id, payload) => {
    const response = await axiosInstance.patch(ENDPOINTS.SALES_DISPATCH.INVOICES.UPDATE(id), payload);
    return response.data;
  },

  confirm: async (id) => {
    const response = await axiosInstance.patch(ENDPOINTS.SALES_DISPATCH.INVOICES.CONFIRM(id));
    return response.data;
  },

  cancel: async (id) => {
    const response = await axiosInstance.patch(ENDPOINTS.SALES_DISPATCH.INVOICES.CANCEL(id));
    return response.data;
  },

  invalidateCache: () => {
    _cache.ts = 0;
    _cache.key = null;
    _cache.data = null;
  },
};

export default salesInvoicesApi;
